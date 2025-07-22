import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Download, 
  Pause, 
  Play, 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Loader2
} from 'lucide-react'
import { targetAccountAnalysisApi, MonitoringTask } from '@/lib/api'
import { toast } from 'sonner'

interface DownloadTask {
  id: string
  videoId: string
  videoTitle: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  errorMessage?: string
  startedAt: string
  estimatedTimeRemaining?: string
}

interface DownloadManagerProps {
  className?: string
  maxVisible?: number
}

export function DownloadManager({ className, maxVisible = 5 }: DownloadManagerProps) {
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  // Fetch active download tasks
  const fetchDownloadTasks = useCallback(async () => {
    try {
      const response = await targetAccountAnalysisApi.getTasks(0, 50, undefined, undefined, 'video_download', undefined)
      
      if (response.data.code === 0) {
        const tasks = response.data.data
          .filter((task: MonitoringTask) => 
            task.task_type === 'video_download' && 
            ['pending', 'processing'].includes(task.status)
          )
          .map((task: MonitoringTask): DownloadTask => ({
            id: task.id,
            videoId: task.video_id || '',
            videoTitle: `Video ${task.video_id}`, // Would need to fetch video details for actual title
            status: task.status as DownloadTask['status'],
            errorMessage: task.error_message || undefined,
            startedAt: task.created_at
          }))
        
        setDownloadTasks(tasks)
        setIsVisible(tasks.length > 0)
      }
    } catch (error) {
      console.warn('Failed to fetch download tasks:', error)
    }
  }, [])

  // Start/stop polling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isPolling) {
      fetchDownloadTasks() // Initial fetch
      interval = setInterval(fetchDownloadTasks, 3000) // Poll every 3 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPolling, fetchDownloadTasks])

  // Auto-start polling when component mounts
  useEffect(() => {
    setIsPolling(true)
    return () => setIsPolling(false)
  }, [])

  const handleRetryDownload = useCallback(async (task: DownloadTask) => {
    try {
      await targetAccountAnalysisApi.triggerVideoDownload({
        video_ids: [task.videoId],
        priority: 10
      })
      toast.success('Download retry initiated')
      fetchDownloadTasks()
    } catch (error) {
      toast.error('Failed to retry download')
    }
  }, [fetchDownloadTasks])

  const handleCancelDownload = useCallback(async (task: DownloadTask) => {
    // Note: This would require a cancel endpoint in the API
    toast.info('Download cancellation not yet implemented')
  }, [])

  const getStatusIcon = (status: DownloadTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Download className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: DownloadTask['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700'
      case 'processing':
        return 'text-blue-700'
      case 'completed':
        return 'text-green-700'
      case 'failed':
        return 'text-red-700'
      default:
        return 'text-muted-foreground'
    }
  }

  if (!isVisible || downloadTasks.length === 0) {
    return null
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-96 z-50 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Active Downloads ({downloadTasks.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {downloadTasks.slice(0, maxVisible).map((task) => (
              <div key={task.id} className="p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(task.status)}
                    <span className="text-sm font-medium truncate">
                      {task.videoTitle}
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </Badge>
                </div>
                
                {task.progress !== undefined && (
                  <div className="mb-2">
                    <Progress value={task.progress} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{task.progress}%</span>
                      {task.estimatedTimeRemaining && (
                        <span>{task.estimatedTimeRemaining} remaining</span>
                      )}
                    </div>
                  </div>
                )}
                
                {task.errorMessage && (
                  <p className="text-xs text-red-600 mb-2">{task.errorMessage}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Started: {new Date(task.startedAt).toLocaleTimeString()}</span>
                  <div className="flex gap-1">
                    {task.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetryDownload(task)}
                        className="h-6 px-2 text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    )}
                    {['pending', 'processing'].includes(task.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelDownload(task)}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {downloadTasks.length > maxVisible && (
              <div className="text-center text-xs text-muted-foreground py-2">
                +{downloadTasks.length - maxVisible} more downloads
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}