// 标准 API 响应格式
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 分页响应格式
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// 分页参数
export interface PaginationParams {
  page?: number
  size?: number
}

// 排序参数
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 基础过滤参数
export interface BaseFilterParams {
  search?: string
  status?: string
  created_after?: string
  created_before?: string
}

// 组合查询参数
export interface QueryParams extends PaginationParams, SortParams, BaseFilterParams {
  [key: string]: any
}

// API 错误类型
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp?: string
}

// 批量操作请求
export interface BatchRequest<T> {
  items: T[]
  options?: Record<string, unknown>
}

// 批量操作响应
export interface BatchResponse<T> {
  successful: T[]
  failed: Array<{
    item: T
    error: string
  }>
  total: number
  successCount: number
  failureCount: number
}

// 资源的通用字段
export interface BaseResource {
  id: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

// API 方法类型
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// 请求配置
export interface RequestConfig {
  method: ApiMethod
  url: string
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
}