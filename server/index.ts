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
const PORT = process.env.SERVER_PORT || 4000

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
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")
  next()
})

// Static files (uploads, public assets)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")))
app.use(express.static(path.join(__dirname, "../public")))

// API Routes
app.use("/api/auth", authRouter)
app.use("/api/business", businessRouter)
app.use("/api/public", publicRouter)
app.use("/api/booking", bookingRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/customer", customerRouter)

// In production, serve the built Vite SPA
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../dist")
  app.use(express.static(distPath))

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
})
