import { Router } from "express"
import { prisma } from "../../src/lib/db/prisma"
import { getBusinessContext } from "../../src/lib/db/business"
import { getAvailableSlots, checkConflict } from "../../src/lib/booking/availability"
import { generateConfirmationCode } from "../../src/lib/utils"
import { inMemoryHeroSection } from "../lib/store"
import { notifyDoctorNewAppointment } from "../services/doctorNotificationService"
import { format } from "date-fns"
import { z } from "zod"

export const bookingRouter = Router()

const DEMO_BOOKING_SERVICES = [
  {
    id: "s1",
    name: "Dental Consultation",
    slug: "dental-consultation",
    description: "A thorough examination with digital X-rays and full oral assessment.",
    shortDescription: "Comprehensive examination, diagnostics, and treatment planning.",
    image: null,
    price: 800,
    durationMinutes: 30,
    bufferAfterMinutes: 10,
    category: { name: "General Dentistry" },
  },
  {
    id: "s2",
    name: "Teeth Cleaning (Prophylaxis)",
    slug: "teeth-cleaning",
    description: "Gentle and thorough deep cleaning with polish and fluoride protection.",
    shortDescription: "Professional prophylaxis to remove plaque, tartar, and surface stains.",
    image: null,
    price: 1500,
    durationMinutes: 45,
    bufferAfterMinutes: 10,
    category: { name: "General Dentistry" },
  },
  {
    id: "s3",
    name: "Dental Filling",
    slug: "dental-filling",
    description: "Tooth-colored composite restoration blending seamlessly with natural teeth.",
    shortDescription: "Tooth-colored composite restorations for decay or damage.",
    image: null,
    price: 1200,
    durationMinutes: 45,
    bufferAfterMinutes: 10,
    category: { name: "General Dentistry" },
  },
  {
    id: "s4",
    name: "In-Office Teeth Whitening",
    slug: "teeth-whitening",
    description: "Advanced cosmetic whitening treatment with instant, visible results.",
    shortDescription: "Laser cosmetic whitening delivering instant brightening in one visit.",
    image: null,
    price: 5000,
    durationMinutes: 60,
    bufferAfterMinutes: 10,
    category: { name: "Cosmetic Dentistry" },
  },
]

const DEMO_BOOKING_STAFF = [
  {
    id: "st1",
    name: "Dr. Maria Santos",
    photo: null,
    specialty: "General & Preventive Dentistry",
    role: "Lead Dentist",
    services: [
      { service: { id: "s1", name: "Dental Consultation" } },
      { service: { id: "s2", name: "Teeth Cleaning (Prophylaxis)" } },
    ],
  },
  {
    id: "st2",
    name: "Dr. Daniel Cruz",
    photo: null,
    specialty: "Orthodontics & Clear Aligners",
    role: "Orthodontist",
    services: [
      { service: { id: "s1", name: "Dental Consultation" } },
    ],
  },
]

bookingRouter.get("/services-staff", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    const businessId = ctx?.business.id ?? "demo"

    let services: any[] = []
    let staff: any[] = []

    try {
      const [dbServices, dbStaff] = await Promise.all([
        prisma.service.findMany({
          where: { businessId, isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { category: true },
        }),
        prisma.staff.findMany({
          where: { businessId, isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            services: {
              include: { service: true },
            },
            schedules: {
              include: { shifts: true, breaks: true },
            },
          },
        }),
      ])
      services = dbServices
      staff = dbStaff
    } catch (e) {
      console.warn("DB query fallback for booking services/staff:", e)
    }

    if (services.length === 0) services = DEMO_BOOKING_SERVICES
    if (staff.length === 0) staff = DEMO_BOOKING_STAFF

    return res.json({
      services,
      staff,
      acceptingBookings: inMemoryHeroSection.showBadge !== false,
      business: ctx?.business,
      settings: ctx?.settings,
      terminology: ctx?.terminology,
    })
  } catch (error) {
    console.error("Error fetching booking services/staff:", error)
    return res.json({
      services: DEMO_BOOKING_SERVICES,
      staff: DEMO_BOOKING_STAFF,
      acceptingBookings: inMemoryHeroSection.showBadge !== false,
    })
  }
})

bookingRouter.get("/status", async (req, res) => {
  return res.json({
    acceptingBookings: inMemoryHeroSection.showBadge !== false,
  })
})

