import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

dotenv.config()

import { authMiddleware } from "./middleware/auth"
import { authRouter } from "./routes/auth"
import { businessRouter } from "./routes/business"
import { publicRouter } from "./routes/public"
import { bookingRouter } from "./routes/booking"
import { adminRouter } from "./routes/admin"
import { doctorRouter } from "./routes/doctor"
import { customerRouter } from "./routes/customer"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(authMiddleware)

// Prevent stale HTTP caching on dynamic API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/booking")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
  }
  next()
})

// Static files (uploads, public assets)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")))
app.use(express.static(path.join(__dirname, "../public")))

// Health check endpoint
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    databaseConnected: Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")),
  })
}
app.get("/api/health", healthHandler)
app.get("/health", healthHandler)

// API Routes mounted under both /api/... and /... for robust serverless & local routing
app.use("/api/auth", authRouter)
app.use("/auth", authRouter)

app.use("/api/business", businessRouter)
app.use("/business", businessRouter)

app.use("/api/public", publicRouter)
app.use("/public", publicRouter)

app.use("/api/booking", bookingRouter)
app.use("/booking", bookingRouter)

app.use("/api/admin", adminRouter)
app.use("/admin", adminRouter)

app.use("/api/doctor", doctorRouter)
app.use("/doctor", doctorRouter)

app.use("/api/customer", customerRouter)
app.use("/customer", customerRouter)

export { app }
export default app
