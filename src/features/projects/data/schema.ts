import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  project_type_code: z.string(),
  initial_parameters: z.record(z.any()),
  status: z.string(),
  inspiration_id: z.string().nullable(),
  score: z.number().nullable(),
  score_details: z.record(z.any()).nullable(),
  review_notes: z.string().nullable(),
  used_transform_workflow_id: z.string().nullable(),
  used_execution_workflow_id: z.string().nullable(),
  total_tasks: z.number(),
  completed_tasks: z.number(),
  failed_tasks: z.number(),
  output_asset_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  tasks: z.array(z.any()).default([]),
})

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  project_type_code: z.string().min(1, 'Project type is required'),
  initial_parameters: z.record(z.any()),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  initial_parameters: z.record(z.any()).optional(),
  inspiration_id: z.string().nullable().optional(),
  status: z.string().optional(),
  score: z.number().nullable().optional(),
  score_details: z.record(z.any()).nullable().optional(),
  review_notes: z.string().nullable().optional(),
})

export type Project = z.infer<typeof projectSchema>
export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>