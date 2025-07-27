import { useState, useCallback } from 'react'
import { Download, Copy, CheckSquare, Square, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Video } from '@/lib/api'
import { showErrorMessage, showSuccessMessage } from '@/lib/error-handling'
import { useAccessibility } from '@/hooks/use-accessibility'
import { useTouchFriendly } from '@/hooks/use-responsive'

interface BatchOperationsProps {
  videos: Video[]
  selectedVideoIds: Set<string>
  onSelectAll: () => void
  onClearSelection: () => void
  onBatchDownload: (videoIds: string[]) => Promise<void>
  loadingStates: {
    batchDownload: boolean
  }
  isMobile: boolean
}

export function BatchOperations({
  videos,
  selectedVideoIds,
  onSelectAll,
  onClearSelection,
  onBatchDownload,
  loadingStates,
  isMobile,
}: BatchOperationsProps) {
  const { touchTargetSize } = useTouchFriendly()
  const { announceStatus, announceError, announceSuccess } = useAccessibility()
  
  const selectedCount = selectedVideoIds.size
  const allSelected = selectedCount === videos.length && videos.length > 0
  
  const selectedDownloadableCount = Array.from(selectedVideoIds).filter(id => {
    const video = videos.find(v => v.id === id)
    return video && !video.is_downloaded
  }).length

  const handleBatchDownload = useCallback(async () => {
    if (selectedVideoIds.size === 0) {
      showErrorMessage('Please select videos to download')
      announceError('No videos selected for download')
      return
    }

    const videoIdsArray = Array.from(selectedVideoIds)
    const downloadableVideos = videoIdsArray.filter(id => {
      const video = videos.find(v => v.id === id)
      return video && !video.is_downloaded
    })

    if (downloadableVideos.length === 0) {
      showErrorMessage('No downloadable videos selected')
      announceError('No downloadable videos selected')
      return
    }

    if (downloadableVideos.length < videoIdsArray.length) {
      const alreadyDownloaded = videoIdsArray.length - downloadableVideos.length
      const message = `${alreadyDownloaded} video(s) already downloaded, proceeding with ${downloadableVideos.length} video(s)`
      showSuccessMessage(message)
      announceStatus(message)
    }

    announceStatus(`Starting download for ${downloadableVideos.length} videos`)
    
    try {
      await onBatchDownload(downloadableVideos)
      announceSuccess(`Successfully started download for ${downloadableVideos.length} videos`)
    } catch (error) {
      showErrorMessage(error, 'Batch download failed')
    }
  }, [selectedVideoIds, videos, onBatchDownload, announceStatus, announceError, announceSuccess])

  const handleBatchCopyUrl = useCallback(async () => {
    if (selectedVideoIds.size === 0) {
      showErrorMessage('Please select videos to copy URLs')
      announceError('No videos selected for copying URLs')
      return
    }

    const videoUrls = Array.from(selectedVideoIds)
      .map(id => videos.find(v => v.id === id)?.video_url)
      .map(url => {
        if (url && url.includes('youtube.com/watch?v=')) {
          try {
            const videoId = new URL(url).searchParams.get('v')
            if (videoId) {
              return `https://www.youtube.com/shorts/${videoId}`
            }
          } catch (_e) {
            return url
          }
        }
        return url
      })
      .filter((url): url is string => !!url)

    if (videoUrls.length === 0) {
      showErrorMessage('No valid URLs found for the selected videos')
      announceError('No valid URLs found for the selected videos')
      return
    }

    try {
      await navigator.clipboard.writeText(videoUrls.join('\n'))
      showSuccessMessage(`已成功复制 ${videoUrls.length} 个视频链接`)
      announceSuccess(`Copied ${videoUrls.length} video URLs`)
    } catch (error) {
      showErrorMessage('复制链接失败')
      announceError('Failed to copy URLs to clipboard')
    }
  }, [selectedVideoIds, videos, announceError, announceSuccess])

  return (
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
          onClick={allSelected ? onClearSelection : onSelectAll}
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

        {selectedCount > 0 && (
          <Button
            variant="outline"
            size={isMobile ? "default" : "sm"}
            onClick={handleBatchCopyUrl}
            className={`${touchTargetSize} ${isMobile ? 'w-full justify-center' : 'flex items-center gap-1'}`}
            title={`Copy URLs for ${selectedCount} selected video(s)`}
            aria-label={`Copy URLs for ${selectedCount} selected videos`}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span className="ml-2">
              Copy URLs ({selectedCount})
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
  )
}