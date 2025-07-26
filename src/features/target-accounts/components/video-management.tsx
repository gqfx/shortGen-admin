import { useState, useEffect } from 'react'
import { Video, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useTargetAccounts } from '../context/target-accounts-context'
import { Video as VideoType } from '@/lib/api'

interface VideoManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  accountName: string
}

export function VideoManagement({ 
  open, 
  onOpenChange, 
  accountId, 
  accountName 
}: VideoManagementProps) {
  const { getAccountVideos, triggerVideoDownload } = useTargetAccounts()
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])

  useEffect(() => {
    if (open && accountId) {
      fetchVideos()
    }
  }, [open, accountId])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const result = await getAccountVideos(accountId, { page: 1, size: 100 }) // Fetch up to 100 videos
      if (result) {
        setVideos(result.items)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSelected = async () => {
    if (selectedVideos.length === 0) return
    
    await triggerVideoDownload({ video_ids: selectedVideos })
    setSelectedVideos([])
  }

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([])
    } else {
      setSelectedVideos(videos.map(video => video.id))
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Videos for {accountName}
          </DialogTitle>
          <DialogDescription>
            Manage videos and trigger downloads for this account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedVideos.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedVideos.length} video(s) selected
              </span>
              <Button size="sm" onClick={handleDownloadSelected}>
                <Download className="mr-2 h-4 w-4" />
                Download Selected
              </Button>
            </div>
          )}

          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading videos...
              </div>
            ) : videos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No videos found for this account.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedVideos.length === videos.length && videos.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedVideos.includes(video.id)}
                          onCheckedChange={() => toggleVideoSelection(video.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{video.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {video.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* {getVideoTypeBadge(video.video_type)} */}
                      </TableCell>
                      <TableCell>
                        {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={video.is_downloaded ? 'default' : 'secondary'}>
                          {video.is_downloaded ? 'Downloaded' : 'Not Downloaded'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(video.video_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}