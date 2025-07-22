import { VideoDetailProvider } from '../context/video-detail-context'
import { VideoPlayer } from '../components/video-player'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EnhancedVideoPlayerExampleProps {
  videoId: string
}

/**
 * Example component demonstrating the enhanced video player with download status management
 * 
 * Features demonstrated:
 * 1. Real-time download progress tracking
 * 2. Download completion notifications
 * 3. Retry functionality for failed downloads
 * 4. Cancel download monitoring
 * 5. Estimated time remaining
 * 6. Retry attempt counting
 */
export function EnhancedVideoPlayerExample({ videoId }: EnhancedVideoPlayerExampleProps) {
  return (
    <VideoDetailProvider videoId={videoId}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Video Player with Download Status Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              This example shows the enhanced video player with comprehensive download status management.
              Try downloading a video to see the real-time progress tracking, notifications, and retry functionality.
            </p>
          </CardHeader>
          <CardContent>
            <VideoPlayer 
              video={{
                id: videoId,
                title: "Example Video",
                thumbnail_url: "https://example.com/thumbnail.jpg",
                video_url: "https://example.com/video.mp4",
                is_downloaded: false,
                platform: "youtube",
                video_type: "long",
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                account_id: "example-account"
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download Status Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Real-time Status Updates</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Automatic polling every 2 seconds</li>
                  <li>• Visual status indicators</li>
                  <li>• Progress percentage display</li>
                  <li>• Estimated time remaining</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">User Notifications</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Success notifications with details</li>
                  <li>• Error notifications with retry actions</li>
                  <li>• Progress updates during download</li>
                  <li>• Timeout warnings</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Error Handling & Retry</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• One-click retry functionality</li>
                  <li>• Retry attempt counter</li>
                  <li>• Specific error message display</li>
                  <li>• Multiple retry entry points</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Task Management</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Task ID tracking</li>
                  <li>• Download monitoring with cleanup</li>
                  <li>• Cancel download option</li>
                  <li>• Automatic timeout protection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VideoDetailProvider>
  )
}

/**
 * Usage example:
 * 
 * ```tsx
 * function VideoDetailPage() {
 *   const { videoId } = useParams()
 *   
 *   return (
 *     <EnhancedVideoPlayerExample videoId={videoId} />
 *   )
 * }
 * ```
 */