import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.DEV ? '' : 'http://localhost:8000'

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    })
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    })
    return Promise.reject(error)
  }
)

// Project types
export interface Project {
  id: number
  name: string
  project_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  initial_parameters: Record<string, any>
  inspiration_id: number | null
  score: number | null
  score_details: Record<string, any> | null
  review_notes: string | null
  used_transform_workflow_id: string | null
  used_execution_workflow_id: string | null
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  output_asset_id: number | null
  created_at: string
  updated_at: string
  tasks?: Task[]
}

export interface CreateProjectRequest {
  name: string
  project_type: string
  initial_parameters: Record<string, any>
}

export interface UpdateProjectRequest {
  name?: string
  initial_parameters?: Record<string, any>
  inspiration_id?: number
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  score?: number
  score_details?: Record<string, any>
  review_notes?: string
}

// Task types
export interface Task {
  id: number
  project_id: number
  task_type: string
  status: 'waiting' | 'pending' | 'processing' | 'completed' | 'failed'
  dependencies: number[]
  task_output: Record<string, any> | null
  platform_account_id: number | null
  commit_id: string | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskRequest {
  project_id: number
  task_type: string
  status: 'waiting' | 'pending' | 'processing' | 'completed' | 'failed'
  dependencies?: number[]
  task_output?: Record<string, any>
  platform_account_id?: number
  commit_id?: string
  error_message?: string
}

export interface UpdateTaskRequest {
  status?: 'waiting' | 'pending' | 'processing' | 'completed' | 'failed'
  task_output?: Record<string, any>
  error_message?: string
}

// Asset types
export interface Asset {
  id: number
  name: string
  description: string
  asset_type: 'video' | 'image' | 'audio' | 'text'
  storage_path: string
  asset_metadata: Record<string, any>
  duration_seconds: number | null
  source: string
  visibility: 'private' | 'public'
  status: string
  created_at: string
  updated_at: string
}

export interface CreateAssetRequest {
  name: string
  description: string
  asset_type: 'video' | 'image' | 'audio' | 'text'
  storage_path: string
  asset_metadata: Record<string, any>
  duration_seconds?: number
  source: string
  visibility: 'private' | 'public'
  status: string
}

export interface UpdateAssetRequest {
  name?: string
  description?: string
  asset_type?: 'video' | 'image' | 'audio' | 'text'
  storage_path?: string
  asset_metadata?: Record<string, any>
  duration_seconds?: number
  source?: string
  visibility?: 'private' | 'public'
  status?: string
}

// Inspiration types
export interface Inspiration {
  id: number
  title: string
  description: string
  project_type_code: string
  source: string
  parameters: Record<string, any>
  status: string
  score: number | null
  score_details: Record<string, any> | null
  review_notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateInspirationRequest {
  title: string
  description: string
  project_type_code: string
  source: string
  parameters: Record<string, any>
}

export interface UpdateInspirationRequest {
  title?: string
  description?: string
  project_type_code?: string
  source?: string
  parameters?: Record<string, any>
  status?: string
  score?: number
  score_details?: Record<string, any>
  review_notes?: string
}

// Platform Account types
export interface PlatformAccount {
  id: number
  platform: 'dreamina' | 'midjourney' | 'runway'
  name: string
  credentials: Record<string, any>
  status: 'active' | 'inactive'
  daily_limit: number
  used_today: number
  last_used_at: string | null
  is_available: boolean
  remaining_quota: number
  created_at: string
  updated_at: string
}

export interface CreatePlatformAccountRequest {
  platform: 'dreamina' | 'midjourney' | 'runway'
  name: string
  credentials: Record<string, any>
  status: 'active' | 'inactive'
  daily_limit: number
}

export interface UpdatePlatformAccountRequest {
  platform?: 'dreamina' | 'midjourney' | 'runway'
  name?: string
  credentials?: Record<string, any>
  status?: 'active' | 'inactive'
  daily_limit?: number
}

// Worker Config types
export interface WorkerConfig {
  id: number
  config_name: string
  config_type: string
  worker_type: string
  config_data: Record<string, any>
  description: string
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateWorkerConfigRequest {
  config_name: string
  config_type: string
  worker_type: string
  config_data: Record<string, any>
  description: string
  priority: number
  is_active: boolean
}

export interface UpdateWorkerConfigRequest {
  config_name?: string
  config_type?: string
  worker_type?: string
  config_data?: Record<string, any>
  description?: string
  priority?: number
  is_active?: boolean
}

// WorkflowRegistry types
export interface WorkflowRegistry {
  id: string
  name: string
  description: string
  workflow_type: 'inspiration' | 'transform' | 'execution'
  version: string
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateWorkflowRegistryRequest {
  id: string
  name: string
  description: string
  workflow_type: 'inspiration' | 'transform' | 'execution'
  version: string
  config: Record<string, any>
  is_active: boolean
}

export interface UpdateWorkflowRegistryRequest {
  name?: string
  description?: string
  workflow_type?: 'inspiration' | 'transform' | 'execution'
  version?: string
  config?: Record<string, any>
  is_active?: boolean
}

// ProjectType types
export interface ProjectType {
  code: string
  name: string
  description: string
  inspiration_workflow_id: string | null
  transform_workflow_id: string | null
  execution_workflow_id: string | null
  default_parameters: Record<string, any>
  parameter_schema: Record<string, any>
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  inspiration_workflow?: {
    id: string
    name: string
    workflow_type: string
  }
  transform_workflow?: {
    id: string
    name: string
    workflow_type: string
  }
  execution_workflow?: {
    id: string
    name: string
    workflow_type: string
  }
}

export interface CreateProjectTypeRequest {
  code: string
  name: string
  description: string
  inspiration_workflow_id?: string
  transform_workflow_id?: string
  execution_workflow_id?: string
  default_parameters: Record<string, any>
  parameter_schema: Record<string, any>
  category: string
  sort_order: number
  is_active: boolean
}

export interface UpdateProjectTypeRequest {
  name?: string
  description?: string
  inspiration_workflow_id?: string
  transform_workflow_id?: string
  execution_workflow_id?: string
  default_parameters?: Record<string, any>
  parameter_schema?: Record<string, any>
  category?: string
  sort_order?: number
  is_active?: boolean
}

// API Functions

// Projects API
export const projectsApi = {
  getAll: (skip = 0, limit = 100): Promise<AxiosResponse<ApiResponse<Project[]>>> =>
    api.get(`/api/projects?skip=${skip}&limit=${limit}`),
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Project>>> =>
    api.get(`/api/projects/${id}`),
  
  create: (data: CreateProjectRequest): Promise<AxiosResponse<ApiResponse<Project>>> =>
    api.post('/api/projects', data),
  
  update: (id: number, data: UpdateProjectRequest): Promise<AxiosResponse<ApiResponse<Project>>> =>
    api.put(`/api/projects/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/projects/${id}`),
  
  recalculateTasks: (id: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/api/projects/${id}/recalculate-tasks`),
  
  regenerate: (id: number, data?: Record<string, any>): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/api/projects/${id}/regenerate`, data),
}

// Tasks API
export const tasksApi = {
  getAll: (skip = 0, limit = 100): Promise<AxiosResponse<ApiResponse<Task[]>>> =>
    api.get(`/api/tasks?skip=${skip}&limit=${limit}`),
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Task>>> =>
    api.get(`/api/tasks/${id}`),
  
  create: (data: CreateTaskRequest): Promise<AxiosResponse<ApiResponse<Task>>> =>
    api.post('/api/tasks', data),
  
  update: (id: number, data: UpdateTaskRequest): Promise<AxiosResponse<ApiResponse<Task>>> =>
    api.patch(`/api/tasks/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/tasks/${id}`),
  
  claim: (taskTypes: string[]): Promise<AxiosResponse<ApiResponse<Task>>> =>
    api.post('/api/tasks/claim', { task_types: taskTypes }),
}

// Assets API
export const assetsApi = {
  getAll: (skip = 0, limit = 100, assetType?: string, status?: string): Promise<AxiosResponse<ApiResponse<Asset[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (assetType) params.append('asset_type', assetType)
    if (status) params.append('status', status)
    return api.get(`/api/assets?${params}`)
  },
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Asset>>> =>
    api.get(`/api/assets/${id}`),
  
  create: (data: CreateAssetRequest): Promise<AxiosResponse<ApiResponse<Asset>>> =>
    api.post('/api/assets', data),
  
  update: (id: number, data: UpdateAssetRequest): Promise<AxiosResponse<ApiResponse<Asset>>> =>
    api.put(`/api/assets/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/assets/${id}`),
  
  getByType: (assetType: string, skip = 0, limit = 100): Promise<AxiosResponse<ApiResponse<Asset[]>>> =>
    api.get(`/api/assets/by-type/${assetType}?skip=${skip}&limit=${limit}`),
}

// Inspirations API
export const inspirationsApi = {
  getAll: (skip = 0, limit = 100, status?: string): Promise<AxiosResponse<ApiResponse<Inspiration[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (status) params.append('status', status)
    return api.get(`/api/inspirations?${params}`)
  },
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Inspiration>>> =>
    api.get(`/api/inspirations/${id}`),
  
  create: (data: CreateInspirationRequest): Promise<AxiosResponse<ApiResponse<Inspiration>>> =>
    api.post('/api/inspirations', data),
  
  update: (id: number, data: UpdateInspirationRequest): Promise<AxiosResponse<ApiResponse<Inspiration>>> =>
    api.put(`/api/inspirations/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/inspirations/${id}`),
  
  approve: (id: number, data?: { review_notes?: string; score?: number }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/api/inspirations/${id}/approve`, data),
  
  reject: (id: number, data?: { review_notes?: string }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/api/inspirations/${id}/reject`, data),
  
  regenerate: (id: number, data?: { parameter_overrides?: Record<string, any> }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/api/inspirations/${id}/regenerate`, data),
}

// Platform Accounts API
export const platformAccountsApi = {
  getAll: (skip = 0, limit = 100, platform?: string, status?: string): Promise<AxiosResponse<ApiResponse<PlatformAccount[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (platform) params.append('platform', platform)
    if (status) params.append('status', status)
    return api.get(`/api/platform-accounts?${params}`)
  },
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<PlatformAccount>>> =>
    api.get(`/api/platform-accounts/${id}`),
  
  create: (data: CreatePlatformAccountRequest): Promise<AxiosResponse<ApiResponse<PlatformAccount>>> =>
    api.post('/api/platform-accounts', data),
  
  update: (id: number, data: UpdatePlatformAccountRequest): Promise<AxiosResponse<ApiResponse<PlatformAccount>>> =>
    api.put(`/api/platform-accounts/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/platform-accounts/${id}`),
  
  getAvailable: (platform: string): Promise<AxiosResponse<ApiResponse<PlatformAccount[]>>> =>
    api.get(`/api/platform-accounts/available/${platform}`),
  
  resetUsage: (id: number, usedToday = 0): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/api/platform-accounts/${id}/reset-usage`, { used_today: usedToday }),
  
  getPlatforms: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get('/api/platform-accounts/platforms/list'),
}

// Worker Configs API
export const workerConfigsApi = {
  getAll: (skip = 0, limit = 100, workerType?: string, configType?: string, isActive?: boolean): Promise<AxiosResponse<ApiResponse<WorkerConfig[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (workerType) params.append('worker_type', workerType)
    if (configType) params.append('config_type', configType)
    if (isActive !== undefined) params.append('is_active', isActive.toString())
    return api.get(`/api/worker-configs?${params}`)
  },
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<WorkerConfig>>> =>
    api.get(`/api/worker-configs/${id}`),
  
  create: (data: CreateWorkerConfigRequest): Promise<AxiosResponse<ApiResponse<WorkerConfig>>> =>
    api.post('/api/worker-configs', data),
  
  update: (id: number, data: UpdateWorkerConfigRequest): Promise<AxiosResponse<ApiResponse<WorkerConfig>>> =>
    api.put(`/api/worker-configs/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/worker-configs/${id}`),
  
  assignToTask: (taskId: number, configIds: number[], overrideData?: Record<string, any>): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/api/worker-configs/tasks/${taskId}/assign`, { config_ids: configIds, override_data: overrideData }),
  
  getTaskConfigs: (taskId: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/api/worker-configs/tasks/${taskId}/configs`),
}

// WorkflowRegistry API
export const workflowRegistryApi = {
  getAll: (skip = 0, limit = 100, workflowType?: string, isActive?: boolean): Promise<AxiosResponse<ApiResponse<WorkflowRegistry[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (workflowType) params.append('workflow_type', workflowType)
    if (isActive !== undefined) params.append('is_active', isActive.toString())
    return api.get(`/api/workflow-registry?${params}`)
  },
  
  getById: (id: string): Promise<AxiosResponse<ApiResponse<WorkflowRegistry>>> =>
    api.get(`/api/workflow-registry/${id}`),
  
  create: (data: CreateWorkflowRegistryRequest): Promise<AxiosResponse<ApiResponse<WorkflowRegistry>>> =>
    api.post('/api/workflow-registry', data),
  
  update: (id: string, data: UpdateWorkflowRegistryRequest): Promise<AxiosResponse<ApiResponse<WorkflowRegistry>>> =>
    api.put(`/api/workflow-registry/${id}`, data),
  
  delete: (id: string): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/workflow-registry/${id}`),
  
  activate: (id: string): Promise<AxiosResponse<ApiResponse<WorkflowRegistry>>> =>
    api.post(`/api/workflow-registry/${id}/activate`),
  
  deactivate: (id: string): Promise<AxiosResponse<ApiResponse<WorkflowRegistry>>> =>
    api.post(`/api/workflow-registry/${id}/deactivate`),
  
  getTypes: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get('/api/workflow-registry/types/list'),
}

// ProjectType API
export const projectTypesApi = {
  getAll: (skip = 0, limit = 100, category?: string, isActive?: boolean): Promise<AxiosResponse<ApiResponse<ProjectType[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (category) params.append('category', category)
    if (isActive !== undefined) params.append('is_active', isActive.toString())
    return api.get(`/api/project-types?${params}`)
  },
  
  getById: (code: string): Promise<AxiosResponse<ApiResponse<ProjectType>>> =>
    api.get(`/api/project-types/${code}`),
  
  create: (data: CreateProjectTypeRequest): Promise<AxiosResponse<ApiResponse<ProjectType>>> =>
    api.post('/api/project-types', data),
  
  update: (code: string, data: UpdateProjectTypeRequest): Promise<AxiosResponse<ApiResponse<ProjectType>>> =>
    api.put(`/api/project-types/${code}`, data),
  
  delete: (code: string): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/project-types/${code}`),
  
