import { Router } from "express"
import { prisma } from "../../src/lib/db/prisma"
import { getBusinessContext, invalidateBusinessCache } from "../../src/lib/db/business"
import { requireDoctor, AuthRequest } from "../middleware/auth"
import { startOfDay, endOfDay } from "date-fns"
import bcrypt from "bcryptjs"
import multer from "multer"
import path from "path"
import fs from "fs"

export const doctorRouter = Router()

// Setup file upload destination for doctor portal
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
    cb(null, `doctor-self-${Date.now()}-${cleanName}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Protect all routes with doctor role check
doctorRouter.use(requireDoctor)

// Helper: resolve staff profile for the logged in doctor
async function resolveDoctorStaff(req: AuthRequest) {
  if (req.user?.staffId) {
    const staff = await prisma.staff.findFirst({
      where: { id: req.user.staffId },
      include: {
        services: { include: { service: true } },
        schedules: { include: { shifts: true, breaks: true } },
      },
    })
    if (staff) return staff
  }

  if (req.user?.id) {
    const staff = await prisma.staff.findFirst({
      where: { userId: req.user.id },
      include: {
        services: { include: { service: true } },
        schedules: { include: { shifts: true, breaks: true } },
      },
    })
    if (staff) return staff
  }

  if (req.user?.email) {
    const staff = await prisma.staff.findFirst({
      where: { email: req.user.email },
      include: {
        services: { include: { service: true } },
        schedules: { include: { shifts: true, breaks: true } },
      },
    })
    if (staff) return staff
  }

  // Fallback to first active staff member
  return await prisma.staff.findFirst({
    where: { isActive: true },
    include: {
      services: { include: { service: true } },
      schedules: { include: { shifts: true, breaks: true } },
    },
  })
}

// Doctor Dashboard Stats
doctorRouter.get("/dashboard", async (req: AuthRequest, res) => {
  try {
    const ctx = await getBusinessContext()
    const businessId = ctx?.business.id ?? "demo-clinic"
    const staff = await resolveDoctorStaff(req)
    const staffId = staff?.id || req.user?.staffId || "st1"

    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    let todayAppts = 0
    let upcomingCount = 0
    let completedCount = 0
    let todaySchedule: any[] = []

    try {
      const [tA, uC, cC, tSched] = await Promise.all([
        prisma.appointment.count({
          where: {
            businessId,
            staffId,
            startAt: { gte: todayStart, lte: todayEnd },
            status: { notIn: ["CANCELLED"] },
          },
        }),
        prisma.appointment.count({
          where: {
            businessId,
            staffId,
            startAt: { gte: todayStart },
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        }),
        prisma.appointment.count({
          where: {
            businessId,
            staffId,
            status: "COMPLETED",
          },
        }),
        prisma.appointment.findMany({
          where: {
            businessId,
            staffId,
            startAt: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { startAt: "asc" },
          include: { customer: true, service: true },
        }),
      ])

      todayAppts = tA
      upcomingCount = uC
      completedCount = cC
      todaySchedule = tSched
    } catch (e) {
      console.warn("DB doctor dashboard fallback:", e)
    }

    return res.json({
      todayAppts,
      upcomingCount,
      completedCount,
      todaySchedule,
      doctorProfile: staff || {
        id: staffId,
        name: req.user?.name || "Dr. Maria Santos",
        role: "Lead Dentist",
        specialty: "General & Preventive Dentistry",
      },
      business: ctx?.business,
      terminology: ctx?.terminology,
    })
  } catch (error) {
    console.error("Doctor dashboard error:", error)
    return res.status(500).json({ error: "Failed to fetch doctor dashboard" })
  }
})

// Doctor Assigned Appointments (Workspace list with KPI counters & filters)
doctorRouter.get("/appointments", async (req: AuthRequest, res) => {
  try {
    const ctx = await getBusinessContext()
    const businessId = ctx?.business.id ?? "demo-clinic"
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const { status, timeframe, search } = req.query as {
      status?: string
      timeframe?: string
      search?: string
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)

    // Build Prisma where conditions
    const where: any = {
      businessId,
      staffId: staff.id,
    }

    // Status filter
    if (status && status !== "ALL") {
      where.status = status
    }

    // Timeframe filter
    if (timeframe === "today") {
      where.startAt = { gte: todayStart, lte: todayEnd }
    } else if (timeframe === "tomorrow") {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      where.startAt = { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) }
    } else if (timeframe === "this-week") {
      const weekStart = startOfDay(now)
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() + 7)
      where.startAt = { gte: weekStart, lte: endOfDay(weekEnd) }
    } else if (timeframe === "upcoming") {
      where.startAt = { gte: todayStart }
      where.status = { notIn: ["COMPLETED", "CANCELLED", "NO_SHOW"] }
    }

    // Search filter (patient name or treatment name)
    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { email: { contains: q, mode: "insensitive" } } },
        { customer: { phone: { contains: q, mode: "insensitive" } } },
        { serviceName: { contains: q, mode: "insensitive" } },
        { service: { name: { contains: q, mode: "insensitive" } } },
        { confirmationCode: { contains: q, mode: "insensitive" } },
      ]
    }

    // Fetch all doctor's appointments for KPI calculations
    const allDoctorAppts = await prisma.appointment.findMany({
      where: { businessId, staffId: staff.id },
      include: { customer: true, service: true },
      orderBy: { startAt: "desc" },
    })

    // Calculate Summary Metrics
    const todayCount = allDoctorAppts.filter(
      a => new Date(a.startAt) >= todayStart && new Date(a.startAt) <= todayEnd && a.status !== "CANCELLED"
    ).length
    const upcomingCount = allDoctorAppts.filter(
      a => new Date(a.startAt) >= todayStart && ["CONFIRMED", "IN_PROGRESS"].includes(a.status)
    ).length
    const inProgressCount = allDoctorAppts.filter(a => a.status === "IN_PROGRESS").length
    const completedCount = allDoctorAppts.filter(a => a.status === "COMPLETED").length
    const cancelledCount = allDoctorAppts.filter(a => a.status === "CANCELLED").length
    const noShowCount = allDoctorAppts.filter(a => a.status === "NO_SHOW").length

    // Filtered result set
    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startAt: timeframe === "completed" || status === "COMPLETED" ? "desc" : "asc" },
      include: { customer: true, service: true, review: true },
      take: 100,
    })

    return res.json({
      appointments,
      summary: {
        total: allDoctorAppts.length,
        today: todayCount,
        upcoming: upcomingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount,
        noShow: noShowCount,
      },
      terminology: ctx?.terminology,
    })
  } catch (error) {
    console.error("Doctor appointments error:", error)
    return res.status(500).json({ error: "Failed to fetch appointments" })
  }
})

// GET /api/doctor/appointments/:id — Single appointment details with strict doctor ownership check
doctorRouter.get("/appointments/:id", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const { id } = req.params

    const appointment = await prisma.appointment.findUnique({
      where: { id: String(id) },
      include: {
        customer: true,
        service: true,
        staff: true,
        review: true,
      },
    })

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    // STRICT SECURITY CHECK: Ensure the appointment belongs to the authenticated doctor
    if (appointment.staffId !== staff.id && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. You can only view appointments assigned to you." })
    }

    // Fetch patient's past appointments with this clinic for context
    let patientHistory: any[] = []
    if (appointment.customerId) {
      patientHistory = await prisma.appointment.findMany({
        where: {
          customerId: appointment.customerId,
          id: { not: appointment.id },
        },
        include: { service: true, staff: true },
        orderBy: { startAt: "desc" },
        take: 5,
      })
    }

    return res.json({
      appointment,
      patientHistory,
    })
  } catch (error) {
    console.error("Get doctor appointment detail error:", error)
    return res.status(500).json({ error: "Failed to fetch appointment detail" })
  }
})

// PATCH /api/doctor/appointments/:id/status — Doctor updates appointment status lifecycle
doctorRouter.patch("/appointments/:id/status", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const { id } = req.params
    const { status, staffNotes, cancellationReason } = req.body

    const existingAppt = await prisma.appointment.findUnique({
      where: { id: String(id) },
    })

    if (!existingAppt) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    // STRICT SECURITY CHECK: Doctor can only update their own appointments
    if (existingAppt.staffId !== staff.id && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. You can only manage your own appointments." })
    }

    // Validate allowed status lifecycle values
    const validStatuses = ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed values: ${validStatuses.join(", ")}` })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (staffNotes !== undefined) updateData.staffNotes = staffNotes
    if (status === "CANCELLED") {
      updateData.cancelledAt = new Date()
      if (cancellationReason) updateData.cancellationReason = cancellationReason
    }

    const appointment = await prisma.appointment.update({
      where: { id: String(id) },
      data: updateData,
      include: { customer: true, service: true, staff: true },
    })

    return res.json({
      appointment,
      message: `Appointment status updated to ${appointment.status}`,
    })
  } catch (error: any) {
    console.error("Doctor appointment status update error:", error)
    return res.status(500).json({ error: error?.message || "Failed to update appointment status" })
  }
})

