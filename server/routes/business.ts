import { Router } from "express"
import { getBusinessContext, invalidateBusinessCache } from "../../src/lib/db/business"

export const businessRouter = Router()

businessRouter.get("/context", async (req, res) => {
  try {
    const context = await getBusinessContext()
    return res.json(context)
  } catch (error) {
    console.error("Error fetching business context:", error)
    return res.status(500).json({ error: "Failed to fetch business context" })
  }
})
