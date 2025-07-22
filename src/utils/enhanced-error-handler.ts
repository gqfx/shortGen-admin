import { AxiosError } from 'axios'
import { toast } from 'sonner'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  accountId?: string
  videoId?: string
  timestamp?: string
  retryCount?: number
  additionalData?: Record<string, any>
}

export interface EnhancedError {
  id: string
  type: 'network' | 'validation' | 'permission' | 'not_found' | 'server' | 'client' | 'unknown'
  message: string
  originalError: Error
  context: ErrorContext
  isRetryable: boolean
  suggestedAction?: string
  userFriendlyMessage: string
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorReports: EnhancedError[] = []
  private maxStoredErrors = 100

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Enhanced error handling with context and user-friendly messages
   */
  handleError(error: unknown, context: ErrorContext = {}): EnhancedError {
    const enhancedError = this.createEnhancedError(error, context)
    
    // Store error for debugging
    this.storeError(enhancedError)
    
    // Log error for development
    this.logError(enhancedError)
    
    return enhancedError
  }

  /**
   * Handle error with automatic toast notification
   */
  handleErrorWithToast(
    error: unknown, 
    context: ErrorContext = {},
    showToast = true,
    toastOptions?: {
      showRetry?: boolean
      onRetry?: () => void
      duration?: number
    }
  ): EnhancedError {
    const enhancedError = this.handleError(error, context)
    
    if (showToast) {
      this.showErrorToast(enhancedError, toastOptions)
    }
    
    return enhancedError
  }

  /**
   * Create enhanced error object with context and user-friendly information
   */
  private createEnhancedError(error: unknown, context: ErrorContext): EnhancedError {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    const timestamp = new Date().toISOString()
    
    let originalError: Error
    let type: EnhancedError['type'] = 'unknown'
    let message = 'An unexpected error occurred'
    let isRetryable = false
    let suggestedAction: string | undefined
    let userFriendlyMessage = 'Something went wrong. Please try again.'

    // Handle different error types
    if (error instanceof AxiosError) {
      originalError = error
      const status = error.response?.status
      const responseData = error.response?.data
      
      // Determine error type based on status code
      if (status) {
        if (status >= 500) {
          type = 'server'
          isRetryable = true
          userFriendlyMessage = 'Server error occurred. Please try again in a moment.'
          suggestedAction = 'retry'
        } else if (status === 404) {
          type = 'not_found'
          userFriendlyMessage = 'The requested resource was not found.'
          suggestedAction = 'go_back'
        } else if (status === 403) {
          type = 'permission'
          userFriendlyMessage = 'You do not have permission to perform this action.'
          suggestedAction = 'contact_support'
        } else if (status === 401) {
          type = 'permission'
          userFriendlyMessage = 'Please log in to continue.'
          suggestedAction = 'login'
        } else if (status >= 400 && status < 500) {
          type = 'validation'
          userFriendlyMessage = responseData?.msg || 'Invalid request. Please check your input.'
          suggestedAction = 'check_input'
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        type = 'network'
        isRetryable = true
        userFriendlyMessage = 'Network connection error. Please check your internet connection.'
        suggestedAction = 'check_connection'
      }
      
      message = responseData?.msg || error.message || message
    } else if (error instanceof Error) {
      originalError = error
      message = error.message
      
      // Categorize based on error message patterns
      if (error.message.includes('fetch') || error.message.includes('network')) {
        type = 'network'
        isRetryable = true
        userFriendlyMessage = 'Network error occurred. Please try again.'
        suggestedAction = 'retry'
      } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        type = 'permission'
        userFriendlyMessage = 'Permission denied. Please check your access rights.'
        suggestedAction = 'contact_support'
      } else if (error.message.includes('not found')) {
        type = 'not_found'
        userFriendlyMessage = 'The requested item was not found.'
        suggestedAction = 'go_back'
      } else {
        type = 'client'
        userFriendlyMessage = 'An error occurred while processing your request.'
        suggestedAction = 'retry'
      }
    } else {
      // Handle non-Error objects
      originalError = new Error(String(error))
      message = String(error)
    }

    // Context-specific error handling
    if (context.action) {
      switch (context.action) {
        case 'download':
          if (type === 'server' || type === 'network') {
            userFriendlyMessage = 'Download failed due to connection issues. Please try again.'
            isRetryable = true
          }
          break
        case 'analysis':
          if (type === 'server') {
            userFriendlyMessage = 'Video analysis failed. Please try again later.'
            isRetryable = true
          }
          break
        case 'fetch_data':
          if (type === 'network') {
            userFriendlyMessage = 'Failed to load data. Please check your connection and try again.'
            isRetryable = true
          }
          break
      }
    }

    return {
      id: errorId,
      type,
      message,
      originalError,
      context: {
        ...context,
        timestamp
      },
      isRetryable,
      suggestedAction,
      userFriendlyMessage
    }
  }