// PATCH /api/doctor/appointments/:id/notes — Doctor updates clinical staff notes
doctorRouter.patch("/appointments/:id/notes", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const { id } = req.params
    const { staffNotes } = req.body

    const existingAppt = await prisma.appointment.findUnique({
      where: { id: String(id) },
    })

    if (!existingAppt) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    if (existingAppt.staffId !== staff.id && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. You can only edit notes for your own appointments." })
    }

    const appointment = await prisma.appointment.update({
      where: { id: String(id) },
      data: { staffNotes: staffNotes || null },
      include: { customer: true, service: true },
    })

    return res.json({
      appointment,
      message: "Clinical notes updated successfully.",
    })
  } catch (error) {
    console.error("Doctor clinical notes update error:", error)
    return res.status(500).json({ error: "Failed to update notes" })
  }
})

// Doctor's Assigned Schedule
doctorRouter.get("/schedule", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    const staffId = staff?.id || req.user?.staffId || "st1"

    let schedule: any = null
    try {
      schedule = await prisma.staffSchedule.findMany({
        where: { staffId },
        include: { shifts: true, breaks: true },
        orderBy: { dayOfWeek: "asc" },
      })
    } catch (e) {
      console.warn("DB doctor schedule fallback:", e)
    }

    return res.json({ schedule: schedule || [] })
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch schedule" })
  }
})

