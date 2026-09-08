import { prisma } from "../../src/lib/db/prisma"
import nodemailer from "nodemailer"

interface NotificationPayload {
  staffId: string
  appointmentId?: string
  type: "NEW_APPOINTMENT" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "CLINIC_ANNOUNCEMENT"
  title: string
  message: string
  metadata?: Record<string, any>
  emailSubject?: string
  emailHtml?: string
}

// Lazy create or reuse email transport with clean environment configuration
let emailTransporter: nodemailer.Transporter | null = null

function getEmailTransporter(): nodemailer.Transporter | null {
  if (emailTransporter) return emailTransporter

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (host && user && pass) {
    emailTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  }
  return emailTransporter
}

/**
 * Send an email notification safely without throwing or interrupting appointment flows
 */
async function sendDoctorEmailSafely(recipientEmail: string, subject: string, htmlContent: string) {
  try {
    if (!recipientEmail || !recipientEmail.includes("@")) {
      return
    }

    const transporter = getEmailTransporter()
    const fromAddress = process.env.SMTP_FROM_EMAIL || "notifications@veridiandental.com"
    const fromName = process.env.SMTP_FROM_NAME || "Veridian Dental Clinic"

    if (transporter) {
      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
      })
      console.log(`[Notification Service] Email sent successfully to ${recipientEmail}: "${subject}"`)
    } else {
      // In development or when SMTP is not configured, log notification email output cleanly
      console.log(`[Notification Service: Mock Mailer] Email dispatched to ${recipientEmail}`)
      console.log(`  Subject: ${subject}`)
      console.log(`  Preview: ${htmlContent.replace(/<[^>]*>?/gm, "").slice(0, 150)}...`)
    }
  } catch (error) {
    console.error(`[Notification Service] Failed to send email to ${recipientEmail}:`, error)
    // Does NOT rethrow - error is caught so the parent business process (e.g. appointment booking) completes
  }
}

/**
 * Core function to create an in-app notification & dispatch email if enabled in preferences
 */
export async function createDoctorNotification(payload: NotificationPayload) {
  const { staffId, appointmentId, type, title, message, metadata, emailSubject, emailHtml } = payload

  try {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    })

    if (!staff) {
      console.warn(`[Notification Service] Doctor staff ${staffId} not found`)
      return null
    }

    // 1. Check in-app notification preference
    let shouldCreateInApp = staff.inAppNotifications !== false

    if (type === "NEW_APPOINTMENT" && staff.notifyNewAppointment === false) shouldCreateInApp = false
    if (type === "APPOINTMENT_CANCELLED" && staff.notifyCancellation === false) shouldCreateInApp = false
    if (type === "APPOINTMENT_RESCHEDULED" && staff.notifyReschedule === false) shouldCreateInApp = false
    if (type === "CLINIC_ANNOUNCEMENT" && staff.notifyClinicAnnouncements === false) shouldCreateInApp = false

    let inAppNotification: any = null

    if (shouldCreateInApp) {
      inAppNotification = await prisma.doctorNotification.create({
        data: {
          staffId,
          appointmentId: appointmentId || null,
          type,
          title,
          message,
          metadata: metadata || undefined,
        },
      })
    }

    // 2. Check email notification preference & professional email
    let shouldSendEmail = staff.emailNotifications !== false

    if (type === "NEW_APPOINTMENT" && staff.notifyNewAppointment === false) shouldSendEmail = false
    if (type === "APPOINTMENT_CANCELLED" && staff.notifyCancellation === false) shouldSendEmail = false
    if (type === "APPOINTMENT_RESCHEDULED" && staff.notifyReschedule === false) shouldSendEmail = false
    if (type === "CLINIC_ANNOUNCEMENT" && staff.notifyClinicAnnouncements === false) shouldSendEmail = false

    // Only send to doctor's professional email (staff.email)
    const professionalEmail = staff.email

    if (shouldSendEmail && professionalEmail && professionalEmail.includes("@")) {
      const subject = emailSubject || `[Veridian Dental] ${title}`
      const htmlBody = emailHtml || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">${title}</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">${message.replace(/\n/g, "<br/>")}</p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            This is an automated notification sent to your verified professional email: ${professionalEmail}.
          </div>
        </div>
      `

      // Fire and forget non-blocking email
      sendDoctorEmailSafely(professionalEmail, subject, htmlBody).catch(err => {
        console.error("[Notification Service] Background send error:", err)
      })
    }

    return inAppNotification
  } catch (error) {
    console.error("[Notification Service] Error creating doctor notification:", error)
    return null
  }
}

/**
 * Convenience helper for New Appointment Booking
 */
export async function notifyDoctorNewAppointment(data: {
  appointmentId: string
  staffId: string
  customerName: string
  serviceName: string
  date: string
  time: string
  price?: number
}) {
  const title = `New Appointment: ${data.customerName}`
  const message = `You have a new appointment with ${data.customerName}.\nTreatment: ${data.serviceName}\nDate: ${data.date}\nTime: ${data.time}`

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
      <div style="background: #0f766e; padding: 20px 24px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700;">New Appointment Booked</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Veridian Dental Clinical Portal</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">You have a new patient appointment scheduled with your care team:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; font-size: 13px; color: #1e293b; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 110px;">Patient:</td>
              <td style="padding: 6px 0; font-weight: 700;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Treatment:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f766e;">${data.serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Date:</td>
              <td style="padding: 6px 0;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Time:</td>
              <td style="padding: 6px 0;">${data.time}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
          You can review patient notes and clinical diagnostic records directly in your Doctor Portal.
        </p>
      </div>
    </div>
  `

  return createDoctorNotification({
    staffId: data.staffId,
    appointmentId: data.appointmentId,
    type: "NEW_APPOINTMENT",
    title,
    message,
    metadata: { ...data },
    emailSubject: `[New Appointment] ${data.customerName} - ${data.serviceName} on ${data.date}`,
    emailHtml,
  })
}

