import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { ApiResponse, PaginatedResponse } from '@/lib/api'
import { showErrorMessage, showSuccessMessage } from '@/lib/error-handling'

// 通用分页参数类型
export interface PaginationOptions {
  page?: number
  size?: number
}

// 通用过滤参数类型
export interface FilterOptions {
  [key: string]: string | number | boolean | undefined
}

// Query key 工厂函数
export const queryKeys = {
  // Target Accounts
  targetAccounts: (filters?: FilterOptions & PaginationOptions) => ['target-accounts', filters],
  targetAccount: (id: string) => ['target-accounts', id],
  accountVideos: (accountId: string, filters?: FilterOptions & PaginationOptions) => 
    ['target-accounts', accountId, 'videos', filters],
  
  // Projects
  projects: (filters?: FilterOptions & PaginationOptions) => ['projects', filters],
  project: (id: string) => ['projects', id],
  
  // Tasks
  tasks: (filters?: FilterOptions & PaginationOptions) => ['tasks', filters],
  task: (id: string) => ['tasks', id],
  
  // Assets
  assets: (filters?: FilterOptions & PaginationOptions) => ['assets', filters],
  asset: (id: string) => ['assets', id],
  
  // Platform Accounts
  platformAccounts: (filters?: FilterOptions & PaginationOptions) => ['platform-accounts', filters],
  platformAccount: (id: string) => ['platform-accounts', id],
  
  // Monitoring Tasks
  monitoringTasks: (filters?: FilterOptions & PaginationOptions) => ['monitoring-tasks', filters],
  
  // Workflow Registry
  workflowRegistry: (filters?: FilterOptions & PaginationOptions) => ['workflow-registry', filters],
  
  // Worker Configs
  workerConfigs: (filters?: FilterOptions & PaginationOptions) => ['worker-configs', filters],
  
  // Project Types
  projectTypes: (filters?: FilterOptions & PaginationOptions) => ['project-types', filters],
  
  // Inspirations
  inspirations: (filters?: FilterOptions & PaginationOptions) => ['inspirations', filters],
}

// 通用的 Query hook
export function useApiQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<ApiResponse<T>>,
  options?: Omit<UseQueryOptions<ApiResponse<T>, Error, T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    select: (data) => data.data, // 自动解包 ApiResponse
    ...options,
  })
}

// 通用的 Paginated Query hook
export function usePaginatedQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<ApiResponse<PaginatedResponse<T>>>,
  options?: Omit<UseQueryOptions<ApiResponse<PaginatedResponse<T>>, Error, PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    select: (data) => data.data, // 自动解包 ApiResponse
    ...options,
  })
}

// 通用的 Mutation hook
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'> & {
    successMessage?: string
    errorMessage?: string
    invalidateQueries?: string[][]
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // 显示成功消息
      if (options?.successMessage) {
        showSuccessMessage(options.successMessage)
      }
      
      // 失效相关查询
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
      
      // 调用用户自定义的 onSuccess
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      // 显示错误消息
      if (options?.errorMessage) {
        showErrorMessage(error, options.errorMessage)
      } else {
        showErrorMessage(error)
      }
      
      // 调用用户自定义的 onError
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}

// 批量操作 Mutation hook
export function useBatchMutation<TData, TVariables>(
  mutationFn: (variables: TVariables[]) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables[]>, 'mutationFn'> & {
    successMessage?: string
    errorMessage?: string
    invalidateQueries?: string[][]
  }
) {
  return useApiMutation(mutationFn, options)
}

// 创建、更新、删除的标准 hooks
export function useCreateMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  resourceName: string,
  invalidateQueries?: string[][],
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useApiMutation(mutationFn, {
    successMessage: `${resourceName} created successfully`,
    errorMessage: `Failed to create ${resourceName.toLowerCase()}`,
    invalidateQueries,
    ...options,
  })
}

export function useUpdateMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  resourceName: string,
  invalidateQueries?: string[][],
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useApiMutation(mutationFn, {
    successMessage: `${resourceName} updated successfully`,
    errorMessage: `Failed to update ${resourceName.toLowerCase()}`,
    invalidateQueries,
    ...options,
  })
}

export function useDeleteMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  resourceName: string,
  invalidateQueries?: string[][],
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  return useApiMutation(mutationFn, {
    successMessage: `${resourceName} deleted successfully`,
    errorMessage: `Failed to delete ${resourceName.toLowerCase()}`,
    invalidateQueries,
    ...options,
  })
}

// 分页状态管理 hook
export function usePagination(initialPage = 1, initialSize = 10) {
  const [pagination, setPaginationState] = useState({
    page: initialPage,
    size: initialSize,
  })
  
  const setPagination = useCallback((updates: Partial<PaginationOptions>) => {
    setPaginationState(prev => ({ ...prev, ...updates }))
  }, [])
  
  const resetPagination = useCallback(() => {
    setPaginationState({ page: initialPage, size: initialSize })
  }, [initialPage, initialSize])
  
  return {
    pagination,
    setPagination,
    resetPagination,
  }
}

// 过滤状态管理 hook
export function useFilters<T extends FilterOptions>(initialFilters: T) {
  const [filters, setFiltersState] = useState<T>(initialFilters)
  
  const setFilters = useCallback((updates: Partial<T>) => {
    setFiltersState(prev => ({ ...prev, ...updates }))
  }, [])
  
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters)
  }, [initialFilters])
  
  const clearFilters = useCallback(() => {
    setFiltersState({} as T)
  }, [])
  
  return {
    filters,
    setFilters,
    resetFilters,
    clearFilters,
  }
}

// 组合分页和过滤的 hook
export function usePaginatedFilters<T extends FilterOptions>(
  initialFilters: T,
  initialPage = 1,
  initialSize = 10
) {
  const { pagination, setPagination, resetPagination } = usePagination(initialPage, initialSize)
  const { filters, setFilters, resetFilters, clearFilters } = useFilters(initialFilters)
  
  // 当过滤条件改变时，重置分页到第一页
  const setFiltersWithPagination = useCallback((updates: Partial<T>) => {
    setFilters(updates)
    setPagination({ page: 1 })
  }, [setFilters, setPagination])
  
  const resetAll = useCallback(() => {
    resetFilters()
    resetPagination()
  }, [resetFilters, resetPagination])
  
  return {
    pagination,
    filters,
    setPagination,
    setFilters: setFiltersWithPagination,
    resetPagination,
    resetFilters,
    clearFilters,
    resetAll,
    // 组合的查询参数
    queryParams: { ...filters, ...pagination },
  }
}