
import { z } from 'zod'

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  defaultLowStockThreshold: z.number().int().min(0).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one setting must be provided' }
)
