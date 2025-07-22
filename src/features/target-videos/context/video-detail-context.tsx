import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { targetAccountAnalysisApi, Video, MonitoringTask } from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface VideoDetails extends Video {
  // Additional fields for enhanced video details
  localFilePath?: string
  analysisId?: string
}

// Convert API response to internal format
interface VideoAnalysis {
  id: string
  videoId: string
  scenes: {
    sceneId: string
    startTime: number
    endTime: number
    thumbnailUrl: string
    description: string
    confidence: number
  }[]
  summary: string
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

interface LoadingStates {
  video: boolean
  analysis: boolean
  download: boolean
  triggerAnalysis: boolean
}

interface ErrorStates {
  video: string | null
  analysis: string | null
  download: string | null
  triggerAnalysis: string | null
}

interface DownloadProgress {
  taskId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  message?: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  retryCount?: number
  estimatedTimeRemaining?: string
}

interface VideoDetailContextType {
  // Data
  video: VideoDetails | null
  analysis: VideoAnalysis | null
  
  // Loading states
  loading: boolean
  loadingStates: LoadingStates
  
  // Error states
  error: string | null
  errorStates: ErrorStates
  
  // Download progress tracking
  downloadProgress: DownloadProgress | null
  
  // Video player integration
  currentTime: number
  selectedSceneId: string | null
  highlightedScene: VideoAnalysis['scenes'][0] | null
  
  // Computed states
  isVideoDownloaded: boolean
  isAnalysisAvailable: boolean
  canTriggerAnalysis: boolean
  canTriggerDownload: boolean
  
  // Actions
  fetchVideoDetail: (videoId: string) => Promise<void>
  fetchAnalysis: (videoId: string) => Promise<void>
  triggerDownload: (videoId: string) => Promise<void>
  triggerAnalysis: (videoId: string) => Promise<void>
  refreshVideoData: () => Promise<void>
  clearErrors: () => void
  retryDownload: () => Promise<void>
  cancelDownload: () => void
  getDownloadStatusMessage: (status: string) => string
  
