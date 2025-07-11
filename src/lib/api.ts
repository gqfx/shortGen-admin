import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = 'http://localhost:8000'

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

// API Functions

// Projects API
export const projectsApi = {
  getAll: (skip = 0, limit = 100): Promise<AxiosResponse<ApiResponse<Project[]>>> =>
    api.get(`/projects?skip=${skip}&limit=${limit}`),
  
  getById: (id: number): Promise<AxiosResponse<ApiResponse<Project>>> =>
    api.get(`/projects/${id}`),
  
  create: (data: CreateProjectRequest): Promise<AxiosResponse<ApiResponse<Project>>> =>
    api.post('/projects', data),
  
  update: (id: number, data: UpdateProjectRequest): Promise<AxiosResponse<ApiResponse<Project>>> =>
    api.put(`/projects/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    api.delete(`/projects/${id}`),
  
  recalculateTasks: (id: number): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/projects/${id}/recalculate-tasks`),
  
  regenerate: (id: number, data?: Record<string, any>): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/projects/${id}/regenerate`, data),
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

export default api