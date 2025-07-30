import { useState, useCallback } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccountDetail } from '../context/account-detail-context'
import { Video } from '@/lib/api'
import { useResponsive, useTouchFriendly } from '@/hooks/use-responsive'
import { Pagination } from '@/components/ui/pagination'
import { VideoDetailDialog } from './video-detail-dialog'
import { BatchOperations } from './video-list/batch-operations'
import { BatchResultDisplay } from './video-list/batch-result-display'
import { VideoVirtualizedList } from './video-list/video-virtualized-list'
import { useKeyboardShortcuts } from './video-list/use-keyboard-shortcuts'

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
    triggerBatchDownload,
    currentFilters,
    filterVideos,
    pagination,
    setPagination,
  } = useAccountDetail()
  
  const { isMobile } = useResponsive()
  const { touchPadding } = useTouchFriendly()
  
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())
  const [batchOperationResult, setBatchOperationResult] = useState<BatchOperationResult | null>(null)
  const [showBatchResult, setShowBatchResult] = useState(false)
  const [detailVideo, setDetailVideo] = useState<Video | null>(null)

  const sortOptions = [
    { value: 'views_desc', label: 'Most Views' },
    { value: 'date_desc', label: 'Newest First' },
  ]

  const handleSortChange = (value: string) => {
    filterVideos({ ...currentFilters, sortBy: value as 'views_desc' | 'date_desc' })
  }

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
  const handleBatchDownload = useCallback(async (videoIds: string[]) => {
    try {
      await triggerBatchDownload(videoIds)
      
      // Show success result
      setBatchOperationResult({
        success: videoIds.length,
        failed: 0,
        total: videoIds.length,
        errors: []
      })
      setShowBatchResult(true)
      
      // Clear selection after successful batch operation
      setSelectedVideoIds(new Set())
      
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
      let failedCount = videoIds.length
      
      // Check if the error message contains success information
      if (errorMessage.includes('Created') && errorMessage.includes('download tasks')) {
        const match = errorMessage.match(/Created (\d+) download tasks/)
        if (match) {
          successCount = parseInt(match[1], 10)
          failedCount = videoIds.length - successCount
        }
      }
      
      setBatchOperationResult({
        success: successCount,
        failed: failedCount,
        total: videoIds.length,
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
      
      throw error // Re-throw to let BatchOperations handle the error display
    }
  }, [triggerBatchDownload])

  // Individual video action handlers
  const handleVideoAction = useCallback((video: Video, action: 'download' | 'view') => {
    switch (action) {
      case 'download':
        handleBatchDownload([video.id])
        break
      case 'view':
        setDetailVideo(video)
        break
    }
  }, [handleBatchDownload])

  const handleThumbnailClick = useCallback((video: Video) => {
    if (video.video_id) {
      window.open(`https://www.youtube.com/shorts/${video.video_id}`, '_blank', 'noopener,noreferrer')
    }
  }, [])

  // Use keyboard shortcuts
  useKeyboardShortcuts({
    onSelectAll: handleSelectAll,
    onClearSelection: handleClearSelection,
    onBatchDownload: () => handleBatchDownload(Array.from(selectedVideoIds)),
    selectedCount: selectedVideoIds.size,
  })

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
    <>
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
            
            {/* Responsive Controls */}
            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
              <div className="w-[180px]">
                <Select
                  value={currentFilters?.sortBy || 'views_desc'}
                  onValueChange={handleSortChange}
                  disabled={loadingStates.videos}
                >
                  <SelectTrigger aria-label="Sort by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <BatchOperations
                videos={videos}
                selectedVideoIds={selectedVideoIds}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onBatchDownload={handleBatchDownload}
                loadingStates={loadingStates}
                isMobile={isMobile}
              />
            </div>
          </div>
          
          <BatchResultDisplay
            isLoading={loadingStates.batchDownload}
            result={batchOperationResult}
            showResult={showBatchResult}
          />
        </CardHeader>
        
        <CardContent>
          <VideoVirtualizedList
            videos={videos}
            selectedVideoIds={selectedVideoIds}
            onVideoSelect={handleVideoSelect}
            onVideoAction={handleVideoAction}
            onThumbnailClick={handleThumbnailClick}
          />
        </CardContent>
        
        <CardFooter>
          <Pagination
            page={pagination.page}
            total={pagination.total}
            pageSize={pagination.size}
            onPageChange={(page) => {
              setPagination({ page })
            }}
            onPageSizeChange={(size) => {
              setPagination({ size, page: 1 })
            }}
          />
        </CardFooter>
      </Card>
      
      {detailVideo && (
        <VideoDetailDialog
          video={detailVideo}
          open={!!detailVideo}
          onOpenChange={(open) => !open && setDetailVideo(null)}
        />
      )}
    </>
  )
}