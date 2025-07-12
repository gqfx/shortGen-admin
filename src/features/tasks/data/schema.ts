import { z } from 'zod'

// Updated schema to match API Task structure
export const taskSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  task_type: z.string(),
  status: z.enum(['waiting', 'pending', 'processing', 'completed', 'failed']),
  dependencies: z.array(z.number()),
  task_output: z.record(z.any()).nullable(),
  platform_account_id: z.number().nullable(),
  commit_id: z.string().nullable(),
  error_message: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Task = z.infer<typeof taskSchema>
