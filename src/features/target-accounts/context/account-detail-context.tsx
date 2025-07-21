import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  TargetAccount, 
  Video,
  targetAccountAnalysisApi
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface AccountStatistics {
  subscriberCount: number
  description: string
  createdAt: string
  totalVideos: number
  totalViews: number
  lastPublishedAt: string | null
}

interface LoadingStates {
  account: boolean
  videos: boolean
  statistics: boolean
  batchDownload: boolean
}

interface ErrorStates {
  account: string | null
  videos: string | null
  statistics: string | null
  batchDownload: string | null
}

interface AccountDetailContextType {
  // Data
  account: TargetAccount | null
  accountStats: AccountStatistics | null
  videos: Video[]
  
  // Loading states
  loading: boolean
  loadingStates: LoadingStates
  
  // Error states
  error: string | null
  errorStates: ErrorStates
  
  // Pagination and filtering
  pagination: {
    skip: number
    limit: number
    total: number
  }
  currentFilters: VideoFilters
  
  // Actions
  fetchAccountDetail: (accountId: string) => Promise<void>
  fetchAccountVideos: (accountId: string, filters?: VideoFilters, pagination?: { skip?: number, limit?: number }) => Promise<void>
  fetchAccountStatistics: (accountId: string) => Promise<void>
  triggerBatchDownload: (videoIds: string[]) => Promise<void>
  filterVideos: (filters: VideoFilters) => void
  refreshAccountData: () => Promise<void>
  clearErrors: () => void
  setPagination: (pagination: Partial<AccountDetailContextType['pagination']>) => void
}

interface VideoFilters {
  dateRange?: {
    start: string
    end: string
  }
  status?: 'all' | 'downloaded' | 'not_downloaded' | 'analyzed'
  videoType?: 'all' | 'long' | 'short' | 'live'
  searchQuery?: string
}

const AccountDetailContext = createContext<AccountDetailContextType | undefined>(undefined)

export function useAccountDetail() {
  const context = useContext(AccountDetailContext)
  if (context === undefined) {
    throw new Error('useAccountDetail must be used within an AccountDetailProvider')
  }
  return context
}

interface AccountDetailProviderProps {
  children: React.ReactNode
  accountId: string
}

