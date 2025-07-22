import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, AlertTriangle, Home, Bug } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error details
    this.logError(error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Show error toast notification
    toast.error(`Component Error: ${this.props.componentName || 'Unknown'}`, {
      description: error.message,
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => this.handleRetry()
      }
    })
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      componentName: this.props.componentName || 'Unknown',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.retryCount
    }

    // Log to console for development
    console.error('Error Boundary caught an error:', errorReport)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorReport)
    }
  }

  private reportError = async (errorReport: any) => {
    try {
      // This would typically send to an error reporting service like Sentry, LogRocket, etc.
      // For now, we'll just store it in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]')
      existingErrors.push(errorReport)
      
      // Keep only the last 50 errors to prevent storage bloat
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50)
      }
      
      localStorage.setItem('error_reports', JSON.stringify(existingErrors))
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      
      toast.info(`Retrying... (Attempt ${this.retryCount}/${this.maxRetries})`)
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
    } else {
      toast.error('Maximum retry attempts reached. Please refresh the page.')
    }
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportBug = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    // Create a pre-filled bug report (you could integrate with your issue tracker)
    const bugReportUrl = `mailto:support@example.com?subject=Bug Report - ${this.props.componentName}&body=${encodeURIComponent(
      `Error Details:\n${JSON.stringify(errorDetails, null, 2)}`
    )}`
    
    window.open(bugReportUrl)
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {this.props.componentName && (
                  <span className="font-medium">Component: {this.props.componentName}</span>
                )}
                <br />
                <span className="text-sm">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </span>
                {this.state.errorId && (
                  <>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Error ID: {this.state.errorId}
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>

            {this.props.showErrorDetails && this.state.error && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  Technical Details
                </summary>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40 mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex flex-wrap gap-2">
              {this.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - this.retryCount} left)
                </Button>
              )}
              
              <Button
                onClick={this.handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              
              <Button
                onClick={this.handleReportBug}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Bug className="h-4 w-4" />
                Report Bug
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error reporting from functional components
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      errorId: `hook_error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      context: context || 'useErrorHandler',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.error('Error reported via useErrorHandler:', errorReport)

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]')
      existingErrors.push(errorReport)
      
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50)
      }
      
      localStorage.setItem('error_reports', JSON.stringify(existingErrors))
    } catch (reportingError) {
      console.error('Failed to store error report:', reportingError)
    }

    // Show error toast
    toast.error('An error occurred', {
      description: error.message,
      duration: 5000
    })
  }, [])

  return { reportError }
}