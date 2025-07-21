import { useState } from 'react'
import { MoreHorizontal, Edit, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMonitoringTasks } from '../context/monitoring-tasks-context'
import { MonitoringTask } from '@/lib/api'

export function TaskTable() {
  const { tasks, loading, error, updateTask } = useMonitoringTasks()
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'outline',
    } as const

    const colors = {
      pending: '🟡',
      processing: '🔄',
      completed: '✅',
      failed: '❌',
      cancelled: '⏹️',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <span className="mr-1">{colors[status as keyof typeof colors] || '❓'}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTaskTypeIcon = (taskType: string) => {
    const icons = {
      crawl_channel_info: '📋',
      crawl_channel_videos: '🎬',
      download_video_file: '⬇️',
      analyze_video_content: '🔍',
    } as const

    return icons[taskType as keyof typeof icons] || '📝'
  }

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    setUpdatingTask(taskId)
    try {
      await updateTask(taskId, { status })
    } finally {
      setUpdatingTask(null)
    }
  }

  const handleCancelTask = async (taskId: string) => {
    await handleUpdateTaskStatus(taskId, 'cancelled')
  }

  const handleRetryTask = async (taskId: string) => {
    await handleUpdateTaskStatus(taskId, 'pending')
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading monitoring tasks: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring Tasks ({tasks.length})</CardTitle>
        <CardDescription>
          Track and manage all monitoring and crawl tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Video ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                      <div>
                        <p className="font-medium">{task.task_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="text-sm text-muted-foreground">ID: {task.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.account_id ? (
                      <Badge variant="outline">#{task.account_id}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.video_id ? (
                      <Badge variant="outline">#{task.video_id}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(task.status)}
                  </TableCell>
                  <TableCell>
                    {task.priority ? (
                      <Badge variant={task.priority <= 5 ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(task.created_at).toLocaleDateString()} {new Date(task.created_at).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(task.updated_at).toLocaleDateString()} {new Date(task.updated_at).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={updatingTask === task.id}>
                          {updatingTask === task.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        {task.status === 'failed' && (
                          <DropdownMenuItem onClick={() => handleRetryTask(task.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Task
                          </DropdownMenuItem>
                        )}
                        
                        {(task.status === 'pending' || task.status === 'processing') && (
                          <DropdownMenuItem 
                            onClick={() => handleCancelTask(task.id)}
                            className="text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Task
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => console.log('View details for task', task.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No monitoring tasks found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}