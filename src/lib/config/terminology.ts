import type { BusinessType } from "@prisma/client"

export interface TerminologyConfig {
  staffLabel: string
  staffSingular: string
  serviceLabel: string
  serviceSingular: string
  appointmentLabel: string
  appointmentSingular: string
  customerLabel: string
  customerSingular: string
}

const DEFAULTS: Record<BusinessType, TerminologyConfig> = {
  MEDICAL: {
    staffLabel: "Doctors",
    staffSingular: "Doctor",
    serviceLabel: "Services",
    serviceSingular: "Service",
    appointmentLabel: "Appointments",
    appointmentSingular: "Appointment",
    customerLabel: "Patients",
    customerSingular: "Patient",
  },
  DENTAL: {
    staffLabel: "Dentists",
    staffSingular: "Dentist",
    serviceLabel: "Treatments",
    serviceSingular: "Treatment",
    appointmentLabel: "Appointments",
    appointmentSingular: "Appointment",
    customerLabel: "Patients",
    customerSingular: "Patient",
  },
  SALON: {
    staffLabel: "Stylists",
    staffSingular: "Stylist",
    serviceLabel: "Services",
    serviceSingular: "Service",
    appointmentLabel: "Bookings",
    appointmentSingular: "Booking",
    customerLabel: "Clients",
    customerSingular: "Client",
  },
  BARBERSHOP: {
    staffLabel: "Barbers",
    staffSingular: "Barber",
    serviceLabel: "Services",
    serviceSingular: "Service",
    appointmentLabel: "Bookings",
    appointmentSingular: "Booking",
    customerLabel: "Clients",
    customerSingular: "Client",
  },
  SPA: {
    staffLabel: "Therapists",
    staffSingular: "Therapist",
    serviceLabel: "Treatments",
    serviceSingular: "Treatment",
    appointmentLabel: "Sessions",
    appointmentSingular: "Session",
    customerLabel: "Guests",
    customerSingular: "Guest",
  },
  MASSAGE: {
    staffLabel: "Therapists",
    staffSingular: "Therapist",
    serviceLabel: "Services",
    serviceSingular: "Service",
    appointmentLabel: "Sessions",
    appointmentSingular: "Session",
    customerLabel: "Clients",
    customerSingular: "Client",
  },
  FITNESS: {
    staffLabel: "Trainers",
    staffSingular: "Trainer",
    serviceLabel: "Classes",
    serviceSingular: "Class",
    appointmentLabel: "Sessions",
    appointmentSingular: "Session",
    customerLabel: "Members",
    customerSingular: "Member",
  },
  PERSONAL_TRAINING: {
    staffLabel: "Trainers",
    staffSingular: "Trainer",
    serviceLabel: "Programs",
    serviceSingular: "Program",
    appointmentLabel: "Sessions",
    appointmentSingular: "Session",
    customerLabel: "Clients",
    customerSingular: "Client",
  },
  CONSULTATION: {
    staffLabel: "Consultants",
    staffSingular: "Consultant",
    serviceLabel: "Services",
    serviceSingular: "Service",
    appointmentLabel: "Consultations",
    appointmentSingular: "Consultation",
    customerLabel: "Clients",
    customerSingular: "Client",
  },
  PHOTOGRAPHY: {
    staffLabel: "Photographers",
    staffSingular: "Photographer",
    serviceLabel: "Sessions",
    serviceSingular: "Session",
    appointmentLabel: "Bookings",
    appointmentSingular: "Booking",
    customerLabel: "Clients",
    customerSingular: "Client",
  },
  REPAIR: {
    staffLabel: "Technicians",
    staffSingular: "Technician",
    serviceLabel: "Services",
    serviceSingular: "Service",
    appointmentLabel: "Appointments",
    appointmentSingular: "Appointment",
    customerLabel: "Customers",
    customerSingular: "Customer",
  },
  OTHER: {
    staffLabel: "Staff",
    staffSingular: "Staff Member",
    serviceLabel: "Services",
    serviceSingular: "Service",
    appointmentLabel: "Appointments",
    appointmentSingular: "Appointment",
    customerLabel: "Customers",
    customerSingular: "Customer",
  },
}

export function getDefaultTerminology(businessType: BusinessType): TerminologyConfig {
  return DEFAULTS[businessType] ?? DEFAULTS.OTHER
}

export function mergeTerminology(
  defaults: TerminologyConfig,
  overrides: Partial<TerminologyConfig>
): TerminologyConfig {
  return { ...defaults, ...overrides }
}
