import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bug,
  Home,
  ArrowLeft,
  Download,
  Settings,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { errorHandler, EnhancedError } from '@/utils/enhanced-error-handler'
import { errorLogger } from '@/utils/error-logging'

export interface ErrorRecoveryProps {
  error?: EnhancedError | Error | string
  context?: {
    component: string
    action?: string
    resourceId?: string
    resourceType?: 'account' | 'video' | 'analysis'
  }
  recoveryOptions?: {
    showRetry?: boolean
    showRefresh?: boolean
    showGoBack?: boolean
    showGoHome?: boolean
    showReportBug?: boolean
    customActions?: Array<{
      label: string
      icon?: React.ReactNode
      action: () => void | Promise<void>
      variant?: 'default' | 'outline' | 'ghost'
    }>
  }
  onRetry?: () => void | Promise<void>
  onRecover?: () => void
  className?: string
}

export function ErrorRecovery({
  error,
  context,
  recoveryOptions = {},
  onRetry,
  onRecover,
  className
}: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [recoveryProgress, setRecoveryProgress] = useState(0)

  const {
    showRetry = true,
    showRefresh = true,
    showGoBack = true,
    showGoHome = false,
    showReportBug = true,
    customActions = []
  } = recoveryOptions

  // Convert error to enhanced error if needed
  const enhancedError = React.useMemo(() => {
    if (!error) return null
    
    if (typeof error === 'string') {
      return errorHandler.handleError(new Error(error), context)
    } else if (error instanceof Error && !(error as any).type) {
      return errorHandler.handleError(error, context)
    } else {
      return error as EnhancedError
    }
  }, [error, context])

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return

    setIsRetrying(true)
    setRetryAttempts(prev => prev + 1)
    setRecoveryProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setRecoveryProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      await onRetry()
      
      clearInterval(progressInterval)
      setRecoveryProgress(100)
      
      toast.success('Recovery successful!', {
        description: 'The operation completed successfully'
      })

      if (onRecover) {
        onRecover()
      }
    } catch (retryError) {
      setRecoveryProgress(0)
      
      const retryEnhancedError = errorHandler.handleErrorWithToast(retryError, {
        ...context,
        action: 'retry',
        retryCount: retryAttempts
      })

      // Log the retry failure
      errorLogger.logError(retryError as Error, {
        component: context?.component || 'ErrorRecovery',
        action: 'retry_failed',
        additionalData: {
          originalError: enhancedError?.message,
          retryAttempts
        }
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const handleRefresh = () => {
    errorLogger.logUserAction('refresh_page', context?.component || 'ErrorRecovery')
    window.location.reload()
  }

  const handleGoBack = () => {
    errorLogger.logUserAction('go_back', context?.component || 'ErrorRecovery')
    window.history.back()
  }

  const handleGoHome = () => {
    errorLogger.logUserAction('go_home', context?.component || 'ErrorRecovery')
    window.location.href = '/'
  }

  const handleReportBug = () => {
    const errorDetails = {
      errorId: enhancedError?.id,
      component: context?.component,
      action: context?.action,
      resourceId: context?.resourceId,
      resourceType: context?.resourceType,
      message: enhancedError?.message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryAttempts
    }

    const bugReportUrl = `mailto:support@example.com?subject=Error Report - ${context?.component}&body=${encodeURIComponent(
      `Error Details:\n${JSON.stringify(errorDetails, null, 2)}\n\nPlease describe what you were doing when this error occurred:`
    )}`
    
    window.open(bugReportUrl)
    
    errorLogger.logUserAction('report_bug', context?.component || 'ErrorRecovery', errorDetails)
    toast.info('Bug report prepared. Please send the email to help us fix this issue.')
  }

  const getErrorIcon = () => {
    if (!enhancedError) return <AlertTriangle className="h-5 w-5" />
    
    switch (enhancedError.type) {
      case 'network':
        return <RefreshCw className="h-5 w-5" />
      case 'permission':
        return <XCircle className="h-5 w-5" />
      case 'not_found':
        return <AlertTriangle className="h-5 w-5" />
      case 'server':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getErrorTypeColor = () => {
    if (!enhancedError) return 'destructive'
    
    switch (enhancedError.type) {
      case 'network':
        return 'secondary'
      case 'permission':
        return 'destructive'
      case 'not_found':
        return 'outline'
      case 'server':
        return 'destructive'
      default:
        return 'destructive'
    }
  }

  const getSuggestedActions = () => {
    if (!enhancedError) return []
    
    const actions = []
    
    switch (enhancedError.type) {
      case 'network':
        actions.push('Check your internet connection')
        actions.push('Try again in a few moments')
        actions.push('Disable VPN if using one')
        break
      case 'permission':
        actions.push('Check if you are logged in')
        actions.push('Contact administrator for access')
        actions.push('Try logging out and back in')
        break
      case 'not_found':
        actions.push('Check if the resource still exists')
        actions.push('Try navigating back and selecting again')
        actions.push('Refresh the page')
        break
      case 'server':
        actions.push('Try again in a few minutes')
        actions.push('Check system status page')
        actions.push('Contact support if problem persists')
        break
      default:
        actions.push('Try refreshing the page')
        actions.push('Clear browser cache')
        actions.push('Try a different browser')
    }
    
    return actions
  }

  if (!enhancedError) {
    return null
  }

  return (
    <Card className={`border-destructive ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          {getErrorIcon()}
          {context?.component ? `${context.component} Error` : 'Error Occurred'}
          <Badge variant={getErrorTypeColor() as any} className="ml-auto">
            {enhancedError.type.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{enhancedError.userFriendlyMessage}</p>
              {context?.resourceType && context?.resourceId && (
                <p className="text-sm text-muted-foreground">
                  {context.resourceType.charAt(0).toUpperCase() + context.resourceType.slice(1)} ID: {context.resourceId}
                </p>
              )}
              {enhancedError.id && (
                <p className="text-xs text-muted-foreground">
                  Error ID: {enhancedError.id}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {isRetrying && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 animate-spin" />
              Attempting recovery... (Attempt {retryAttempts})
            </div>
            <Progress value={recoveryProgress} className="h-2" />
          </div>
        )}

        {getSuggestedActions().length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Suggested actions:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {getSuggestedActions().map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          {showRetry && onRetry && enhancedError.isRetryable && (
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : `Retry${retryAttempts > 0 ? ` (${retryAttempts})` : ''}`}
            </Button>
          )}
          
          {showRefresh && (
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          )}
          
          {showGoBack && (
            <Button 
              onClick={handleGoBack} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
          
          {showGoHome && (
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}

          {customActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant={action.variant || 'outline'}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          
          {showReportBug && (
            <Button 
              onClick={handleReportBug} 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Report Bug
            </Button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && enhancedError.originalError.stack && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              Technical Details (Development)
            </summary>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
              {enhancedError.originalError.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for using error recovery in components
export function useErrorRecovery() {
  const [error, setError] = useState<EnhancedError | null>(null)
  const [isRecovering, setIsRecovering] = useState(false)

  const handleError = (error: unknown, context?: ErrorRecoveryProps['context']) => {
    const enhancedError = errorHandler.handleError(error, context)
    setError(enhancedError)
    return enhancedError
  }

  const clearError = () => {
    setError(null)
    setIsRecovering(false)
  }

  const retry = async (operation: () => Promise<void>, context?: ErrorRecoveryProps['context']) => {
    setIsRecovering(true)
    try {
      await operation()
      clearError()
    } catch (retryError) {
      handleError(retryError, context)
    } finally {
      setIsRecovering(false)
    }
  }

  return {
    error,
    isRecovering,
    handleError,
    clearError,
    retry
  }
}