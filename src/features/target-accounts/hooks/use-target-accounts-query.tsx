import { analysisApi, TargetAccount, Video, MonitoringTask, QuickAddAccountRequest, TriggerDownloadRequest, AccountCrawlRequest, TargetAccountUpdate } from '@/lib/api'
import { 
  useApiQuery, 
  usePaginatedQuery, 
  useCreateMutation, 
  useUpdateMutation, 
  useDeleteMutation,
  useApiMutation,
  queryKeys,
  PaginationOptions,
  FilterOptions 
} from '@/hooks/use-api-query'

// Target Accounts 特定的过滤参数
export interface TargetAccountFilters extends FilterOptions {
  is_active?: boolean
  category?: string
  search?: string
}

// Videos 特定的过滤参数  
export interface VideoFilters extends FilterOptions {
  sortBy?: 'views_desc' | 'date_desc'
  status?: string
}

// ============ Queries ============

// 获取目标账号列表
export function useTargetAccounts(
  filters: TargetAccountFilters & PaginationOptions = {}
) {
  return usePaginatedQuery(
    queryKeys.targetAccounts(filters),
    () => analysisApi.getAccounts(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}

// 获取单个目标账号
export function useTargetAccount(accountId: string) {
  return useApiQuery(
    queryKeys.targetAccount(accountId),
    () => analysisApi.getAccount(accountId),
    {
      enabled: !!accountId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )
}

// 获取账号视频列表
export function useAccountVideos(
  accountId: string,
  filters: VideoFilters & PaginationOptions = {}
) {
  return usePaginatedQuery(
    queryKeys.accountVideos(accountId, filters),
    () => analysisApi.getAccountVideos(accountId, filters),
    {
      enabled: !!accountId,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )
}

// ============ Mutations ============

// 快速添加账号
export function useQuickAddAccount() {
  return useCreateMutation(
    (data: QuickAddAccountRequest) => analysisApi.quickAddAccount(data),
    'Account',
    [queryKeys.targetAccounts()]
  )
}

// 更新账号
export function useUpdateAccount() {
  return useUpdateMutation(
    ({ accountId, data }: { accountId: string; data: TargetAccountUpdate }) => 
      analysisApi.updateAccount(accountId, data),
    'Account',
    [queryKeys.targetAccounts(), queryKeys.targetAccount]
  )
}

// 删除账号
export function useDeleteAccount() {
  return useDeleteMutation(
    ({ accountId, force }: { accountId: string; force?: boolean }) => 
      analysisApi.deleteAccount(accountId, { force }),
    'Account',
    [queryKeys.targetAccounts()]
  )
}

// 触发账号爬取
export function useTriggerAccountCrawl() {
  return useApiMutation(
    ({ accountId, data }: { accountId: string; data: AccountCrawlRequest }) =>
      analysisApi.triggerAccountCrawl(accountId, data),
    {
      successMessage: 'Account crawl triggered successfully',
      errorMessage: 'Failed to trigger account crawl',
      invalidateQueries: [
        queryKeys.targetAccounts(),
        queryKeys.targetAccount,
        queryKeys.accountVideos,
      ],
    }
  )
}

// 批量触发爬取
export function useBatchTriggerCrawl() {
  return useApiMutation(
    (data: { account_ids: string[]; crawl_videos?: boolean; video_limit?: number }) =>
      analysisApi.batchTriggerCrawl(data),
    {
      successMessage: 'Batch crawl triggered successfully',
      errorMessage: 'Failed to trigger batch crawl',
      invalidateQueries: [
        queryKeys.targetAccounts(),
        queryKeys.accountVideos,
      ],
    }
  )
}

// 触发视频下载
export function useTriggerVideoDownload() {
  return useApiMutation(
    (data: TriggerDownloadRequest) => analysisApi.triggerVideoDownload(data),
    {
      successMessage: 'Video download triggered successfully',
      errorMessage: 'Failed to trigger video download',
      invalidateQueries: [
        queryKeys.accountVideos,
      ],
    }
  )
}

// 视频分析
export function useAnalyzeVideo() {
  return useApiMutation(
    (videoId: string) => analysisApi.analyzeVideo(videoId),
    {
      successMessage: 'Video analysis triggered successfully',
      errorMessage: 'Failed to trigger video analysis',
      invalidateQueries: [
        queryKeys.accountVideos,
      ],
    }
  )
}