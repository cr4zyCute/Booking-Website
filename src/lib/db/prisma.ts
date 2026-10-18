import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

let prismaInstance: PrismaClient | null = null

export function isDbConnected(): boolean {
  const url = process.env.DATABASE_URL
  if (!url) return false
  // In Vercel serverless environment, localhost/127.0.0.1 cannot be reached
  if (process.env.VERCEL && (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("placeholder"))) {
    return false
  }
  return true
}

function getPrismaClient(): PrismaClient {
  if (prismaInstance) return prismaInstance

  const connectionString = process.env.DATABASE_URL
  try {
    const adapter = new PrismaPg({
      connectionString: connectionString || "postgresql://postgres:password@localhost:5432/booking_platform",
    })
    prismaInstance = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  } catch (err) {
    console.warn("PrismaPg adapter initialization deferred/failed:", err)
    prismaInstance = new PrismaClient({
      log: ["error"],
    })
  }

  return prismaInstance
}

// Lazy proxy so Prisma engine only loads on first DB query, not on module import
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    if (typeof value === "function") {
      return value.bind(client)
    }
    return value
  },
})

export default prisma