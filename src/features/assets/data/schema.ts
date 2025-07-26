import { z } from 'zod'

export const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  asset_type: z.string(),
  storage_path: z.string().optional(),
  asset_metadata: z.record(z.any()),
  duration_seconds: z.number().optional(),
  source: z.string().optional(),
  visibility: z.string().optional(),
  file_hash: z.string(),
  original_filename: z.string().optional(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Asset = z.infer<typeof assetSchema>