import { z } from 'zod'
import { ProjectParametersSchema, ScoreDetailsSchema } from '@/lib/types/common'

// 任务状态枚举
const TaskStatusSchema = z.enum(['pending', 'running', 'completed', 'failed', 'cancelled'])

// 项目状态枚举
const ProjectStatusSchema = z.enum(['pending', 'running', 'completed', 'failed', 'cancelled', 'reviewing'])

// 简化的任务Schema，避免循环依赖
const SimpleTaskSchema = z.object({
  id: z.string(),
  task_type: z.string(),
  status: TaskStatusSchema,
  priority: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  project_type_code: z.string(),
  initial_parameters: ProjectParametersSchema,
  status: ProjectStatusSchema,
  inspiration_id: z.string().nullable(),
  score: z.number().min(0).max(100).nullable(),
  score_details: ScoreDetailsSchema.nullable(),
  review_notes: z.string().nullable(),
  used_transform_workflow_id: z.string().nullable(),
  used_execution_workflow_id: z.string().nullable(),
  total_tasks: z.number().min(0),
  completed_tasks: z.number().min(0),
  failed_tasks: z.number().min(0),
  output_asset_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  tasks: z.array(SimpleTaskSchema).default([]),
})

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  project_type_code: z.string().min(1, 'Project type is required'),
  initial_parameters: ProjectParametersSchema,
})

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  initial_parameters: ProjectParametersSchema.optional(),
  inspiration_id: z.string().nullable().optional(),
  status: ProjectStatusSchema.optional(),
  score: z.number().min(0).max(100).nullable().optional(),
  score_details: ScoreDetailsSchema.nullable().optional(),
  review_notes: z.string().nullable().optional(),
})

export type Project = z.infer<typeof projectSchema>
export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>