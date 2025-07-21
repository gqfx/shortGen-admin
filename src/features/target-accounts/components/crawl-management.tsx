import { useState } from 'react'
import { RefreshCw, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useTargetAccounts } from '../context/target-accounts-context'

interface CrawlManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId?: string
  accountIds?: string[]
  accountName?: string
}

export function CrawlManagement({ 
  open, 
  onOpenChange, 
  accountId, 
  accountIds, 
  accountName 
}: CrawlManagementProps) {
  const { triggerAccountCrawl, batchTriggerCrawl } = useTargetAccounts()
  const [crawlVideos, setCrawlVideos] = useState(true)
  const [videoLimit, setVideoLimit] = useState(50)
  const [loading, setLoading] = useState(false)

  const isBatch = accountIds && accountIds.length > 0
  const title = isBatch 
    ? `Trigger Crawl for ${accountIds.length} Accounts`
    : `Trigger Crawl for ${accountName || 'Account'}`

  const handleTriggerCrawl = async () => {
    setLoading(true)
    try {
      const options = {
        crawl_videos: crawlVideos,
        video_limit: videoLimit
      }

      if (isBatch && accountIds) {
        await batchTriggerCrawl(accountIds, options)
      } else if (accountId) {
        await triggerAccountCrawl(accountId, options)
      }
      
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Configure crawl settings and trigger data collection tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-base font-medium">Crawl Videos</div>
              <div className="text-sm text-muted-foreground">
                Collect video list and metadata
              </div>
            </div>
            <Switch
              checked={crawlVideos}
              onCheckedChange={setCrawlVideos}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Video Limit</div>
            <Input
              id="video-limit"
              type="number"
              min={1}
              max={1000}
              value={videoLimit}
              onChange={(e) => setVideoLimit(parseInt(e.target.value) || 50)}
              placeholder="50"
            />
            <div className="text-sm text-muted-foreground">
              Maximum number of videos to crawl (1-1000)
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTriggerCrawl} disabled={loading}>
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Trigger Crawl
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}