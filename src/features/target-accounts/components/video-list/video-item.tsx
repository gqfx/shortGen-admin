import { useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Play,
  Download,
  ExternalLink,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Video } from '@/lib/api'
import { showErrorMessage, showSuccessMessage } from '@/lib/error-handling'

interface VideoItemProps {
  video: Video
  isSelected: boolean
  onSelect: (videoId: string, checked: boolean) => void
  onAction: (video: Video, action: 'download' | 'view') => void
  onThumbnailClick: (video: Video) => void
}

export function VideoItem({
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
            onClick={() => onAction(video, 'view')}
            className="flex items-center gap-1"
          >
            View Details
          </Button>
        )
      default:
        return null
    }
  }

  const handleCopyLink = useCallback(async () => {
    if (!video.video_id) {
      showErrorMessage('No video link available to copy.')
      return
    }
    try {
      await navigator.clipboard.writeText(`https://www.youtube.com/shorts/${video.video_id}`)
      showSuccessMessage('Video link copied to clipboard!')
    } catch {
      showErrorMessage('Failed to copy video link.')
    }
  }, [video.video_id])

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

  const renderDiff = (diff: number) => {
    if (diff > 0) {
      return <span className="text-xs text-green-500 ml-1">↑{formatNumber(diff)}</span>
    } else if (diff < 0) {
      return <span className="text-xs text-red-500 ml-1">↓{formatNumber(Math.abs(diff))}</span>
    }
    return null
  }

  const latest_snapshot = video.snapshots && video.snapshots.length > 0 ? video.snapshots[0] : null
  const prev_snapshot = video.snapshots && video.snapshots.length > 1 ? video.snapshots[1] : null

  const viewsDiff = latest_snapshot && prev_snapshot ? (latest_snapshot.views_count ?? 0) - (prev_snapshot.views_count ?? 0) : 0
  const likesDiff = latest_snapshot && prev_snapshot ? (latest_snapshot.likes_count ?? 0) - (prev_snapshot.likes_count ?? 0) : 0
  const commentsDiff = latest_snapshot && prev_snapshot ? (latest_snapshot.comments_count ?? 0) - (prev_snapshot.comments_count ?? 0) : 0

  return (
    <div
      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer"
      role="article"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
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
              aria-label={`Video metrics: ${formatNumber(latest_snapshot?.views_count)} views, ${formatNumber(latest_snapshot?.likes_count)} likes, ${formatNumber(latest_snapshot?.comments_count)} comments, published ${formatDate(video.published_at)}`}
            >
              <span aria-label="View count">{formatNumber(latest_snapshot?.views_count)} views {renderDiff(viewsDiff)}</span>
              <span aria-label="Like count">{formatNumber(latest_snapshot?.likes_count)} likes {renderDiff(likesDiff)}</span>
              <span aria-label="Comment count">{formatNumber(latest_snapshot?.comments_count)} comments {renderDiff(commentsDiff)}</span>
              <span aria-label={`Published ${formatDate(video.published_at)}`}>{formatDate(video.published_at)}</span>
            </div>
            
            <div className="flex items-center gap-2" id={`video-${video.id}-status`}>
              {getStatusBadge()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0" role="group" aria-label={`Actions for ${video.title}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center gap-1"
              aria-label={`Copy link for ${video.title}`}
              disabled={!video.video_url}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
            </Button>
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