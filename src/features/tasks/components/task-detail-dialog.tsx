import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Task } from '../data/schema'
import { statuses } from '../data/data'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

// Helper function to check if URL is an image
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext))
}

// Helper function to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv']
  return videoExtensions.some(ext => url.toLowerCase().includes(ext))
}

// Component to render media items from task output
const MediaRenderer = ({ items }: { items: any[] }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
        {items.map((item, index) => {
          if (item.url) {
            if (isImageUrl(item.url)) {
              return (
                <div key={item.id || index} className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow flex-shrink-0">
                  <img 
                    src={item.url} 
                    alt={item.title || `Generated Image ${index + 1}`}
                    className="w-[150px] h-auto object-cover"
                    loading="lazy"
                  />
                  {item.id && (
                    <div className="px-2 py-1">
                      <p className="text-xs text-muted-foreground font-mono truncate">ID: {item.id}</p>
                    </div>
                  )}
                </div>
              )
            } else if (isVideoUrl(item.url)) {
              return (
                <div key={item.id || index} className="border rounded-md overflow-hidden shadow-sm flex-shrink-0">
                  <video 
                    src={item.url} 
                    controls 
                    className="w-[150px] h-auto"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  {item.id && (
                    <div className="px-2 py-1">
                      <p className="text-xs text-muted-foreground font-mono truncate">ID: {item.id}</p>
                    </div>
                  )}
                </div>
              )
            }
          }
          return (
            <div key={item.id || index} className="border rounded-md p-2 bg-muted flex-shrink-0 w-[150px]">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TaskDetailDialog({ open, onOpenChange, task }: Props) {
  if (!task) return null

  const status = statuses.find(s => s.value === task.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[98vh] flex flex-col" style={{ width: '1200px', maxWidth: '95vw' }}>
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2">
            Task #{task.id}
            {status && (
              <Badge variant="outline" className="flex items-center gap-1">
                {status.icon && <status.icon className="h-3 w-3" />}
                {status.label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Task details and execution information
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">

            {/* Task Input */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Task Input</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {task.task_input ? (
                  <ScrollArea className="h-32">
                    <pre className="text-xs bg-muted p-3 rounded-md font-mono">
                      {JSON.stringify(task.task_input, null, 2)}
                    </pre>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">No task input available</p>
                )}
              </CardContent>
            </Card>

            {/* Task Output */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Task Output</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {task.task_output && Object.keys(task.task_output).length > 0 ? (
                  <div className="space-y-3">
                    {/* Check if task_output has item array with media URLs */}
                    {task.task_output.item && Array.isArray(task.task_output.item) ? (
                      <div>
                        <h4 className="text-xs font-medium mb-2">Generated Media</h4>
                        <ScrollArea className="max-h-[60vh]">
                          <MediaRenderer items={task.task_output.item} />
                        </ScrollArea>
                      </div>
                    ) : null}
                    
                    {/* Show raw JSON for reference */}
                    <details className="mt-3">
                      <summary className="text-xs font-medium cursor-pointer hover:text-primary">
                        Show Raw Output Data
                      </summary>
                      <ScrollArea className="h-32 mt-2">
                        <pre className="text-xs bg-muted p-3 rounded-md font-mono">
                          {JSON.stringify(task.task_output, null, 2)}
                        </pre>
                      </ScrollArea>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No task output available</p>
                )}
              </CardContent>
            </Card>

            {/* Error Message */}
            {task.error_message && (
              <Card className="border-red-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-600">Error Message</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md max-h-24 overflow-auto">
                    {task.error_message}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}