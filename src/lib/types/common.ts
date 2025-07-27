import { z } from 'zod'

// 通用的 JSON 值类型定义
export const JsonValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ])
)

export type JsonValue = z.infer<typeof JsonValueSchema>

// 项目参数类型定义
export const ProjectParametersSchema = z.record(z.string(), JsonValueSchema)
export type ProjectParameters = z.infer<typeof ProjectParametersSchema>

// 评分详情类型定义
export const ScoreDetailsSchema = z.object({
  criteria: z.array(z.object({
    name: z.string(),
    score: z.number(),
    weight: z.number().optional(),
    comment: z.string().optional(),
  })).optional(),
  total_score: z.number().optional(),
  reviewer_notes: z.string().optional(),
  timestamp: z.string().optional(),
}).catchall(JsonValueSchema)

export type ScoreDetails = z.infer<typeof ScoreDetailsSchema>

// 资产元数据类型定义
export const AssetMetadataSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  size_bytes: z.number().optional(),
  duration_ms: z.number().optional(),
  fps: z.number().optional(),
  bitrate: z.number().optional(),
  codec: z.string().optional(),
  tags: z.array(z.string()).optional(),
  processing_info: z.object({
    processed_at: z.string(),
    processor_version: z.string(),
    status: z.string(),
  }).optional(),
}).catchall(JsonValueSchema)

export type AssetMetadata = z.infer<typeof AssetMetadataSchema>

// 任务输入/输出类型定义
export const TaskDataSchema = z.object({
  // 通用任务数据字段
  input_files: z.array(z.string()).optional(),
  output_files: z.array(z.string()).optional(),
  parameters: z.record(z.string(), JsonValueSchema).optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.string().optional(),
  error_details: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), JsonValueSchema).optional(),
  }).optional(),
  metrics: z.object({
    start_time: z.string(),
    end_time: z.string().optional(),
    duration_ms: z.number().optional(),
    memory_usage: z.number().optional(),
    cpu_usage: z.number().optional(),
  }).optional(),
}).catchall(JsonValueSchema)

export type TaskData = z.infer<typeof TaskDataSchema>

// 通用配置数据类型
export const ConfigDataSchema = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  enabled: z.boolean().optional(),
  settings: z.record(z.string(), JsonValueSchema).optional(),
  limits: z.object({
    max_concurrent: z.number().optional(),
    timeout_ms: z.number().optional(),
    retry_count: z.number().optional(),
  }).optional(),
}).catchall(JsonValueSchema)

export type ConfigData = z.infer<typeof ConfigDataSchema>

// 错误类型定义
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp?: string
}

// 分页参数类型
export interface PaginationParams {
  page: number
  size: number
}

// 排序参数类型
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 过滤参数基础类型
export interface BaseFilterParams {
  search?: string
  status?: string
  created_after?: string
  created_before?: string
}