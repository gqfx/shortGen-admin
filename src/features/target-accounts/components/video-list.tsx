import { useState, useCallback, useMemo, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  Play,
  Download,
  ExternalLink,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAccountDetail } from '../context/account-detail-context'
import { Video } from '@/lib/api'
import { toast } from 'sonner'
import { useResponsive, useTouchFriendly } from '@/hooks/use-responsive'
import { useAccessibility } from '@/hooks/use-accessibility'

interface VideoListProps {
  className?: string
}

interface BatchOperationResult {
  success: number
  failed: number
  total: number
  errors: string[]
}

export function VideoList({ className }: VideoListProps) {
  const { 
    videos, 
    loadingStates, 
    errorStates, 
    triggerBatchDownload
  } = useAccountDetail()
  
  const { isMobile } = useResponsive()
  const { touchTargetSize, touchPadding } = useTouchFriendly()
  const { announceStatus, announceError, announceSuccess } = useAccessibility()
  const navigate = useNavigate()
  
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())
  const [batchOperationResult, setBatchOperationResult] = useState<BatchOperationResult | null>(null)
  const [showBatchResult, setShowBatchResult] = useState(false)

  // Batch selection handlers
  const handleSelectAll = useCallback(() => {
    const allVideoIds = new Set(videos.map(video => video.id))
    setSelectedVideoIds(allVideoIds)
  }, [videos])

  const handleClearSelection = useCallback(() => {
    setSelectedVideoIds(new Set())
  }, [])

  const handleVideoSelect = useCallback((videoId: string, checked: boolean) => {
    setSelectedVideoIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(videoId)
      } else {
        newSet.delete(videoId)
      }
      return newSet
    })
  }, [])

  // Batch download handler
  const handleBatchDownload = useCallback(async () => {
    if (selectedVideoIds.size === 0) {
      toast.error('Please select videos to download')
      announceError('No videos selected for download')
      return
    }

    const videoIdsArray = Array.from(selectedVideoIds)
    const downloadableVideos = videoIdsArray.filter(id => {
      const video = videos.find(v => v.id === id)
      return video && !video.is_downloaded
    })

    if (downloadableVideos.length === 0) {
      toast.error('No downloadable videos selected')
      announceError('No downloadable videos selected')
      return
    }

    if (downloadableVideos.length < videoIdsArray.length) {
      const alreadyDownloaded = videoIdsArray.length - downloadableVideos.length
      const message = `${alreadyDownloaded} video(s) already downloaded, proceeding with ${downloadableVideos.length} video(s)`
      toast.info(message)
      announceStatus(message)
    }

    announceStatus(`Starting download for ${downloadableVideos.length} videos`)
    
    try {
      await triggerBatchDownload(downloadableVideos)
      
      // Show success result
      setBatchOperationResult({
        success: downloadableVideos.length,
        failed: 0,
        total: downloadableVideos.length,
        errors: []
      })
      setShowBatchResult(true)
      
      // Clear selection after successful batch operation
      setSelectedVideoIds(new Set())
      
      // Announce success
      announceSuccess(`Successfully started download for ${downloadableVideos.length} videos`)
      
      // Auto-hide result after 5 seconds
      setTimeout(() => {
        setShowBatchResult(false)
        setBatchOperationResult(null)
      }, 5000)
      
    } catch (error) {
      // Handle partial success scenarios
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Try to extract partial success information from error message
      let successCount = 0
      let failedCount = downloadableVideos.length
      
      // Check if the error message contains success information
      if (errorMessage.includes('Created') && errorMessage.includes('download tasks')) {
        const match = errorMessage.match(/Created (\d+) download tasks/)
        if (match) {
          successCount = parseInt(match[1], 10)
          failedCount = downloadableVideos.length - successCount
        }
      }
      
      setBatchOperationResult({
        success: successCount,
        failed: failedCount,
        total: downloadableVideos.length,
        errors: [errorMessage]
      })
      setShowBatchResult(true)
      
      // If there was partial success, clear selection
      if (successCount > 0) {
        setSelectedVideoIds(new Set())
      }
      
      setTimeout(() => {
        setShowBatchResult(false)
        setBatchOperationResult(null)
      }, 8000)
    }
  }, [selectedVideoIds, triggerBatchDownload, videos])

  // Individual video action handlers
  const handleVideoAction = useCallback((video: Video, action: 'download' | 'view') => {
    switch (action) {
      case 'download':
        triggerBatchDownload([video.id])
        break
      case 'view':
        // navigate({ to: '/target-videos/$videoId', params: { videoId: video.id } })
        break
    }
  }, [triggerBatchDownload, navigate])

  const handleThumbnailClick = useCallback((video: Video) => {
    if (video.video_url) {
      window.open(video.video_url, '_blank', 'noopener,noreferrer')
    }
  }, [])

 
   // Computed values
   const selectedCount = selectedVideoIds.size
  const allSelected = selectedCount === videos.length && videos.length > 0

  const selectedDownloadableCount = useMemo(() => {
    return Array.from(selectedVideoIds).filter(id => {
      const video = videos.find(v => v.id === id)
      return video && !video.is_downloaded
    }).length
  }, [selectedVideoIds, videos])

  // Keyboard shortcuts for batch operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            event.preventDefault()
            handleSelectAll()
            break
          case 'd':
            if (selectedCount > 0) {
              event.preventDefault()
              handleBatchDownload()
            }
            break
        }
      }

      if (event.key === 'Escape') {
        handleClearSelection()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSelectAll, handleClearSelection, handleBatchDownload, selectedCount])

  if (loadingStates.videos) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading videos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (errorStates.videos) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load videos: {errorStates.videos}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className={isMobile ? touchPadding : ''}>
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
          <CardTitle className={isMobile ? 'text-base' : ''}>
            Videos ({videos.length})
            {videos.length > 0 && !isMobile && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                • {videos.filter(v => !v.is_downloaded).length} downloadable
              </span>
            )}
            {videos.length > 0 && isMobile && (
              <div className="text-xs font-normal text-muted-foreground mt-1">
                {videos.filter(v => !v.is_downloaded).length} downloadable
              </div>
            )}
          </CardTitle>
          
          {/* Responsive Batch Selection Controls */}
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-2'}`}>
            {!isMobile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{selectedCount} selected</span>
              </div>
            )}
            
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-2'}`}>
              <Button
                variant="outline"
                size={isMobile ? "default" : "sm"}
                onClick={allSelected ? handleClearSelection : handleSelectAll}
                className={`${touchTargetSize} ${isMobile ? 'w-full justify-center' : 'flex items-center gap-1'}`}
                title={allSelected ? "Clear all selections (Esc)" : "Select all videos (Ctrl+A)"}
                aria-label={allSelected ? `Clear all ${videos.length} video selections` : `Select all ${videos.length} videos`}
              >
                {allSelected ? (
                  <>
                    <Square className="h-4 w-4" aria-hidden="true" />
                    <span className="ml-2">Clear All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" aria-hidden="true" />
                    <span className="ml-2">Select All</span>
                  </>
                )}
              </Button>
              
              {selectedCount > 0 && (
                <Button
                  variant="default"
                  size={isMobile ? "default" : "sm"}
                  onClick={handleBatchDownload}
                  disabled={loadingStates.batchDownload || selectedDownloadableCount === 0}
                  className={`${touchTargetSize} ${isMobile ? 'w-full justify-center' : 'flex items-center gap-1'}`}
                  title={`Download ${selectedDownloadableCount} selected video(s) (Ctrl+D)`}
                  aria-label={`Download ${selectedDownloadableCount} selected videos out of ${selectedCount} total selected`}
                >
                  {loadingStates.batchDownload ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="ml-2">
                    Download ({selectedDownloadableCount})
                    {isMobile && selectedCount > selectedDownloadableCount && (
                      <span className="text-xs opacity-75 ml-1">
                        of {selectedCount}
                      </span>
                    )}
                  </span>
                </Button>
              )}
            </div>
            
            {isMobile && (
              <div className="text-xs text-muted-foreground text-center">
                {selectedCount} selected
              </div>
            )}
          </div>
        </div>
        
        {/* Batch Operation Progress/Results */}
        {loadingStates.batchDownload && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing batch download...
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}
        
        {showBatchResult && batchOperationResult && (
          <Alert className={`mt-4 ${batchOperationResult.failed > 0 ? 'border-destructive' : 'border-green-500'}`}>
            <div className="flex items-center gap-2">
              {batchOperationResult.failed > 0 ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <div>
                    Batch operation completed: {batchOperationResult.success} successful, {batchOperationResult.failed} failed out of {batchOperationResult.total} total
                  </div>
                  {batchOperationResult.errors.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Errors: {batchOperationResult.errors.join(', ')}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No videos found for this account
          </div>
        ) : (
          <div className="h-[600px]">
            <List
              height={600}
              itemCount={videos.length}
              itemSize={230}
              width="100%"
              itemData={{
                videos,
                selectedVideoIds,
                handleVideoSelect,
                handleVideoAction,
                handleThumbnailClick,
              }}
            >
              {Row}
            </List>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface VideoItemProps {
  video: Video
  isSelected: boolean
  onSelect: (videoId: string, checked: boolean) => void
  onAction: (video: Video, action: 'download' | 'view') => void
  onThumbnailClick: (video: Video) => void
}

interface RowProps {
  index: number
  style: React.CSSProperties
  data: {
    videos: Video[]
    selectedVideoIds: Set<string>
    handleVideoSelect: (videoId: string, checked: boolean) => void
    handleVideoAction: (video: Video, action: 'download' | 'view') => void
    handleThumbnailClick: (video: Video) => void
  }
}

const Row = ({ index, style, data }: RowProps) => {
  const {
    videos,
    selectedVideoIds,
    handleVideoSelect,
    handleVideoAction,
    handleThumbnailClick,
  } = data
  const video = videos[index]
  const isSelected = selectedVideoIds.has(video.id)

  return (
    <div style={style}>
      <VideoItem
        video={video}
        isSelected={isSelected}
        onSelect={handleVideoSelect}
        onAction={handleVideoAction}
        onThumbnailClick={handleThumbnailClick}
      />
    </div>
  )
}

function VideoItem({
  video,
  isSelected,
  onSelect,
  onAction,
  onThumbnailClick,
}: VideoItemProps) {
  const getVideoStatus = (): 'downloaded' | 'not_downloaded' => {
    if (video.is_downloaded) {
      return 'downloaded'
    }
    return 'not_downloaded'
  }

  const getStatusBadge = () => {
    const status = getVideoStatus()
    switch (status) {
      case 'downloaded':
        return <Badge variant="secondary">Downloaded</Badge>
      default:
        return <Badge variant="outline">Not Downloaded</Badge>
    }
  }

  const getActionButton = () => {
    const status = getVideoStatus()
    switch (status) {
      case 'not_downloaded':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction(video, 'download')}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )
      case 'downloaded':
        return (
          <Button
            variant="outline"
            size="sm"
            // onClick={() => onAction(video, 'view')}
            className="flex items-center gap-1"
          >
            View Details
          </Button>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Unknown'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === null || num === undefined) return 'N/A'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <div
      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer"
      role="article"
      // onClick={() => onNavigateToDetail(video.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // onNavigateToDetail(video.id)
        }
      }}
      tabIndex={0}
      aria-labelledby={`video-${video.id}-title`}
      aria-describedby={`video-${video.id}-status video-${video.id}-meta`}
    >
      {/* Selection Checkbox */}
      <div className="flex items-center pt-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(video.id, checked as boolean)}
          aria-label={`Select video: ${video.title}`}
          aria-describedby={`video-${video.id}-status`}
        />
      </div>

      {/* Video Thumbnail */}
      <div className="flex-shrink-0">
        <div
          className="w-32 h-20 bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation()
            onThumbnailClick(video)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onThumbnailClick(video)
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View original video: ${video.title}`}
        >
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={`Thumbnail for ${video.title}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-muted-foreground hidden">
            <Play className="h-8 w-8" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Video Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3
              id={`video-${video.id}-title`}
              className="font-medium line-clamp-2 mb-1"
            >
              {video.title}
            </h3>
            
            <div
              id={`video-${video.id}-meta`}
              className="flex items-center gap-4 text-sm text-muted-foreground mb-2"
              aria-label={`Video metrics: ${formatNumber(video.latest_snapshot?.views_count)} views, ${formatNumber(video.latest_snapshot?.likes_count)} likes, ${formatNumber(video.latest_snapshot?.comments_count)} comments, published ${formatDate(video.published_at)}`}
            >
              <span aria-label="View count">{formatNumber(video.latest_snapshot?.views_count)} views</span>
              <span aria-label="Like count">{formatNumber(video.latest_snapshot?.likes_count)} likes</span>
              <span aria-label="Comment count">{formatNumber(video.latest_snapshot?.comments_count)} comments</span>
              <span aria-label={`Published ${formatDate(video.published_at)}`}>{formatDate(video.published_at)}</span>
            </div>
            
            <div className="flex items-center gap-2" id={`video-${video.id}-status`}>
              {getStatusBadge()}
              {/* {video.video_type && (
                <Badge variant="outline" className="capitalize" aria-label={`Video type: ${video.video_type}`}>
                  {video.video_type}
                </Badge>
              )} */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0" role="group" aria-label={`Actions for ${video.title}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onThumbnailClick(video)}
              className="flex items-center gap-1"
              aria-label={`Open ${video.title} in new tab`}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Button>
            {getActionButton()}
          </div>
        </div>
      </div>
    </div>
  )
}