// ==========================================
// DOCTOR SELF-PROFILE MANAGEMENT
// ==========================================

// GET /api/doctor/profile — Fetch doctor's own profile
doctorRouter.get("/profile", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)

    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    return res.json({
      staff,
      user: {
        id: req.user?.id,
        email: req.user?.email,
        name: req.user?.name,
        role: req.user?.role,
      },
    })
  } catch (error) {
    console.error("Fetch doctor self-profile error:", error)
    return res.status(500).json({ error: "Failed to fetch doctor profile" })
  }
})

// POST /api/doctor/upload — Doctor uploads their own portrait / photo
doctorRouter.post("/upload", upload.single("image"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" })
    }

    const imageUrl = `/uploads/${req.file.filename}`
    return res.json({ imageUrl, filename: req.file.filename })
  } catch (error: any) {
    console.error("Doctor photo upload error:", error)
    return res.status(500).json({ error: error.message || "Failed to upload photo" })
  }
})

// PATCH /api/doctor/profile — Doctor updates their OWN personal profile
doctorRouter.patch("/profile", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    // Only allow editing non-administrative personal fields and appointment availability
    const {
      photo,
      images,
      bio,
      biography,
      languages,
      phone,
      email,
      password,
      acceptingAppointments,
    } = req.body

    // Prepare update data for staff profile
    const updateData: any = {}

    if (acceptingAppointments !== undefined) {
      updateData.acceptingAppointments = Boolean(acceptingAppointments)
    }

    if (photo !== undefined) {
      updateData.photo = photo || null
    }

    if (images !== undefined && Array.isArray(images)) {
      updateData.images = images.filter(Boolean)
      if (!updateData.photo && images.length > 0) {
        updateData.photo = images[0]
      }
    } else if (photo) {
      updateData.images = [photo]
    }

    if (bio !== undefined) updateData.bio = String(bio).trim()
    if (biography !== undefined) updateData.biography = String(biography).trim()
    if (languages !== undefined) {
      updateData.languages = Array.isArray(languages)
        ? languages.map((l: string) => String(l).trim()).filter(Boolean)
        : String(languages).split(",").map(l => l.trim()).filter(Boolean)
    }
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null
    
    // Doctor professional contact / notification email (Staff.email)
    if (email !== undefined) {
      const cleanEmail = String(email).trim()
      updateData.email = cleanEmail || null
      updateData.emailVerified = Boolean(cleanEmail && cleanEmail.includes("@"))
    }

    // If doctor wants to update their login password
    if (password && typeof password === "string" && password.trim().length >= 6) {
      if (req.user?.id) {
        const hashedPassword = await bcrypt.hash(password.trim(), 10)
        await prisma.user.update({
          where: { id: req.user.id },
          data: { password: hashedPassword },
        })
      }
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: staff.id },
      data: updateData,
      include: {
        services: { include: { service: true } },
        schedules: { include: { shifts: true, breaks: true } },
      },
    })

    invalidateBusinessCache()

    return res.json({
      staff: updatedStaff,
      message: "Your profile has been updated successfully!",
    })
  } catch (error) {
    console.error("Doctor profile update error:", error)
    return res.status(500).json({ error: "Failed to update profile" })
  }
})

// =========================================================================
// DOCTOR NOTIFICATIONS ENDPOINTS
// =========================================================================

// GET /api/doctor/notifications — Fetch notifications for authenticated doctor
doctorRouter.get("/notifications", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.doctorNotification.findMany({
        where: { staffId: staff.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          appointment: {
            include: {
              customer: true,
              service: true,
            },
          },
        },
      }),
      prisma.doctorNotification.count({
        where: { staffId: staff.id, isRead: false },
      }),
    ])

    return res.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Fetch doctor notifications error:", error)
    return res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

