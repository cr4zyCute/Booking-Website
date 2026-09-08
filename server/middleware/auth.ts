import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "STAFF" | "CUSTOMER" | string
  staffId?: string | null
  customerId?: string | null
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "super-secret-booking-platform-key-12345"

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      staffId: user.staffId,
      customerId: user.customerId,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const cookieToken = req.cookies?.token

  let token: string | undefined

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  } else if (cookieToken) {
    token = cookieToken
  }

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    req.user = decoded
  } catch (err) {
    // Invalid/expired token - continue as unauthenticated
  }

  next()
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required" })
  }
  next()
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: Admin access required" })
  }
  next()
}

export function requireDoctor(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "STAFF" && req.user.role !== "ADMIN")) {
    return res.status(403).json({ error: "Forbidden: Doctor account access required" })
  }
  next()
}

export function requireCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "CUSTOMER" && req.user.role !== "ADMIN")) {
    return res.status(403).json({ error: "Forbidden: Customer account access required" })
  }
  next()
}
