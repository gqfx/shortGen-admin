import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DownloadStatus } from './download-status'

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

export function DownloadStatusDemo() {
  const [currentDemo, setCurrentDemo] = useState<string>('loading')

  const demoStates: Record<string, { downloadProgress: DownloadProgress | null; isLoading: boolean }> = {
    loading: {
      downloadProgress: null,
      isLoading: true
    },
    pending: {
      downloadProgress: {
        taskId: 'demo-task-1',
        status: 'pending',
        message: 'Download task is queued and waiting to start...',
        startedAt: new Date().toISOString()
      },
      isLoading: false
    },
    processing: {
      downloadProgress: {
        taskId: 'demo-task-2',
        status: 'processing',
        message: 'Video is being downloaded...',
        progress: 45,
        estimatedTimeRemaining: '~3m',
        startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
      },
      isLoading: false
    },
    completed: {
      downloadProgress: {
        taskId: 'demo-task-3',
        status: 'completed',
        message: 'Download completed successfully!',
        progress: 100,
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        completedAt: new Date().toISOString()
      },
      isLoading: false
    },
    failed: {
      downloadProgress: {
        taskId: 'demo-task-4',
        status: 'failed',
        message: 'Download failed. You can retry the download.',
        errorMessage: 'Network timeout: Unable to connect to video server',
        retryCount: 2,
        startedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString() // 3 minutes ago
      },
      isLoading: false
    },
    'failed-first-attempt': {
      downloadProgress: {
        taskId: 'demo-task-5',
        status: 'failed',
        message: 'Download failed. You can retry the download.',
        errorMessage: 'Video not available: The video may have been deleted or made private',
        retryCount: 0,
        startedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString() // 1 minute ago
      },
      isLoading: false
    }
  }

  const handleRetry = () => {
    console.log('Retry download requested')
  }

  const handleCancel = () => {
    console.log('Download cancelled')
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Download Status Management Demo</CardTitle>
          <p className="text-sm text-muted-foreground">
            This demo shows all the different states of the enhanced download status management system.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(demoStates).map((state) => (
              <Button
                key={state}
                variant={currentDemo === state ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentDemo(state)}
                className="capitalize"
              >
                {state.replace('-', ' ')}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current State: {currentDemo.replace('-', ' ')}</h3>
            
            {/* Full Version */}
            <div>
              <h4 className="text-sm font-medium mb-2">Full Version</h4>
              <DownloadStatus
                downloadProgress={demoStates[currentDemo].downloadProgress}
                isLoading={demoStates[currentDemo].isLoading}
                onRetry={handleRetry}
                onCancel={handleCancel}
              />
            </div>

            {/* Compact Version */}
            <div>
              <h4 className="text-sm font-medium mb-2">Compact Version</h4>
              <DownloadStatus
                downloadProgress={demoStates[currentDemo].downloadProgress}
                isLoading={demoStates[currentDemo].isLoading}
                onRetry={handleRetry}
                onCancel={handleCancel}
                compact={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">✅ Display current download status and progress</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time status updates (pending, processing, completed, failed)</li>
                <li>• Progress indicators with percentage</li>
                <li>• Estimated time remaining</li>
                <li>• Task ID tracking</li>
                <li>• Start and completion timestamps</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">✅ Handle download task creation and monitoring</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic polling for task status updates</li>
                <li>• Smart polling with timeout protection</li>
                <li>• Task monitoring with cleanup on unmount</li>
                <li>• Integration with monitoring tasks API</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">✅ Show download completion notifications</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Success notifications with detailed descriptions</li>
                <li>• Error notifications with actionable retry buttons</li>
                <li>• Progress notifications during download</li>
                <li>• Timeout warnings for long-running tasks</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">✅ Implement retry functionality for failed downloads</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• One-click retry with attempt counter</li>
                <li>• Retry button in notifications</li>
                <li>• Error message display with specific failure reasons</li>
                <li>• Automatic retry count tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}