// PATCH /api/doctor/notifications/:id/read — Mark single notification as read
doctorRouter.patch("/notifications/:id/read", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const id = String(req.params.id)

    const notification = await prisma.doctorNotification.findFirst({
      where: { id, staffId: staff.id },
    })

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or access denied" })
    }

    const updated = await prisma.doctorNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    const unreadCount = await prisma.doctorNotification.count({
      where: { staffId: staff.id, isRead: false },
    })

    return res.json({
      notification: updated,
      unreadCount,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Mark notification read error:", error)
    return res.status(500).json({ error: "Failed to update notification" })
  }
})

// PATCH /api/doctor/notifications/:id/unread — Mark single notification as unread
doctorRouter.patch("/notifications/:id/unread", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const id = String(req.params.id)

    const notification = await prisma.doctorNotification.findFirst({
      where: { id, staffId: staff.id },
    })

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or access denied" })
    }

    const updated = await prisma.doctorNotification.update({
      where: { id },
      data: {
        isRead: false,
        readAt: null,
      },
    })

    const unreadCount = await prisma.doctorNotification.count({
      where: { staffId: staff.id, isRead: false },
    })

    return res.json({
      notification: updated,
      unreadCount,
      message: "Notification marked as unread",
    })
  } catch (error) {
    console.error("Mark notification unread error:", error)
    return res.status(500).json({ error: "Failed to update notification" })
  }
})

// PATCH /api/doctor/notifications/read-all — Mark all notifications as read
doctorRouter.patch("/notifications/read-all", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    await prisma.doctorNotification.updateMany({
      where: { staffId: staff.id, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return res.json({
      success: true,
      unreadCount: 0,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    return res.status(500).json({ error: "Failed to mark all as read" })
  }
})

// GET /api/doctor/notification-preferences — Get notification preferences
doctorRouter.get("/notification-preferences", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    return res.json({
      preferences: {
        emailNotifications: staff.emailNotifications !== false,
        inAppNotifications: staff.inAppNotifications !== false,
        notifyNewAppointment: staff.notifyNewAppointment !== false,
        notifyCancellation: staff.notifyCancellation !== false,
        notifyReschedule: staff.notifyReschedule !== false,
        notifyClinicAnnouncements: staff.notifyClinicAnnouncements !== false,
        professionalEmail: staff.email || "",
        emailVerified: staff.emailVerified !== false,
      },
    })
  } catch (error) {
    console.error("Get notification preferences error:", error)
    return res.status(500).json({ error: "Failed to fetch notification preferences" })
  }
})

// PATCH /api/doctor/notification-preferences — Update notification preferences
doctorRouter.patch("/notification-preferences", async (req: AuthRequest, res) => {
  try {
    const staff = await resolveDoctorStaff(req)
    if (!staff) {
      return res.status(404).json({ error: "Doctor profile not found" })
    }

    const {
      emailNotifications,
      inAppNotifications,
      notifyNewAppointment,
      notifyCancellation,
      notifyReschedule,
      notifyClinicAnnouncements,
      professionalEmail,
    } = req.body

    const updateData: any = {}

    if (emailNotifications !== undefined) updateData.emailNotifications = Boolean(emailNotifications)
    if (inAppNotifications !== undefined) updateData.inAppNotifications = Boolean(inAppNotifications)
    if (notifyNewAppointment !== undefined) updateData.notifyNewAppointment = Boolean(notifyNewAppointment)
    if (notifyCancellation !== undefined) updateData.notifyCancellation = Boolean(notifyCancellation)
    if (notifyReschedule !== undefined) updateData.notifyReschedule = Boolean(notifyReschedule)
    if (notifyClinicAnnouncements !== undefined) updateData.notifyClinicAnnouncements = Boolean(notifyClinicAnnouncements)

    if (professionalEmail !== undefined) {
      const cleanEmail = String(professionalEmail).trim()
      updateData.email = cleanEmail || null
      updateData.emailVerified = Boolean(cleanEmail && cleanEmail.includes("@"))
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: staff.id },
      data: updateData,
    })

    return res.json({
      preferences: {
        emailNotifications: updatedStaff.emailNotifications !== false,
        inAppNotifications: updatedStaff.inAppNotifications !== false,
        notifyNewAppointment: updatedStaff.notifyNewAppointment !== false,
        notifyCancellation: updatedStaff.notifyCancellation !== false,
        notifyReschedule: updatedStaff.notifyReschedule !== false,
        notifyClinicAnnouncements: updatedStaff.notifyClinicAnnouncements !== false,
        professionalEmail: updatedStaff.email || "",
        emailVerified: updatedStaff.emailVerified !== false,
      },
      message: "✓ Notification preferences updated successfully.",
    })
  } catch (error) {
    console.error("Update notification preferences error:", error)
    return res.status(500).json({ error: "Failed to update preferences" })
  }
})

