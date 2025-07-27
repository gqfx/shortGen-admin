import { z } from 'zod'
import { TaskDataSchema } from '@/lib/types/common'

// 任务状态枚举
const TaskStatusSchema = z.enum(['pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'timeout', 'processing'])

// 任务类型枚举
const TaskTypeSchema = z.enum([
  'video_download', 'video_analysis', 'image_generation', 'text_generation',
  'data_processing', 'model_training', 'batch_processing', 'crawl_account',
  'crawl_videos', 'content_analysis', 'DREAMINA_IMAGE_GENERATION', 'DREAMINA_VIDEO_GENERATION',
  'DREAMINA_ACCOUNT_REGISTER', 'DREAMINA_LIP_SYNC', 'DREAMINA_IMAGE_HQ', 'DREAMINA_COLLECT_DATA'
])

// Platform Account credentials schema
const CredentialsSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  proxy: z.string().url().optional(),
  api_key: z.string().optional(),
  access_token: z.string().optional(),
}).catchall(z.string())

// Platform Account schema
export const platformAccountSchema = z.object({
  id: z.string().optional(),
  platform: z.string().optional(),
  account_id: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().url().optional(),
  name: z.string().optional(),
  credentials: CredentialsSchema.optional(),
  proxy: z.string().url().optional(),
}).nullable()

// Task schema with improved typing
export const taskSchema = z.object({
  id: z.string(),
  task_type: TaskTypeSchema,
  status: TaskStatusSchema,
  dependencies: z.array(z.string()).nullable().default([]),
  task_output: TaskDataSchema.nullable().optional(),
  task_input: TaskDataSchema.nullable().optional(),
  project_id: z.string().nullable().optional(),
  platform_account_id: z.string().nullable().optional(),
  platform_account: platformAccountSchema.optional(),
  submit_id: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
  forecast_generate_cost: z.number().min(0).nullable().optional(),
  forecast_queue_cost: z.number().min(0).nullable().optional(),
  priority: z.number().min(0).max(10).default(5),
  retry_count: z.number().min(0).default(0),
  max_retries: z.number().min(0).default(3),
})

export type Task = z.infer<typeof taskSchema>
export type PlatformAccount = z.infer<typeof platformAccountSchema>
