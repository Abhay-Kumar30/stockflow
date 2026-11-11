
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product'
import { createProductSchema, updateProductSchema } from '../validators/product.validator'

export const createProduct = async (req: Request, res: Response) => {
  const validation = createProductSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product details',
      errors: validation.error.flatten(),
    })
  }

  try {
    const product = await Product.create({
      ...validation.data,
      sku: validation.data.sku.toUpperCase(),
      organizationId: res.locals.auth.organizationId,
    })

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    })
  } catch (error: unknown) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message: 'A product with this SKU already exists',
      })
    }

    throw error
  }
}

export const getProducts = async (req: Request, res: Response) => {
  const organizationId = res.locals.auth.organizationId
  const search = String(req.query.search || '').trim()

  const filter: Record<string, unknown> = { organizationId }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { sku: { $regex: escapedSearch, $options: 'i' } },
    ]
  }

  const products = await Product.find(filter).sort({ createdAt: -1 })

  return res.status(200).json({
    success: true,
    count: products.length,
    products,
  })
}

export const getProductById = async (req: Request, res: Response) => {
  const { productId } = req.params

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID',
    })
  }

  const product = await Product.findOne({
    _id: productId,
    organizationId: res.locals.auth.organizationId,
  })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    })
  }

  return res.status(200).json({
    success: true,
    product,
  })
}

export const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID',
    })
  }

  const validation = updateProductSchema.safeParse(req.body)

  if (!validation.success || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product details',
      errors: validation.success ? undefined : validation.error.flatten(),
    })
  }

  const updateData = {
    ...validation.data,
    ...(validation.data.sku
      ? { sku: validation.data.sku.toUpperCase() }
      : {}),
  }

  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        organizationId: res.locals.auth.organizationId,
      },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    })
  } catch (error: unknown) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message: 'A product with this SKU already exists',
      })
    }

    throw error
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID',
    })
  }

  const product = await Product.findOneAndDelete({
    _id: productId,
    organizationId: res.locals.auth.organizationId,
  })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  })
}
