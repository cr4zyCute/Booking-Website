import { Router } from "express"
import bcrypt from "bcryptjs"
import multer from "multer"
import path from "path"
import fs from "fs"
import { prisma } from "../../src/lib/db/prisma"
import { getBusinessContext, invalidateBusinessCache } from "../../src/lib/db/business"
import { requireAdmin, AuthRequest } from "../middleware/auth"
import {
  inMemoryUsers,
  inMemoryHeroSection,
  setInMemoryHero,
  getInMemoryServices,
  setAllInMemoryServices,
  createInMemoryService,
  updateInMemoryService,
  deleteInMemoryService,
  reorderInMemoryServices,
} from "../lib/store"
import { startOfDay, endOfDay, parseISO, startOfMonth, endOfMonth, format } from "date-fns"
import { notifyDoctorAppointmentCancelled, notifyDoctorNewAppointment, notifyDoctorAppointmentRescheduled } from "../services/doctorNotificationService"

const uploadDir = path.resolve(process.cwd(), "public/uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg"
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "")
    cb(null, `hero-${Date.now()}-${cleanName}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

export const adminRouter = Router()

// Protect all admin routes
adminRouter.use(requireAdmin)

// Dashboard stats
adminRouter.get("/dashboard", async (req: AuthRequest, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    let todayAppts = 4
    let pendingCount = 2
    let confirmedCount = 6
    let completedCount = 18
    let cancelledCount = 1
    let totalCustomers = 32
    let recentAppts: any[] = []
    let todaySchedule: any[] = []

    try {
      const [tA, pC, cC, compC, canC, tCust, rAppts, tSched] = await Promise.all([
        prisma.appointment.count({ where: { businessId: ctx.business.id, startAt: { gte: todayStart, lte: todayEnd } } }),
        prisma.appointment.count({ where: { businessId: ctx.business.id, status: "PENDING" } }),
        prisma.appointment.count({ where: { businessId: ctx.business.id, status: "CONFIRMED" } }),
        prisma.appointment.count({ where: { businessId: ctx.business.id, status: "COMPLETED" } }),
        prisma.appointment.count({ where: { businessId: ctx.business.id, status: "CANCELLED" } }),
        prisma.customer.count({ where: { businessId: ctx.business.id } }),
        prisma.appointment.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { customer: true, service: true, staff: true },
        }),
        prisma.appointment.findMany({
          where: {
            businessId: ctx.business.id,
            startAt: { gte: todayStart, lte: todayEnd },
            status: { notIn: ["CANCELLED"] },
          },
          orderBy: { startAt: "asc" },
          include: { customer: true, service: true, staff: true },
        }),
      ])
      todayAppts = tA
      pendingCount = pC
      confirmedCount = cC
      completedCount = compC
      cancelledCount = canC
      totalCustomers = tCust
      recentAppts = rAppts
      todaySchedule = tSched
    } catch (e) {
      console.warn("DB dashboard query fallback:", e)
    }

    return res.json({
      todayAppts,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalCustomers,
      recentAppts,
      todaySchedule,
      acceptingBookings: inMemoryHeroSection.showBadge !== false,
      terminology: ctx.terminology,
      business: ctx.business,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return res.status(500).json({ error: "Failed to fetch dashboard stats" })
  }
})

// Toggle Booking Status (ADMIN ONLY)
adminRouter.patch("/booking-status", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { acceptingBookings } = req.body
    const isAccepting = Boolean(acceptingBookings)

    // Update in-memory store
    setInMemoryHero({ showBadge: isAccepting })

    // Update DB
    try {
      const existing = await prisma.websiteSection.findFirst({
        where: { businessId: ctx.business.id, type: "HERO" },
      })
      if (existing) {
        const current = (existing.content as Record<string, any>) || {}
        await prisma.websiteSection.update({
          where: { id: existing.id },
          data: {
            content: { ...current, showBadge: isAccepting },
          },
        })
      } else {
        await prisma.websiteSection.create({
          data: {
            businessId: ctx.business.id,
            type: "HERO",
            content: { ...inMemoryHeroSection, showBadge: isAccepting },
            isEnabled: true,
            order: 0,
          },
        })
      }
    } catch (e) {
      console.warn("DB booking status update fallback:", e)
    }

    invalidateBusinessCache()
    return res.json({
      acceptingBookings: isAccepting,
      message: isAccepting
        ? "New patient bookings are now ACTIVE"
        : "New patient bookings are now PAUSED",
    })
  } catch (error) {
    console.error("Booking status toggle error:", error)
    return res.status(500).json({ error: "Failed to update booking status" })
  }
})

// Appointments
adminRouter.get("/appointments", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    let appointments: any[] = []
    try {
      appointments = await prisma.appointment.findMany({
        where: { businessId: ctx.business.id },
        orderBy: { startAt: "desc" },
        include: { customer: true, service: true, staff: true },
        take: 100,
      })
    } catch (e) {
      console.warn("DB appointments query fallback:", e)
    }

    return res.json({ appointments, terminology: ctx.terminology, business: ctx.business })
  } catch (error) {
    console.error("Admin appointments error:", error)
    return res.status(500).json({ error: "Failed to fetch appointments" })
  }
})

adminRouter.patch("/appointments/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status, cancellationReason } = req.body

    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          status,
          cancellationReason: status === "CANCELLED" ? (cancellationReason || "Cancelled by clinic administration") : undefined,
          cancelledAt: status === "CANCELLED" ? new Date() : undefined,
        },
        include: { customer: true, service: true, staff: true },
      })

      // If cancelled, trigger doctor notification
      if (status === "CANCELLED" && appointment.staffId) {
        notifyDoctorAppointmentCancelled({
          appointmentId: appointment.id,
          staffId: appointment.staffId,
          customerName: appointment.customer?.name || "Patient",
          serviceName: appointment.service?.name || appointment.serviceName,
          date: format(new Date(appointment.startAt), "MMMM d, yyyy"),
          time: `${format(new Date(appointment.startAt), "hh:mm a")} – ${format(new Date(appointment.endAt), "hh:mm a")}`,
          reason: cancellationReason || "Cancelled by clinic administration",
        }).catch(err => console.error("Admin cancel notification error:", err))
      }

      return res.json({ appointment })
    } catch (e) {
      return res.json({ appointment: { id, status } })
    }
  } catch (error) {
    console.error("Update appointment status error:", error)
    return res.status(500).json({ error: "Failed to update appointment status" })
  }
})

// Calendar
adminRouter.get("/calendar", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { start, end } = req.query as { start?: string; end?: string }
    const startDate = start ? parseISO(start) : startOfMonth(new Date())
    const endDate = end ? parseISO(end) : endOfMonth(new Date())

    let appointments: any[] = []
    try {
      appointments = await prisma.appointment.findMany({
        where: {
          businessId: ctx.business.id,
          startAt: { gte: startDate, lte: endDate },
        },
        include: { customer: true, service: true, staff: true },
        orderBy: { startAt: "asc" },
      })
    } catch (e) {
      console.warn("DB calendar query fallback:", e)
    }

    return res.json({ appointments, terminology: ctx.terminology, business: ctx.business })
  } catch (error) {
    console.error("Admin calendar error:", error)
    return res.status(500).json({ error: "Failed to fetch calendar appointments" })
  }
})

// Customers
adminRouter.get("/customers", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    let customers: any[] = []
    try {
      customers = await prisma.customer.findMany({
        where: { businessId: ctx.business.id },
        include: {
          _count: { select: { appointments: true } },
          appointments: {
            orderBy: { startAt: "desc" },
            take: 1,
            include: { service: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } catch (e) {
      console.warn("DB customers query fallback:", e)
    }

    return res.json({ customers, terminology: ctx.terminology, business: ctx.business })
  } catch (error) {
    console.error("Admin customers error:", error)
    return res.status(500).json({ error: "Failed to fetch customers" })
  }
})

// Helper to sync services list to WebsiteSection (type: SERVICES)
async function syncServicesToWebsiteSection(businessId: string) {
  try {
    const existing = await prisma.websiteSection.findFirst({
      where: { businessId, type: "SERVICES" },
    })
    if (!existing) {
      await prisma.websiteSection.create({
        data: {
          businessId,
          type: "SERVICES",
          isEnabled: true,
          order: 2,
          content: {
            heading: "Our Treatments",
            subheading: "Professional treatments tailored to your dental health and confidence.",
            cardStyle: "default",
          },
        },
      })
    }
  } catch (e) {
    console.warn("DB syncServicesToWebsiteSection fallback:", e)
  }
}

// Services / Treatments Management
adminRouter.get("/services", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    let services: any[] = []
    let categories: any[] = []
    let globalCardStyle = "default"

    try {
      const [dbServices, dbCategories, servicesSection] = await Promise.all([
        prisma.service.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { sortOrder: "asc" },
          include: {
            category: true,
            _count: { select: { appointments: true, staffServices: true } },
          },
        }),
        prisma.serviceCategory.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { order: "asc" },
        }),
        prisma.websiteSection.findFirst({
          where: { businessId: ctx.business.id, type: "SERVICES" },
        }),
      ])

      if (servicesSection?.content && (servicesSection.content as any).cardStyle) {
        globalCardStyle = (servicesSection.content as any).cardStyle
      }

      if (dbServices && dbServices.length > 0) {
        services = dbServices.map((s: any) => {
          const sImages = s.images && Array.isArray(s.images) && s.images.length > 0 ? s.images : s.image ? [s.image] : []
          return {
            id: s.id,
            name: s.name,
            slug: s.slug,
            shortDescription: s.shortDescription || s.description,
            description: s.description || s.shortDescription,
            price: Number(s.price),
            durationMinutes: s.durationMinutes,
            image: sImages[0] || s.image || null,
            images: sImages,
            cardStyle: globalCardStyle,
            sortOrder: s.sortOrder,
            isFeatured: s.isFeatured,
            isActive: s.isActive,
            category: s.category,
            _count: s._count,
          }
        })
        setAllInMemoryServices(services)
      }
      categories = dbCategories
    } catch (e) {
      console.warn("DB services query fallback:", e)
    }

    if (services.length === 0) {
      services = getInMemoryServices().map((s: any) => ({ ...s, cardStyle: globalCardStyle }))
    }

    return res.json({
      services,
      categories,
      cardStyle: globalCardStyle,
      terminology: ctx.terminology,
      business: ctx.business,
    })
  } catch (error) {
    console.error("Admin services error:", error)
    return res.status(500).json({ error: "Failed to fetch services" })
  }
})

// Update Global Treatment Card Presentation Style (ADMIN ONLY)
adminRouter.put("/website/treatment-card-style", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { cardStyle } = req.body
    const validCardStyle = ["default", "image_card", "overlay", "blurred-image-reveal", "blurred_reveal"].includes(cardStyle)
      ? cardStyle
      : "default"

    try {
      const existing = await prisma.websiteSection.findFirst({
        where: { businessId: ctx.business.id, type: "SERVICES" },
      })

      if (existing) {
        const currentContent = (existing.content as Record<string, any>) || {}
        await prisma.websiteSection.update({
          where: { id: existing.id },
          data: {
            content: { ...currentContent, cardStyle: validCardStyle },
          },
        })
      } else {
        await prisma.websiteSection.create({
          data: {
            businessId: ctx.business.id,
            type: "SERVICES",
            content: {
              heading: "Our Treatments",
              subheading: "Professional treatments tailored to your dental health and confidence.",
              cardStyle: validCardStyle,
            },
            isEnabled: true,
            order: 2,
          },
        })
      }
    } catch (e) {
      console.warn("DB update global card style fallback:", e)
    }

    invalidateBusinessCache()
    return res.json({
      success: true,
      cardStyle: validCardStyle,
      message: "Global treatment card presentation style updated successfully",
    })
  } catch (error: any) {
    console.error("Update global card style error:", error)
    return res.status(500).json({ error: "Failed to update treatment card presentation style" })
  }
})

adminRouter.put("/services/card-style", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { cardStyle } = req.body
    const validCardStyle = ["default", "image_card", "overlay", "blurred-image-reveal", "blurred_reveal"].includes(cardStyle)
      ? cardStyle
      : "default"

    try {
      const existing = await prisma.websiteSection.findFirst({
        where: { businessId: ctx.business.id, type: "SERVICES" },
      })

      if (existing) {
        const currentContent = (existing.content as Record<string, any>) || {}
        await prisma.websiteSection.update({
          where: { id: existing.id },
          data: {
            content: { ...currentContent, cardStyle: validCardStyle },
          },
        })
      } else {
        await prisma.websiteSection.create({
          data: {
            businessId: ctx.business.id,
            type: "SERVICES",
            content: {
              heading: "Our Treatments",
              subheading: "Professional treatments tailored to your dental health and confidence.",
              cardStyle: validCardStyle,
            },
            isEnabled: true,
            order: 2,
          },
        })
      }
    } catch (e) {
      console.warn("DB update global card style fallback:", e)
    }

    invalidateBusinessCache()
    return res.json({
      success: true,
      cardStyle: validCardStyle,
      message: "Global treatment card presentation style updated successfully",
    })
  } catch (error: any) {
    console.error("Update global card style error:", error)
    return res.status(500).json({ error: "Failed to update treatment card presentation style" })
  }
})

// Update Global Dentist Card Presentation Style (ADMIN ONLY)
adminRouter.put(["/website/dentist-card-style", "/staff/card-style"], async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { cardStyle } = req.body
    const validCardStyle = ["clinical", "editorial", "overlay", "minimal"].includes(cardStyle)
      ? cardStyle
      : "clinical"

    try {
      const existing = await prisma.websiteSection.findFirst({
        where: { businessId: ctx.business.id, type: "STAFF" },
      })

      if (existing) {
        const currentContent = (existing.content as Record<string, any>) || {}
        await prisma.websiteSection.update({
          where: { id: existing.id },
          data: {
            content: { ...currentContent, cardStyle: validCardStyle },
          },
        })
      } else {
        await prisma.websiteSection.create({
          data: {
            businessId: ctx.business.id,
            type: "STAFF",
            content: {
              heading: "Meet Our Dentists",
              subheading: "Board-certified dental professionals with specialized clinical expertise.",
              cardStyle: validCardStyle,
            },
            isEnabled: true,
            order: 3,
          },
        })
      }
    } catch (e) {
      console.warn("DB update global dentist card style fallback:", e)
    }

    invalidateBusinessCache()
    return res.json({
      success: true,
      cardStyle: validCardStyle,
      message: "Global dentist card presentation style updated successfully",
    })
  } catch (error: any) {
    console.error("Update global dentist card style error:", error)
    return res.status(500).json({ error: "Failed to update dentist card presentation style" })
  }
})

// Upload Single Treatment Image (ADMIN ONLY)
adminRouter.post("/services/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" })
    }
    const imageUrl = `/uploads/${req.file.filename}`
    return res.json({ imageUrl, filename: req.file.filename, message: "Treatment image uploaded successfully" })
  } catch (error: any) {
    console.error("Treatment image upload error:", error)
    return res.status(500).json({ error: error.message || "Failed to upload image" })
  }
})

// Upload Multiple Treatment Images (ADMIN ONLY)
adminRouter.post("/services/upload-multiple", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No image files provided" })
    }
    const imageUrls = files.map(f => `/uploads/${f.filename}`)
    return res.json({ imageUrls, count: imageUrls.length, message: `${imageUrls.length} image(s) uploaded successfully` })
  } catch (error: any) {
    console.error("Multiple treatment images upload error:", error)
    return res.status(500).json({ error: error.message || "Failed to upload images" })
  }
})

// Create Treatment
adminRouter.post("/services", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { name, shortDescription, description, price, durationMinutes, image, images, isFeatured, isActive, categoryId } = req.body
    if (!name) return res.status(400).json({ error: "Treatment name is required" })

    const sImages = images && Array.isArray(images) && images.length > 0 ? images : image ? [image] : []
    const primaryImage = sImages[0] || image || null
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    // Update in-memory runtime store
    const created = createInMemoryService({
      name,
      slug,
      shortDescription: shortDescription || description,
      description: description || shortDescription,
      price: Number(price) || 800,
      durationMinutes: Number(durationMinutes) || 30,
      image: primaryImage,
      images: sImages,
      cardStyle: "default",
      isFeatured: isFeatured !== undefined ? isFeatured : true,
      isActive: isActive !== undefined ? isActive : true,
    })

    try {
      const dbService = await prisma.service.create({
        data: {
          businessId: ctx.business.id,
          name,
          slug,
          shortDescription: shortDescription || description,
          description: description || shortDescription,
          price: Number(price) || 800,
          durationMinutes: Number(durationMinutes) || 30,
          image: primaryImage,
          images: sImages,
          isFeatured: isFeatured !== undefined ? isFeatured : true,
          isActive: isActive !== undefined ? isActive : true,
          categoryId: categoryId || undefined,
        },
      })
      created.id = dbService.id
    } catch (e) {
      console.warn("DB service create fallback:", e)
    }

    await syncServicesToWebsiteSection(ctx.business.id)
    invalidateBusinessCache()
    return res.status(201).json({ service: created, message: "Treatment created successfully" })
  } catch (error: any) {
    console.error("Create treatment error:", error)
    return res.status(500).json({ error: error.message || "Failed to create treatment" })
  }
})

// Update Treatment
adminRouter.patch("/services/:id", async (req, res) => {
  try {
    const { id } = req.params
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { name, shortDescription, description, price, durationMinutes, image, images, isFeatured, isActive, categoryId } = req.body

    let sImages: string[] | undefined = undefined
    let primaryImage: string | null | undefined = undefined
    if (images !== undefined && Array.isArray(images)) {
      sImages = images
      primaryImage = sImages.length > 0 ? sImages[0] : null
    } else if (image !== undefined) {
      primaryImage = image
      sImages = image ? [image] : []
    }

    const updated = updateInMemoryService(id, {
      ...(name && { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") }),
      ...(shortDescription !== undefined && { shortDescription }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
      ...(primaryImage !== undefined && { image: primaryImage }),
      ...(sImages !== undefined && { images: sImages }),
      ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    })

    try {
      await prisma.service.update({
        where: { id },
        data: {
          ...(name && { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price: Number(price) }),
          ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
          ...(primaryImage !== undefined && { image: primaryImage }),
          ...(sImages !== undefined && { images: sImages }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
          ...(categoryId !== undefined && { categoryId: categoryId || null }),
        },
      })
    } catch (e) {
      console.warn("DB service update fallback:", e)
    }

    await syncServicesToWebsiteSection(ctx.business.id)
    invalidateBusinessCache()
    return res.json({ service: updated, message: "Treatment updated successfully" })
  } catch (error: any) {
    console.error("Update treatment error:", error)
    return res.status(500).json({ error: error.message || "Failed to update treatment" })
  }
})

// Delete Treatment
adminRouter.delete("/services/:id", async (req, res) => {
  try {
    const { id } = req.params
    const ctx = await getBusinessContext()
    deleteInMemoryService(id)

    if (ctx) {
      try {
        await prisma.service.delete({ where: { id } })
      } catch (e) {
        console.warn("DB service delete fallback:", e)
      }
      await syncServicesToWebsiteSection(ctx.business.id)
      invalidateBusinessCache()
    }

    return res.json({ success: true, message: "Treatment removed successfully" })
  } catch (error: any) {
    console.error("Delete treatment error:", error)
    return res.status(500).json({ error: error.message || "Failed to delete treatment" })
  }
})

// Reorder Treatments
adminRouter.post("/services/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body
    const ctx = await getBusinessContext()
    if (Array.isArray(orderedIds)) {
      reorderInMemoryServices(orderedIds)
      if (ctx) {
        try {
          await Promise.all(
            orderedIds.map((id, index) =>
              prisma.service.update({
                where: { id },
                data: { sortOrder: index },
              }).catch(() => {})
            )
          )
        } catch (e) {
          console.warn("DB reorder fallback:", e)
        }
        await syncServicesToWebsiteSection(ctx.business.id)
        invalidateBusinessCache()
      }
    }
    return res.json({ success: true, message: "Treatments reordered successfully" })
  } catch (error: any) {
    console.error("Reorder treatments error:", error)
    return res.status(500).json({ error: "Failed to reorder treatments" })
  }
})

// Staff
adminRouter.get("/staff", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    let staff: any[] = []
    let globalCardStyle = "clinical"

    try {
      const [dbStaff, staffSection] = await Promise.all([
        prisma.staff.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { sortOrder: "asc" },
          include: {
            services: {
              include: { service: true },
            },
            _count: { select: { appointments: true } },
          },
        }),
        prisma.websiteSection.findFirst({
          where: { businessId: ctx.business.id, type: "STAFF" },
        }),
      ])

      staff = dbStaff
      if (staffSection?.content && (staffSection.content as any).cardStyle) {
        globalCardStyle = (staffSection.content as any).cardStyle
      }
    } catch (e) {
      console.warn("DB staff query fallback:", e)
    }

    return res.json({ staff, cardStyle: globalCardStyle, terminology: ctx.terminology, business: ctx.business })
  } catch (error) {
    console.error("Admin staff error:", error)
    return res.status(500).json({ error: "Failed to fetch staff" })
  }
})

// Upload Single Doctor/Staff Image (ADMIN ONLY)
adminRouter.post("/staff/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" })
    }
    const imageUrl = `/uploads/${req.file.filename}`
    return res.json({ imageUrl, filename: req.file.filename, message: "Doctor photo uploaded successfully" })
  } catch (error: any) {
    console.error("Doctor photo upload error:", error)
    return res.status(500).json({ error: error.message || "Failed to upload image" })
  }
})

// Upload Multiple Doctor/Staff Images (ADMIN ONLY)
adminRouter.post("/staff/upload-multiple", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No image files provided" })
    }
    const imageUrls = files.map(f => `/uploads/${f.filename}`)
    return res.json({ imageUrls, count: imageUrls.length, message: `${imageUrls.length} image(s) uploaded successfully` })
  } catch (error: any) {
    console.error("Multiple doctor images upload error:", error)
    return res.status(500).json({ error: error.message || "Failed to upload images" })
  }
})

// Create Doctor / Specialist Account (ADMIN ONLY)
adminRouter.post("/staff", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const {
      name,
      email,
      password,
      specialty,
      specialties,
      role,
      bio,
      biography,
      photo,
      images,
      credentials,
      education,
      experience,
      languages,
      phone,
      serviceIds,
      isActive,
      sortOrder,
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and initial password are required to create a doctor account" })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4)
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      // Check existing user with this email
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ error: "A user account with this email already exists" })
      }

      // 1. Create User account with role STAFF
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STAFF",
        },
      })

      // 2. Create Staff profile linked to User
      const doctor = await prisma.staff.create({
        data: {
          businessId: ctx.business.id,
          userId: user.id,
          name,
          email,
          phone: phone || null,
          role: role || "Associate Dentist",
          specialty: specialty || "General Dentistry",
          specialties: Array.isArray(specialties) ? specialties : (specialty ? [specialty] : []),
          bio: bio || null,
          biography: biography || bio || null,
          photo: photo || (Array.isArray(images) && images.length > 0 ? images[0] : null),
          images: Array.isArray(images) ? images : (photo ? [photo] : []),
          credentials: Array.isArray(credentials) ? credentials : [],
          education: Array.isArray(education) ? education : [],
          experience: experience || null,
          languages: Array.isArray(languages) ? languages : ["English", "Filipino"],
          slug,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
          services: serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0
            ? {
                create: serviceIds.map((sid: string) => ({ serviceId: sid })),
              }
            : undefined,
        },
        include: {
          services: { include: { service: true } },
        },
      })

      // Create default schedule for new doctor (Mon-Fri 9-17)
      for (const day of [0, 1, 2, 3, 4, 5, 6]) {
        const isWorking = [1, 2, 3, 4, 5].includes(day)
        const schedule = await prisma.staffSchedule.create({
          data: { staffId: doctor.id, dayOfWeek: day, isWorking },
        })
        if (isWorking) {
          await prisma.scheduleShift.create({
            data: { scheduleId: schedule.id, startTime: "09:00", endTime: "12:00" },
          })
          await prisma.scheduleShift.create({
            data: { scheduleId: schedule.id, startTime: "13:00", endTime: "17:00" },
          })
          await prisma.scheduleBreak.create({
            data: { scheduleId: schedule.id, startTime: "12:00", endTime: "13:00", label: "Lunch" },
          })
        }
      }

      return res.status(201).json({
        doctor,
        message: `Doctor account created for ${name}. They can now sign in with their email and password.`,
      })
    } catch (e) {
      console.warn("DB staff create fallback:", e)
      return res.status(500).json({ error: "Database error while creating doctor profile" })
    }
  } catch (error) {
    console.error("Create doctor account error:", error)
    return res.status(500).json({ error: "Failed to create doctor account" })
  }
})

// Update Doctor Account (ADMIN ONLY)
adminRouter.patch("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      email,
      specialty,
      specialties,
      role,
      bio,
      biography,
      photo,
      images,
      credentials,
      education,
      experience,
      languages,
      phone,
      isActive,
      sortOrder,
      serviceIds,
      password,
    } = req.body

    try {
      const staffMember = await prisma.staff.findFirst({
        where: { id: String(id) },
        include: { user: true },
      })

      if (!staffMember) {
        return res.status(404).json({ error: "Doctor profile not found" })
      }

      // If updating password or user email
      if (staffMember.userId && (password || email || name)) {
        const updateUserData: any = {}
        if (name) updateUserData.name = name
        if (email) updateUserData.email = email
        if (password) {
          updateUserData.password = await bcrypt.hash(password, 10)
        }

        await prisma.user.update({
          where: { id: staffMember.userId },
          data: updateUserData,
        })
      } else if (!staffMember.userId && email) {
        // Auto-create or link User account for doctor
        let existingUser = await prisma.user.findUnique({ where: { email } })
        if (!existingUser) {
          const passHash = await bcrypt.hash(password || "password", 10)
          existingUser = await prisma.user.create({
            data: {
              name: name || staffMember.name,
              email,
              password: passHash,
              role: "STAFF",
            },
          })
        }
        await prisma.staff.update({
          where: { id: String(id) },
          data: { userId: existingUser.id },
        })
      }

      // If updating linked services
      if (serviceIds !== undefined && Array.isArray(serviceIds)) {
        await prisma.staffService.deleteMany({
          where: { staffId: String(id) },
        })
        if (serviceIds.length > 0) {
          await prisma.staffService.createMany({
            data: serviceIds.map((sid: string) => ({
              staffId: String(id),
              serviceId: sid,
            })),
          })
        }
      }

      let primaryPhoto = photo
      let staffImages = images
      if (images !== undefined && Array.isArray(images)) {
        staffImages = images
        primaryPhoto = images.length > 0 ? images[0] : null
      } else if (photo !== undefined) {
        primaryPhoto = photo
        staffImages = photo ? [photo] : []
      }

      const updated = await prisma.staff.update({
        where: { id: String(id) },
        data: {
          name: name !== undefined ? name : undefined,
          email: email !== undefined ? email : undefined,
          specialty: specialty !== undefined ? specialty : undefined,
          specialties: specialties !== undefined ? specialties : undefined,
          role: role !== undefined ? role : undefined,
          bio: bio !== undefined ? bio : undefined,
          biography: biography !== undefined ? biography : undefined,
          photo: primaryPhoto !== undefined ? primaryPhoto : undefined,
          images: staffImages !== undefined ? staffImages : undefined,
          credentials: credentials !== undefined ? credentials : undefined,
          education: education !== undefined ? education : undefined,
          experience: experience !== undefined ? experience : undefined,
          languages: languages !== undefined ? languages : undefined,
          phone: phone !== undefined ? phone : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
          acceptingAppointments: req.body.acceptingAppointments !== undefined ? Boolean(req.body.acceptingAppointments) : undefined,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
        },
        include: {
          services: { include: { service: true } },
        },
      })

      invalidateBusinessCache()

      return res.json({ doctor: updated, message: "Doctor profile updated successfully" })
    } catch (e) {
      console.error("DB staff update error:", e)
      return res.status(500).json({ error: "Failed to update doctor profile in database" })
    }
  } catch (error) {
    console.error("Update doctor error:", error)
    return res.status(500).json({ error: "Failed to update doctor account" })
  }
})

// Reorder Doctors (ADMIN ONLY)
adminRouter.put("/staff/reorder", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { staffIds } = req.body
    if (!Array.isArray(staffIds)) {
      return res.status(400).json({ error: "staffIds must be an array of IDs" })
    }

    await Promise.all(
      staffIds.map((id: string, index: number) =>
        prisma.staff.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    return res.json({ message: "Dentist order updated successfully" })
  } catch (error: any) {
    console.error("Reorder staff error:", error)
    return res.status(500).json({ error: error.message || "Failed to reorder dentists" })
  }
})

// Deactivate / Remove Doctor (ADMIN ONLY)
adminRouter.delete("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params
    try {
      const staff = await prisma.staff.findFirst({ where: { id: String(id) } })
      if (staff?.userId) {
        await prisma.user.delete({ where: { id: staff.userId } }).catch(() => {})
      }
      await prisma.staff.delete({ where: { id: String(id) } })
    } catch (e) {}
    return res.json({ success: true, message: "Doctor account removed" })
  } catch (error) {
    return res.status(500).json({ error: "Failed to remove doctor account" })
  }
})

// Schedules
adminRouter.get("/schedules", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    let staff: any[] = []
    let schedules: any[] = []
    let openingHours: any[] = []

    try {
      const [dbStaff, dbSchedules, dbOpeningHours] = await Promise.all([
        prisma.staff.findMany({
          where: { businessId: ctx.business.id, isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.staffSchedule.findMany({
          where: { staff: { businessId: ctx.business.id } },
          include: { shifts: true, breaks: true },
        }),
        prisma.openingHours.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { dayOfWeek: "asc" },
        }),
      ])
      staff = dbStaff
      schedules = dbSchedules
      openingHours = dbOpeningHours
    } catch (e) {
      console.warn("DB schedules query fallback:", e)
    }

    return res.json({ staff, schedules, openingHours, terminology: ctx.terminology, business: ctx.business })
  } catch (error) {
    console.error("Admin schedules error:", error)
    return res.status(500).json({ error: "Failed to fetch schedules" })
  }
})

// Appearance
adminRouter.get("/appearance", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    return res.json({
      theme: ctx.theme,
      business: ctx.business,
      terminology: ctx.terminology,
    })
  } catch (error) {
    console.error("Admin appearance error:", error)
    return res.status(500).json({ error: "Failed to fetch appearance" })
  }
})

adminRouter.patch("/appearance", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { theme, primaryColor, secondaryColor, accentColor, headingFont, bodyFont, borderRadius } = req.body

    try {
      const updated = await prisma.themeSettings.upsert({
        where: { businessId: ctx.business.id },
        update: { theme, primaryColor, secondaryColor, accentColor, headingFont, bodyFont, borderRadius },
        create: { businessId: ctx.business.id, theme, primaryColor, secondaryColor, accentColor, headingFont, bodyFont, borderRadius },
      })
      invalidateBusinessCache()
      return res.json({ theme: updated })
    } catch (e) {
      return res.json({ theme: { theme } })
    }
  } catch (error) {
    console.error("Update appearance error:", error)
    return res.status(500).json({ error: "Failed to update appearance" })
  }
})

// Website sections
adminRouter.get("/website", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    let sections: any[] = []
    let navItems: any[] = []
    let testimonials: any[] = []
    let faqs: any[] = []

    try {
      const [s, n, t, f] = await Promise.all([
        prisma.websiteSection.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { order: "asc" },
        }),
        prisma.navigationItem.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { order: "asc" },
        }),
        prisma.testimonial.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.fAQ.findMany({
          where: { businessId: ctx.business.id },
          orderBy: { sortOrder: "asc" },
        }),
      ])
      sections = s
      navItems = n
      testimonials = t
      faqs = f
    } catch (e) {
      console.warn("DB website query fallback:", e)
    }

    return res.json({ sections, navItems, testimonials, faqs, terminology: ctx.terminology, business: ctx.business })
  } catch (error) {
    console.error("Admin website error:", error)
    return res.status(500).json({ error: "Failed to fetch website configuration" })
  }
})

// Hero Section Customization (Layout, Image Position, Content)
adminRouter.get("/website/hero", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    let heroSection: any = null
    try {
      heroSection = await prisma.websiteSection.findFirst({
        where: { businessId: ctx.business.id, type: "HERO" },
      })
    } catch (e) {
      console.warn("DB hero section query fallback:", e)
    }

    return res.json({
      hero: heroSection?.content || inMemoryHeroSection,
    })
  } catch (error) {
    console.error("Fetch hero section error:", error)
    return res.status(500).json({ error: "Failed to fetch hero section" })
  }
})

adminRouter.patch("/website/hero", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const {
      imagePosition,
      heading,
      subheading,
      primaryCta,
      secondaryCta,
      image,
      showBadge,
      badgeText,
      stat1Value,
      stat1Label,
      stat2Value,
      stat2Label,
    } = req.body

    const validPosition = ["left", "right", "center"].includes(imagePosition) ? imagePosition : "right"

    let updatedContent: any = {
      imagePosition: validPosition,
      heading: heading !== undefined ? heading : `Exceptional care.\nDesigned around you.`,
      subheading: subheading !== undefined ? subheading : `Professional services delivered by an experienced team in ${ctx.business.name}.`,
      primaryCta: primaryCta || `Book Appointment`,
      secondaryCta: secondaryCta || "Explore Services",
      image: image || "/hero-dental.jpg",
      showBadge: showBadge !== undefined ? Boolean(showBadge) : true,
      badgeText: badgeText !== undefined ? badgeText : "Now accepting new patient bookings",
      stat1Value: stat1Value !== undefined ? stat1Value : "500+",
      stat1Label: stat1Label !== undefined ? stat1Label : "Satisfied Patients",
      stat2Value: stat2Value !== undefined ? stat2Value : "12",
      stat2Label: stat2Label !== undefined ? stat2Label : "Certified Dental Specialists",
    }

    // Always update runtime store so live website reflects changes instantly
    setInMemoryHero(updatedContent)

    try {
      const existing = await prisma.websiteSection.findFirst({
        where: { businessId: ctx.business.id, type: "HERO" },
      })

      if (existing) {
        await prisma.websiteSection.update({
          where: { id: existing.id },
          data: {
            content: updatedContent,
          },
        })
      } else {
        await prisma.websiteSection.create({
          data: {
            businessId: ctx.business.id,
            type: "HERO",
            content: updatedContent,
            isEnabled: true,
            order: 0,
          },
        })
      }
    } catch (e) {
      console.warn("DB hero update fallback:", e)
    }

    invalidateBusinessCache()
    return res.json({
      hero: updatedContent,
      message: "Hero section layout updated successfully",
    })
  } catch (error) {
    console.error("Update hero section error:", error)
    return res.status(500).json({ error: "Failed to update hero section" })
  }
})

// Upload Hero Image (ADMIN ONLY)
adminRouter.post("/website/hero/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" })
    }

    const imageUrl = `/uploads/${req.file.filename}`

    // Update in-memory hero store image
    setInMemoryHero({ image: imageUrl })

    // If DB is connected, persist image URL
    try {
      const ctx = await getBusinessContext()
      if (ctx) {
        const existing = await prisma.websiteSection.findFirst({
          where: { businessId: ctx.business.id, type: "HERO" },
        })
        if (existing) {
          const currentContent = (existing.content as Record<string, any>) || {}
          await prisma.websiteSection.update({
            where: { id: existing.id },
            data: {
              content: { ...currentContent, image: imageUrl },
            },
          })
          invalidateBusinessCache()
        }
      }
    } catch (e) {
      console.warn("DB image update fallback:", e)
    }

    return res.json({
      imageUrl,
      filename: req.file.filename,
      message: "Hero image uploaded and saved successfully",
    })
  } catch (error: any) {
    console.error("Hero image upload error:", error)
    return res.status(500).json({ error: error.message || "Failed to upload hero image" })
  }
})

// Location Management
adminRouter.get("/location", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    return res.json({
      address: ctx.business.address || "2F Veridian Building, 123 Ayala Avenue, Makati City, Metro Manila",
      latitude: (ctx.business as any).latitude ?? 14.5547,
      longitude: (ctx.business as any).longitude ?? 121.0244,
      mapZoom: (ctx.business as any).mapZoom ?? 15,
      businessName: ctx.business.name,
    })
  } catch (error) {
    console.error("Admin location get error:", error)
    return res.status(500).json({ error: "Failed to fetch location" })
  }
})

adminRouter.patch("/location", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { address, latitude, longitude, mapZoom } = req.body

    const lat = typeof latitude === "number" ? latitude : parseFloat(latitude)
    const lng = typeof longitude === "number" ? longitude : parseFloat(longitude)
    const zoom = typeof mapZoom === "number" ? mapZoom : (parseInt(mapZoom, 10) || 15)

    try {
      const updated = await prisma.business.update({
        where: { id: ctx.business.id },
        data: {
          address: address !== undefined ? address : ctx.business.address,
          latitude: !isNaN(lat) ? lat : (ctx.business as any).latitude,
          longitude: !isNaN(lng) ? lng : (ctx.business as any).longitude,
          mapZoom: !isNaN(zoom) ? zoom : (ctx.business as any).mapZoom,
        },
      })
      invalidateBusinessCache()
      return res.json({
        address: updated.address,
        latitude: updated.latitude,
        longitude: updated.longitude,
        mapZoom: updated.mapZoom,
      })
    } catch (e) {
      console.warn("DB location update fallback:", e)
      return res.json({
        address,
        latitude: lat,
        longitude: lng,
        mapZoom: zoom,
      })
    }
  } catch (error) {
    console.error("Update location error:", error)
    return res.status(500).json({ error: "Failed to update location" })
  }
})

// Review Moderation
adminRouter.get("/reviews", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    const { status } = req.query as { status?: string }

    let reviews: any[] = []
    try {
      reviews = await prisma.review.findMany({
        where: {
          businessId: ctx.business.id,
          status: status && status !== "ALL" ? (status as any) : undefined,
        },
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          service: true,
          staff: true,
          appointment: true,
        },
      })
    } catch (e) {
      console.warn("DB admin reviews query fallback:", e)
    }

    if (reviews.length === 0) {
      // Fallback demo reviews for admin review
      reviews = [
        {
          id: "rev-1",
          customerName: "Ana Reyes",
          rating: 5,
          comment: "Dr. Maria Santos was incredibly gentle and knowledgeable. Highly recommended!",
          status: "APPROVED",
          isVerified: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
          service: { name: "Dental Consultation" },
          staff: { name: "Dr. Maria Santos" },
        },
        {
          id: "rev-2",
          customerName: "Marco Villanueva",
          rating: 5,
          comment: "The aligner treatment was fast and seamless. Great clinic ambience!",
          status: "PENDING",
          isVerified: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
          service: { name: "Orthodontic Assessment" },
          staff: { name: "Dr. Daniel Cruz" },
        },
        {
          id: "rev-3",
          customerName: "Jessa Tan",
          rating: 4,
          comment: "Good service and teeth whitening results were visible right away.",
          status: "PENDING",
          isVerified: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          service: { name: "Teeth Whitening" },
          staff: { name: "Dr. Sofia Reyes" },
        },
      ]
    }

    return res.json({ reviews })
  } catch (error) {
    console.error("Admin reviews error:", error)
    return res.status(500).json({ error: "Failed to fetch reviews" })
  }
})

adminRouter.patch("/reviews/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    try {
      const review = await prisma.review.update({
        where: { id: String(id) },
        data: { status },
      })
      return res.json({ review })
    } catch (e) {
      return res.json({ review: { id, status } })
    }
  } catch (error) {
    console.error("Update review status error:", error)
    return res.status(500).json({ error: "Failed to update review status" })
  }
})

adminRouter.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params
    try {
      await prisma.review.delete({ where: { id: String(id) } })
    } catch (e) {}
    return res.json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete review" })
  }
})

// Reassign Appointment to another Doctor
adminRouter.patch("/appointments/:id/reassign", async (req, res) => {
  try {
    const { id } = req.params
    const { staffId } = req.body

    const staffMember = await prisma.staff.findFirst({ where: { id: String(staffId) } })

    try {
      const appointment = await prisma.appointment.update({
        where: { id: String(id) },
        data: {
          staffId: String(staffId),
          staffName: staffMember?.name ?? "Specialist",
        },
        include: { customer: true, service: true, staff: true },
      })

      // Notify newly assigned doctor
      if (staffId) {
        notifyDoctorNewAppointment({
          appointmentId: appointment.id,
          staffId: String(staffId),
          customerName: appointment.customer?.name || "Patient",
          serviceName: appointment.service?.name || appointment.serviceName,
          date: format(new Date(appointment.startAt), "MMMM d, yyyy"),
          time: `${format(new Date(appointment.startAt), "hh:mm a")} – ${format(new Date(appointment.endAt), "hh:mm a")}`,
          price: Number(appointment.priceAtBooking),
        }).catch(err => console.error("Reassign notification error:", err))
      }

      return res.json({ appointment })
    } catch (e) {
      return res.json({ appointment: { id, staffId, staffName: staffMember?.name ?? "Specialist" } })
    }
  } catch (error) {
    console.error("Reassign appointment error:", error)
    return res.status(500).json({ error: "Failed to reassign appointment" })
  }
})

// Reschedule Appointment
adminRouter.patch("/appointments/:id/reschedule", async (req, res) => {
  try {
    const { id } = req.params
    const { startAt, endAt } = req.body

    if (!startAt || !endAt) {
      return res.status(400).json({ error: "startAt and endAt are required" })
    }

    const prevAppt = await prisma.appointment.findUnique({
      where: { id: String(id) },
      include: { customer: true, service: true, staff: true },
    })

    if (!prevAppt) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    const oldStartDate = new Date(prevAppt.startAt)
    const oldEndDate = new Date(prevAppt.endAt)
    const newStartDate = new Date(startAt)
    const newEndDate = new Date(endAt)

    const updatedAppointment = await prisma.appointment.update({
      where: { id: String(id) },
      data: {
        startAt: newStartDate,
        endAt: newEndDate,
      },
      include: { customer: true, service: true, staff: true },
    })

    // Trigger Doctor Reschedule Notification
    if (updatedAppointment.staffId) {
      notifyDoctorAppointmentRescheduled({
        appointmentId: updatedAppointment.id,
        staffId: updatedAppointment.staffId,
        customerName: updatedAppointment.customer?.name || "Patient",
        serviceName: updatedAppointment.service?.name || updatedAppointment.serviceName,
        newDate: format(newStartDate, "MMMM d, yyyy"),
        newTime: `${format(newStartDate, "hh:mm a")} – ${format(newEndDate, "hh:mm a")}`,
        oldDate: format(oldStartDate, "MMMM d, yyyy"),
        oldTime: `${format(oldStartDate, "hh:mm a")} – ${format(oldEndDate, "hh:mm a")}`,
      }).catch(err => console.error("Reschedule notification error:", err))
    }

    return res.json({ appointment: updatedAppointment, message: "Appointment rescheduled successfully" })
  } catch (error) {
    console.error("Reschedule appointment error:", error)
    return res.status(500).json({ error: "Failed to reschedule appointment" })
  }
})

// Broadcast Clinic Announcement to All Doctors
adminRouter.post("/announcements/broadcast", async (req, res) => {
  try {
    const { title, message } = req.body

    if (!title || !message) {
      return res.status(400).json({ error: "title and message are required" })
    }

    const ctx = await getBusinessContext()
    const businessId = ctx?.business.id ?? "demo-clinic"

    const doctors = await prisma.staff.findMany({
      where: { businessId, isActive: true },
    })

    const { createDoctorNotification } = await import("../services/doctorNotificationService")

    for (const doc of doctors) {
      await createDoctorNotification({
        staffId: doc.id,
        type: "CLINIC_ANNOUNCEMENT",
        title: `Clinic Notice: ${title}`,
        message: String(message),
      })
    }

    return res.json({ success: true, recipientsCount: doctors.length, message: "Announcement broadcast to doctors." })
  } catch (error) {
    console.error("Broadcast announcement error:", error)
    return res.status(500).json({ error: "Failed to broadcast announcement" })
  }
})

// Settings
adminRouter.get("/settings", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    if (!ctx) return res.status(404).json({ error: "Business not found" })

    return res.json({
      business: ctx.business,
      settings: ctx.settings,
      terminology: ctx.terminology,
      features: ctx.features,
    })
  } catch (error) {
    console.error("Admin settings error:", error)
    return res.status(500).json({ error: "Failed to fetch settings" })
  }
})
