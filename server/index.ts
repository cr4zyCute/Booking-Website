import path from "path"
import { fileURLToPath } from "url"
import express from "express"
import app from "./app"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.SERVER_PORT || 4000

// In standalone production server, serve the built Vite SPA
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