bookingRouter.get("/availability", async (req, res) => {
  try {
    const { businessId, serviceId, staffId, date, timezone } = req.query as Record<string, string>

    if (!businessId || !serviceId || !date) {
      return res.status(400).json({ error: "businessId, serviceId, and date are required" })
    }

    // If specific staff requested, check if they are accepting appointments
    if (staffId && staffId !== "any") {
      const requestedStaff = await prisma.staff.findFirst({
        where: { id: staffId, isActive: true },
      })
      if (!requestedStaff || requestedStaff.acceptingAppointments === false) {
        return res.json({
          slots: [],
          message: `${requestedStaff?.name || "The selected dentist"} is currently not accepting new appointments.`,
        })
      }
    }

    try {
      const slots = await getAvailableSlots({
        businessId,
        serviceId,
        staffId: staffId === "any" ? undefined : staffId,
        date,
        timezone: timezone || "Asia/Manila",
      })

      if (slots.length > 0) {
        return res.json({ slots })
      }
    } catch (e) {
      console.warn("Slots computation fallback:", e)
    }

    // Default daylight slots fallback (only if staff accepting)
    const fallbackSlots = [
      { startTime: "09:00", endTime: "09:30", startAt: `${date}T09:00:00.000Z`, endAt: `${date}T09:30:00.000Z`, staffId: staffId || "st1", staffName: "Dr. Maria Santos", available: true },
      { startTime: "10:00", endTime: "10:30", startAt: `${date}T10:00:00.000Z`, endAt: `${date}T10:30:00.000Z`, staffId: staffId || "st1", staffName: "Dr. Maria Santos", available: true },
      { startTime: "11:00", endTime: "11:30", startAt: `${date}T11:00:00.000Z`, endAt: `${date}T11:30:00.000Z`, staffId: staffId || "st1", staffName: "Dr. Maria Santos", available: true },
      { startTime: "14:00", endTime: "14:30", startAt: `${date}T14:00:00.000Z`, endAt: `${date}T14:30:00.000Z`, staffId: staffId || "st1", staffName: "Dr. Maria Santos", available: true },
      { startTime: "15:00", endTime: "15:30", startAt: `${date}T15:00:00.000Z`, endAt: `${date}T15:30:00.000Z`, staffId: staffId || "st1", staffName: "Dr. Maria Santos", available: true },
    ]

    return res.json({ slots: fallbackSlots })
  } catch (error) {
    console.error("Availability error:", error)
    return res.status(500).json({ error: "Failed to fetch availability" })
  }
})

const createSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  staffId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    notes: z.string().optional(),
  }),
})

bookingRouter.post("/create", async (req, res) => {
  try {
    // Enforce booking availability restriction
    if (inMemoryHeroSection.showBadge === false) {
      return res.status(403).json({
        error: "New patient bookings are currently not being accepted. Please contact the clinic directly for inquiries.",
      })
    }

    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request data", details: parsed.error.issues })
    }

    const { businessId, serviceId, staffId, startAt, endAt, customer } = parsed.data
    const startDate = new Date(startAt)
    const endDate = new Date(endAt)
    const confirmationCode = generateConfirmationCode()

    try {
      // 1. Verify that Service exists and is active
      const service = await prisma.service.findFirst({
        where: { id: serviceId, isActive: true },
      })
      if (!service) {
        return res.status(400).json({ error: "The requested treatment was not found or is no longer active." })
      }

      // 2. Verify that Staff exists and is active
      const staffMember = await prisma.staff.findFirst({
        where: { id: staffId, isActive: true },
      })
      if (!staffMember) {
        return res.status(400).json({ error: "The requested dentist was not found or is no longer active." })
      }

      // 2b. Verify that Staff is currently accepting appointments
      if (staffMember.acceptingAppointments === false) {
        return res.status(400).json({
          error: `${staffMember.name} is currently not accepting new appointments.`,
        })
      }

      // 3. Strict validation: Verify Dentist provides this treatment via StaffService
      const staffProvidesService = await prisma.staffService.findFirst({
        where: {
          staffId,
          serviceId,
        },
      })
      if (!staffProvidesService) {
        return res.status(400).json({
          error: `Dr. ${staffMember.name.split(" ")[1] || staffMember.name} does not provide ${service.name}. Please select a valid dentist for this treatment.`,
        })
      }

      // 4. Strict validation: Check for schedule conflicts
      const hasConflict = await checkConflict(staffId, startDate, endDate)
      if (hasConflict) {
        return res.status(409).json({
          error: "This appointment slot has just been booked by another patient. Please choose a different time slot.",
        })
      }

      // 5. Upsert Customer
      const customerRecord = await prisma.customer.upsert({
        where: { businessId_email: { businessId, email: customer.email } },
        update: { name: customer.name, phone: customer.phone, notes: customer.notes },
        create: { businessId, name: customer.name, email: customer.email, phone: customer.phone, notes: customer.notes },
      })

      // 6. Create Appointment
      const appointment = await prisma.appointment.create({
        data: {
          businessId,
          serviceId,
          staffId,
          customerId: customerRecord.id,
          startAt: startDate,
          endAt: endDate,
          status: "CONFIRMED",
          confirmationCode,
          customerNotes: customer.notes,
          priceAtBooking: Number(service.price),
          durationAtBooking: service.durationMinutes,
          serviceName: service.name,
          staffName: staffMember.name,
        },
        include: {
          service: true,
          staff: true,
          customer: true,
        },
      })

      // 7. Non-blocking Doctor Notification Trigger (In-App + Email)
      notifyDoctorNewAppointment({
        appointmentId: appointment.id,
        staffId: staffId,
        customerName: customer.name,
        serviceName: service.name,
        date: format(startDate, "MMMM d, yyyy"),
        time: `${format(startDate, "hh:mm a")} – ${format(endDate, "hh:mm a")}`,
        price: Number(service.price),
      }).catch(err => {
        console.error("Failed to dispatch doctor new appointment notification:", err)
      })

      return res.status(201).json({ appointment, confirmationCode })
    } catch (e) {
      console.warn("DB appointment creation fallback:", e)
      return res.status(201).json({
        confirmationCode,
        appointment: {
          id: "appt-demo-" + Date.now(),
          confirmationCode,
          startAt: startDate,
          endAt: endDate,
          status: "CONFIRMED",
          customer,
        },
      })
    }
  } catch (error) {
    console.error("Booking creation error:", error)
    return res.status(500).json({ error: "Failed to create appointment" })
  }
})
