import { z } from 'zod'
import { AssetMetadataSchema } from '@/lib/types/common'

// 资产类型枚举
const AssetTypeSchema = z.enum(['image', 'video', 'audio', 'document', 'data', 'model', 'archive'])

// 资产状态枚举
const AssetStatusSchema = z.enum(['uploading', 'processing', 'ready', 'failed', 'archived', 'deleted'])

// 可见性枚举
const VisibilitySchema = z.enum(['public', 'private', 'shared', 'internal'])

export const assetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  asset_type: AssetTypeSchema,
  storage_path: z.string().optional(),
  asset_metadata: AssetMetadataSchema,
  duration_seconds: z.number().min(0).optional(),
  source: z.string().optional(),
  visibility: VisibilitySchema.optional(),
  file_hash: z.string().min(1, 'File hash is required'),
  original_filename: z.string().optional(),
  status: AssetStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

export type Asset = z.infer<typeof assetSchema>