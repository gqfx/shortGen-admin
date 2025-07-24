import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  TargetAccount,
  QuickAddAccountRequest,
  TargetAccountUpdate,
  Video,
  analysisApi,
  AccountCrawlRequest,
  BatchAccountCrawlRequest,
  TriggerDownloadRequest,
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
  updateTargetAccount: (id: string, data: TargetAccountUpdate) => Promise<TargetAccount | null>
  deleteTargetAccount: (id: string) => Promise<boolean>
  setFilters: (filters: Partial<TargetAccountsContextType['filters']>) => void
  setPagination: (pagination: Partial<TargetAccountsContextType['pagination']>) => void
  resetFilters: () => void
  
  // Navigation actions
  navigateToAccountDetail: (accountId: string) => void
  openProfilePage: (profileUrl: string) => void
  setNavigationState: (state: Partial<TargetAccountsContextType['navigationState']>) => void
  handleBrowserNavigation: () => void
  
  // New enhanced actions
  triggerAccountCrawl: (accountId: string, data: AccountCrawlRequest) => Promise<boolean>
  batchTriggerCrawl: (data: BatchAccountCrawlRequest) => Promise<boolean>
  getAccountVideos: (accountId: string, params: { skip?: number; limit?: number; sort_by?: string }) => Promise<Video[] | null>
  triggerVideoDownload: (data: TriggerDownloadRequest) => Promise<boolean>
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
      
      const response = await analysisApi.getAccounts({
        skip: pagination.skip,
        limit: pagination.limit,
        is_active: filters.isActive,
        category: filters.category,
      })

      if (response.code === 0) {
        setTargetAccounts(response.data)
        // Assuming the API does not return total count, we might need to adjust this
        // For now, we'll just use the length of the returned array
        setPaginationState(prev => ({
          ...prev,
          total: response.data.length,
        }))
      } else {
        setError(response.msg || 'Failed to fetch target accounts')
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
      const response = await analysisApi.quickAddAccount(data)

      if (response.data.code === 0) {
        toast.success('Target account added successfully')
        await fetchTargetAccounts()
        return response.data.data
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

  const updateTargetAccount = useCallback(async (id: string, data: TargetAccountUpdate): Promise<TargetAccount | null> => {
    try {
      const response = await analysisApi.updateAccount(id, data)

      if (response.code === 0) {
        toast.success('Target account updated successfully')
        await fetchTargetAccounts()
        return response.data
      } else {
        toast.error(response.msg || 'Failed to update target account')
        return null
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return null
    }
  }, [fetchTargetAccounts])

  const deleteTargetAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      // The new API expects an empty object for the body if no specific options are needed.
      const response = await analysisApi.deleteAccount(id, {})

      if (response.code === 0) {
        toast.success('Target account deleted successfully')
        await fetchTargetAccounts()
        return true
      } else {
        toast.error(response.msg || 'Failed to delete target account')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [fetchTargetAccounts])

  // New enhanced methods
  const triggerAccountCrawl = useCallback(async (accountId: string, data: AccountCrawlRequest): Promise<boolean> => {
    try {
      const response = await analysisApi.triggerAccountCrawl(accountId, data)

      if (response.data.code === 0) {
        toast.success(`Successfully triggered crawl for account ${accountId}. Task ID: ${response.data.data.id}`)
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

  const batchTriggerCrawl = useCallback(async (data: BatchAccountCrawlRequest): Promise<boolean> => {
    try {
      const response = await analysisApi.batchTriggerCrawl(data)

      if (response.data.code === 0) {
        toast.success(response.data.data.message)
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

  const getAccountVideos = useCallback(async (accountId: string, params: { skip?: number; limit?: number; sort_by?: string }): Promise<Video[] | null> => {
    try {
      const response = await analysisApi.getAccountVideos(accountId, params)

      if (response.code === 0) {
        return response.data
      } else {
        toast.error(response.msg || 'Failed to fetch account videos')
        return null
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return null
    }
  }, [])

  const triggerVideoDownload = useCallback(async (data: TriggerDownloadRequest): Promise<boolean> => {
    try {
      const response = await analysisApi.triggerVideoDownload(data)

      if (response.data.code === 0) {
        toast.success(response.data.data.message)
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