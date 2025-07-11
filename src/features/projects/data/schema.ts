import { z } from 'zod'

export const projectSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  project_type: z.string().min(1, 'Project type is required'),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  initial_parameters: z.record(z.any()),
  inspiration_id: z.number().nullable(),
  score: z.number().nullable(),
  score_details: z.record(z.any()).nullable(),
  review_notes: z.string().nullable(),
  used_transform_workflow_id: z.string().nullable(),
  used_execution_workflow_id: z.string().nullable(),
  total_tasks: z.number(),
  completed_tasks: z.number(),
  failed_tasks: z.number(),
  output_asset_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  project_type: z.string().min(1, 'Project type is required'),
  initial_parameters: z.record(z.any()).optional().default({}),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  initial_parameters: z.record(z.any()).optional(),
  inspiration_id: z.number().nullable().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  score: z.number().nullable().optional(),
  score_details: z.record(z.any()).nullable().optional(),
  review_notes: z.string().nullable().optional(),
})

export type Project = z.infer<typeof projectSchema>
export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>