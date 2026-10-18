import { prisma } from "@/lib/db/prisma"
import { getDefaultTerminology } from "@/lib/config/terminology"
import type { Business, BusinessSettings, BusinessTerminology, FeatureSettings, ThemeSettings } from "@prisma/client"

export interface BusinessContext {
  business: Business
  settings: BusinessSettings | null
  terminology: BusinessTerminology
  features: FeatureSettings | null
  theme: ThemeSettings | null
}

const DEFAULT_FALLBACK_BUSINESS: BusinessContext = {
  business: {
    id: "demo-clinic",
    name: "Veridian Dental Studio",
    type: "DENTAL",
    description: "A premium dental care studio offering comprehensive dental services in a comfortable, modern environment. We combine clinical excellence with a patient-first approach.",
    logo: null,
    favicon: null,
    address: "2F Veridian Building, 123 Ayala Avenue, Makati City, Metro Manila",
    latitude: 14.5547,
    longitude: 121.0244,
    mapZoom: 15,
    phone: "+63 2 8123 4567",
    email: "hello@veridian.com",
    website: "https://veridian.com",
    timezone: "Asia/Manila",
    currency: "PHP",
    currencySymbol: "₱",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  settings: {
    id: "demo-settings",
    businessId: "demo-clinic",
    minNoticeHours: 2,
    maxBookingDays: 90,
    slotIntervalMinutes: 15,
    defaultBufferMinutes: 10,
    cancellationWindowHours: 24,
    allowSameDayBooking: true,
    allowCustomerCancel: true,
    allowCustomerReschedule: true,
    maxDailyAppointments: null,
    sendConfirmationEmail: false,
    sendReminderEmail: false,
    reminderHoursBefore: 24,
    adminNotificationEmail: null,
    smtpHost: null,
    smtpPort: null,
    smtpUser: null,
    smtpPassword: null,
    smtpFromEmail: null,
    smtpFromName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  terminology: {
    id: "demo-terminology",
    businessId: "demo-clinic",
    staffLabel: "Dentists",
    staffSingular: "Dentist",
    serviceLabel: "Treatments",
    serviceSingular: "Treatment",
    appointmentLabel: "Appointments",
    appointmentSingular: "Appointment",
    customerLabel: "Patients",
    customerSingular: "Patient",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  features: {
    id: "demo-features",
    businessId: "demo-clinic",
    onlineBooking: true,
    staffProfiles: true,
    services: true,
    testimonials: true,
    faq: true,
    blog: false,
    gallery: false,
    contactForm: true,
    customerAccounts: false,
    payments: false,
    notifications: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  theme: {
    id: "demo-theme",
    businessId: "demo-clinic",
    theme: "CLINICAL_SWISS",
    primaryColor: null,
    secondaryColor: null,
    accentColor: null,
    headingFont: null,
    bodyFont: null,
    borderRadius: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

let _cache: BusinessContext | null = null
let _cacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export async function getBusinessContext(): Promise<BusinessContext | null> {
  const now = Date.now()
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache

  try {
    const business = await prisma.business.findFirst({
      include: {
        settings: true,
        terminology: true,
        featureSettings: true,
        themeSettings: true,
      },
    })

    if (!business) return DEFAULT_FALLBACK_BUSINESS

    const defaults = getDefaultTerminology(business.type)
    const terminology: BusinessTerminology = business.terminology ?? {
      id: "default",
      businessId: business.id,
      staffLabel: defaults.staffLabel,
      staffSingular: defaults.staffSingular,
      serviceLabel: defaults.serviceLabel,
      serviceSingular: defaults.serviceSingular,
      appointmentLabel: defaults.appointmentLabel,
      appointmentSingular: defaults.appointmentSingular,
      customerLabel: defaults.customerLabel,
      customerSingular: defaults.customerSingular,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    _cache = {
      business,
      settings: business.settings,
      terminology,
      features: business.featureSettings,
      theme: business.themeSettings,
    }
    _cacheTime = now

    return _cache
  } catch (error) {
    return DEFAULT_FALLBACK_BUSINESS
  }
}

export function invalidateBusinessCache() {
  _cache = null
  _cacheTime = 0
}