  /**
   * Show error toast with appropriate actions
   */
  private showErrorToast(
    error: EnhancedError, 
    options?: {
      showRetry?: boolean
      onRetry?: () => void
      duration?: number
    }
  ) {
    const { showRetry = error.isRetryable, onRetry, duration = 5000 } = options || {}
    
    const toastOptions: any = {
      description: error.userFriendlyMessage,
      duration
    }

    // Add retry action if applicable
    if (showRetry && onRetry) {
      toastOptions.action = {
        label: 'Retry',
        onClick: onRetry
      }
    } else if (error.suggestedAction && !onRetry) {
      // Add suggested action based on error type
      switch (error.suggestedAction) {
        case 'go_back':
          toastOptions.action = {
            label: 'Go Back',
            onClick: () => window.history.back()
          }
          break
        case 'refresh':
          toastOptions.action = {
            label: 'Refresh',
            onClick: () => window.location.reload()
          }
          break
        case 'contact_support':
          toastOptions.action = {
            label: 'Contact Support',
            onClick: () => {
              // You could integrate with your support system here
              window.open('mailto:support@example.com?subject=Error Report&body=' + 
                encodeURIComponent(`Error ID: ${error.id}\nMessage: ${error.message}`))
            }
          }
          break
      }
    }

    // Show appropriate toast based on error type
    switch (error.type) {
      case 'permission':
        toast.error('Permission Error', toastOptions)
        break
      case 'not_found':
        toast.error('Not Found', toastOptions)
        break
      case 'network':
        toast.error('Connection Error', toastOptions)
        break
      case 'server':
        toast.error('Server Error', toastOptions)
        break
      case 'validation':
        toast.error('Validation Error', toastOptions)
        break
      default:
        toast.error('Error', toastOptions)
    }
  }

  /**
   * Store error for debugging and analytics
   */
  private storeError(error: EnhancedError) {
    this.errorReports.push(error)
    
    // Keep only the most recent errors
    if (this.errorReports.length > this.maxStoredErrors) {
      this.errorReports.splice(0, this.errorReports.length - this.maxStoredErrors)
    }

    // Store in localStorage for persistence
    try {
      const storedErrors = JSON.parse(localStorage.getItem('enhanced_error_reports') || '[]')
      storedErrors.push({
        ...error,
        originalError: {
          name: error.originalError.name,
          message: error.originalError.message,
          stack: error.originalError.stack
        }
      })
      
      if (storedErrors.length > this.maxStoredErrors) {
        storedErrors.splice(0, storedErrors.length - this.maxStoredErrors)
      }
      
      localStorage.setItem('enhanced_error_reports', JSON.stringify(storedErrors))
    } catch (storageError) {
      console.warn('Failed to store error report:', storageError)
    }
  }

  /**
   * Log error for development
   */
  private logError(error: EnhancedError) {
    const logData = {
      errorId: error.id,
      type: error.type,
      message: error.message,
      context: error.context,
      isRetryable: error.isRetryable,
      suggestedAction: error.suggestedAction,
      stack: error.originalError.stack,
      timestamp: error.context.timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    console.group(`🚨 Enhanced Error [${error.type.toUpperCase()}]`)
    console.error('Error Details:', logData)
    console.error('Original Error:', error.originalError)
    console.groupEnd()

    // Log to error logging service
    try {
      const { errorLogger } = require('./error-logging')
      errorLogger.logError(error.originalError, {
        component: error.context.component || 'Unknown',
        action: error.context.action,
        additionalData: {
          errorType: error.type,
          isRetryable: error.isRetryable,
          suggestedAction: error.suggestedAction,
          ...error.context.additionalData
        },
        userId: error.context.userId
      })
    } catch (loggingError) {
      console.warn('Failed to log error to error logging service:', loggingError)
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportToService(logData)
    }
  }

  /**
   * Report error to external service (placeholder)
   */
  private async reportToService(errorData: any) {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      // For now, we'll just log it
      console.log('Would report to error service:', errorData)
    } catch (reportingError) {
      console.warn('Failed to report error to service:', reportingError)
    }
  }

  /**
   * Get stored error reports for debugging
   */
  getErrorReports(): EnhancedError[] {
    return [...this.errorReports]
  }

  /**
   * Clear stored error reports
   */
  clearErrorReports() {
    this.errorReports = []
    localStorage.removeItem('enhanced_error_reports')
  }

  /**
   * Create retry mechanism with exponential backoff
   */
  createRetryMechanism<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options: {
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      backoffFactor?: number
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2
    } = options

    return new Promise(async (resolve, reject) => {
      let retryCount = 0

      const attemptOperation = async (): Promise<void> => {
        try {
          const result = await operation()
          resolve(result)
        } catch (error) {
          retryCount++
          
          const enhancedError = this.handleError(error, {
            ...context,
            retryCount
          })

          if (retryCount >= maxRetries || !enhancedError.isRetryable) {
            reject(enhancedError)
            return
          }

          // Calculate delay with exponential backoff
          const delay = Math.min(
            baseDelay * Math.pow(backoffFactor, retryCount - 1),
            maxDelay
          )

          toast.info(`Retrying operation... (${retryCount}/${maxRetries})`, {
            description: `Waiting ${Math.round(delay / 1000)}s before retry`,
            duration: delay
          })

          setTimeout(attemptOperation, delay)
        }
      }

      await attemptOperation()
    })
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience functions
export function handleError(error: unknown, context?: ErrorContext): EnhancedError {
  return errorHandler.handleError(error, context)
}

export function handleErrorWithToast(
  error: unknown,
  context?: ErrorContext,
  showToast = true,
  toastOptions?: Parameters<typeof errorHandler.handleErrorWithToast>[3]
): EnhancedError {
  return errorHandler.handleErrorWithToast(error, context, showToast, toastOptions)
}

export function createRetryMechanism<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  options?: Parameters<typeof errorHandler.createRetryMechanism>[2]
): Promise<T> {
  return errorHandler.createRetryMechanism(operation, context, options)
}