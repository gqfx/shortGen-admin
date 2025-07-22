import { toast } from 'sonner'
import { errorHandler, ErrorContext } from '@/utils/enhanced-error-handler'
import { targetAccountAnalysisApi } from '@/lib/api'

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  showProgress?: boolean
}

export class AccountRetryMechanisms {
  /**
   * Retry fetching account details with exponential backoff
   */
  static async retryFetchAccountDetail(
    accountId: string,
    options: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountDetail',
      action: 'fetch_data',
      accountId
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.getAccountById(accountId),
      context,
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000,
        ...options
      }
    )
  }

  /**
   * Retry fetching account videos with exponential backoff
   */
  static async retryFetchAccountVideos(
    accountId: string,
    skip = 0,
    limit = 50,
    options: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountDetail',
      action: 'fetch_data',
      accountId,
      additionalData: { skip, limit }
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.getAccountVideos(accountId, skip, limit),
      context,
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000,
        ...options
      }
    )
  }

  /**
   * Retry fetching account statistics with exponential backoff
   */
  static async retryFetchAccountStatistics(
    accountId: string,
    options: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountStatistics',
      action: 'fetch_data',
      accountId
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.getAccountSnapshots(accountId, 0, 1),
      context,
      {
        maxRetries: 2, // Statistics are less critical, fewer retries
        baseDelay: 2000,
        maxDelay: 10000,
        ...options
      }
    )
  }

  /**
   * Retry batch video download with exponential backoff
   */
  static async retryBatchVideoDownload(
    videoIds: string[],
    priority = 10,
    options: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'VideoList',
      action: 'download',
      additionalData: { videoIds, priority }
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.triggerVideoDownload({
        video_ids: videoIds,
        priority
      }),
      context,
      {
        maxRetries: 3,
        baseDelay: 2000,
        maxDelay: 15000,
        backoffFactor: 1.5,
        ...options
      }
    )
  }

  /**
   * Retry account crawl trigger with exponential backoff
   */
  static async retryTriggerAccountCrawl(
    accountId: string,
    crawlOptions?: { crawl_videos?: boolean; video_limit?: number },
    retryOptions: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountDetail',
      action: 'trigger_crawl',
      accountId,
      additionalData: crawlOptions
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.triggerAccountCrawl(accountId, crawlOptions),
      context,
      {
        maxRetries: 2,
        baseDelay: 3000,
        maxDelay: 12000,
        ...retryOptions
      }
    )
  }

  /**
   * Retry batch account crawl with exponential backoff
   */
  static async retryBatchTriggerCrawl(
    accountIds: string[],
    crawlOptions?: { crawl_videos?: boolean; video_limit?: number },
    retryOptions: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountList',
      action: 'batch_crawl',
      additionalData: { accountIds, ...crawlOptions }
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.batchTriggerCrawl({
        account_ids: accountIds,
        ...crawlOptions
      }),
      context,
      {
        maxRetries: 2,
        baseDelay: 5000,
        maxDelay: 20000,
        ...retryOptions
      }
    )
  }

  /**
   * Retry account creation with validation
   */
  static async retryCreateAccount(
    accountData: any,
    options: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountList',
      action: 'create_account',
      additionalData: { username: accountData.username }
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.quickAddAccount(accountData),
      context,
      {
        maxRetries: 2, // Account creation should not be retried too many times
        baseDelay: 1000,
        maxDelay: 5000,
        ...options
      }
    )
  }

  /**
   * Retry account update with validation
   */
  static async retryUpdateAccount(
    accountId: string,
    updateData: any,
    options: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountList',
      action: 'update_account',
      accountId,
      additionalData: updateData
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.updateAccount(accountId, updateData),
      context,
      {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        ...options
      }
    )
  }

  /**
   * Retry account deletion with confirmation
   */
  static async retryDeleteAccount(
    accountId: string,
    force = false,
    options: RetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AccountList',
      action: 'delete_account',
      accountId,
      additionalData: { force }
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.deleteAccount(accountId, { force }),
      context,
      {
        maxRetries: 1, // Deletion should not be retried many times
        baseDelay: 2000,
        maxDelay: 5000,
        ...options
      }
    )
  }

  /**
   * Smart retry mechanism that adapts based on error type
   */
  static async smartRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      showProgress = true
    } = options

    let retryCount = 0
    let lastError: any

    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0 && showProgress) {
          toast.info(`Retrying operation... (${retryCount}/${maxRetries})`, {
            description: `Attempting to ${context.action || 'complete operation'}`,
            duration: 2000
          })
        }

        const result = await operation()
        
        if (retryCount > 0 && showProgress) {
          toast.success('Operation completed successfully', {
            description: `Succeeded after ${retryCount} ${retryCount === 1 ? 'retry' : 'retries'}`,
            duration: 3000
          })
        }

        return result
      } catch (error) {
        lastError = error
        retryCount++

        // Handle the error to determine if it's retryable
        const enhancedError = errorHandler.handleError(error, {
          ...context,
          retryCount
        })

        // Don't retry if error is not retryable or we've exceeded max retries
        if (!enhancedError.isRetryable || retryCount > maxRetries) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, retryCount - 1),
          maxDelay
        )

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000

        if (showProgress) {
          toast.warning(`Operation failed, retrying in ${Math.round(jitteredDelay / 1000)}s...`, {
            description: enhancedError.userFriendlyMessage,
            duration: jitteredDelay
          })
        }

        await new Promise(resolve => setTimeout(resolve, jitteredDelay))
      }
    }

    // If we get here, all retries failed
    const finalError = errorHandler.handleErrorWithToast(lastError, {
      ...context,
      retryCount
    }, true, {
      showRetry: false,
      duration: 8000
    })

    throw finalError
  }
}

// Convenience functions for common operations
export const retryFetchAccountDetail = AccountRetryMechanisms.retryFetchAccountDetail
export const retryFetchAccountVideos = AccountRetryMechanisms.retryFetchAccountVideos
export const retryFetchAccountStatistics = AccountRetryMechanisms.retryFetchAccountStatistics
export const retryBatchVideoDownload = AccountRetryMechanisms.retryBatchVideoDownload
export const retryTriggerAccountCrawl = AccountRetryMechanisms.retryTriggerAccountCrawl
export const retryBatchTriggerCrawl = AccountRetryMechanisms.retryBatchTriggerCrawl
export const retryCreateAccount = AccountRetryMechanisms.retryCreateAccount
export const retryUpdateAccount = AccountRetryMechanisms.retryUpdateAccount
export const retryDeleteAccount = AccountRetryMechanisms.retryDeleteAccount
export const smartRetry = AccountRetryMechanisms.smartRetry