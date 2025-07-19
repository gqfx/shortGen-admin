import { z } from 'zod'

// Platform Account schema - make fields optional since they might not exist
export const platformAccountSchema = z.object({
  id: z.number().optional(),
  platform: z.string().optional(),
  account_id: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
}).nullable()

// Updated schema to match actual API Task structure - make fields optional/nullable as needed
export const taskSchema = z.object({
  id: z.number(),
  project_id: z.number().nullable(),
  platform_account_id: z.number().nullable(),
  platform_account: platformAccountSchema,
  submit_id: z.string().nullable(),
  error_message: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  forecast_generate_cost: z.number().nullable(),
  forecast_queue_cost: z.number().nullable(),
  task_type: z.string(),
  status: z.enum(['waiting', 'pending', 'processing', 'completed', 'failed']),
  dependencies: z.array(z.number()).nullable(),
  task_output: z.record(z.any()).nullable(),
  task_input: z.record(z.any()).nullable(),
})

export type Task = z.infer<typeof taskSchema>
export type PlatformAccount = z.infer<typeof platformAccountSchema>
