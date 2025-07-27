import { apiClient } from '@/lib/api/client'
import { ApiResponse, PaginatedResponse as BasePaginatedResponse } from '@/lib/api/types'
import { Project } from '@/features/projects/data/schema'
import { CreateProjectFormData, UpdateProjectFormData } from '../features/projects/data/schema'
import { Task } from '@/features/tasks/data/schema'

// 重新导出类型以保持向后兼容
export type { ApiResponse } from '@/lib/api/types'
export type PaginatedResponse<T> = BasePaginatedResponse<T>


// Task types have been moved to `features/tasks/data/schema.ts`
// We will import them from there when needed.

// Asset types
export interface Asset {
  id: string
  name: string
  description?: string
  asset_type: string
  storage_path?: string
  asset_metadata: Record<string, unknown>
  duration_seconds?: number
  source?: string
  visibility?: string
  file_hash: string
  original_filename?: string
  status: string
  created_at: string
  updated_at: string
}

export interface AssetCreate {
  name: string
  description?: string
  asset_type: string
  storage_path?: string
  asset_metadata?: Record<string, unknown>
  duration_seconds?: number
  source?: string
  visibility?: string
  file_hash: string
  original_filename?: string
  status: string
}

export interface AssetUpdate {
  name?: string
  description?: string
  asset_metadata?: Record<string, unknown>
  source?: string
  visibility?: string
}

// Inspiration types
export interface Inspiration {
  id: string
  title: string
  description?: string
  project_type_code?: string
  source?: string
  parameters: Record<string, unknown>
  status: string
  score?: number
  score_details?: Record<string, unknown>
  review_notes?: string
  created_at: string
  updated_at: string
}

// Corresponds to schemas.InspirationCreate
export interface CreateInspirationRequest {
  title: string
  description?: string
  project_type_code?: string
  source?: string
  parameters?: Record<string, unknown>
}

// Corresponds to schemas.InspirationUpdate
export interface UpdateInspirationRequest {
  title?: string
  description?: string
  project_type_code?: string
  source?: string
  parameters?: Record<string, unknown>
  status?: string
  score?: number
  score_details?: Record<string, unknown>
  review_notes?: string
}

// Platform Account types
export interface PlatformAccountCredentials {
  email?: string
  password?: string
  proxy?: string
  [key: string]: unknown
}

export interface PlatformAccount {
  id: string
  platform: string
  name: string
  credentials: PlatformAccountCredentials
  status: string
  daily_limit?: number
  used_today: number
  last_used_at?: string | null
  created_at: string
  updated_at: string
  is_available: boolean
  remaining_quota?: number
}

// Corresponds to schemas.platform_account.PlatformAccountCreate
export interface PlatformAccountCreate {
  platform: string
  name: string
  credentials: PlatformAccountCredentials
  daily_limit?: number
}

// Corresponds to schemas.platform_account.PlatformAccountUpdate
export interface PlatformAccountUpdate {
  name?: string
  credentials?: PlatformAccountCredentials
  status?: string
  daily_limit?: number
}

// Corresponds to schemas.platform_account.PlatformAccountUsageReset
export interface PlatformAccountUsageReset {
  used_today: number
}

