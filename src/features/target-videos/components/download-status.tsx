import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  AlertCircle,
  Loader2,
  X,
  Clock,
  RefreshCw,
  CheckCircle
} from 'lucide-react'

interface DownloadProgress {
  taskId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  message?: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  retryCount?: number
  estimatedTimeRemaining?: string
}

interface DownloadStatusProps {
  downloadProgress: DownloadProgress | null
  isLoading: boolean
  onRetry: () => void
  onCancel: () => void
  className?: string
  compact?: boolean
}

export function DownloadStatus({ 
  downloadProgress, 
  isLoading, 
  onRetry, 
  onCancel,
  className = '',
  compact = false
}: DownloadStatusProps) {
  if (!downloadProgress && !isLoading) {
    return null
  }

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
    }
    
    switch (downloadProgress?.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Download className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    if (isLoading) {
      return 'Initiating download...'
    }
    
    switch (downloadProgress?.status) {
      case 'pending':
        return 'Download Queued'
      case 'processing':
        return 'Downloading...'
      case 'completed':
        return 'Download Complete'
      case 'failed':
        return 'Download Failed'
      default:
        return 'Download Status'
    }
  }

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-700'
    
    switch (downloadProgress?.status) {
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

  const getBgColor = () => {
    if (isLoading) return 'bg-blue-50 border-blue-200'
    
    switch (downloadProgress?.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-muted border-border'
    }
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-md ${getBgColor()} ${className}`}>
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {downloadProgress?.estimatedTimeRemaining && (
          <Badge variant="outline" className="text-xs">
            {downloadProgress.estimatedTimeRemaining}
          </Badge>
        )}
        {downloadProgress && downloadProgress.status !== 'completed' && (
          <Button
            onClick={onCancel}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 ml-auto"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {downloadProgress && downloadProgress.status !== 'completed' && (
          <Button
            onClick={onCancel}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {downloadProgress?.message || 'Preparing download task...'}
        </p>
        
        {downloadProgress?.progress !== undefined && (
          <div className="space-y-1">
            <Progress value={downloadProgress.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {downloadProgress.progress}%
            </p>
          </div>
        )}
        
        {downloadProgress?.estimatedTimeRemaining && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Estimated time remaining: {downloadProgress.estimatedTimeRemaining}</span>
          </div>
        )}
        
        {downloadProgress?.retryCount && downloadProgress.retryCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <RefreshCw className="w-3 h-3" />
            <span>Retry attempt #{downloadProgress.retryCount}</span>
          </div>
        )}
        
        {downloadProgress?.status === 'failed' && (
          <div className="flex items-center justify-between pt-2 border-t border-red-200">
            <p className="text-xs text-red-600 flex-1 mr-2">
              {downloadProgress.errorMessage || 'Unknown error occurred'}
            </p>
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          {downloadProgress?.startedAt && (
            <span>Started: {new Date(downloadProgress.startedAt).toLocaleString()}</span>
          )}
          {downloadProgress?.taskId && (
            <span>Task ID: {downloadProgress.taskId}</span>
          )}
        </div>
      </div>
    </div>
  )
}