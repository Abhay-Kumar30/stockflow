
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import Organization from '../models/Organization'
import { signupSchema, loginSchema } from '../validators/auth.validator'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
}

const generateToken = (userId: string, organizationId: string) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(
    { userId, organizationId },
    secret,
    { expiresIn: '1d' }
  )
}

export const signup = async (req: Request, res: Response) => {
  const validation = signupSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid signup details',
      errors: validation.error.flatten(),
    })
  }

  const { name, email, password, organizationName } = validation.data
  const normalizedEmail = email.toLowerCase()

  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
    })
  }

  const organization = await Organization.create({
    name: organizationName,
  })

  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      organizationId: organization._id,
    })

    const token = generateToken(
      user._id.toString(),
      organization._id.toString()
    )

    res.cookie('token', token, cookieOptions)

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
      },
    })
  } catch (error) {
    await Organization.findByIdAndDelete(organization._id)
    throw error
  }
}

export const login = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid login details',
      errors: validation.error.flatten(),
    })
  }

  const { email, password } = validation.data

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select('+password')

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }

  const token = generateToken(
    user._id.toString(),
    user.organizationId.toString()
  )

  res.cookie('token', token, cookieOptions)

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      organizationId: user.organizationId,
    },
  })
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}

export const getMe = async (_req: Request, res: Response) => {
  const { userId } = res.locals.auth

  const user = await User.findById(userId).select('-password')

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    })
  }

  const organization = await Organization.findById(user.organizationId)

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    })
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      organizationId: user.organizationId,
    },
    organization: {
      id: organization._id,
      name: organization.name,
      defaultLowStockThreshold: organization.defaultLowStockThreshold,
    },
  })
}
