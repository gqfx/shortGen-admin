import { toast } from 'sonner'

export interface ErrorLog {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  component: string
  action?: string
  message: string
  stack?: string
  context: Record<string, any>
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  resolved: boolean
  reportedToService: boolean
}

export interface ErrorMetrics {
  totalErrors: number
  errorsByComponent: Record<string, number>
  errorsByType: Record<string, number>
  recentErrors: ErrorLog[]
  topErrors: Array<{ message: string; count: number; lastOccurred: string }>
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService
  private logs: ErrorLog[] = []
  private maxLogs = 500
  private sessionId: string
  private reportingEndpoint?: string

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.loadStoredLogs()
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService()
    }
    return ErrorLoggingService.instance
  }

  /**
   * Configure error reporting endpoint
   */
  configure(options: { reportingEndpoint?: string }) {
    this.reportingEndpoint = options.reportingEndpoint
  }

  /**
   * Log an error with context
   */
  logError(
    error: Error | string,
    context: {
      component: string
      action?: string
      level?: 'error' | 'warning' | 'info'
      additionalData?: Record<string, any>
      userId?: string
    }
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level: context.level || 'error',
      component: context.component,
      action: context.action,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        ...context.additionalData,
        pathname: window.location.pathname,
        search: window.location.search,
        referrer: document.referrer
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context.userId,
      sessionId: this.sessionId,
      resolved: false,
      reportedToService: false
    }

    this.addLog(errorLog)
    this.reportToService(errorLog)

    return errorLog
  }

  /**
   * Log user action for debugging context
   */
  logUserAction(action: string, component: string, data?: Record<string, any>) {
    this.logError(`User action: ${action}`, {
      component,
      action,
      level: 'info',
      additionalData: data
    })
  }

  /**
   * Log performance issues
   */
  logPerformanceIssue(
    metric: string,
    value: number,
    threshold: number,
    component: string
  ) {
    this.logError(`Performance issue: ${metric} (${value}ms > ${threshold}ms)`, {
      component,
      action: 'performance_monitoring',
      level: 'warning',
      additionalData: { metric, value, threshold }
    })
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string) {
    const log = this.logs.find(l => l.id === errorId)
    if (log) {
      log.resolved = true
      this.persistLogs()
    }
  }

  /**
   * Get error metrics and analytics
   */
  getMetrics(): ErrorMetrics {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentErrors = this.logs.filter(
      log => new Date(log.timestamp) > last24Hours && log.level === 'error'
    )

    const errorsByComponent = this.logs.reduce((acc, log) => {
      if (log.level === 'error') {
        acc[log.component] = (acc[log.component] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const errorsByType = this.logs.reduce((acc, log) => {
      const errorType = this.categorizeError(log.message)
      acc[errorType] = (acc[errorType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const errorCounts = this.logs.reduce((acc, log) => {
      if (log.level === 'error') {
        const key = log.message
        if (!acc[key]) {
          acc[key] = { count: 0, lastOccurred: log.timestamp }
        }
        acc[key].count++
        if (new Date(log.timestamp) > new Date(acc[key].lastOccurred)) {
          acc[key].lastOccurred = log.timestamp
        }
      }
      return acc
    }, {} as Record<string, { count: number; lastOccurred: string }>)

    const topErrors = Object.entries(errorCounts)
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalErrors: this.logs.filter(l => l.level === 'error').length,
      errorsByComponent,
      errorsByType,
      recentErrors: recentErrors.slice(-20),
      topErrors
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      logs: this.logs,
      metrics: this.getMetrics()
    }, null, 2)
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = []
    localStorage.removeItem('error_logs')
    toast.success('Error logs cleared')
  }

  /**
   * Get logs for debugging
   */
  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  /**
   * Search logs by criteria
   */
  searchLogs(criteria: {
    component?: string
    action?: string
    level?: string
    message?: string
    timeRange?: { start: Date; end: Date }
  }): ErrorLog[] {
    return this.logs.filter(log => {
      if (criteria.component && !log.component.includes(criteria.component)) {
        return false
      }
      if (criteria.action && !log.action?.includes(criteria.action)) {
        return false
      }
      if (criteria.level && log.level !== criteria.level) {
        return false
      }
      if (criteria.message && !log.message.includes(criteria.message)) {
        return false
      }
      if (criteria.timeRange) {
        const logTime = new Date(log.timestamp)
        if (logTime < criteria.timeRange.start || logTime > criteria.timeRange.end) {
          return false
        }
      }
      return true
    })
  }

  private addLog(log: ErrorLog) {
    this.logs.push(log)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    this.persistLogs()
    this.notifyIfCritical(log)
  }

  private persistLogs() {
    try {
      const logsToStore = this.logs.slice(-100) // Store only last 100 logs
      localStorage.setItem('error_logs', JSON.stringify(logsToStore))
    } catch (error) {
      console.warn('Failed to persist error logs:', error)
    }
  }

  private loadStoredLogs() {
    try {
      const stored = localStorage.getItem('error_logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load stored error logs:', error)
    }
  }

  private async reportToService(log: ErrorLog) {
    if (!this.reportingEndpoint || log.reportedToService) {
      return
    }

    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      })

      log.reportedToService = true
      this.persistLogs()
    } catch (error) {
      console.warn('Failed to report error to service:', error)
    }
  }

  private notifyIfCritical(log: ErrorLog) {
    // Check for critical error patterns
    const criticalPatterns = [
      /network.*error/i,
      /failed.*to.*fetch/i,
      /server.*error/i,
      /unauthorized/i,
      /permission.*denied/i
    ]

    const isCritical = criticalPatterns.some(pattern => 
      pattern.test(log.message)
    )

    if (isCritical && log.level === 'error') {
      // Count recent occurrences of similar errors
      const recentSimilar = this.logs.filter(l => 
        l.component === log.component &&
        l.message === log.message &&
        new Date(l.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      )

      if (recentSimilar.length >= 3) {
        toast.error('Critical Error Pattern Detected', {
          description: `Multiple ${log.component} errors in the last 5 minutes`,
          duration: 10000,
          action: {
            label: 'View Details',
            onClick: () => this.showErrorDetails(log)
          }
        })
      }
    }
  }

  private showErrorDetails(log: ErrorLog) {
    const details = `
Error ID: ${log.id}
Component: ${log.component}
Action: ${log.action || 'N/A'}
Time: ${new Date(log.timestamp).toLocaleString()}
Message: ${log.message}
URL: ${log.url}
    `.trim()

    // Create a modal or detailed view
    console.group('🚨 Error Details')
    console.log(details)
    console.log('Full Log:', log)
    console.groupEnd()

    // You could integrate with a modal component here
    alert(details)
  }

  private categorizeError(message: string): string {
    if (/network|fetch|connection/i.test(message)) return 'network'
    if (/permission|unauthorized|forbidden/i.test(message)) return 'permission'
    if (/not.*found|404/i.test(message)) return 'not_found'
    if (/server|500|503/i.test(message)) return 'server'
    if (/validation|invalid|bad.*request/i.test(message)) return 'validation'
    if (/timeout/i.test(message)) return 'timeout'
    return 'unknown'
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, {
        component: 'Global',
        action: 'unhandled_promise_rejection',
        level: 'error',
        additionalData: {
          promise: event.promise.toString()
        }
      })
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || event.message, {
        component: 'Global',
        action: 'javascript_error',
        level: 'error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement
        this.logError(`Resource loading failed: ${target.tagName}`, {
          component: 'Global',
          action: 'resource_error',
          level: 'warning',
          additionalData: {
            tagName: target.tagName,
            src: (target as any).src || (target as any).href,
            outerHTML: target.outerHTML
          }
        })
      }
    }, true)
  }
}

// Export singleton instance
export const errorLogger = ErrorLoggingService.getInstance()

// Convenience functions
export function logError(
  error: Error | string,
  context: Parameters<typeof errorLogger.logError>[1]
): ErrorLog {
  return errorLogger.logError(error, context)
}

export function logUserAction(
  action: string,
  component: string,
  data?: Record<string, any>
) {
  return errorLogger.logUserAction(action, component, data)
}

export function logPerformanceIssue(
  metric: string,
  value: number,
  threshold: number,
  component: string
) {
  return errorLogger.logPerformanceIssue(metric, value, threshold, component)
}

export function getErrorMetrics(): ErrorMetrics {
  return errorLogger.getMetrics()
}

export function exportErrorLogs(): string {
  return errorLogger.exportLogs()
}

export function clearErrorLogs() {
  return errorLogger.clearLogs()
}