  // Video player integration actions
  seekToTime: (time: number) => void
  updateCurrentTime: (time: number) => void
  selectScene: (sceneId: string) => void
  highlightScene: (scene: VideoAnalysis['scenes'][0] | null) => void
}

const VideoDetailContext = createContext<VideoDetailContextType | undefined>(undefined)

interface VideoDetailProviderProps {
  children: ReactNode
  videoId: string
}

export function VideoDetailProvider({ children, videoId }: VideoDetailProviderProps) {
  const [video, setVideo] = useState<VideoDetails | null>(null)
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Enhanced loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    video: false,
    analysis: false,
    download: false,
    triggerAnalysis: false
  })
  
  // Enhanced error states
  const [errorStates, setErrorStates] = useState<ErrorStates>({
    video: null,
    analysis: null,
    download: null,
    triggerAnalysis: null
  })

  // Download progress tracking
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const downloadPollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastNotificationRef = useRef<string | null>(null)

  // Video player integration state
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [highlightedScene, setHighlightedScene] = useState<VideoAnalysis['scenes'][0] | null>(null)
  const seekTimeRef = useRef<number | null>(null)

  const fetchVideoDetail = useCallback(async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, video: true }))
      setErrorStates(prev => ({ ...prev, video: null }))
      setError(null)
      
      // Use the dedicated video detail endpoint
      const response = await targetAccountAnalysisApi.getVideoById(id)
      
      if (response.data.code === 0) {
        const videoData = response.data.data
        
        // Enhance video data with additional fields
        const videoDetails: VideoDetails = {
          ...videoData,
          localFilePath: videoData.local_file_path || undefined,
          analysisId: undefined // Will be set when analysis is fetched
        }
        setVideo(videoDetails)
        
        // If video is downloaded, try to fetch analysis data
        if (videoData.is_downloaded) {
          await fetchAnalysis(id)
        }
      } else {
        const errorMessage = response.data.msg || 'Failed to fetch video details'
        setErrorStates(prev => ({ ...prev, video: errorMessage }))
        setError(errorMessage)
        toast.error('Failed to load video details')
      }
    } catch (err) {
      const errorMessage = handleServerError(err)
      setErrorStates(prev => ({ ...prev, video: errorMessage }))
      setError(errorMessage)
      toast.error('Failed to load video details')
      console.error('Error fetching video detail:', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, video: false }))
      setLoading(false)
    }
  }, [])

  // Download progress monitoring
  const startDownloadMonitoring = useCallback((taskId: string) => {
    // Clear any existing polling
    if (downloadPollingRef.current) {
      clearInterval(downloadPollingRef.current)
    }

    // Set initial progress state
    setDownloadProgress({
      taskId,
      status: 'pending',
      message: 'Download task created, waiting to start...',
      startedAt: new Date().toISOString(),
      retryCount: 0
    })

    let pollCount = 0
    const maxPollCount = 300 // 10 minutes at 2-second intervals

    // Start polling for task status
    downloadPollingRef.current = setInterval(async () => {
      try {
        pollCount++
        
        const response = await targetAccountAnalysisApi.getTasks(0, 50, undefined, videoId, 'video_download')
        
        if (response.data.code === 0) {
          const downloadTask = response.data.data.find((task: MonitoringTask) => 
            task.id === taskId || (task.video_id === videoId && task.task_type === 'video_download')
          )

          if (downloadTask) {
            // Calculate estimated time remaining for processing tasks
            let estimatedTimeRemaining: string | undefined
            if (downloadTask.status === 'processing') {
              const startTime = new Date(downloadTask.created_at).getTime()
              const currentTime = new Date().getTime()
              const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60))
              
              // Rough estimate: most downloads complete within 5-15 minutes
              const estimatedTotalMinutes = Math.max(10, elapsedMinutes + 5)
              const remainingMinutes = Math.max(0, estimatedTotalMinutes - elapsedMinutes)
              
              if (remainingMinutes > 0) {
                estimatedTimeRemaining = remainingMinutes > 60 
                  ? `~${Math.ceil(remainingMinutes / 60)}h ${remainingMinutes % 60}m`
                  : `~${remainingMinutes}m`
              }
            }

            const newProgress: DownloadProgress = {
              taskId: downloadTask.id,
              status: downloadTask.status as DownloadProgress['status'],
              message: getDownloadStatusMessage(downloadTask.status),
              startedAt: downloadTask.created_at,
              errorMessage: downloadTask.error_message || undefined,
              retryCount: downloadProgress?.retryCount || 0,
              estimatedTimeRemaining
            }

            // Update progress state
            setDownloadProgress(newProgress)

            // Handle completion or failure
            if (downloadTask.status === 'completed') {
              // Stop polling
              if (downloadPollingRef.current) {
                clearInterval(downloadPollingRef.current)
                downloadPollingRef.current = null
              }

              // Show success notification (only once)
              if (lastNotificationRef.current !== `completed-${taskId}`) {
                toast.success('Video download completed successfully!', {
                  description: 'The video is now available for viewing and analysis.',
                  duration: 5000
                })
                lastNotificationRef.current = `completed-${taskId}`
              }

              // Refresh video data to get updated download status
              await fetchVideoDetail(videoId)
              
              // Clear progress after a delay
              setTimeout(() => {
                setDownloadProgress(null)
              }, 5000)
            } else if (downloadTask.status === 'failed') {
              // Stop polling
              if (downloadPollingRef.current) {
                clearInterval(downloadPollingRef.current)
                downloadPollingRef.current = null
              }

              // Show error notification (only once)
              if (lastNotificationRef.current !== `failed-${taskId}`) {
                toast.error('Video download failed', {
                  description: downloadTask.error_message || 'Unknown error occurred during download',
                  duration: 8000,
                  action: {
                    label: 'Retry',
                    onClick: () => retryDownload()
                  }
                })
                lastNotificationRef.current = `failed-${taskId}`
              }

              // Update error state
              setErrorStates(prev => ({ 
                ...prev, 
                download: downloadTask.error_message || 'Download failed' 
              }))
            }
          } else if (pollCount > 5) {
            // Task not found after several attempts - might have been completed very quickly
            console.warn('Download task not found, refreshing video data')
            await fetchVideoDetail(videoId)
          }
        }
        
        // Stop polling after max attempts
        if (pollCount >= maxPollCount) {
          if (downloadPollingRef.current) {
            clearInterval(downloadPollingRef.current)
            downloadPollingRef.current = null
          }
          
          setDownloadProgress(prev => prev ? {
            ...prev,
            message: 'Download monitoring timed out. Check monitoring tasks for current status.',
            estimatedTimeRemaining: undefined
          } : null)
          
          toast.warning('Download monitoring timed out', {
            description: 'Please check the monitoring tasks page for current status.'
          })
        }
      } catch (error) {
        console.warn('Failed to poll download status:', error)
        
        // If we get too many errors, stop polling
        if (pollCount > 10) {
          if (downloadPollingRef.current) {
            clearInterval(downloadPollingRef.current)
            downloadPollingRef.current = null
          }
          
          setDownloadProgress(prev => prev ? {
            ...prev,
            message: 'Unable to monitor download progress. Check monitoring tasks for status.',
            estimatedTimeRemaining: undefined
          } : null)
        }
      }
    }, 2000) // Poll every 2 seconds
  }, [videoId, fetchVideoDetail, downloadProgress?.retryCount, getDownloadStatusMessage])

  const stopDownloadMonitoring = useCallback(() => {
    if (downloadPollingRef.current) {
      clearInterval(downloadPollingRef.current)
      downloadPollingRef.current = null
    }
    setDownloadProgress(null)
  }, [])

  const getDownloadStatusMessage = useCallback((status: string): string => {
    switch (status) {
      case 'pending':
        return 'Download task is queued and waiting to start...'
      case 'processing':
        return 'Video is being downloaded...'
      case 'completed':
        return 'Download completed successfully!'
      case 'failed':
        return 'Download failed. You can retry the download.'
      default:
        return `Download status: ${status}`
    }
  }, [])

  const fetchAnalysis = useCallback(async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, analysis: true }))
      setErrorStates(prev => ({ ...prev, analysis: null }))
      
      // Use the dedicated video analysis endpoint
      const response = await targetAccountAnalysisApi.getVideoAnalysis(id)
      
      if (response.data.code === 0) {
        const analysisData = response.data.data
        
        // Convert API response to internal format
        const analysis: VideoAnalysis = {
          id: analysisData.id,
          videoId: analysisData.video_id,
          scenes: analysisData.scenes.map(scene => ({
            sceneId: scene.scene_id,
            startTime: scene.start_time,
            endTime: scene.end_time,
            thumbnailUrl: scene.thumbnail_url,
            description: scene.description,
            confidence: scene.confidence
          })),
          summary: analysisData.summary,
          analysisStatus: analysisData.analysis_status,
          createdAt: analysisData.created_at,
          updatedAt: analysisData.updated_at
        }
        
        setAnalysis(analysis)
        setVideo(prev => prev ? { ...prev, analysisId: analysis.id } : null)
      } else {
        // Analysis not found is not an error - video might not be analyzed yet
        if (response.data.code === 404 || response.data.msg?.includes('not found')) {
          setAnalysis(null)
        } else {
          const errorMessage = response.data.msg || 'Failed to fetch video analysis'
          setErrorStates(prev => ({ ...prev, analysis: errorMessage }))
          console.warn('Failed to fetch video analysis:', errorMessage)
        }
      }
    } catch (err) {
      const errorMessage = handleServerError(err)
      
      // Check if it's a 404 error (analysis not found)
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setAnalysis(null)
      } else {
        setErrorStates(prev => ({ ...prev, analysis: errorMessage }))
        console.warn('Failed to fetch video analysis:', errorMessage)
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, analysis: false }))
    }
  }, [])

  const triggerDownload = useCallback(async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, download: true }))
      setErrorStates(prev => ({ ...prev, download: null }))
      
      // Check if video is already downloaded
      if (video?.is_downloaded) {
        toast.info('Video is already downloaded')
        return
      }
      
      const response = await targetAccountAnalysisApi.triggerVideoDownload({ 
        video_ids: [id],
        priority: 10
      })
      
      if (response.data.code === 0) {
        const { valid_videos, requested_videos, invalid_video_ids } = response.data.data
        
        if (valid_videos > 0) {
          toast.success(`Created ${valid_videos} download task out of ${requested_videos} requested`, {
            description: 'Download will start shortly. You can monitor progress below.',
            duration: 4000
          })
          
          // Update video status to show download is in progress
          setVideo(prev => prev ? {
            ...prev,
            download_status: 'pending'
          } : null)
          
          // Start monitoring download progress
          // We'll use a small delay to allow the task to be created in the system
          setTimeout(() => {
            startDownloadMonitoring(`video_${id}_download`)
          }, 1000)
          
          // Also refresh video data after a delay to check for updates
          setTimeout(() => {
            fetchVideoDetail(id)
          }, 3000)
        } else {
          const errorMessage = invalid_video_ids.length > 0 
            ? `Invalid video ID: ${invalid_video_ids.join(', ')}`
            : 'No valid videos to download'
          setErrorStates(prev => ({ ...prev, download: errorMessage }))
          toast.error(errorMessage)
        }
      } else {
        const errorMessage = response.data.msg || 'Failed to trigger video download'
        setErrorStates(prev => ({ ...prev, download: errorMessage }))
        toast.error(errorMessage)
      }
    } catch (err) {
      const errorMessage = handleServerError(err)
      setErrorStates(prev => ({ ...prev, download: errorMessage }))
      toast.error(errorMessage)
      console.error('Error triggering download:', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, download: false }))
    }
  }, [video?.is_downloaded, fetchVideoDetail, startDownloadMonitoring])

  const triggerAnalysis = useCallback(async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, triggerAnalysis: true }))
      setErrorStates(prev => ({ ...prev, triggerAnalysis: null }))
      
      // Check if video is downloaded before triggering analysis
      if (!video?.is_downloaded) {
        toast.error('Video must be downloaded before analysis can be triggered')
        return
      }
      
      const response = await targetAccountAnalysisApi.triggerVideoAnalysis(id, { priority: 10 })
      
      if (response.data.code === 0) {
        const { task_id } = response.data.data
        toast.success(`Video analysis task created successfully (Task ID: ${task_id})`)
        
        // Update analysis status to pending
        setAnalysis(prev => prev ? {
          ...prev,
          analysisStatus: 'pending'
        } : {
          id: `pending_${id}`,
          videoId: id,
          scenes: [],
          summary: '',
          analysisStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        // Optionally refresh analysis data after a delay to check for updates
        setTimeout(() => {
          fetchAnalysis(id)
        }, 2000)
      } else {
        const errorMessage = response.data.msg || 'Failed to trigger video analysis'
        setErrorStates(prev => ({ ...prev, triggerAnalysis: errorMessage }))
        toast.error(errorMessage)
      }
    } catch (err) {
      const errorMessage = handleServerError(err)
      setErrorStates(prev => ({ ...prev, triggerAnalysis: errorMessage }))
      toast.error(errorMessage)
      console.error('Error triggering analysis:', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, triggerAnalysis: false }))
    }
  }, [video?.is_downloaded, fetchAnalysis])

  const retryDownload = useCallback(async () => {
    if (!video) return
    
    // Increment retry count
    setDownloadProgress(prev => prev ? {
      ...prev,
      retryCount: (prev.retryCount || 0) + 1
    } : null)
    
    // Clear previous error state
    setErrorStates(prev => ({ ...prev, download: null }))
    
    // Show retry notification
    toast.info('Retrying video download...', {
      description: `Attempt ${(downloadProgress?.retryCount || 0) + 1}`
    })
    
    // Trigger download again
    await triggerDownload(video.id)
  }, [video, downloadProgress?.retryCount, triggerDownload])

  const cancelDownload = useCallback(() => {
    // Stop polling
    if (downloadPollingRef.current) {
      clearInterval(downloadPollingRef.current)
      downloadPollingRef.current = null
    }
    
    // Clear download progress
    setDownloadProgress(null)
    
    // Clear download loading state
    setLoadingStates(prev => ({ ...prev, download: false }))
    
    // Show cancellation message
    toast.info('Download monitoring cancelled')
  }, [])

  const refreshVideoData = useCallback(async () => {
    if (videoId) {
      // First fetch video details
      await fetchVideoDetail(videoId)
      
      // Then fetch analysis if video is downloaded
      // Note: fetchVideoDetail will automatically call fetchAnalysis if needed
    }
  }, [videoId, fetchVideoDetail])

  const clearErrors = useCallback(() => {
    setError(null)
    setErrorStates({
      video: null,
      analysis: null,
      download: null,
      triggerAnalysis: null
    })
  }, [])

  // Video player integration methods
  const seekToTime = useCallback((time: number) => {
    seekTimeRef.current = time
    setCurrentTime(time)
  }, [])

  const updateCurrentTime = useCallback((time: number) => {
    setCurrentTime(time)
    
    // Auto-select scene based on current time
    if (analysis?.scenes) {
      const currentScene = analysis.scenes.find(scene => 
        time >= scene.startTime && time <= scene.endTime
      )
      
      if (currentScene && currentScene.sceneId !== selectedSceneId) {
        setSelectedSceneId(currentScene.sceneId)
      }
    }
  }, [analysis?.scenes, selectedSceneId])

  const selectScene = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId)
    
    // Find the scene and highlight it
    if (analysis?.scenes) {
      const scene = analysis.scenes.find(s => s.sceneId === sceneId)
      if (scene) {
        setHighlightedScene(scene)
        
        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedScene(null)
        }, 3000)
      }
    }
  }, [analysis?.scenes])

  const highlightScene = useCallback((scene: VideoAnalysis['scenes'][0] | null) => {
    setHighlightedScene(scene)
  }, [])

  // Initialize data when videoId changes
  useEffect(() => {
    if (videoId && videoId.trim() !== '') {
      setLoading(true)
      clearErrors() // Clear any previous errors
      fetchVideoDetail(videoId).finally(() => {
        setLoading(false)
      })
    } else {
      // Handle invalid video ID
      setError('Invalid video ID')
      setLoading(false)
    }
  }, [videoId, fetchVideoDetail, clearErrors])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (downloadPollingRef.current) {
        clearInterval(downloadPollingRef.current)
        downloadPollingRef.current = null
      }
    }
  }, [])

  // Computed states
  const isVideoDownloaded = video?.is_downloaded ?? false
  const isAnalysisAvailable = analysis !== null && analysis.analysisStatus === 'completed'
  const canTriggerAnalysis = isVideoDownloaded && (!analysis || analysis.analysisStatus === 'failed')
  const canTriggerDownload = video !== null && !isVideoDownloaded

  const value: VideoDetailContextType = {
    // Data
    video,
    analysis,
    
    // Loading states
    loading,
    loadingStates,
    
    // Error states
    error,
    errorStates,
    
    // Download progress tracking
    downloadProgress,
    
    // Video player integration
    currentTime,
    selectedSceneId,
    highlightedScene,
    
    // Computed states
    isVideoDownloaded,
    isAnalysisAvailable,
    canTriggerAnalysis,
    canTriggerDownload,
    
    // Actions
    fetchVideoDetail,
    fetchAnalysis,
    triggerDownload,
    triggerAnalysis,
    refreshVideoData,
    clearErrors,
    retryDownload,
    cancelDownload,
    getDownloadStatusMessage,
    
    // Video player integration actions
    seekToTime,
    updateCurrentTime,
    selectScene,
    highlightScene
  }

  return (
    <VideoDetailContext.Provider value={value}>
      {children}
    </VideoDetailContext.Provider>
  )
}

export function useVideoDetail() {
  const context = useContext(VideoDetailContext)
  if (context === undefined) {
    throw new Error('useVideoDetail must be used within a VideoDetailProvider')
  }
  return context
}