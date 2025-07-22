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
}

export function VideoPlayer({ 
  video, 
  className, 
  currentTime,
  onTimeUpdate,
  onSeekToTime,
  highlightedScene
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

  // Seek to specific time when requested
  useEffect(() => {
    if (videoRef.current && onSeekToTime && typeof currentTime === 'number' && isVideoReady) {
      const video = videoRef.current
      const targetTime = currentTime
      
      // Only seek if the difference is significant (more than 1 second)
      if (Math.abs(video.currentTime - targetTime) > 1) {
        video.currentTime = targetTime
        
        // Add enhanced smooth transition effect with ripple animation
        video.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        video.style.opacity = '0.6'
        video.style.transform = 'scale(0.98)'
        
        // Show seeking indicator
        const seekIndicator = document.createElement('div')
        seekIndicator.className = 'absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg z-10'
        seekIndicator.innerHTML = `
          <div class="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in fade-in-0 zoom-in-95 duration-300">
            Seeking to ${Math.floor(targetTime / 60)}:${(targetTime % 60).toString().padStart(2, '0')}
          </div>
        `
        video.parentElement?.appendChild(seekIndicator)
        
        setTimeout(() => {
          video.style.opacity = '1'
          video.style.transform = 'scale(1)'
          
          // Remove seeking indicator
          setTimeout(() => {
            seekIndicator?.remove()
            video.style.transition = ''
          }, 400)
        }, 200)
      }
    }
  }, [currentTime, onSeekToTime, isVideoReady])

  // Scene highlighting effect
  const getSceneHighlightStyle = useCallback(() => {
    if (!highlightedScene || !isVideoReady) return {}
    
    return {
      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)',
      borderRadius: '8px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'scale(1.01)'
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

              {/* Scene highlight indicator */}
              {highlightedScene && isVideoReady && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  Scene {highlightedScene.sceneId}: {Math.floor(highlightedScene.startTime / 60)}:{(highlightedScene.startTime % 60).toString().padStart(2, '0')}
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