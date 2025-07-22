import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Download, Clock } from 'lucide-react'

interface DownloadNotificationProps {
  videoId: string
  videoTitle: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  message?: string
  onRetry?: () => void
}

export function DownloadNotification({
  videoId,
  videoTitle,
  status,
  message,
  onRetry
}: DownloadNotificationProps) {
  const [hasShownNotification, setHasShownNotification] = useState(false)

  useEffect(() => {
    // Only show notification once per status change
    const notificationKey = `${videoId}-${status}`
    
    if (hasShownNotification) return
    
    switch (status) {
      case 'pending':
        toast.info('Download queued', {
          description: `${videoTitle} has been added to the download queue`,
          icon: <Clock className="w-4 h-4" />,
          duration: 3000
        })
        break
        
      case 'processing':
        toast.info('Download started', {
          description: `Downloading ${videoTitle}...`,
          icon: <Download className="w-4 h-4" />,
          duration: 4000
        })
        break
        
      case 'completed':
        toast.success('Download completed', {
          description: `${videoTitle} is now available for viewing`,
          icon: <CheckCircle className="w-4 h-4" />,
          duration: 5000
        })
        break
        
      case 'failed':
        toast.error('Download failed', {
          description: message || `Failed to download ${videoTitle}`,
          icon: <AlertCircle className="w-4 h-4" />,
          duration: 8000,
          action: onRetry ? {
            label: 'Retry',
            onClick: onRetry
          } : undefined
        })
        break
    }
    
    setHasShownNotification(true)
  }, [videoId, videoTitle, status, message, onRetry, hasShownNotification])

  // Reset notification flag when status changes
  useEffect(() => {
    setHasShownNotification(false)
  }, [status])

  return null // This component doesn't render anything visible
}