  activate: (code: string): Promise<AxiosResponse<ApiResponse<ProjectType>>> =>
    api.post(`/api/project-types/${code}/activate`),
  
  deactivate: (code: string): Promise<AxiosResponse<ApiResponse<ProjectType>>> =>
    api.post(`/api/project-types/${code}/deactivate`),
  
  getCategories: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get('/api/project-types/categories/list'),
  
  updateSortOrder: (code: string, sortOrder: number): Promise<AxiosResponse<ApiResponse<ProjectType>>> =>
    api.put(`/api/project-types/${code}/sort-order?sort_order=${sortOrder}`),
}

// Target Account Analysis types
export interface TargetAccount {
  id: number
  platform: 'youtube' | 'tiktok' | 'bilibili'
  platform_account_id: string
  username: string
  display_name: string
  profile_url: string
  description: string | null
  avatar_url: string | null
  is_verified: boolean
  category: string
  is_active: boolean
  monitor_frequency: 'hourly' | 'daily' | 'weekly'
  last_crawled_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTargetAccountRequest {
  platform: 'youtube' | 'tiktok' | 'bilibili'
  platform_account_id: string
  username: string
  display_name: string
  profile_url: string
  description?: string
  avatar_url?: string
  is_verified: boolean
  category: string
  monitor_frequency: 'hourly' | 'daily' | 'weekly'
}

export interface UpdateTargetAccountRequest {
  display_name?: string
  description?: string
  avatar_url?: string
  category?: string
  monitor_frequency?: 'hourly' | 'daily' | 'weekly'
  is_active?: boolean
}

export interface Channel {
  id: number
  platform: 'youtube' | 'tiktok' | 'bilibili'
  channel_id: string
  channel_name: string
  channel_url: string
  is_verified: boolean
  subscriber_count: number
  created_at: string
  updated_at: string
}

export interface CreateChannelRequest {
  platform: 'youtube' | 'tiktok' | 'bilibili'
  channel_id: string
  channel_name: string
  channel_url: string
  is_verified: boolean
  subscriber_count: number
}

export interface TargetAccountStatistics {
  id: number
  account_id: number
  followers_count: number
  following_count: number
  total_videos_count: number
  total_views: number
  total_likes: number
  followers_growth: number
  followers_growth_rate: number
  collected_at: string
  created_at: string
}

export interface CreateAccountStatisticsRequest {
  followers_count: number
  following_count: number
  total_videos_count: number
  total_views: number
  total_likes: number
  collected_at: string
}

export interface Video {
  id: number
  account_id: number
  channel_id: number | null
  platform: 'youtube' | 'tiktok' | 'bilibili'
  platform_video_id: string
  video_url: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration: number | null
  video_type: 'long' | 'short' | 'live'
  is_downloaded: boolean
  download_status: string | null
  local_file_path: string | null
  local_file_size: number | null
  published_at: string
  discovered_at: string
  created_at: string
  updated_at: string
}

export interface CreateVideoRequest {
  account_id: number
  channel_id?: number
  platform: 'youtube' | 'tiktok' | 'bilibili'
  platform_video_id: string
  video_url: string
  title: string
  description?: string
  thumbnail_url?: string
  duration?: number
  video_type: 'long' | 'short' | 'live'
  published_at: string
  discovered_at: string
}

export interface VideoEngagementMetrics {
  id: number
  video_id: number
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  engagement_rate: number
  views_growth: number
  likes_growth: number
  collected_at: string
  created_at: string
}

export interface CreateVideoEngagementRequest {
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  collected_at: string
}

// Target Account Analysis API
export const targetAccountAnalysisApi = {
  // Accounts
  getAccounts: (skip = 0, limit = 50, platform?: string, isActive?: boolean, category?: string): Promise<AxiosResponse<ApiResponse<TargetAccount[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (platform) params.append('platform', platform)
    if (isActive !== undefined) params.append('is_active', isActive.toString())
    if (category) params.append('category', category)
    return api.get(`/api/target-account-analysis/accounts?${params}`)
  },
  
  getAccountById: (id: number): Promise<AxiosResponse<ApiResponse<TargetAccount>>> =>
    api.get(`/api/target-account-analysis/accounts/${id}`),
  
  createAccount: (data: CreateTargetAccountRequest): Promise<AxiosResponse<ApiResponse<TargetAccount>>> =>
    api.post('/api/target-account-analysis/accounts', data),
  
  updateAccount: (id: number, data: UpdateTargetAccountRequest): Promise<AxiosResponse<ApiResponse<TargetAccount>>> =>
    api.put(`/api/target-account-analysis/accounts/${id}`, data),
  
  deleteAccount: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/api/target-account-analysis/accounts/${id}`),

  // Channels
  getChannels: (skip = 0, limit = 50, platform?: string): Promise<AxiosResponse<ApiResponse<Channel[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (platform) params.append('platform', platform)
    return api.get(`/api/target-account-analysis/channels?${params}`)
  },

  // Videos
  getVideos: (skip = 0, limit = 50, accountId?: number, channelId?: number, videoType?: string, isDownloaded?: boolean): Promise<AxiosResponse<ApiResponse<Video[]>>> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (accountId) params.append('account_id', accountId.toString())
    if (channelId) params.append('channel_id', channelId.toString())
    if (videoType) params.append('video_type', videoType)
    if (isDownloaded !== undefined) params.append('is_downloaded', isDownloaded.toString())
    return api.get(`/api/target-account-analysis/videos?${params}`)
  },

  // Statistics
  getAccountStatistics: (accountId: number, days = 30, limit = 100): Promise<AxiosResponse<ApiResponse<TargetAccountStatistics[]>>> => {
    const params = new URLSearchParams({ days: days.toString(), limit: limit.toString() })
    return api.get(`/api/target-account-analysis/accounts/${accountId}/statistics?${params}`)
  },

  getGrowthTrends: (accountId: number, days = 7): Promise<AxiosResponse<ApiResponse<{
    followers_trend: number
    videos_trend: number
    avg_daily_growth: number
    total_growth_rate: number
    analysis_period_days: number
    data_points: number
  }>>> => {
    const params = new URLSearchParams({ days: days.toString() })
    return api.get(`/api/target-account-analysis/accounts/${accountId}/growth-trends?${params}`)
  },

  getVideoEngagementMetrics: (videoId: number, days = 30, limit = 100): Promise<AxiosResponse<ApiResponse<VideoEngagementMetrics[]>>> => {
    const params = new URLSearchParams({ days: days.toString(), limit: limit.toString() })
    return api.get(`/api/target-account-analysis/videos/${videoId}/engagement-metrics?${params}`)
  },

  getTrendingVideos: (accountId?: number, metric = 'views_count', days = 7, limit = 10): Promise<AxiosResponse<ApiResponse<Video[]>>> => {
    const params = new URLSearchParams({ metric, days: days.toString(), limit: limit.toString() })
    if (accountId) params.append('account_id', accountId.toString())
    return api.get(`/api/target-account-analysis/videos/trending?${params}`)
  },

  getAnalyticsSummary: (accountId: number): Promise<AxiosResponse<ApiResponse<{
    account: TargetAccount
    latest_stats: TargetAccountStatistics
    recent_videos: Video[]
    growth_trends: any
    engagement_analysis: any
  }>>> =>
    api.get(`/api/target-account-analysis/accounts/${accountId}/analytics-summary`),
}

export default api