/**
 * Convenience helper for Appointment Cancellation
 */
export async function notifyDoctorAppointmentCancelled(data: {
  appointmentId: string
  staffId: string
  customerName: string
  serviceName: string
  date: string
  time: string
  reason?: string
}) {
  const title = `Appointment Cancelled: ${data.customerName}`
  const message = `The appointment with ${data.customerName} for ${data.serviceName} on ${data.date} at ${data.time} has been cancelled.${data.reason ? `\nReason: ${data.reason}` : ""}`

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
      <div style="background: #dc2626; padding: 20px 24px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700;">Appointment Cancelled</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Veridian Dental Clinical Portal</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">An appointment scheduled on your calendar has been cancelled:</p>
        <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; font-size: 13px; color: #1e293b; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 110px;">Patient:</td>
              <td style="padding: 6px 0; font-weight: 700;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Treatment:</td>
              <td style="padding: 6px 0;">${data.serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Scheduled Date:</td>
              <td style="padding: 6px 0;">${data.date} at ${data.time}</td>
            </tr>
            ${data.reason ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Reason:</td>
              <td style="padding: 6px 0; color: #b91c1c;">${data.reason}</td>
            </tr>
            ` : ""}
          </table>
        </div>
      </div>
    </div>
  `

  return createDoctorNotification({
    staffId: data.staffId,
    appointmentId: data.appointmentId,
    type: "APPOINTMENT_CANCELLED",
    title,
    message,
    metadata: { ...data },
    emailSubject: `[Cancelled] Appointment with ${data.customerName} on ${data.date}`,
    emailHtml,
  })
}

/**
 * Convenience helper for Appointment Rescheduling
 */
export async function notifyDoctorAppointmentRescheduled(data: {
  appointmentId: string
  staffId: string
  customerName: string
  serviceName: string
  newDate: string
  newTime: string
  oldDate?: string
  oldTime?: string
}) {
  const title = `Appointment Rescheduled: ${data.customerName}`
  const message = `The appointment with ${data.customerName} (${data.serviceName}) has been rescheduled to ${data.newDate} at ${data.newTime}.${data.oldDate ? `\n(Previous: ${data.oldDate} at ${data.oldTime})` : ""}`

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
      <div style="background: #2563eb; padding: 20px 24px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700;">Appointment Rescheduled</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Veridian Dental Clinical Portal</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #334155; margin-top: 0;">An appointment on your schedule has been moved to a new time slot:</p>
        <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; font-size: 13px; color: #1e293b; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 110px;">Patient:</td>
              <td style="padding: 6px 0; font-weight: 700;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Treatment:</td>
              <td style="padding: 6px 0;">${data.serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">New Time:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #1d4ed8;">${data.newDate} at ${data.newTime}</td>
            </tr>
            ${data.oldDate ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Previous:</td>
              <td style="padding: 6px 0; text-decoration: line-through; color: #94a3b8;">${data.oldDate} at ${data.oldTime}</td>
            </tr>
            ` : ""}
          </table>
        </div>
      </div>
    </div>
  `

  return createDoctorNotification({
    staffId: data.staffId,
    appointmentId: data.appointmentId,
    type: "APPOINTMENT_RESCHEDULED",
    title,
    message,
    metadata: { ...data },
    emailSubject: `[Rescheduled] ${data.customerName} - New Time: ${data.newDate} at ${data.newTime}`,
    emailHtml,
  })
}
