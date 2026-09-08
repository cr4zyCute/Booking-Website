import { prisma } from "@/lib/db/prisma"
import { parseTimeToMinutes, minutesToTime, addMinutes } from "@/lib/utils"
import { toZonedTime, format } from "date-fns-tz"
import { isBefore, isAfter, startOfDay, endOfDay, addDays } from "date-fns"

export interface TimeSlot {
  startTime: string  // HH:mm
  endTime: string    // HH:mm
  startAt: Date      // full UTC datetime
  endAt: Date        // full UTC datetime
  staffId: string
  staffName: string
  available: boolean
}

export interface AvailabilityOptions {
  businessId: string
  serviceId: string
  staffId?: string   // undefined = "any available"
  date: string       // YYYY-MM-DD in business timezone
  timezone: string
}

export async function getAvailableSlots(opts: AvailabilityOptions): Promise<TimeSlot[]> {
  const { businessId, serviceId, staffId, date, timezone } = opts

  // Load service
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  })
  if (!service) return []

  // Load business settings
  const settings = await prisma.businessSettings.findUnique({
    where: { businessId },
  })
  const slotInterval = settings?.slotIntervalMinutes ?? 15
  const minNoticeHours = settings?.minNoticeHours ?? 2
  const maxBookingDays = settings?.maxBookingDays ?? 90
  const bufferAfter = Number(service.bufferAfterMinutes) || 0
  const duration = Number(service.durationMinutes)

  // Validate date range
  const now = new Date()
  const minDate = addMinutes(now, minNoticeHours * 60)
  const maxDate = addDays(now, maxBookingDays)

  // Parse date in business timezone to get start/end of day in UTC
  const [y, m, d] = date.split("-").map(Number)
  // Create date in business timezone
  const dayStartLocal = new Date(y, m - 1, d, 0, 0, 0)
  // For simplicity, treat the date string directly
  const dateInTz = `${date}T00:00:00`

  // Get all eligible staff
  const staffWhere = staffId
    ? { id: staffId, businessId, isActive: true, acceptingAppointments: true }
    : {
        businessId,
        isActive: true,
        acceptingAppointments: true,
        services: { some: { serviceId } },
      }
  const staffList = await prisma.staff.findMany({
    where: staffWhere,
    include: {
      services: { where: { serviceId } },
      schedules: {
        where: { dayOfWeek: new Date(y, m - 1, d).getDay() },
        include: { shifts: true, breaks: true },
      },
      overrides: { where: { date } },
      blockedTimes: {
        where: {
          startAt: { lt: new Date(`${date}T23:59:59`) },
          endAt:   { gt: new Date(`${date}T00:00:00`) },
        },
      },
    },
  })

  // Get existing appointments for that day for those staff
  const staffIds = staffList.map((s) => s.id)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      staffId: { in: staffIds },
      startAt: { gte: new Date(`${date}T00:00:00.000Z`), lt: new Date(`${date}T23:59:59.999Z`) },
      status: { notIn: ["CANCELLED"] },
    },
  })

  const allSlots: TimeSlot[] = []

  for (const staff of staffList) {
    if (!staff.services.length) continue

    // Determine working windows
    const override = staff.overrides[0]
    let workingShifts: { startTime: string; endTime: string }[] = []
    const breakPeriods: { startTime: string; endTime: string }[] = []

    if (override) {
      if (!override.isWorking || !override.startTime || !override.endTime) continue
      workingShifts = [{ startTime: override.startTime, endTime: override.endTime }]
    } else {
      const schedule = staff.schedules[0]
      if (!schedule || !schedule.isWorking) continue
      workingShifts = schedule.shifts.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
      breakPeriods.push(...schedule.breaks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })))
    }

    if (!workingShifts.length) continue

    // Get blocked times for this staff
    const blocked = staff.blockedTimes
    const appts = existingAppointments.filter((a) => a.staffId === staff.id)

    // Generate slots for each shift
    for (const shift of workingShifts) {
      const shiftStart = parseTimeToMinutes(shift.startTime)
      const shiftEnd = parseTimeToMinutes(shift.endTime)

      let cursor = shiftStart
      while (cursor + duration <= shiftEnd) {
        const slotStart = cursor
        const slotEnd = cursor + duration + bufferAfter

        // Build UTC datetime for this slot
        const slotStartDt = new Date(`${date}T${minutesToTime(slotStart)}:00`)
        const slotEndDt = new Date(`${date}T${minutesToTime(slotStart + duration)}:00`)

        let available = true

        // Check minimum notice
        if (isBefore(slotStartDt, minDate)) {
          available = false
        }

        // Check max booking window
        if (isAfter(slotStartDt, maxDate)) {
          available = false
        }

        // Check breaks
        for (const brk of breakPeriods) {
          const brkStart = parseTimeToMinutes(brk.startTime)
          const brkEnd = parseTimeToMinutes(brk.endTime)
          if (slotStart < brkEnd && slotEnd > brkStart) {
            available = false
            break
          }
        }

        // Check blocked times
        for (const blk of blocked) {
          const blkStart = new Date(blk.startAt)
          const blkEnd = new Date(blk.endAt)
          if (slotStartDt < blkEnd && slotEndDt > blkStart) {
            available = false
            break
          }
        }

        // Check existing appointments
        for (const appt of appts) {
          const apptStart = new Date(appt.startAt)
          const apptEnd = new Date(appt.endAt)
          // Add buffer from existing appointment
          const apptEndWithBuffer = new Date(apptEnd)
          if (slotStartDt < apptEndWithBuffer && slotEndDt > apptStart) {
            available = false
            break
          }
        }

        if (available) {
          // Check if this slot already added (for "any staff")
          const existing = allSlots.find(
            (s) => s.startTime === minutesToTime(slotStart) && s.staffId === staff.id
          )
          if (!existing) {
            allSlots.push({
              startTime: minutesToTime(slotStart),
              endTime: minutesToTime(slotStart + duration),
              startAt: slotStartDt,
              endAt: slotEndDt,
              staffId: staff.id,
              staffName: staff.name,
              available: true,
            })
          }
        }

        cursor += slotInterval
      }
    }
  }

  // Sort by time
  allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))

  return allSlots
}

export async function checkConflict(
  staffId: string,
  startAt: Date,
  endAt: Date,
  excludeAppointmentId?: string
): Promise<boolean> {
  const conflict = await prisma.appointment.findFirst({
    where: {
      staffId,
      status: { notIn: ["CANCELLED"] },
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      OR: [
        { startAt: { gte: startAt, lt: endAt } },
        { endAt: { gt: startAt, lte: endAt } },
        { startAt: { lte: startAt }, endAt: { gte: endAt } },
      ],
    },
  })
  return !!conflict
}
