import { toast } from 'sonner'
import { errorHandler, ErrorContext } from '@/utils/enhanced-error-handler'
import { targetAccountAnalysisApi } from '@/lib/api'

export interface VideoRetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  showProgress?: boolean
}

export class VideoRetryMechanisms {
  /**
   * Retry fetching video details with exponential backoff
   */
  static async retryFetchVideoDetail(
    videoId: string,
    options: VideoRetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'VideoDetail',
      action: 'fetch_data',
      videoId
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.getVideoById(videoId),
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
   * Retry video download with exponential backoff
   */
  static async retryVideoDownload(
    videoId: string,
    priority = 10,
    options: VideoRetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'VideoDetail',
      action: 'download',
      videoId,
      additionalData: { priority }
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.triggerVideoDownload({
        video_ids: [videoId],
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
   * Retry video analysis with exponential backoff
   */
  static async retryVideoAnalysis(
    videoId: string,
    analysisType = 'full',
    options: VideoRetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'VideoDetail',
      action: 'analysis',
      videoId,
      additionalData: { analysisType }
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.triggerVideoAnalysis(videoId, { type: analysisType }),
      context,
      {
        maxRetries: 2,
        baseDelay: 3000,
        maxDelay: 12000,
        ...options
      }
    )
  }

  /**
   * Retry fetching video analysis results
   */
  static async retryFetchAnalysisResults(
    videoId: string,
    options: VideoRetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'AnalysisResults',
      action: 'fetch_data',
      videoId
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.getVideoAnalysis(videoId),
      context,
      {
        maxRetries: 3,
        baseDelay: 1500,
        maxDelay: 10000,
        ...options
      }
    )
  }

  /**
   * Retry fetching scene analysis data
   */
  static async retryFetchSceneAnalysis(
    videoId: string,
    options: VideoRetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'SceneAnalysisSlider',
      action: 'fetch_data',
      videoId
    }

    return errorHandler.createRetryMechanism(
      () => targetAccountAnalysisApi.getVideoScenes(videoId),
      context,
      {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 8000,
        ...options
      }
    )
  }

  /**
   * Retry video status check with polling
   */
  static async retryVideoStatusCheck(
    videoId: string,
    expectedStatus: string,
    options: VideoRetryOptions & { pollInterval?: number; maxPollTime?: number } = {}
  ) {
    const {
      pollInterval = 2000,
      maxPollTime = 60000,
      ...retryOptions
    } = options

    const context: ErrorContext = {
      component: 'VideoDetail',
      action: 'status_check',
      videoId,
      additionalData: { expectedStatus }
    }

    const startTime = Date.now()

    return errorHandler.createRetryMechanism(
      async () => {
        const video = await targetAccountAnalysisApi.getVideoById(videoId)
        
        // Check if we've exceeded max poll time
        if (Date.now() - startTime > maxPollTime) {
          throw new Error(`Video status check timed out after ${maxPollTime}ms`)
        }

        // Check if video has reached expected status
        if (video.status !== expectedStatus) {
          throw new Error(`Video status is ${video.status}, expected ${expectedStatus}`)
        }

        return video
      },
      context,
      {
        maxRetries: Math.floor(maxPollTime / pollInterval),
        baseDelay: pollInterval,
        maxDelay: pollInterval,
        backoffFactor: 1, // No backoff for polling
        ...retryOptions
      }
    )
  }

  /**
   * Retry video file validation
   */
  static async retryVideoFileValidation(
    videoId: string,
    options: VideoRetryOptions = {}
  ) {
    const context: ErrorContext = {
      component: 'VideoPlayer',
      action: 'file_validation',
      videoId
    }

    return errorHandler.createRetryMechanism(
      async () => {
        const video = await targetAccountAnalysisApi.getVideoById(videoId)
        
        if (!video.local_file_path) {
          throw new Error('Video file not available locally')
        }

        // Validate file exists and is accessible
        const response = await fetch(`/api/videos/${videoId}/validate`)
        if (!response.ok) {
          throw new Error(`Video file validation failed: ${response.statusText}`)
        }

        return video
      },
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
   * Smart retry mechanism that adapts based on error type and video state
   */
  static async smartVideoRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options: VideoRetryOptions = {}
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
          toast.info(`Retrying video operation... (${retryCount}/${maxRetries})`, {
            description: `Attempting to ${context.action || 'complete operation'}`,
            duration: 2000
          })
        }

        const result = await operation()
        
        if (retryCount > 0 && showProgress) {
          toast.success('Video operation completed successfully', {
            description: `Succeeded after ${retryCount} ${retryCount === 1 ? 'retry' : 'retries'}`,
            duration: 3000
          })
        }

        return result
      } catch (error) {
        lastError = error
        retryCount++

        const enhancedError = errorHandler.handleError(error, {
          ...context,
          retryCount
        })

        // Adapt retry strategy based on error type
        let shouldRetry = enhancedError.isRetryable && retryCount <= maxRetries
        let adaptedDelay = baseDelay * Math.pow(backoffFactor, retryCount - 1)

        // Special handling for video-specific errors
        if (context.action === 'download') {
          // For download errors, use longer delays
          adaptedDelay = Math.min(adaptedDelay * 2, maxDelay)
          
          // Don't retry if video doesn't exist
          if (enhancedError.type === 'not_found') {
            shouldRetry = false
          }
        } else if (context.action === 'analysis') {
          // For analysis errors, check if video is ready
          if (enhancedError.message.includes('not downloaded')) {
            shouldRetry = false
            toast.error('Video must be downloaded before analysis')
          }
        } else if (context.action === 'file_validation') {
          // For file validation, try re-downloading if file is corrupted
          if (enhancedError.message.includes('corrupted') && retryCount === 1) {
            toast.info('File appears corrupted, attempting re-download...')
            try {
              await VideoRetryMechanisms.retryVideoDownload(context.videoId!, 20)
            } catch (downloadError) {
              console.warn('Re-download failed:', downloadError)
            }
          }
        }

        if (!shouldRetry) {
          break
        }

        // Add jitter to prevent thundering herd
        const jitteredDelay = Math.min(adaptedDelay + Math.random() * 1000, maxDelay)

        if (showProgress) {
          toast.warning(`Video operation failed, retrying in ${Math.round(jitteredDelay / 1000)}s...`, {
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

  /**
   * Batch retry mechanism for multiple video operations
   */
  static async retryBatchVideoOperation<T>(
    videoIds: string[],
    operation: (videoId: string) => Promise<T>,
    context: Omit<ErrorContext, 'videoId'>,
    options: VideoRetryOptions & { 
      concurrency?: number
      failFast?: boolean
    } = {}
  ): Promise<Array<{ videoId: string; result?: T; error?: any }>> {
    const {
      concurrency = 3,
      failFast = false,
      ...retryOptions
    } = options

    const results: Array<{ videoId: string; result?: T; error?: any }> = []
    const semaphore = new Array(concurrency).fill(null)

    const processVideo = async (videoId: string): Promise<void> => {
      try {
        const result = await VideoRetryMechanisms.smartVideoRetry(
          () => operation(videoId),
          { ...context, videoId },
          retryOptions
        )
        results.push({ videoId, result })
      } catch (error) {
        results.push({ videoId, error })
        
        if (failFast) {
          throw error
        }
      }
    }

    // Process videos with concurrency control
    const chunks = []
    for (let i = 0; i < videoIds.length; i += concurrency) {
      chunks.push(videoIds.slice(i, i + concurrency))
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(processVideo))
    }

    return results
  }
}

// Convenience functions
export const retryFetchVideoDetail = VideoRetryMechanisms.retryFetchVideoDetail
export const retryVideoDownload = VideoRetryMechanisms.retryVideoDownload
export const retryVideoAnalysis = VideoRetryMechanisms.retryVideoAnalysis
export const retryFetchAnalysisResults = VideoRetryMechanisms.retryFetchAnalysisResults
export const retryFetchSceneAnalysis = VideoRetryMechanisms.retryFetchSceneAnalysis
export const retryVideoStatusCheck = VideoRetryMechanisms.retryVideoStatusCheck
export const retryVideoFileValidation = VideoRetryMechanisms.retryVideoFileValidation
export const smartVideoRetry = VideoRetryMechanisms.smartVideoRetry
export const retryBatchVideoOperation = VideoRetryMechanisms.retryBatchVideoOperation