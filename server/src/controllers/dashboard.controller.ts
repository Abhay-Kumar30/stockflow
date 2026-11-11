
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product'
import Organization from '../models/Organization'

export const getDashboardSummary = async (_req: Request, res: Response) => {
  const organizationId = res.locals.auth.organizationId

  if (!mongoose.isValidObjectId(organizationId)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid organization authentication',
    })
  }

  const organization = await Organization.findById(organizationId)

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    })
  }

  const [summary] = await Product.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
    },
    {
      $addFields: {
        effectiveThreshold: {
          $ifNull: [
            '$lowStockThreshold',
            organization.defaultLowStockThreshold,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        lowStockProducts: {
          $sum: {
            $cond: [
              { $lte: ['$quantity', '$effectiveThreshold'] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalProducts: 1,
        totalQuantity: 1,
        lowStockProducts: 1,
      },
    },
  ])

  return res.status(200).json({
    success: true,
    summary: summary || {
      totalProducts: 0,
      totalQuantity: 0,
      lowStockProducts: 0,
    },
  })
}
