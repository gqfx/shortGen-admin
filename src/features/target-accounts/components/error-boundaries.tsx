import React, { useState } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, ArrowLeft, Bug, Home, Download, Settings } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { errorHandler } from '@/utils/enhanced-error-handler'
import { retryFetchAccountDetail, retryFetchAccountVideos, retryFetchAccountStatistics } from '../utils/retry-mechanisms'

// Account List Error Boundary
export function AccountListErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AccountList"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      fallback={<AccountListErrorFallback />}
      onError={(error, errorInfo) => {
        // Custom error handling for account list
        console.error('Account List Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AccountListErrorFallback() {
  const navigate = useNavigate()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate({ to: '/' })
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Failed to Load Account List
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the target accounts list. This might be due to a 
            network issue or a problem with the server.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh List
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Account Detail Error Boundary
export function AccountDetailErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AccountDetail"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      fallback={<AccountDetailErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Account Detail Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AccountDetailErrorFallback() {
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

  const handleSmartRetry = async () => {
    try {
      const accountId = window.location.pathname.split('/').pop()
      if (!accountId) {
        throw new Error('No account ID found in URL')
      }

      toast.info('Attempting to recover account details...')
      
      // Try to fetch account details with retry mechanism
      await retryFetchAccountDetail(accountId, { maxRetries: 2, showProgress: true })
      
      toast.success('Account details recovered successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Smart retry failed:', error)
      
      const enhancedError = errorHandler.handleErrorWithToast(error, {
        component: 'AccountDetail',
        action: 'smart_retry'
      })

      // If account doesn't exist, redirect to accounts list
      if (enhancedError.type === 'not_found') {
        setTimeout(() => {
          navigate({ to: '/target-accounts' })
          toast.info('Account not found. Redirected to accounts list.')
        }, 2000)
      }
    }
  }

  const handleReportBug = () => {
    const errorDetails = {
      component: 'AccountDetail',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      accountId: window.location.pathname.split('/').pop()
    }

    const bugReportUrl = `mailto:support@example.com?subject=Account Detail Error&body=${encodeURIComponent(
      `Error Details:\n${JSON.stringify(errorDetails, null, 2)}`
    )}`
    
    window.open(bugReportUrl)
    toast.info('Bug report prepared. Please send the email to help us fix this issue.')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Failed to Load Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              There was an error loading the account details page. This could be due to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The account might not exist or has been deleted</li>
                <li>Network connectivity issues</li>
                <li>Server maintenance or temporary issues</li>
                <li>Invalid account ID in the URL</li>
                <li>Insufficient permissions to access this account</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSmartRetry} className="flex items-center gap-2">
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

// Account Statistics Error Boundary
export function AccountStatisticsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AccountStatistics"
      showErrorDetails={false}
      fallback={<AccountStatisticsErrorFallback />}
      onError={(error, errorInfo) => {
        console.warn('Account Statistics Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AccountStatisticsErrorFallback() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Statistics Unavailable</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load account statistics. The account data may be incomplete or 
            there could be a temporary issue with the statistics service.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Video List Error Boundary
export function VideoListErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoList"
      showErrorDetails={false}
      fallback={<VideoListErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Video List Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoListErrorFallback() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Failed to Load Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the video list for this account. This might be due to 
            network issues or the videos haven't been crawled yet.
          </AlertDescription>
        </Alert>
        
        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Loading Videos
        </Button>
      </CardContent>
    </Card>
  )
}

// Video Filters Error Boundary
export function VideoFiltersErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="VideoFilters"
      showErrorDetails={false}
      fallback={<VideoFiltersErrorFallback />}
      onError={(error, errorInfo) => {
        console.warn('Video Filters Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function VideoFiltersErrorFallback() {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertDescription>
            Video filters are temporarily unavailable. You can still view the video list below.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Batch Operations Error Boundary
export function BatchOperationsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="BatchOperations"
      showErrorDetails={false}
      fallback={<BatchOperationsErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Batch Operations Error:', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function BatchOperationsErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Batch operations are temporarily unavailable. You can still perform individual 
        actions on videos.
      </AlertDescription>
    </Alert>
  )
}

// Enhanced Account Statistics Error Boundary with retry
function AccountStatisticsErrorFallback() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetryStatistics = async () => {
    setIsRetrying(true)
    try {
      const accountId = window.location.pathname.split('/').pop()
      if (accountId) {
        await retryFetchAccountStatistics(accountId, { showProgress: true })
        toast.success('Statistics loaded successfully!')
        window.location.reload()
      }
    } catch (error) {
      errorHandler.handleErrorWithToast(error, {
        component: 'AccountStatistics',
        action: 'retry_fetch'
      })
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Statistics Unavailable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load account statistics. This could be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The account data may be incomplete or still being processed</li>
              <li>Temporary issue with the statistics service</li>
              <li>Network connectivity problems</li>
              <li>The account might be newly added and statistics are being calculated</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleRetryStatistics} 
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Loading...' : 'Retry Statistics'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Video List Error Boundary with smart retry
function VideoListErrorFallback() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetryVideos = async () => {
    setIsRetrying(true)
    try {
      const accountId = window.location.pathname.split('/').pop()
      if (accountId) {
        await retryFetchAccountVideos(accountId, 0, 50, { showProgress: true })
        toast.success('Videos loaded successfully!')
        window.location.reload()
      }
    } catch (error) {
      errorHandler.handleErrorWithToast(error, {
        component: 'VideoList',
        action: 'retry_fetch'
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const handleTriggerCrawl = async () => {
    try {
      const accountId = window.location.pathname.split('/').pop()
      if (accountId) {
        toast.info('Triggering account crawl to fetch videos...')
        // This would trigger a crawl to get videos
        window.dispatchEvent(new CustomEvent('trigger-account-crawl', { 
          detail: { accountId, crawlVideos: true } 
        }))
      }
    } catch (error) {
      errorHandler.handleErrorWithToast(error, {
        component: 'VideoList',
        action: 'trigger_crawl'
      })
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Failed to Load Videos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the video list for this account. This could be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Network issues or server problems</li>
              <li>The videos haven't been crawled yet</li>
              <li>The account might be private or restricted</li>
              <li>Temporary API rate limiting</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleRetryVideos} 
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Loading...' : 'Retry Loading Videos'}
          </Button>
          <Button 
            onClick={handleTriggerCrawl} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Crawl Videos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Account Actions Error Boundary
export function AccountActionsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AccountActions"
      showErrorDetails={false}
      fallback={<AccountActionsErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'AccountActions',
          action: 'action_execution',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AccountActionsErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Account actions are temporarily unavailable. Please try refreshing the page or contact support if the issue persists.
      </AlertDescription>
    </Alert>
  )
}

// Account Navigation Error Boundary
export function AccountNavigationErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="AccountNavigation"
      showErrorDetails={false}
      fallback={<AccountNavigationErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'AccountNavigation',
          action: 'navigation',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function AccountNavigationErrorFallback() {
  const navigate = useNavigate()

  return (
    <Alert variant="destructive">
      <AlertDescription className="space-y-2">
        <p>Navigation is temporarily unavailable.</p>
        <Button 
          onClick={() => navigate({ to: '/target-accounts' })} 
          size="sm" 
          variant="outline"
        >
          Go to Accounts List
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// Crawl Management Error Boundary
export function CrawlManagementErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      componentName="CrawlManagement"
      showErrorDetails={false}
      fallback={<CrawlManagementErrorFallback />}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'CrawlManagement',
          action: 'crawl_operation',
          additionalData: { errorInfo }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function CrawlManagementErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Crawl management features are temporarily unavailable. You can still view existing data and try manual operations.
      </AlertDescription>
    </Alert>
  )
}