// Worker Config types
export interface WorkerConfig {
  id: string
  config_name: string
  config_type: string
  worker_type?: string
  config_data: Record<string, unknown>
  description?: string
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateWorkerConfigRequest {
  config_name: string
  config_type: string
  worker_type: string
  config_data: Record<string, unknown>
  description: string
  priority: number
  is_active: boolean
}

export interface UpdateWorkerConfigRequest {
  config_name?: string
  config_type?: string
  worker_type?: string
  config_data?: Record<string, unknown>
  description?: string
  priority?: number
  is_active?: boolean
}

// Corresponds to schemas.worker_config.ConfigAssignmentRequest
export interface ConfigAssignmentRequest {
  config_ids: string[]
}

// Corresponds to schemas.worker_config.TaskConfigAssignment
export interface TaskConfigAssignment {
  task_id: string
  config_id: string
  assigned_at: string
}

// WorkflowRegistry types
export interface WorkflowRegistry {
  id: string
  name: string
  description?: string
  workflow_type: string
  n8n_webhook_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Corresponds to schemas.workflow_registry.WorkflowRegistryCreate
export interface WorkflowRegistryCreate {
  name: string
  description?: string
  workflow_type: string
  n8n_webhook_url?: string
}

// Corresponds to schemas.workflow_registry.WorkflowRegistryUpdate
export interface WorkflowRegistryUpdate {
  name?: string
  description?: string
  n8n_webhook_url?: string
}

// ProjectType types
export interface ProjectType {
  code: string
  name: string
  description?: string
  inspiration_workflow_id?: string | null
  transform_workflow_id?: string | null
  execution_workflow_id?: string | null
  default_parameters: Record<string, unknown>
  parameter_schema: Record<string, unknown>
  category?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  inspiration_workflow?: Record<string, unknown>
  transform_workflow?: Record<string, unknown>
  execution_workflow?: Record<string, unknown>
}

// Corresponds to schemas.project_type.ProjectTypeCreate
export interface ProjectTypeCreate {
  code: string
  name: string
  description?: string
  inspiration_workflow_id?: string
  transform_workflow_id?: string
  execution_workflow_id?: string
  default_parameters?: Record<string, unknown>
  parameter_schema?: Record<string, unknown>
  category?: string
  sort_order?: number
  is_active?: boolean
}

// Corresponds to schemas.project_type.ProjectTypeUpdate
export interface ProjectTypeUpdate {
  name?: string
  description?: string
  inspiration_workflow_id?: string | null
  transform_workflow_id?: string | null
  execution_workflow_id?: string | null
  default_parameters?: Record<string, unknown>
  parameter_schema?: Record<string, unknown>
  category?: string
  sort_order?: number
  is_active?: boolean
}

// API Functions

// Projects API
export const projectsApi = {
  getAll: (page = 1, size = 100): Promise<ApiResponse<PaginatedResponse<Project>>> => {
    if (page < 1) page = 1
    return apiClient.get(`/api/projects`, { page, size })
  },

  getById: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.get(`/api/projects/${id}`),

  create: (data: CreateProjectFormData): Promise<ApiResponse<Project>> =>
    apiClient.post('/api/projects', data),

  update: (id: string, data: UpdateProjectFormData): Promise<ApiResponse<Project>> =>
    apiClient.put(`/api/projects/${id}`, data),

  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/projects/${id}`),

  recalculateTasks: (id: string): Promise<ApiResponse<Project>> =>
    apiClient.post(`/api/projects/${id}/recalculate-tasks`),

  regenerate: (id: string, data?: Record<string, unknown>): Promise<ApiResponse<{ project_id: string; execution_id: string }>> =>
    apiClient.post(`/api/projects/${id}/regenerate`, data),
}

// Tasks API
export const tasksApi = {
  create: (data: unknown): Promise<ApiResponse<Task>> =>
    apiClient.post('/api/tasks', data),

  createBatch: (data: unknown): Promise<ApiResponse<Task[]>> =>
    apiClient.post('/api/tasks/batch', data),

  updateStatus: (taskId: string, data: unknown): Promise<ApiResponse<Task>> =>
    apiClient.patch(`/api/tasks/${taskId}`, data),

  getTaskTypes: (): Promise<ApiResponse<string[]>> =>
    apiClient.get('/api/tasks/types'),

  listTasks: (params: { project_id?: string; task_type?: string; page?: number; size?: number }): Promise<ApiResponse<PaginatedResponse<Task>>> => {
    let { page = 1 } = params
    const { size = 10, ...rest } = params
    if (page < 1) page = 1
    return apiClient.get('/api/tasks', { params: { ...rest, page, size } })
  },

  enqueue: (taskId: string): Promise<ApiResponse<unknown>> =>
    apiClient.post(`/api/tasks/${taskId}/enqueue`),

  getQueueStatus: (taskId: string): Promise<ApiResponse<unknown>> =>
    apiClient.get(`/api/tasks/${taskId}/queue-status`),

  cancel: (taskId: string): Promise<ApiResponse<unknown>> =>
    apiClient.post(`/api/tasks/${taskId}/cancel`),

  deleteAllQueues: (): Promise<ApiResponse<unknown>> =>
    apiClient.post('/api/tasks/delete-all-queues'),

  getQueueInfo: (): Promise<ApiResponse<unknown>> =>
    apiClient.get('/api/tasks/queue-info'),

  listRedisQueues: (): Promise<ApiResponse<string[]>> =>
    apiClient.get('/api/tasks/list-redis-queues'),

  callback: (data: unknown): Promise<ApiResponse<unknown>> =>
    apiClient.post('/api/tasks/callback', data),

  retryMonitoring: (taskId: string): Promise<ApiResponse<unknown>> =>
    apiClient.post(`/api/tasks/monitoring/${taskId}/retry`),
}

// Assets API
export const assetsApi = {
  getByHash: (fileHash: string): Promise<Asset> =>
    apiClient.get(`/api/assets/by-hash/${fileHash}`),

  create: (data: AssetCreate): Promise<Asset> =>
    apiClient.post('/api/assets', data),

  getAll: (page = 1, size = 10, assetType?: string, status?: string): Promise<ApiResponse<PaginatedResponse<Asset>>> => {
    if (page < 1) page = 1
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (assetType) params.append('asset_type', assetType)
    if (status) params.append('status', status)
    return apiClient.get(`/api/assets?${params.toString()}`)
  },

  getById: (assetId: string): Promise<Asset> =>
    apiClient.get(`/api/assets/${assetId}`),

  update: (assetId: string, data: AssetUpdate): Promise<Asset> =>
    apiClient.put(`/api/assets/${assetId}`, data),

  delete: (assetId: string): Promise<{ message: string }> =>
    apiClient.delete(`/api/assets/${assetId}`),

  getByType: (assetType: string, page = 1, size = 100): Promise<Asset[]> => {
    if (page < 1) page = 1
    return apiClient.get(`/api/assets/by-type/${assetType}?page=${page}&size=${size}`)
  },
}

// Inspirations API
export const inspirationsApi = {
  getAll: (page = 1, size = 100, status?: string): Promise<PaginatedResponse<Inspiration>> => {
    if (page < 1) page = 1
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (status) params.append('status', status)
    return apiClient.get(`/api/inspirations?${params.toString()}`)
  },

  getById: (inspirationId: string): Promise<Inspiration> =>
    apiClient.get(`/api/inspirations/${inspirationId}`),

  create: (data: CreateInspirationRequest): Promise<Inspiration> =>
    apiClient.post('/api/inspirations', data),

  update: (inspirationId: string, data: UpdateInspirationRequest): Promise<Inspiration> =>
    apiClient.put(`/api/inspirations/${inspirationId}`, data),

  delete: (inspirationId: string): Promise<{ message: string }> =>
    apiClient.delete(`/api/inspirations/${inspirationId}`),

  approve: (inspirationId: string, data?: { review_notes?: string; score?: number }): Promise<Inspiration> =>
    apiClient.post(`/api/inspirations/${inspirationId}/approve`, data),

  reject: (inspirationId: string, data?: { review_notes?: string }): Promise<Inspiration> =>
    apiClient.post(`/api/inspirations/${inspirationId}/reject`, data),

  regenerate: (inspirationId: string, data?: Record<string, unknown>): Promise<{ inspiration_id: string; execution_id: string }> =>
    apiClient.post(`/api/inspirations/${inspirationId}/regenerate`, data),
}

// Platform Accounts API
export const platformAccountsApi = {
  getAll: (page = 1, size = 10, platform?: string, status?: string): Promise<ApiResponse<PaginatedResponse<PlatformAccount>>> => {
    if (page < 1) page = 1
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (platform) params.append('platform', platform)
    if (status) params.append('status', status)
    return apiClient.get(`/api/platform-accounts?${params.toString()}`)
  },

  getById: (id: string): Promise<ApiResponse<PlatformAccount>> =>
    apiClient.get(`/api/platform-accounts/${id}`),

  create: (data: PlatformAccountCreate): Promise<ApiResponse<PlatformAccount>> =>
    apiClient.post('/api/platform-accounts', data),

  update: (id: string, data: PlatformAccountUpdate): Promise<ApiResponse<PlatformAccount>> =>
    apiClient.put(`/api/platform-accounts/${id}`, data),

  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/platform-accounts/${id}`),

