import { createContext, useContext, useEffect, useCallback, useState } from 'react'
import { useTargetAccountsStore } from '../stores/target-accounts-store'
import {
  TargetAccount,
  Video,
  analysisApi,
  AccountSnapshot,
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

import { VideoFilters } from '../stores/target-accounts-store'

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
  accountStats: AccountSnapshot | null
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
  fetchAccountVideos: (accountId: string, params?: { skip?: number; limit?: number; sort_by?: string }) => Promise<void>
  fetchAccountStatistics: (accountId: string) => Promise<void>
  triggerBatchDownload: (videoIds: string[]) => Promise<void>
  filterVideos: (filters: VideoFilters) => void
  refreshAccountData: () => Promise<void>
  clearErrors: () => void
  setPagination: (pagination: Partial<AccountDetailContextType['pagination']>) => void
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
  const [accountStats, _setAccountStats] = useState<AccountSnapshot | null>(null)
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
      const response = await analysisApi.getAccount(id)
      if (response.code === 0) {
        setAccount(response.data)
      } else {
        toast.error(response.msg || 'Failed to fetch account details')
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

  const fetchAccountVideos = useCallback(async (id: string, params?: { skip?: number, limit?: number, sort_by?: string }) => {
    try {
      setLoadingStates(prev => ({ ...prev, videos: true }))
      const response = await analysisApi.getAccountVideos(id, {
        skip: params?.skip ?? pagination.skip,
        limit: params?.limit ?? pagination.limit,
        sort_by: params?.sort_by,
      })
      if (response.code === 0) {
        setVideos(accountId, response.data)
        setAllVideos(response.data)
      } else {
        toast.error(response.msg || 'Failed to fetch account videos')
      }
    } catch (error) {
      toast.error(handleServerError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, videos: false }))
    }
  }, [accountId, pagination.skip, pagination.limit, setVideos])

  const fetchAccountStatistics = useCallback(async (id: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, statistics: true }))
      const response = await analysisApi.getAccountSnapshots(id, { limit: 1, skip: 0 })
      if (response.code === 0 && response.data.length > 0) {
        // Assuming we want the latest snapshot for the stats
        _setAccountStats(response.data[0])
      } else if (response.code !== 0) {
        toast.error(response.msg || 'Failed to fetch account statistics')
      }
    } catch (error) {
      toast.error(handleServerError(error))
    } finally {
      setLoadingStates(prev => ({ ...prev, statistics: false }))
    }
  }, [])

  const triggerBatchDownload = useCallback(async (videoIds: string[]) => {
    try {
      setLoadingStates(prev => ({ ...prev, batchDownload: true }))
      const response = await analysisApi.triggerVideoDownload({ video_ids: videoIds })
      if (response.code === 0) {
        toast.success(response.data.message)
        // The download status should be updated via polling the task, not manually setting it.
        // We can trigger a refresh of the video data after a short delay.
        setTimeout(() => fetchAccountVideos(accountId), 3000)
      } else {
        toast.error(response.msg || 'Failed to trigger batch download')
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
      filtered = filtered.filter(v => v.title && v.title.includes(currentFilters.searchQuery!))
    }
    // TODO: Add other filters from currentFilters here
    setComponentVideos(filtered)
  }, [allVideos, currentFilters])

  useEffect(() => {
    if (currentFilters.sortBy) {
      fetchAccountVideos(accountId, { sort_by: currentFilters.sortBy })
    }
  }, [currentFilters.sortBy, accountId, fetchAccountVideos])

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