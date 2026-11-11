
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import Organization from '../models/Organization'
import { updateSettingsSchema } from '../validators/settings.validator'

export const getSettings = async (_req: Request, res: Response) => {
  const organizationId = res.locals.auth.organizationId

  const organization = await Organization.findById(organizationId)

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    })
  }

  return res.status(200).json({
    success: true,
    settings: {
      name: organization.name,
      defaultLowStockThreshold: organization.defaultLowStockThreshold,
    },
  })
}

export const updateSettings = async (req: Request, res: Response) => {
  const validation = updateSettingsSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid settings',
      errors: validation.error.flatten(),
    })
  }

  const organizationId = res.locals.auth.organizationId

  if (!mongoose.isValidObjectId(organizationId)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid organization authentication',
    })
  }

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    { $set: validation.data },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    settings: {
      name: organization.name,
      defaultLowStockThreshold: organization.defaultLowStockThreshold,
    },
  })
}
