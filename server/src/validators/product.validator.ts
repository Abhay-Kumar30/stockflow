
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(100),
  sku: z.string().trim().min(1).max(50),
  description: z.string().trim().max(500).optional(),
  quantity: z.number().int().min(0),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
})

export const updateProductSchema = createProductSchema.partial()
