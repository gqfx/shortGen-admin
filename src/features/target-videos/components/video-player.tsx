import { useState, useRef, useEffect, useCallback } from 'react'
import { Video } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Play, 
  ExternalLink, 
  AlertCircle,
  Loader2,
  X,
  Clock,
  RefreshCw
} from 'lucide-react'
import { useVideoDetail } from '../context/video-detail-context'
import { DownloadStatus } from './download-status'
import { AnalysisAction } from './analysis-action'
import { toast } from 'sonner'

interface SceneData {
  sceneId: string
  startTime: number
  endTime: number
  thumbnailUrl: string
  description: string
  confidence: number
}

interface VideoPlayerProps {
  video: Video
  className?: string
  currentTime?: number
  onTimeUpdate?: (currentTime: number) => void
  onSeekToTime?: (time: number) => void
  highlightedScene?: SceneData | null
  autoSyncWithScenes?: boolean
}

export function VideoPlayer({ 
  video, 
  className, 
  currentTime,
  onTimeUpdate,
  onSeekToTime,
  highlightedScene,
  autoSyncWithScenes = true
}: VideoPlayerProps) {
  const { 
    triggerDownload, 
    loadingStates, 
    errorStates,
    canTriggerDownload,
    downloadProgress,
    retryDownload,
    cancelDownload,
    getDownloadStatusMessage
  } = useVideoDetail()
  
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const handleDownload = async () => {
    if (!canTriggerDownload) {
      toast.info('Video is already downloaded or download is in progress')
      return
    }
    
    await triggerDownload(video.id)
  }

  const handleExternalLink = () => {
    if (video.video_url) {
      window.open(video.video_url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  // Video player event handlers
  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime)
    }
  }, [onTimeUpdate])

  const handleVideoLoadedData = useCallback(() => {
    setIsVideoReady(true)
  }, [])

  const handleVideoError = useCallback(() => {
    setIsVideoReady(false)
    toast.error('Failed to load video file')
  }, [])

  // Enhanced seek to specific time with smooth navigation
  useEffect(() => {
    if (videoRef.current && typeof currentTime === 'number' && isVideoReady) {
      const video = videoRef.current
      const targetTime = currentTime
      
      // Only seek if the difference is significant (more than 1 second)
      if (Math.abs(video.currentTime - targetTime) > 1) {
        video.currentTime = targetTime
        
        // Enhanced smooth transition effect with improved animations
        video.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        video.style.opacity = '0.7'
        video.style.transform = 'scale(0.98)'
        video.style.filter = 'brightness(0.9)'
        
        // Enhanced seeking indicator with better styling
        const seekIndicator = document.createElement('div')
        seekIndicator.className = 'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 to-black/20 rounded-lg z-20 animate-in fade-in-0 duration-300'
        seekIndicator.innerHTML = `
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 backdrop-blur-sm border border-blue-400/30">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex flex-col">
                <span class="text-sm font-semibold">Navigating to Scene</span>
                <span class="text-xs opacity-90">${Math.floor(targetTime / 60)}:${(targetTime % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        `
        video.parentElement?.appendChild(seekIndicator)
        
        // Enhanced ripple effect with multiple waves
        const ripple1 = document.createElement('div')
        ripple1.className = 'absolute inset-0 rounded-lg pointer-events-none'
        ripple1.style.background = 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, transparent 60%)'
        ripple1.style.animation = 'pulse 0.8s ease-out'
        video.parentElement?.appendChild(ripple1)
        
        const ripple2 = document.createElement('div')
        ripple2.className = 'absolute inset-0 rounded-lg pointer-events-none'
        ripple2.style.background = 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 80%)'
        ripple2.style.animation = 'pulse 1.2s ease-out 0.2s'
        video.parentElement?.appendChild(ripple2)
        
        // Add progress bar animation
        const progressBar = document.createElement('div')
        progressBar.className = 'absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden z-20'
        progressBar.innerHTML = '<div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" style="width: 100%; animation: progress-fill 0.8s ease-out;"></div>'
        video.parentElement?.appendChild(progressBar)
        
        setTimeout(() => {
          video.style.opacity = '1'
          video.style.transform = 'scale(1)'
          video.style.filter = 'brightness(1)'
          
          // Remove indicators with enhanced staggered timing
          setTimeout(() => {
            seekIndicator?.remove()
            setTimeout(() => {
              ripple1?.remove()
              setTimeout(() => {
                ripple2?.remove()
                progressBar?.remove()
                video.style.transition = ''
              }, 150)
            }, 150)
          }, 500)
        }, 300)
      }
    }
  }, [currentTime, isVideoReady])

  // Enhanced scene highlighting effect with dynamic animations
  const getSceneHighlightStyle = useCallback(() => {
    if (!highlightedScene || !isVideoReady) return {}
    
    return {
      boxShadow: `
        0 0 0 4px rgba(59, 130, 246, 0.9),
        0 0 20px rgba(59, 130, 246, 0.7),
        0 0 40px rgba(59, 130, 246, 0.5),
        0 0 80px rgba(59, 130, 246, 0.3),
        0 0 120px rgba(59, 130, 246, 0.1)
      `,
      borderRadius: '12px',
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'scale(1.03)',
      filter: 'brightness(1.15) contrast(1.08) saturate(1.1)',
      position: 'relative' as const,
      zIndex: 5
    }
  }, [highlightedScene, isVideoReady])

  // Enhanced scene highlighting with advanced pulsing and overlay effects
  useEffect(() => {
    if (highlightedScene && videoRef.current && isVideoReady) {
      const video = videoRef.current
      
      // Enhanced pulsing animation with multiple phases
      video.style.animation = 'scene-highlight-pulse 3s ease-in-out'
      
      // Create animated highlight overlay with gradient
      const overlay = document.createElement('div')
      overlay.className = 'absolute inset-0 pointer-events-none z-15 rounded-lg'
      overlay.style.background = `
        linear-gradient(45deg, 
          rgba(59, 130, 246, 0.15) 0%, 
          rgba(59, 130, 246, 0.25) 25%,
          rgba(147, 197, 253, 0.2) 50%,
          rgba(59, 130, 246, 0.25) 75%,
          rgba(59, 130, 246, 0.15) 100%
        )
      `
      overlay.style.animation = 'scene-highlight-overlay 4s ease-in-out'
      video.parentElement?.appendChild(overlay)
      
      // Add scene information badge with enhanced styling
      const sceneBadge = document.createElement('div')
      sceneBadge.className = 'absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-2xl z-20 animate-in fade-in-0 slide-in-from-top-2 duration-500 backdrop-blur-sm border border-blue-400/30'
      sceneBadge.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold">Scene ${highlightedScene.sceneId}</span>
            <span class="text-xs opacity-90">
              ${Math.floor(highlightedScene.startTime / 60)}:${(highlightedScene.startTime % 60).toString().padStart(2, '0')} - 
              ${Math.floor(highlightedScene.endTime / 60)}:${(highlightedScene.endTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      `
      video.parentElement?.appendChild(sceneBadge)
      
      // Add scene description tooltip
      const sceneTooltip = document.createElement('div')
      sceneTooltip.className = 'absolute bottom-4 left-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm z-20 animate-in fade-in-0 slide-in-from-bottom-2 duration-700 backdrop-blur-sm'
      sceneTooltip.innerHTML = `
        <div class="flex items-start gap-2">
          <div class="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <p class="leading-relaxed">${highlightedScene.description}</p>
        </div>
      `
      video.parentElement?.appendChild(sceneTooltip)
      
      // Add corner accent animations
      const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      const cornerElements: HTMLElement[] = []
      
      corners.forEach((corner, index) => {
        const cornerElement = document.createElement('div')
        cornerElement.className = `absolute w-6 h-6 border-2 border-blue-400 z-20`
        
        switch (corner) {
          case 'top-left':
            cornerElement.style.top = '8px'
            cornerElement.style.left = '8px'
            cornerElement.style.borderRight = 'none'
            cornerElement.style.borderBottom = 'none'
            break
          case 'top-right':
            cornerElement.style.top = '8px'
            cornerElement.style.right = '8px'
            cornerElement.style.borderLeft = 'none'
            cornerElement.style.borderBottom = 'none'
            break
          case 'bottom-left':
            cornerElement.style.bottom = '8px'
            cornerElement.style.left = '8px'
            cornerElement.style.borderRight = 'none'
            cornerElement.style.borderTop = 'none'
            break
          case 'bottom-right':
            cornerElement.style.bottom = '8px'
            cornerElement.style.right = '8px'
            cornerElement.style.borderLeft = 'none'
            cornerElement.style.borderTop = 'none'
            break
        }
        
        cornerElement.style.animation = `corner-highlight 2s ease-in-out ${index * 0.2}s infinite`
        video.parentElement?.appendChild(cornerElement)
        cornerElements.push(cornerElement)
      })
      
      // Clean up after animation with staggered removal
      const cleanup = setTimeout(() => {
        video.style.animation = ''
        
        // Remove elements with staggered timing
        setTimeout(() => overlay?.remove(), 0)
        setTimeout(() => sceneBadge?.remove(), 200)
        setTimeout(() => sceneTooltip?.remove(), 400)
        cornerElements.forEach((el, index) => {
          setTimeout(() => el?.remove(), 600 + (index * 100))
        })
      }, 4000)
      
      return () => {
        clearTimeout(cleanup)
        video.style.animation = ''
        overlay?.remove()
        sceneBadge?.remove()
        sceneTooltip?.remove()
        cornerElements.forEach(el => el?.remove())
      }
    }
  }, [highlightedScene, isVideoReady])

  // Show error state if there's a download error
  if (errorStates.download) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Download failed: {errorStates.download}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={retryDownload}
              disabled={loadingStates.download}
              variant="outline"
            >
              {loadingStates.download ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Download
                </>
              )}
            </Button>
            <Button 
              onClick={handleExternalLink}
              variant="ghost"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
          {video.is_downloaded && video.local_file_path ? (
            // Video Player for downloaded videos
            <div className="w-full h-full">
              <video
                ref={videoRef}
                controls
                className="w-full h-full object-contain"
                poster={video.thumbnail_url || undefined}
                preload="metadata"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedData={handleVideoLoadedData}
                onError={handleVideoError}
                style={getSceneHighlightStyle()}
              >
                <source src={video.local_file_path} type="video/mp4" />
                <source src={video.local_file_path} type="video/webm" />
                <source src={video.local_file_path} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video status badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Downloaded
                </Badge>
              </div>

              {/* Enhanced scene highlight indicator */}
              {highlightedScene && isVideoReady && (
                <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-500 backdrop-blur-sm border border-blue-400/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>
                      Scene {highlightedScene.sceneId}: {Math.floor(highlightedScene.startTime / 60)}:{(highlightedScene.startTime % 60).toString().padStart(2, '0')} - {Math.floor(highlightedScene.endTime / 60)}:{(highlightedScene.endTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-xs opacity-90 mt-1 truncate max-w-xs">
                    {highlightedScene.description}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Thumbnail with download button for non-downloaded videos
            <div className="relative w-full h-full flex items-center justify-center bg-muted">
              {/* Thumbnail image */}
              {video.thumbnail_url && !imageError ? (
                <>
                  {imageLoading && (
                    <Skeleton className="absolute inset-0 w-full h-full" />
                  )}
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </>
              ) : (
                // Fallback when no thumbnail or image error
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Play className="w-16 h-16 mb-2" />
                  <p className="text-sm">No thumbnail available</p>
                </div>
              )}
              
              {/* Overlay with download button */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <div className="text-center">
                  <Button
                    onClick={handleDownload}
                    disabled={loadingStates.download || !canTriggerDownload}
                    size="lg"
                    className="mb-2"
                  >
                    {loadingStates.download ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Video
                      </>
                    )}
                  </Button>
                  <p className="text-white text-sm">
                    Click to download and watch
                  </p>
                </div>
              </div>
              
              {/* Status badges */}
              <div className="absolute top-2 right-2 flex gap-2">
                {video.download_status === 'pending' && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Download Pending
                  </Badge>
                )}
                {video.download_status === 'processing' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Downloading
                  </Badge>
                )}
                {video.download_status === 'failed' && (
                  <Badge variant="destructive">
                    Download Failed
                  </Badge>
                )}
                {!video.is_downloaded && !video.download_status && (
                  <Badge variant="outline">
                    Not Downloaded
                  </Badge>
                )}
              </div>
              
              {/* Duration badge */}
              {video.duration && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {formatDuration(video.duration)}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Video actions */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {video.platform.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {video.video_type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {!video.is_downloaded && (
                <Button
                  onClick={handleDownload}
                  disabled={loadingStates.download || !canTriggerDownload}
                  size="sm"
                  variant="outline"
                >
                  {loadingStates.download ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              )}
              
              {/* Compact Analysis Action in Actions Bar */}
              {video.is_downloaded && (
                <AnalysisAction variant="inline" />
              )}
              
              <Button
                onClick={handleExternalLink}
                size="sm"
                variant="ghost"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Original
              </Button>
            </div>
          </div>
          
          {/* Enhanced Download Progress Display */}
          {(loadingStates.download || downloadProgress) && (
            <DownloadStatus
              downloadProgress={downloadProgress}
              isLoading={loadingStates.download}
              onRetry={retryDownload}
              onCancel={cancelDownload}
              className="mt-3"
            />
          )}
          
          {/* Analysis Action Component */}
          {video.is_downloaded && (
            <div className="mt-3">
              <AnalysisAction variant="default" />
            </div>
          )}
          
          {/* Legacy status display for videos without active download progress */}
          {!loadingStates.download && !downloadProgress && video.download_status === 'pending' && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Clock className="w-4 h-4" />
                <span>Download task is queued and will start soon</span>
              </div>
            </div>
          )}
          
          {!loadingStates.download && !downloadProgress && video.download_status === 'processing' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Video is being downloaded...</span>
              </div>
            </div>
          )}
          
          {!loadingStates.download && !downloadProgress && video.download_status === 'failed' && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between text-sm text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Download failed. You can retry the download.</span>
                </div>
                <Button
                  onClick={retryDownload}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}