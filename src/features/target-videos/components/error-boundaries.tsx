import React from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, ArrowLeft, Play, Download, Bug, Home } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { errorHandler } from '@/utils/enhanced-error-handler'

// Video Detail Error Boundary
export function VideoDetailErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoDetail"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      fallback={<VideoDetailErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Video Detail Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoDetailErrorFallback() {
  const navigate = useNavigate()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoBack = () => {
    navigate({ to: '/target-accounts' })
  }

  const handleGoHome = () => {
    navigate({ to: '/' })
  }

  const handleReportBug = () => {
    const errorDetails = {
      component: 'VideoDetail',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    const bugReportUrl = `mailto:support@example.com?subject=Video Detail Error&body=${encodeURIComponent(
      `Error Details:\n${JSON.stringify(errorDetails, null, 2)}`
    )}`
    
    window.open(bugReportUrl)
    toast.info('Bug report prepared. Please send the email to help us fix this issue.')
  }

  const handleRetryWithFallback = async () => {
    try {
      toast.info('Attempting to recover video details...')
      
      // Try to extract video ID from URL and navigate to a safe state
      const pathParts = window.location.pathname.split('/')
      const videoIdIndex = pathParts.findIndex(part => part === 'target-videos')
      
      if (videoIdIndex !== -1 && pathParts[videoIdIndex + 1]) {
        const videoId = pathParts[videoIdIndex + 1]
        
        // Try to navigate back to account that contains this video
        const accountId = sessionStorage.getItem(`video_${videoId}_account`)
        if (accountId) {
          navigate({ to: `/target-accounts/${accountId}` })
          toast.success('Redirected to account page')
          return
        }
      }
      
      // Fallback to accounts list
      navigate({ to: '/target-accounts' })
      toast.info('Redirected to accounts list')
    } catch (error) {
      console.error('Recovery attempt failed:', error)
      toast.error('Recovery failed. Please try refreshing the page.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Failed to Load Video Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              There was an error loading the video details page. This could be due to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The video might not exist or has been removed</li>
                <li>Network connectivity issues</li>
                <li>Server maintenance or temporary issues</li>
                <li>Invalid video ID in the URL</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRetryWithFallback} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Smart Recovery
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Accounts
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            <Button onClick={handleReportBug} variant="ghost" size="sm" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Report Bug
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Video Information Error Boundary
export function VideoInformationErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoInformation"
      showErrorDetails={false}
      fallback={<VideoInformationErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'VideoInformation',
          action: 'render',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoInformationErrorFallback() {
  const handleRetryFetch = async () => {
    const videoId = window.location.pathname.split('/').pop()
    if (videoId) {
      // Try to refetch video information
      window.dispatchEvent(new CustomEvent('refetch-video-info', { 
        detail: { videoId } 
      }))
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Video Information Unavailable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load video information. This could be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The video data may be incomplete or corrupted</li>
              <li>Temporary issue with the video service</li>
              <li>Network connectivity problems</li>
              <li>The video might have been recently deleted</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button onClick={handleRetryFetch} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Loading Info
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Video Player Error Boundary
export function VideoPlayerErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoPlayer"
      showErrorDetails={false}
      fallback={<VideoPlayerErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Video Player Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoPlayerErrorFallback() {
  const handleReloadPlayer = () => {
    // Clear video cache and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('video')) {
            caches.delete(name)
          }
        })
      })
    }
    
    toast.info('Clearing video cache and reloading...')
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleTryDifferentFormat = () => {
    toast.info('Attempting to load video in different format...')
    // This would trigger a re-render with different video source options
    window.dispatchEvent(new CustomEvent('video-format-fallback'))
  }

  const handleDownloadVideo = () => {
    const videoId = window.location.pathname.split('/').pop()
    if (videoId) {
      // Trigger video download
      toast.info('Initiating video download...')
      window.dispatchEvent(new CustomEvent('trigger-video-download', { 
        detail: { videoId } 
      }))
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Play className="h-5 w-5" />
          Video Player Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            The video player encountered an error. This might be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Unsupported video format or codec</li>
              <li>Network issues during video loading</li>
              <li>Corrupted video file</li>
              <li>Browser compatibility issues</li>
              <li>Insufficient memory or resources</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleReloadPlayer} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Clear Cache & Reload
          </Button>
          <Button onClick={handleTryDifferentFormat} variant="outline" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Try Different Format
          </Button>
          <Button onClick={handleDownloadVideo} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Re-download Video
          </Button>
        </div>
        
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Troubleshooting tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Try refreshing the page</li>
              <li>Check your internet connection</li>
              <li>Try a different browser</li>
              <li>Disable browser extensions temporarily</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Download Manager Error Boundary
export function DownloadManagerErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="DownloadManager"
      showErrorDetails={false}
      fallback={<DownloadManagerErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Download Manager Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function DownloadManagerErrorFallback() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Download className="h-5 w-5" />
          Download Manager Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            The download manager encountered an error. You can still try to download 
            the video manually or check the monitoring tasks page for download status.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Analysis Results Error Boundary
export function AnalysisResultsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AnalysisResults"
      showErrorDetails={false}
      fallback={<AnalysisResultsErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Analysis Results Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AnalysisResultsErrorFallback() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Analysis Results Unavailable</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load video analysis results. The analysis may not be complete yet 
            or there could be an issue with the analysis service.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Scene Analysis Slider Error Boundary
export function SceneAnalysisSliderErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="SceneAnalysisSlider"
      showErrorDetails={false}
      fallback={<SceneAnalysisSliderErrorFallback />}
      onError={(error, errorInfo) => {
        console.warn('Scene Analysis Slider Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function SceneAnalysisSliderErrorFallback() {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertDescription>
            The scene analysis slider is temporarily unavailable. You can still view 
            the analysis summary and other video information.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Analysis Summary Error Boundary
export function AnalysisSummaryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AnalysisSummary"
      showErrorDetails={false}
      fallback={<AnalysisSummaryErrorFallback />}
      onError={(error, errorInfo) => {
        console.warn('Analysis Summary Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AnalysisSummaryErrorFallback() {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertDescription>
            The analysis summary is temporarily unavailable. The analysis data may be 
            incomplete or there could be a formatting issue.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Analysis Action Error Boundary
export function AnalysisActionErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AnalysisAction"
      showErrorDetails={false}
      fallback={<AnalysisActionErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Analysis Action Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AnalysisActionErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        The analysis action component is temporarily unavailable. You can check the 
        monitoring tasks page to trigger video analysis manually.
      </AlertDescription>
    </Alert>
  )
}
/
/ Enhanced Scene Navigation Error Boundary
export function SceneNavigationErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="SceneNavigation"
      showErrorDetails={false}
      fallback={<SceneNavigationErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'SceneNavigation',
          action: 'navigation',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function SceneNavigationErrorFallback() {
  const handleResetNavigation = () => {
    // Reset scene navigation state
    window.dispatchEvent(new CustomEvent('reset-scene-navigation'))
    toast.info('Scene navigation reset. Try navigating to scenes again.')
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <p>Scene navigation is temporarily unavailable due to a technical issue.</p>
        <Button onClick={handleResetNavigation} size="sm" variant="outline">
          Reset Navigation
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// Video Thumbnail Error Boundary
export function VideoThumbnailErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoThumbnail"
      showErrorDetails={false}
      fallback={<VideoThumbnailErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'VideoThumbnail',
          action: 'load_thumbnail',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoThumbnailErrorFallback() {
  return (
    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center space-y-2">
        <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Thumbnail unavailable</p>
      </div>
    </div>
  )
}

// Video Controls Error Boundary
export function VideoControlsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoControls"
      showErrorDetails={false}
      fallback={<VideoControlsErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'VideoControls',
          action: 'control_interaction',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoControlsErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Video controls are temporarily unavailable. You can still view the video content above.
      </AlertDescription>
    </Alert>
  )
}

// Video Progress Error Boundary
export function VideoProgressErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoProgress"
      showErrorDetails={false}
      fallback={<VideoProgressErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'VideoProgress',
          action: 'progress_tracking',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoProgressErrorFallback() {
  return (
    <div className="h-2 bg-muted rounded-full">
      <div className="h-full bg-muted-foreground/20 rounded-full" />
    </div>
  )
}