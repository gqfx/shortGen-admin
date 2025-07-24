import { createContext, useContext, useEffect, useCallback, useState } from 'react'
import { useTargetAccountsStore } from '../stores/target-accounts-store'
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
  account: TargetAccount | null
  accountStats: AccountStatistics | null
  videos: Video[]
  loading: boolean
  loadingStates: LoadingStates
  error: string | null
  errorStates: ErrorStates
  pagination: {
    skip: number
    limit: number
    total: number
  }
  currentFilters: VideoFilters
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
  initialData?: TargetAccount | null
}

const EMPTY_VIDEOS: Video[] = []
const EMPTY_FILTERS: VideoFilters = {}

export function AccountDetailProvider({ children, accountId, initialData = null }: AccountDetailProviderProps) {
  const { setVideos, updateVideo, setFilters } = useTargetAccountsStore()
  const storeVideos = useTargetAccountsStore((state) => state.videos[accountId] || EMPTY_VIDEOS)
  const currentFilters = useTargetAccountsStore((state) => state.filters[accountId] || EMPTY_FILTERS)

  const [account, setAccount] = useState<TargetAccount | null>(initialData)
  const [accountStats, _setAccountStats] = useState<AccountStatistics | null>(null)
  const [videos, setComponentVideos] = useState<Video[]>(storeVideos)
  const [allVideos, setAllVideos] = useState<Video[]>(storeVideos)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    account: false,
    videos: false,
    statistics: false,
    batchDownload: false
  })
  
  const [errorStates, setErrorStates] = useState<ErrorStates>({
    account: null,
    videos: null,
    statistics: null,
    batchDownload: null
  })
  
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 50,
    total: 0
  })

  const fetchAccountDetail = useCallback(async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, account: true }))
      const response = await targetAccountAnalysisApi.getAccountById(id)
      if (response.data.code === 0) {
        setAccount(response.data.data)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error(handleServerError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, account: false }))
    }
  }, [])

  const filterVideos = useCallback((filters: VideoFilters) => {
    setFilters(accountId, filters)
  }, [accountId, setFilters])

  const fetchAccountVideos = useCallback(async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, videos: true }))
      const response = await targetAccountAnalysisApi.getAccountVideos(id, pagination.skip, pagination.limit)
      if (response.data.code === 0) {
        const videoData = response.data.data
        setVideos(accountId, videoData)
        setAllVideos(videoData)
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error(handleServerError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, videos: false }))
    }
  }, [accountId, pagination.skip, pagination.limit, setVideos])

  const fetchAccountStatistics = useCallback(async () => {
    // Implementation remains the same for now
  }, [])

  const triggerBatchDownload = useCallback(async (videoIds: string[]) => {
    try {
      setLoadingStates(prev => ({ ...prev, batchDownload: true }))
      const response = await targetAccountAnalysisApi.triggerVideoDownload({ video_ids: videoIds, priority: 10 })
      if (response.data.code === 0) {
        toast.success('Batch download started')
        videoIds.forEach(videoId => updateVideo(accountId, videoId, { is_downloaded: true }))
      } else {
        toast.error(response.data.msg)
      }
    } catch (error) {
      toast.error(handleServerError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, batchDownload: false }))
    }
  }, [accountId, updateVideo])

  const refreshAccountData = useCallback(async () => {
    await Promise.all([
      fetchAccountDetail(accountId),
      fetchAccountVideos(accountId),
    ])
  }, [accountId, fetchAccountDetail, fetchAccountVideos])

  const clearErrors = useCallback(() => {
    setError(null)
    setErrorStates({ account: null, videos: null, statistics: null, batchDownload: null })
  }, [])

  const setPagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  useEffect(() => {
    if (accountId) {
      setLoading(true)
      Promise.all([
        fetchAccountDetail(accountId),
        fetchAccountVideos(accountId),
      ]).finally(() => setLoading(false))
    }
  }, [accountId, fetchAccountDetail, fetchAccountVideos])

  useEffect(() => {
    let filtered = allVideos
    if (currentFilters.searchQuery) {
      filtered = filtered.filter(v => v.title.includes(currentFilters.searchQuery!))
    }
    // TODO: Add other filters from currentFilters here
    setComponentVideos(filtered)
  }, [allVideos, currentFilters])

  useEffect(() => {
    setComponentVideos(storeVideos)
    setAllVideos(storeVideos)
  }, [storeVideos])

  const value: AccountDetailContextType = {
    account,
    accountStats,
    videos,
    loading,
    loadingStates,
    error,
    errorStates,
    pagination,
    currentFilters,
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