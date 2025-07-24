import { z } from 'zod'

// Platform Account schema - make fields optional since they might not exist
// Platform Account schema - make fields optional since they might not exist
export const platformAccountSchema = z.object({
  id: z.string().optional(),
  platform: z.string().optional(),
  account_id: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  name: z.string().optional(),
  credentials: z.object({
    email: z.string().optional(),
    password: z.string().optional(),
    proxy: z.string().optional(),
  }).optional(),
  proxy: z.string().optional(),
}).nullable()

// Updated schema to match actual API Task structure - make fields optional/nullable as needed
export const taskSchema = z.object({
  id: z.string(),
  task_type: z.string(),
  status: z.string(),
  dependencies: z.array(z.string()).optional().nullable(),
  task_output: z.record(z.any()).optional().nullable(),
  task_input: z.record(z.any()).optional().nullable(),
  project_id: z.string().optional().nullable(),
  platform_account_id: z.string().optional().nullable(),
  platform_account: platformAccountSchema.optional(),
  submit_id: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
  started_at: z.string().optional().nullable(),
  completed_at: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().optional().nullable(),
  forecast_generate_cost: z.number().optional().nullable(),
  forecast_queue_cost: z.number().optional().nullable(),
})

export type Task = z.infer<typeof taskSchema>
export type PlatformAccount = z.infer<typeof platformAccountSchema>
