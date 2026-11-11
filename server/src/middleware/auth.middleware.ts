
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthPayload extends jwt.JwtPayload {
  userId: string
  organizationId: string
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server authentication is not configured',
      })
    }

    const decoded = jwt.verify(token, secret) as AuthPayload

    if (
      typeof decoded.userId !== 'string' ||
      typeof decoded.organizationId !== 'string'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      })
    }

    res.locals.auth = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
    }

    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    })
  }
}

export default authMiddleware
