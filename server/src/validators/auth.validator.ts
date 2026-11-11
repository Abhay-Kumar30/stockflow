
import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(100),
  password: z.string().min(8).max(72),
  organizationName: z.string().trim().min(2).max(100),
})

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})
