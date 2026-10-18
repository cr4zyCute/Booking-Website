import { Router } from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../../src/lib/db/prisma"
import { generateToken, AuthRequest } from "../middleware/auth"
import { getBusinessContext } from "../../src/lib/db/business"
import { inMemoryUsers } from "../lib/store"
import { z } from "zod"

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
})

// Customer Registration
authRouter.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid registration data" })
    }

    const { name, email, password, phone } = parsed.data

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const ctx = await getBusinessContext()
      const businessId = ctx?.business.id ?? "demo-clinic"

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "CUSTOMER",
          customer: {
            create: {
              name,
              email,
              phone: phone || null,
              businessId,
            },
          },
        },
        include: { customer: true },
      })

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: "CUSTOMER",
        customerId: user.customer?.id,
      })

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "CUSTOMER",
          customerId: user.customer?.id,
        },
      })
    } catch (e) {
      console.warn("DB register fallback:", e)
      const hashedPassword = await bcrypt.hash(password, 10)
      const demoUser = {
        id: "cust-" + Date.now(),
        email,
        name,
        passwordHash: hashedPassword,
        role: "CUSTOMER" as const,
        customerId: "cust-record-" + Date.now(),
      }
      inMemoryUsers.set(email.toLowerCase(), demoUser)

      const token = generateToken(demoUser)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      return res.status(201).json({ token, user: demoUser })
    }
  } catch (error) {
    console.error("Register error:", error)
    return res.status(500).json({ error: "Internal server error during registration" })
  }
})

// Login (Handles Admin, Doctor, Customer)
authRouter.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid email or password format" })
    }

    const { email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { staff: true, customer: true },
      })

      if (user && user.password) {
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (passwordMatch) {
          const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            staffId: user.staff?.id,
            customerId: user.customer?.id,
          })

          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          })

          return res.json({
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
              staffId: user.staff?.id,
              customerId: user.customer?.id,
            },
          })
        }
      }
    } catch (e) {
      console.warn("DB login query fallback:", e)
    }

    // Check In-Memory Users store
    const memUser = inMemoryUsers.get(normalizedEmail)
    if (memUser) {
      const match = await bcrypt.compare(password, memUser.passwordHash)
      if (match) {
        const token = generateToken(memUser)
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" })
        return res.json({ token, user: memUser })
      }
    }

    // Demo Accounts for Instant Testing & Offline Dev
    if (password === "password") {
      // 1. Admin
      if (email === "admin@veridian.com") {
        const demoUser = {
          id: "admin-demo",
          email: "admin@veridian.com",
          name: "Dr. Alexander Ross (Admin)",
          role: "ADMIN" as const,
          image: null,
        }
        const token = generateToken(demoUser)
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" })
        return res.json({ token, user: demoUser })
      }

      // 2. Doctor (Dr. Maria Santos)
      if (email === "doctor@veridian.com" || email === "maria@veridian.com") {
        const demoUser = {
          id: "doctor-demo",
          email: "doctor@veridian.com",
          name: "Dr. Maria Santos",
          role: "STAFF" as const,
          staffId: "st1",
          image: null,
        }
        const token = generateToken(demoUser)
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" })
        return res.json({ token, user: demoUser })
      }

      // 3. Customer (Ana Reyes)
      if (email === "patient@example.com" || email === "ana@example.com") {
        const demoUser = {
          id: "patient-demo",
          email: "patient@example.com",
          name: "Ana Reyes",
          role: "CUSTOMER" as const,
          customerId: "cust-demo",
          image: null,
        }
        const token = generateToken(demoUser)
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" })
        return res.json({ token, user: demoUser })
      }
    }

    return res.status(401).json({ error: "Invalid email or password" })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ error: "Internal server error during login" })
  }
})

// Current User Session
authRouter.get("/me", async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { staff: true, customer: true },
    })

    if (user) {
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          staffId: user.staff?.id ?? req.user.staffId,
          customerId: user.customer?.id ?? req.user.customerId,
        },
      })
    }

    return res.json({ user: req.user })
  } catch (err) {
    return res.json({ user: req.user })
  }
})

// Logout
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token")
  return res.json({ success: true })
})
