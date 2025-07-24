import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Video } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

interface VideoDetailDialogProps {
  video: Video
  children?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatNumber = (num: number | undefined | null) => {
  if (num === null || num === undefined) return 'N/A'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'Unknown'
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch {
    return 'Invalid date'
  }
}

export function VideoDetailDialog({ video, children, open, onOpenChange }: VideoDetailDialogProps) {
  const getVideoUrl = (storagePath: string) => {
    try {
      const url = new URL(storagePath);
      return url.pathname;
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[80vw] max-w-screen-xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="line-clamp-2">{video.title}</DialogTitle>
          <DialogDescription>
            Published {formatDate(video.published_at)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-4">
          <div className="md:col-span-2">
            {video.asset?.storage_path ? (
              <video
                src={getVideoUrl(video.asset.storage_path)}
                controls
                className="w-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No video asset available for playback</p>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-medium">{formatNumber(video.latest_snapshot?.views_count)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Likes</p>
                  <p className="font-medium">{formatNumber(video.latest_snapshot?.likes_count)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Comments</p>
                  <p className="font-medium">{formatNumber(video.latest_snapshot?.comments_count)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shares</p>
                  <p className="font-medium">{formatNumber(video.latest_snapshot?.shares_count)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Analysis</h3>
              <div className="text-sm text-muted-foreground">
                {video.analysis_results ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {JSON.stringify(video.analysis_results, null, 2)}
                  </pre>
                ) : (
                  <p>No analysis data available.</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {video.is_downloaded ? (
                  <Badge variant="secondary">Downloaded</Badge>
                ) : (
                  <Badge variant="outline">Not Downloaded</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}