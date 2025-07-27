import { toast } from 'sonner'
import { AxiosError } from 'axios'

// 错误类型定义
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: Record<string, unknown>
  userMessage?: string
}

// 创建应用错误
export function createAppError(
  message: string,
  code?: string,
  statusCode?: number,
  details?: Record<string, unknown>
): AppError {
  const error = new Error(message) as AppError
  error.code = code
  error.statusCode = statusCode
  error.details = details
  error.userMessage = message
  return error
}

// 解析 API 错误响应
  // Axios 错误
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status
    const responseData = error.response?.data
    
    // 如果是标准的 API 错误响应
    if (responseData && typeof responseData === 'object' && 'msg' in responseData) {
      return createAppError(
        responseData.msg as string,
        responseData.code as string || 'API_ERROR',
        statusCode,
        { originalError: error, responseData }
      )
    }
    
    // 网络错误
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return createAppError(
        '网络连接失败，请检查网络设置',
        'NETWORK_ERROR',
        0,
        { originalError: error }
      )
    }
    
    // HTTP 状态码错误
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权访问',
      403: '权限不足',
      404: '请求的资源不存在',
      409: '资源冲突',
      422: '请求参数验证失败',
      429: '请求过于频繁',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时',
    }
    
    const message = statusMessages[statusCode || 0] || error.message || '未知错误'
    return createAppError(
      message,
      `HTTP_${statusCode}`,
      statusCode,
      { originalError: error }
    )
  }
  
  // 标准 Error 对象
  if (error instanceof Error) {
    return createAppError(
      error.message,
      'UNKNOWN_ERROR',
      undefined,
      { originalError: error }
    )
  }
  
  // 其他类型的错误
  return createAppError(
    String(error),
    'UNKNOWN_ERROR',
    undefined,
    { originalError: error }
  )
}

// 显示错误消息
export function showErrorMessage(error: unknown, title?: string) {
  const message = appError.userMessage || appError.message
  
  if (title) {
    toast.error(title, {
      description: message,
    })
  } else {
    toast.error(message)
  }
  
  // 在开发环境下打印完整错误信息
  if (import.meta.env.DEV) {
    console.error('Error details:', appError)
  }
}

// 显示成功消息
export function showSuccessMessage(message: string, description?: string) {
  if (description) {
    toast.success(message, { description })
  } else {
    toast.success(message)
  }
}

// 显示警告消息
export function showWarningMessage(message: string, description?: string) {
  if (description) {
    toast.warning(message, { description })
  } else {
    toast.warning(message)
  }
}

// 显示信息消息
export function showInfoMessage(message: string, description?: string) {
  if (description) {
    toast.info(message, { description })
  } else {
    toast.info(message)
  }
}

// React Query 错误处理工具
export function createErrorHandler(action: string) {
  return (error: unknown) => {
    showErrorMessage(error, `${action}失败`)
  }
}

// React Query 成功处理工具
export function createSuccessHandler(action: string, description?: string) {
  return () => {
    showSuccessMessage(`${action}成功`, description)
  }
}

// 异步操作包装器，自动处理错误
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorTitle?: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    showErrorMessage(error, errorTitle)
    return null
  }
}

// 批处理操作结果
export interface BatchOperationResult<T = unknown> {
  successful: T[]
  failed: Array<{ item: T; error: AppError }>
  total: number
  successCount: number
  failureCount: number
}

// 批处理操作包装器
export async function withBatchErrorHandling<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  options?: {
    continueOnError?: boolean
    showProgress?: boolean
    successTitle?: string
    errorTitle?: string
  }
): Promise<BatchOperationResult<T>> {
  const result: BatchOperationResult<T> = {
    successful: [],
    failed: [],
    total: items.length,
    successCount: 0,
    failureCount: 0,
  }
  
  for (const item of items) {
    try {
      await operation(item)
      result.successful.push(item)
      result.successCount++
    } catch (error) {
      result.failed.push({ item, error: appError })
      result.failureCount++
      
      if (!options?.continueOnError) {
        break
      }
    }
  }
  
  // 显示结果消息
  if (options?.successTitle && result.successCount > 0) {
    showSuccessMessage(
      options.successTitle,
      `成功处理 ${result.successCount} 项`
    )
  }
  
  if (options?.errorTitle && result.failureCount > 0) {
    showErrorMessage(
      `${options.errorTitle}，失败 ${result.failureCount} 项`,
      result.failed[0]?.error.message
    )
  }
  
  return result
}

// 重试工具
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
      }
    }
  }
  
  throw lastError
}