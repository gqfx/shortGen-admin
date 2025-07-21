import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  TargetAccount, 
  QuickAddAccountRequest, 
  UpdateTargetAccountRequest,
  Video,
  targetAccountAnalysisApi,
  ApiResponse 
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface TargetAccountsContextType {
  targetAccounts: TargetAccount[]
  loading: boolean
  error: string | null
  pagination: {
    skip: number
    limit: number
    total: number
  }
  filters: {
    isActive?: boolean
    category?: string
  }
  
  // Actions
  fetchTargetAccounts: () => Promise<void>
  createTargetAccount: (data: QuickAddAccountRequest) => Promise<TargetAccount | null>
  updateTargetAccount: (id: string, data: UpdateTargetAccountRequest) => Promise<TargetAccount | null>
  deleteTargetAccount: (id: string, force?: boolean) => Promise<boolean>
  setFilters: (filters: Partial<TargetAccountsContextType['filters']>) => void
  setPagination: (pagination: Partial<TargetAccountsContextType['pagination']>) => void
  resetFilters: () => void
  
  // New enhanced actions
  triggerAccountCrawl: (accountId: string, options?: { crawl_videos?: boolean; video_limit?: number }) => Promise<boolean>
  batchTriggerCrawl: (accountIds: string[], options?: { crawl_videos?: boolean; video_limit?: number }) => Promise<boolean>
  getAccountVideos: (accountId: string) => Promise<Video[] | null>
  triggerVideoDownload: (videoIds: string[], priority?: number) => Promise<boolean>
}

const TargetAccountsContext = createContext<TargetAccountsContextType | undefined>(undefined)

export function useTargetAccounts() {
  const context = useContext(TargetAccountsContext)
  if (context === undefined) {
    throw new Error('useTargetAccounts must be used within a TargetAccountsProvider')
  }
  return context
}

interface TargetAccountsProviderProps {
  children: React.ReactNode
}

export function TargetAccountsProvider({ children }: TargetAccountsProviderProps) {
  const [targetAccounts, setTargetAccounts] = useState<TargetAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 50,
    total: 0,
  })
  const [filters, setFiltersState] = useState<TargetAccountsContextType['filters']>({})

  const fetchTargetAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await targetAccountAnalysisApi.getAccounts(
        pagination.skip,
        pagination.limit,
        filters.isActive,
        filters.category
      )
      
      if (response.data.code === 0) {
        setTargetAccounts(response.data.data)
        setPaginationState(prev => ({
          ...prev,
          total: response.data.data.length
        }))
      } else {
        setError(response.data.msg || 'Failed to fetch target accounts')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      // Don't show toast for initial data loading errors
      console.error('Failed to fetch target accounts:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination.skip, pagination.limit, filters.isActive, filters.category])

  const createTargetAccount = useCallback(async (data: QuickAddAccountRequest): Promise<TargetAccount | null> => {
    try {
      const response = await targetAccountAnalysisApi.quickAddAccount(data)
      
      if (response.data.code === 0) {
        toast.success('Target account added and crawl tasks created successfully')
        await fetchTargetAccounts()
        return response.data.data.account
      } else {
        toast.error(response.data.msg || 'Failed to create target account')
        return null
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return null
    }
  }, [fetchTargetAccounts])

  const updateTargetAccount = useCallback(async (id: string, data: UpdateTargetAccountRequest): Promise<TargetAccount | null> => {
    try {
      const response = await targetAccountAnalysisApi.updateAccount(id, data)
      
      if (response.data.code === 0) {
        toast.success('Target account updated successfully')
        await fetchTargetAccounts()
        return response.data.data
      } else {
        toast.error(response.data.msg || 'Failed to update target account')
        return null
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return null
    }
  }, [fetchTargetAccounts])

  const deleteTargetAccount = useCallback(async (id: string, force = false): Promise<boolean> => {
    try {
      const response = await targetAccountAnalysisApi.deleteAccount(id, { force })
      
      if (response.data.code === 0) {
        toast.success('Target account deleted successfully')
        await fetchTargetAccounts()
        return true
      } else {
        toast.error(response.data.msg || 'Failed to delete target account')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [fetchTargetAccounts])

  // New enhanced methods
  const triggerAccountCrawl = useCallback(async (accountId: string, options?: { crawl_videos?: boolean; video_limit?: number }): Promise<boolean> => {
    try {
      const response = await targetAccountAnalysisApi.triggerAccountCrawl(accountId, options)
      
      if (response.data.code === 0) {
        const taskCount = response.data.data.tasks.length
        toast.success(`Created ${taskCount} crawl tasks for account ${accountId}`)
        return true
      } else {
        toast.error(response.data.msg || 'Failed to trigger crawl')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [])

  const batchTriggerCrawl = useCallback(async (accountIds: string[], options?: { crawl_videos?: boolean; video_limit?: number }): Promise<boolean> => {
    try {
      const response = await targetAccountAnalysisApi.batchTriggerCrawl({
        account_ids: accountIds,
        ...options
      })
      
      if (response.data.code === 0) {
        const results = response.data.data.results
        const successCount = results.filter(r => r.status === 'success').length
        toast.success(`Processed ${accountIds.length} accounts, ${successCount} successful`)
        return true
      } else {
        toast.error(response.data.msg || 'Failed to trigger batch crawl')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [])

  const getAccountVideos = useCallback(async (accountId: string): Promise<Video[] | null> => {
    try {
      const response = await targetAccountAnalysisApi.getAccountVideos(accountId)
      
      if (response.data.code === 0) {
        return response.data.data
      } else {
        toast.error(response.data.msg || 'Failed to fetch account videos')
        return null
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return null
    }
  }, [])

  const triggerVideoDownload = useCallback(async (videoIds: string[], priority = 10): Promise<boolean> => {
    try {
      const response = await targetAccountAnalysisApi.triggerVideoDownload({
        video_ids: videoIds,
        priority
      })
      
      if (response.data.code === 0) {
        const { valid_videos, requested_videos } = response.data.data
        toast.success(`Created ${valid_videos} download tasks out of ${requested_videos} requested`)
        return true
      } else {
        toast.error(response.data.msg || 'Failed to trigger video download')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [])

  const setFilters = useCallback((newFilters: Partial<TargetAccountsContextType['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPaginationState(prev => ({ ...prev, skip: 0 })) // Reset to first page when filters change
  }, [])

  const setPagination = useCallback((newPagination: Partial<TargetAccountsContextType['pagination']>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState({})
    setPaginationState(prev => ({ ...prev, skip: 0 }))
  }, [])

  // Fetch data on mount and when pagination/filters change
  useEffect(() => {
    fetchTargetAccounts()
  }, [fetchTargetAccounts])

  const value: TargetAccountsContextType = {
    targetAccounts,
    loading,
    error,
    pagination,
    filters,
    fetchTargetAccounts,
    createTargetAccount,
    updateTargetAccount,
    deleteTargetAccount,
    setFilters,
    setPagination,
    resetFilters,
    triggerAccountCrawl,
    batchTriggerCrawl,
    getAccountVideos,
    triggerVideoDownload,
  }

  return (
    <TargetAccountsContext.Provider value={value}>
      {children}
    </TargetAccountsContext.Provider>
  )
}