  getAvailable: (platform: string): Promise<ApiResponse<PlatformAccount[]>> =>
    apiClient.get(`/api/platform-accounts/available/${platform}`),

  resetUsage: (id: string, data: PlatformAccountUsageReset): Promise<ApiResponse<PlatformAccount>> =>
    apiClient.post(`/api/platform-accounts/${id}/reset-usage`, data),

  getPlatforms: (): Promise<ApiResponse<string[]>> =>
    apiClient.get('/api/platform-accounts/platforms/list'),
}

// Worker Configs API
export const workerConfigsApi = {
  getAll: (page = 1, size = 100, workerType?: string, configType?: string, isActive?: boolean): Promise<ApiResponse<PaginatedResponse<WorkerConfig>>> => {
    if (page < 1) page = 1
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (workerType) params.append('worker_type', workerType)
    if (configType) params.append('config_type', configType)
    if (isActive !== undefined) params.append('is_active', isActive.toString())
    return apiClient.get(`/api/worker-configs?${params}`)
  },
  
  getById: (id: string): Promise<ApiResponse<WorkerConfig>> =>
    apiClient.get(`/api/worker-configs/${id}`),
  
  create: (data: CreateWorkerConfigRequest): Promise<ApiResponse<WorkerConfig>> =>
    apiClient.post('/api/worker-configs', data),
  
  update: (id: string, data: UpdateWorkerConfigRequest): Promise<ApiResponse<WorkerConfig>> =>
    apiClient.put(`/api/worker-configs/${id}`, data),
  
  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/worker-configs/${id}`),
  
  assignToTask: (taskId: string, data: ConfigAssignmentRequest): Promise<ApiResponse<TaskConfigAssignment[]>> =>
    apiClient.post(`/api/worker-configs/tasks/${taskId}/assign`, data),
  
  getTaskConfigs: (taskId: string): Promise<ApiResponse<Record<string, unknown>>> =>
    apiClient.get(`/api/worker-configs/tasks/${taskId}/configs`),
}

// WorkflowRegistry API
export const workflowRegistryApi = {
  getAll: (page = 1, size = 100, workflowType?: string, isActive?: boolean): Promise<ApiResponse<PaginatedResponse<WorkflowRegistry>>> => {
    if (page < 1) page = 1
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (workflowType) params.append('workflow_type', workflowType)
    if (isActive !== undefined) params.append('is_active', isActive.toString())
    return apiClient.get(`/api/workflow-registry?${params}`)
  },

  getById: (id: string): Promise<WorkflowRegistry> =>
    apiClient.get(`/api/workflow-registry/${id}`),

  create: (data: WorkflowRegistryCreate): Promise<WorkflowRegistry> =>
    apiClient.post('/api/workflow-registry', data),

  update: (id: string, data: WorkflowRegistryUpdate): Promise<WorkflowRegistry> =>
    apiClient.put(`/api/workflow-registry/${id}`, data),

  delete: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/api/workflow-registry/${id}`),

