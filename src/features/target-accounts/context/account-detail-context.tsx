import { createContext, useContext, ReactNode } from 'react'
import { useParams } from '@tanstack/react-router'
import { 
  useTargetAccount, 
  useAccountVideos, 
  useTriggerVideoDownload,
  TargetAccountFilters,
  VideoFilters 
} from '../hooks/use-target-accounts-query'
import { usePaginatedFilters } from '@/hooks/use-api-query'

// 统一的加载状态类型
interface LoadingStates {
  account: boolean
  videos: boolean
  batchDownload: boolean
}

// 统一的错误状态类型
interface ErrorStates {
  account: string | null
  videos: string | null
  batchDownload: string | null
}

interface AccountDetailContextType {
  // 数据
  account: any | null // TargetAccount
  videos: any[] // Video[]
  
  // 状态
  loadingStates: LoadingStates
  errorStates: ErrorStates
  
  // 分页和过滤
  pagination: {
    page: number
    size: number
    total: number
  }
  currentFilters: VideoFilters
  
  // 操作方法
  triggerBatchDownload: (videoIds: string[]) => Promise<void>
  filterVideos: (filters: VideoFilters) => void
  setPagination: (pagination: Partial<{ page: number; size: number }>) => void
  
  // 刷新方法
  refetchAccount: () => void
  refetchVideos: () => void
}

const AccountDetailContext = createContext<AccountDetailContextType | undefined>(undefined)

interface AccountDetailProviderProps {
  children: ReactNode
}

export function AccountDetailProvider({ children }: AccountDetailProviderProps) {
  const { accountId } = useParams({ from: '/target-accounts/$accountId' })
  
  // 初始化分页和过滤状态
  const {
    pagination,
    filters: currentFilters,
    setPagination,
    setFilters: setVideoFilters,
    queryParams: videoQueryParams,
  } = usePaginatedFilters<VideoFilters>({
    sortBy: 'views_desc',
  }, 1, 10)

  // 获取账号信息
  const {
    data: account,
    isLoading: isAccountLoading,
    error: accountError,
    refetch: refetchAccount,
  } = useTargetAccount(accountId)

  // 获取视频列表
  const {
    data: videosResponse,
    isLoading: isVideosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useAccountVideos(accountId, videoQueryParams)

  // 触发视频下载
  const triggerDownloadMutation = useTriggerVideoDownload()

  // 组装状态数据
  const loadingStates: LoadingStates = {
    account: isAccountLoading,
    videos: isVideosLoading,
    batchDownload: triggerDownloadMutation.isPending,
  }

  const errorStates: ErrorStates = {
    account: accountError?.message || null,
    videos: videosError?.message || null,
    batchDownload: triggerDownloadMutation.error?.message || null,
  }

  // 批量下载处理
  const triggerBatchDownload = async (videoIds: string[]) => {
    await triggerDownloadMutation.mutateAsync({
      video_ids: videoIds,
      priority: 5,
    })
  }

  // 过滤视频
  const filterVideos = (filters: VideoFilters) => {
    setVideoFilters(filters)
  }

  // 更新分页时同步总数
  const updatedPagination = {
    ...pagination,
    total: videosResponse?.total || 0,
  }

  const value: AccountDetailContextType = {
    // 数据
    account,
    videos: videosResponse?.items || [],
    
    // 状态
    loadingStates,
    errorStates,
    
    // 分页和过滤
    pagination: updatedPagination,
    currentFilters,
    
    // 操作方法
    triggerBatchDownload,
    filterVideos,
    setPagination,
    
    // 刷新方法
    refetchAccount,
    refetchVideos,
  }

  return (
    <AccountDetailContext.Provider value={value}>
      {children}
    </AccountDetailContext.Provider>
  )
}

export function useAccountDetail() {
  const context = useContext(AccountDetailContext)
  if (context === undefined) {
    throw new Error('useAccountDetail must be used within an AccountDetailProvider')
  }
  return context
}

// 向后兼容的默认导出
export default AccountDetailProvider