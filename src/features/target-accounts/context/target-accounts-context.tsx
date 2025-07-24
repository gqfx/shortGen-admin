import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
  navigationState: {
    lastVisitedAccountId?: string
    returnPath?: string
    lastProfileVisited?: {
      url: string
      timestamp: string
    }
  }
  
  // Actions
  fetchTargetAccounts: () => Promise<void>
  createTargetAccount: (data: QuickAddAccountRequest) => Promise<TargetAccount | null>
  updateTargetAccount: (id: string, data: UpdateTargetAccountRequest) => Promise<TargetAccount | null>
  deleteTargetAccount: (id: string, force?: boolean) => Promise<boolean>
  setFilters: (filters: Partial<TargetAccountsContextType['filters']>) => void
  setPagination: (pagination: Partial<TargetAccountsContextType['pagination']>) => void
  resetFilters: () => void
  
  // Navigation actions
  navigateToAccountDetail: (accountId: string) => void
  openProfilePage: (profileUrl: string) => void
  setNavigationState: (state: Partial<TargetAccountsContextType['navigationState']>) => void
  handleBrowserNavigation: () => void
  
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
  const navigate = useNavigate()
  const [targetAccounts, setTargetAccounts] = useState<TargetAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 50,
    total: 0,
  })
  const [filters, setFiltersState] = useState<TargetAccountsContextType['filters']>({})
  const [navigationState, setNavigationStateInternal] = useState<TargetAccountsContextType['navigationState']>({})

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
  }, [pagination, filters])

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

  // Navigation handlers
  const navigateToAccountDetail = useCallback((accountId: string) => {
    try {
      // Validate accountId
      if (!accountId || accountId.trim() === '') {
        toast.error('Invalid account ID')
        return
      }

      // Store current path for potential return navigation
      setNavigationStateInternal(prev => ({
        ...prev,
        lastVisitedAccountId: accountId,
        returnPath: '/target-accounts'
      }))
      
      // Navigate to account detail page
      navigate({ 
        to: '/target-accounts/$accountId',
        params: { accountId: accountId.trim() }
      })
    } catch (error) {
      toast.error('Failed to navigate to account detail')
      console.error('Navigation error:', error)
    }
  }, [navigate])

  const openProfilePage = useCallback((profileUrl: string) => {
    try {
      // Validate URL before opening
      if (!profileUrl || profileUrl.trim() === '') {
        toast.error('Profile URL is not available')
        return
      }
      
      // Clean and validate URL
      const cleanUrl = profileUrl.trim()
      let finalUrl: string
      
      // Handle different URL formats
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        finalUrl = cleanUrl
      } else if (cleanUrl.startsWith('//')) {
        finalUrl = `https:${cleanUrl}`
      } else {
        finalUrl = `https://${cleanUrl}`
      }
      
      // Additional validation - check if URL looks valid
      try {
        new URL(finalUrl)
      } catch {
        toast.error('Invalid profile URL format')
        return
      }
      
      // Open in new tab with security attributes
      const newWindow = window.open(finalUrl, '_blank', 'noopener,noreferrer')
      
      // Check if popup was blocked
      if (!newWindow) {
        toast.error('Popup blocked. Please allow popups for this site.')
        return
      }
      
      // Store navigation event for analytics/debugging
      setNavigationStateInternal(prev => ({
        ...prev,
        lastProfileVisited: {
          url: finalUrl,
          timestamp: new Date().toISOString()
        }
      }))
      
    } catch (error) {
      toast.error('Failed to open profile page')
      console.error('Error opening profile URL:', error)
    }
  }, [])

  const setNavigationState = useCallback((state: Partial<TargetAccountsContextType['navigationState']>) => {
    setNavigationStateInternal(prev => ({ ...prev, ...state }))
  }, [])

  // Handle browser navigation state preservation
  const handleBrowserNavigation = useCallback(() => {
    // This function can be called when the component mounts to restore navigation state
    // from sessionStorage or other persistence mechanisms
    try {
      const savedState = sessionStorage.getItem('target-accounts-navigation-state')
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        setNavigationStateInternal(prev => ({ ...prev, ...parsedState }))
      }
    } catch (error) {
      console.warn('Failed to restore navigation state:', error)
    }
  }, [])

  // Save navigation state to sessionStorage when it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('target-accounts-navigation-state', JSON.stringify(navigationState))
    } catch (error) {
      console.warn('Failed to save navigation state:', error)
    }
  }, [navigationState])

  // Initialize browser navigation state on mount
  useEffect(() => {
    handleBrowserNavigation()
  }, [handleBrowserNavigation])

  // Fetch data on mount and when pagination/filters change
  useEffect(() => {
    fetchTargetAccounts()
  }, [pagination.skip, pagination.limit, filters.isActive, filters.category])

  const value: TargetAccountsContextType = {
    targetAccounts,
    loading,
    error,
    pagination,
    filters,
    navigationState,
    fetchTargetAccounts,
    createTargetAccount,
    updateTargetAccount,
    deleteTargetAccount,
    setFilters,
    setPagination,
    resetFilters,
    navigateToAccountDetail,
    openProfilePage,
    setNavigationState,
    handleBrowserNavigation,
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