export function AccountDetailProvider({ children, accountId }: AccountDetailProviderProps) {
  const [account, setAccount] = useState<TargetAccount | null>(null)
  const [accountStats, setAccountStats] = useState<AccountStatistics | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [allVideos, setAllVideos] = useState<Video[]>([]) // Store unfiltered videos
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<VideoFilters>({})
  
  // Enhanced loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    account: false,
    videos: false,
    statistics: false,
    batchDownload: false
  })
  
  // Enhanced error states
  const [errorStates, setErrorStates] = useState<ErrorStates>({
    account: null,
    videos: null,
    statistics: null,
    batchDownload: null
  })
  
  // Pagination state
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 50,
    total: 0
  })

  const fetchAccountDetail = useCallback(async (accountId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, account: true }))
      setErrorStates(prev => ({ ...prev, account: null }))
      setError(null)
      
      // Fetch account details
      const accountResponse = await targetAccountAnalysisApi.getAccountById(accountId)
      
      if (accountResponse.data.code === 0) {
        const accountData = accountResponse.data.data
        setAccount(accountData)
        
        // Create basic account statistics from account data
        const stats: AccountStatistics = {
          subscriberCount: accountData.subscriber_count || 0,
          description: accountData.description || '',
          createdAt: accountData.created_at,
          totalVideos: 0, // Will be updated when videos are fetched
          totalViews: 0, // Will be calculated from videos
          lastPublishedAt: null // Will be calculated from videos
        }
        setAccountStats(stats)
      } else {
        const errorMessage = accountResponse.data.msg || 'Failed to fetch account details'
        setErrorStates(prev => ({ ...prev, account: errorMessage }))
        setError(errorMessage)
        toast.error('Failed to load account details')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setErrorStates(prev => ({ ...prev, account: errorMessage }))
      setError(errorMessage)
      toast.error('Failed to load account details')
      console.error('Failed to fetch account details:', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, account: false }))
      setLoading(false)
    }
  }, [])

  const fetchAccountVideos = useCallback(async (
    accountId: string, 
    filters?: VideoFilters, 
    paginationOptions?: { skip?: number, limit?: number }
  ) => {
    try {
      setLoadingStates(prev => ({ ...prev, videos: true }))
      setErrorStates(prev => ({ ...prev, videos: null }))
      
      const skip = paginationOptions?.skip ?? pagination.skip
      const limit = paginationOptions?.limit ?? pagination.limit
      
      // Fetch videos for the account
      const videosResponse = await targetAccountAnalysisApi.getAccountVideos(accountId, skip, limit)
      
      if (videosResponse.data.code === 0) {
        const videosData = videosResponse.data.data
        setAllVideos(videosData)
        
        // Update pagination total
        setPaginationState(prev => ({
          ...prev,
          total: videosData.length,
          skip,
          limit
        }))
        
        // Update account statistics with video data
        if (videosData.length > 0) {
          // Calculate total views from video data if available
          // Note: Video engagement metrics might be in a separate API call
          const totalViews = 0 // Placeholder - would need engagement metrics API
          const publishedVideos = videosData.filter(video => video.published_at)
          const lastPublished = publishedVideos.length > 0 
            ? publishedVideos.sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())[0].published_at
            : null
          
          setAccountStats(prev => prev ? {
            ...prev,
            totalVideos: videosData.length,
            totalViews,
            lastPublishedAt: lastPublished
          } : null)
        }
        
        // Apply filters if provided
        if (filters) {
          setCurrentFilters(filters)
          filterVideos(filters)
        } else {
          setVideos(videosData)
        }
      } else {
        const errorMessage = videosResponse.data.msg || 'Failed to fetch account videos'
        setErrorStates(prev => ({ ...prev, videos: errorMessage }))
        toast.error('Failed to load videos')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setErrorStates(prev => ({ ...prev, videos: errorMessage }))
      toast.error('Failed to load videos')
      console.error('Failed to fetch account videos:', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, videos: false }))
    }
  }, [pagination.skip, pagination.limit])

  const fetchAccountStatistics = useCallback(async (accountId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, statistics: true }))
      setErrorStates(prev => ({ ...prev, statistics: null }))
      
      // Try to fetch account snapshots for more detailed statistics
      const snapshotsResponse = await targetAccountAnalysisApi.getAccountSnapshots(accountId, 0, 1)
      
      if (snapshotsResponse.data.code === 0 && snapshotsResponse.data.data.length > 0) {
        const latestSnapshot = snapshotsResponse.data.data[0]
        
        // Update account statistics with snapshot data
        setAccountStats(prev => prev ? {
          ...prev,
          subscriberCount: latestSnapshot.subscriber_count || prev.subscriberCount,
          totalViews: latestSnapshot.total_views || prev.totalViews,
          // Keep other fields from existing stats
        } : null)
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setErrorStates(prev => ({ ...prev, statistics: errorMessage }))
      console.warn('Failed to fetch account statistics:', errorMessage)
      // Don't show toast for statistics errors as they're supplementary
    } finally {
      setLoadingStates(prev => ({ ...prev, statistics: false }))
    }
  }, [])

  const filterVideos = useCallback((filters: VideoFilters) => {
    setCurrentFilters(filters)
    
    let filteredVideos = [...allVideos]
    
    // Apply search filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim()
      filteredVideos = filteredVideos.filter(video => 
        video.title.toLowerCase().includes(query) ||
        (video.description && video.description.toLowerCase().includes(query))
      )
    }
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      switch (filters.status) {
        case 'downloaded':
          filteredVideos = filteredVideos.filter(video => video.is_downloaded)
          break
        case 'not_downloaded':
          filteredVideos = filteredVideos.filter(video => !video.is_downloaded)
          break
        case 'analyzed':
          // This would need to be determined by checking if analysis exists
          // For now, we'll assume analyzed videos have analysis_id or similar field
          filteredVideos = filteredVideos.filter(video => video.is_downloaded) // Placeholder
          break
      }
    }
    
    // Apply video type filter
    if (filters.videoType && filters.videoType !== 'all') {
      filteredVideos = filteredVideos.filter(video => video.video_type === filters.videoType)
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      filteredVideos = filteredVideos.filter(video => {
        if (!video.published_at) return false
        const publishDate = new Date(video.published_at)
        return publishDate >= startDate && publishDate <= endDate
      })
    }
    
    setVideos(filteredVideos)
  }, [allVideos])

  const triggerBatchDownload = useCallback(async (videoIds: string[]) => {
    try {
      setLoadingStates(prev => ({ ...prev, batchDownload: true }))
      setErrorStates(prev => ({ ...prev, batchDownload: null }))
      
      const response = await targetAccountAnalysisApi.triggerVideoDownload({
        video_ids: videoIds,
        priority: 10
      })
      
      if (response.data.code === 0) {
        const { valid_videos, requested_videos } = response.data.data
        toast.success(`Created ${valid_videos} download tasks out of ${requested_videos} requested`)
        
        // Refresh video data to show updated download status
        if (account) {
          await fetchAccountVideos(account.id, currentFilters)
        }
      } else {
        const errorMessage = response.data.msg || 'Failed to trigger batch download'
        setErrorStates(prev => ({ ...prev, batchDownload: errorMessage }))
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setErrorStates(prev => ({ ...prev, batchDownload: errorMessage }))
      toast.error(errorMessage)
      console.error('Failed to trigger batch download:', errorMessage)
    } finally {
      setLoadingStates(prev => ({ ...prev, batchDownload: false }))
    }
  }, [account, currentFilters, fetchAccountVideos])

  const refreshAccountData = useCallback(async () => {
    if (accountId) {
      await Promise.all([
        fetchAccountDetail(accountId),
        fetchAccountVideos(accountId, currentFilters),
        fetchAccountStatistics(accountId)
      ])
    }
  }, [accountId, currentFilters, fetchAccountDetail, fetchAccountVideos, fetchAccountStatistics])

  const clearErrors = useCallback(() => {
    setError(null)
    setErrorStates({
      account: null,
      videos: null,
      statistics: null,
      batchDownload: null
    })
  }, [])

  const setPagination = useCallback((newPagination: Partial<AccountDetailContextType['pagination']>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  // Initialize data when accountId changes
  useEffect(() => {
    if (accountId) {
      setLoading(true)
      Promise.all([
        fetchAccountDetail(accountId),
        fetchAccountVideos(accountId),
        fetchAccountStatistics(accountId)
      ]).finally(() => {
        setLoading(false)
      })
    }
  }, [accountId, fetchAccountDetail, fetchAccountVideos, fetchAccountStatistics])

  // Update videos when pagination changes
  useEffect(() => {
    if (accountId && (pagination.skip > 0 || pagination.limit !== 50)) {
      fetchAccountVideos(accountId, currentFilters, { skip: pagination.skip, limit: pagination.limit })
    }
  }, [accountId, pagination.skip, pagination.limit, currentFilters, fetchAccountVideos])

  const value: AccountDetailContextType = {
    // Data
    account,
    accountStats,
    videos,
    
    // Loading states
    loading,
    loadingStates,
    
    // Error states
    error,
    errorStates,
    
    // Pagination and filtering
    pagination,
    currentFilters,
    
    // Actions
    fetchAccountDetail,
    fetchAccountVideos,
    fetchAccountStatistics,
    triggerBatchDownload,
    filterVideos,
    refreshAccountData,
    clearErrors,
    setPagination,
  }

  return (
    <AccountDetailContext.Provider value={value}>
      {children}
    </AccountDetailContext.Provider>
  )
}