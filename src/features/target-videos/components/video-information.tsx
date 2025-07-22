
import { Video } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Clock, Calendar, Eye, Heart, MessageCircle, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface VideoInformationProps {
  video: Video
  className?: string
}

export function VideoInformation({ video, className }: VideoInformationProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return {
        formatted: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        relative: formatDistanceToNow(date, { addSuffix: true })
      }
    } catch {
      return {
        formatted: 'Invalid date',
        relative: 'Unknown'
      }
    }
  }

  const publishedDate = formatDate(video.published_at)
  const discoveredDate = formatDate(video.discovered_at)

  const handleExternalLinkClick = () => {
    if (video.video_url) {
      window.open(video.video_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl font-bold leading-tight break-words">
                {video.title || 'Untitled Video'}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">
                  {video.platform}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {video.video_type}
                </Badge>
                {video.is_downloaded && (
                  <Badge variant="default">Downloaded</Badge>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExternalLinkClick}
              disabled={!video.video_url}
              className="shrink-0"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(video.duration)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-sm text-muted-foreground" title={publishedDate.formatted}>
                  {publishedDate.relative}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Discovered</p>
                <p className="text-sm text-muted-foreground" title={discoveredDate.formatted}>
                  {discoveredDate.relative}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {video.description}
                </p>
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div>
            <h3 className="text-sm font-medium mb-3">Technical Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Video ID:</span>
                  <span className="font-mono text-xs break-all">{video.platform_video_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="capitalize">{video.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{video.video_type}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Download Status:</span>
                  <div className="flex items-center gap-2">
                    {video.is_downloaded ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">Downloaded</span>
                      </>
                    ) : video.download_status === 'pending' ? (
                      <>
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">Pending</span>
                      </>
                    ) : video.download_status === 'processing' ? (
                      <>
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-blue-600 font-medium">Downloading</span>
                      </>
                    ) : video.download_status === 'failed' ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">Failed</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Not Downloaded</span>
                      </>
                    )}
                  </div>
                </div>
                
                {video.local_file_size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size:</span>
                    <span className="font-medium">{(video.local_file_size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                )}
                
                {video.local_file_path && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local Path:</span>
                    <span className="text-xs text-muted-foreground font-mono truncate max-w-48" title={video.local_file_path}>
                      {video.local_file_path}
                    </span>
                  </div>
                )}
                
                {video.download_status && !video.is_downloaded && (
                  <div className="p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2 text-sm">
                      {video.download_status === 'pending' && (
                        <>
                          <Clock className="w-3 h-3 text-yellow-600" />
                          <span className="text-yellow-700">Download task is queued and will start soon</span>
                        </>
                      )}
                      {video.download_status === 'processing' && (
                        <>
                          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                          <span className="text-blue-700">Video is being downloaded...</span>
                        </>
                      )}
                      {video.download_status === 'failed' && (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span className="text-red-700">Download failed. You can retry from the video player.</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Placeholder for engagement metrics */}
          <div>
            <h3 className="text-sm font-medium mb-3">Engagement Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Views</p>
                  <p className="text-sm text-muted-foreground">Not available</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Likes</p>
                  <p className="text-sm text-muted-foreground">Not available</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Comments</p>
                  <p className="text-sm text-muted-foreground">Not available</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Engagement metrics will be available when the video analysis feature is implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}