  activate: (id: string): Promise<WorkflowRegistry> =>
    apiClient.post(`/api/workflow-registry/${id}/activate`),

  deactivate: (id: string): Promise<WorkflowRegistry> =>
    apiClient.post(`/api/workflow-registry/${id}/deactivate`),

  getTypes: (): Promise<string[]> =>
    apiClient.get('/api/workflow-registry/types/list'),
}

// ProjectType API
export const projectTypesApi = {
  getAll: (page = 1, size = 100, category?: string, isActive?: boolean): Promise<ApiResponse<PaginatedResponse<ProjectType>>> => {
    if (page < 1) page = 1
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (category) params.append('category', category)
    if (isActive !== undefined) params.append('is_active', isActive.toString())
    return apiClient.get(`/api/project-types?${params}`)
  },
  
  getById: (code: string): Promise<ApiResponse<ProjectType>> =>
    apiClient.get(`/api/project-types/${code}`),
  
  create: (data: ProjectTypeCreate): Promise<ApiResponse<ProjectType>> =>
    apiClient.post('/api/project-types', data),
  
  update: (code: string, data: ProjectTypeUpdate): Promise<ApiResponse<ProjectType>> =>
    apiClient.put(`/api/project-types/${code}`, data),
  
  delete: (code: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/project-types/${code}`),
  
  activate: (code: string): Promise<ApiResponse<ProjectType>> =>
    apiClient.post(`/api/project-types/${code}/activate`),
  
  deactivate: (code: string): Promise<ApiResponse<ProjectType>> =>
    apiClient.post(`/api/project-types/${code}/deactivate`),
  
  getCategories: (): Promise<ApiResponse<string[]>> =>
    apiClient.get('/api/project-types/categories/list'),
  
  updateSortOrder: (code: string, sortOrder: number): Promise<ApiResponse<ProjectType>> =>
    apiClient.put(`/api/project-types/${code}/sort-order?sort_order=${sortOrder}`),
}

// --- Analysis API Types (Updated based on new documentation) ---

// Schemas
export interface AccountSnapshot {
  id: string
  target_account_id: string
  subscriber_count?: number
  total_videos_count?: number
  hidden_subscriber_count?: boolean
  total_views?: number
  collected_at: string
  created_at: string
}

export interface VideoSnapshot {
  id: string
  video_id: string
  views_count?: number
  likes_count?: number
  comments_count?: number
  shares_count?: number
  favorite_count?: number
  collected_at: string
  created_at: string
}

export interface TargetAccount {
  id: string
  account_id?: string
  display_name?: string
  username?: string
  profile_url?: string
  channel_url?: string
  description?: string
  avatar_url?: string
  is_verified?: boolean
  category?: string
  subscriber_count?: number
  is_active: boolean
  last_crawled_at?: string
  video_crawl_limit: number
  created_at: string
  updated_at: string
  deleted_at?: string
  uploads_playlist_id?: string
  country?: string
  published_at?: string
  is_scheduled?: boolean
  schedule_interval?: number
  cron_string?: string
  snapshots: AccountSnapshot[]
}

export interface Video {
  id: string
  target_account_id: string
  video_id: string
  video_url: string
  asset_id?: string
  title?: string
  description?: string
  thumbnail_url?: string
  local_video_url?: string
  duration?: number
  published_at?: string
  category_id?: string
  default_audio_language?: string
  analysis_results?: Record<string, unknown>
  analysis_status?: string
  analysis_error?: string
  is_downloaded: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
  snapshots: VideoSnapshot[]
  asset?: Asset
}

export interface MonitoringTask {
  id: string
  task_type: string
  status: string
  priority: number
  dependencies: string[]
  target_account_id: string
  video_id?: string
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// Request Bodies
export interface QuickAddAccountRequest {
  channel_url: string
  category?: string
  video_limit?: number
  crawl_videos?: boolean
  is_scheduled?: boolean
  schedule_interval?: number
  cron_string?: string
}

export interface TriggerDownloadRequest {
  video_ids: string[]
  priority?: number
}

export interface AccountCrawlRequest {
  crawl_videos?: boolean
  video_limit?: number
}

export interface BatchAccountCrawlRequest {
  account_ids: string[]
  crawl_videos?: boolean
  video_limit?: number
}

// This corresponds to schemas.target_account.TargetAccountUpdate
export interface TargetAccountUpdate {
  display_name?: string
  username?: string
  profile_url?: string
  description?: string
  avatar_url?: string
  is_active?: boolean
  category?: string
  is_scheduled?: boolean
  schedule_interval?: number
  cron_string?: string
  video_crawl_limit?: number
}

export interface DeleteAccountRequest {
  force?: boolean
}

// This corresponds to schemas.monitoring_task.MonitoringTaskUpdate
export interface MonitoringTaskUpdate {
  status?: string
}


// --- Analysis API Client ---

export const analysisApi = {
  /**
   * 快速添加目标账号并立即触发一次后台数据同步任务.
   */
  quickAddAccount: (data: QuickAddAccountRequest): Promise<ApiResponse<TargetAccount>> =>
    apiClient.post('/api/analysis/accounts/quick-add', data),

  /**
   * 手动创建并入队视频下载任务.
   */
  triggerVideoDownload: (data: TriggerDownloadRequest): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/api/analysis/videos/trigger-download', data),

  /**
   * 手动触发对指定账号的后台数据同步任务.
   */
  triggerAccountCrawl: (accountId: string, data: AccountCrawlRequest): Promise<ApiResponse<MonitoringTask>> =>
    apiClient.post(`/api/analysis/accounts/${accountId}/trigger-crawl`, data),

  /**
   * 批量触发多个账号的后台数据同步任务.
   */
  batchTriggerCrawl: (data: BatchAccountCrawlRequest): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/api/analysis/accounts/batch-trigger-crawl', data),

  /**
   * 获取目标账号列表, 并附带最新的快照数据.
   */
  getAccounts: (params: { page?: number; size?: number; is_active?: boolean; category?: string }): Promise<ApiResponse<PaginatedResponse<TargetAccount>>> => {
    if (params.page && params.page < 1) params.page = 1
    return apiClient.get('/api/analysis/accounts', params)
  },

  /**
   * 获取单个目标账号信息, 并附带最新的快照数据.
   */
  getAccount: (accountId: string): Promise<ApiResponse<TargetAccount>> =>
    apiClient.get(`/api/analysis/accounts/${accountId}`),

  /**
   * 更新目标账号信息.
   */
  updateAccount: (accountId: string, data: TargetAccountUpdate): Promise<ApiResponse<TargetAccount>> =>
    apiClient.put(`/api/analysis/accounts/${accountId}`, data),

  /**
   * 删除目标账号.
   */
  deleteAccount: (accountId: string, data: DeleteAccountRequest): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/analysis/accounts/${accountId}`, data),

  /**
   * 获取指定账号下的视频列表.
   */
  getAccountVideos: (accountId: string, params: { page?: number; size?: number; sort_by?: string }): Promise<ApiResponse<PaginatedResponse<Video>>> => {
    let { page = 1 } = params
    const { size = 10, ...rest } = params
    if (page < 1) page = 1
    return apiClient.get(`/api/analysis/accounts/${accountId}/videos`, { ...rest, page, size })
  },

  /**
   * 获取视频列表, 并附带最新的快照数据.
   */
  getVideos: (params: { page?: number; size?: number; sort_by?: string }): Promise<ApiResponse<PaginatedResponse<Video>>> => {
    let { page = 1 } = params
    const { size = 10, ...rest } = params
    if (page < 1) page = 1
    return apiClient.get('/api/analysis/videos', { ...rest, page, size })
  },

  /**
   * 获取账号的历史快照数据.
   */
  getAccountSnapshots: (accountId: string, params: { page?: number; size?: number }): Promise<ApiResponse<PaginatedResponse<AccountSnapshot>>> => {
    let { page = 1 } = params
    const { size = 10 } = params
    if (page < 1) page = 1
    return apiClient.get(`/api/analysis/accounts/${accountId}/snapshots`, { page, size })
  },

  /**
   * 获取视频的历史快照数据.
   */
  getVideoSnapshots: (videoId: string, params: { page?: number; size?: number }): Promise<ApiResponse<PaginatedResponse<VideoSnapshot>>> => {
    let { page = 1 } = params
    const { size = 10 } = params
    if (page < 1) page = 1
    return apiClient.get(`/api/analysis/videos/${videoId}/snapshots`, { page, size })
  },

  /**
   * 触发对指定视频的后台镜头分析任务.
   */
  analyzeVideo: (videoId: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post(`/api/analysis/videos/${videoId}/analyze`),

  /**
   * 获取监控任务列表.
   */
  getTasks: (params: { page?: number; size?: number; account_id?: string; video_id?: string; task_type?: string; status?: string }): Promise<ApiResponse<PaginatedResponse<MonitoringTask>>> => {
    if (params.page && params.page < 1) params.page = 1
    return apiClient.get('/api/analysis/tasks', params)
  },

  /**
   * 更新监控任务状态.
   */
  updateTask: (taskId: string, data: MonitoringTaskUpdate): Promise<ApiResponse<MonitoringTask>> =>
    apiClient.put(`/api/analysis/tasks/${taskId}`, data),
}

// 向后兼容的默认导出
export default apiClient