import React, { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useBusiness } from "@/context/BusinessContext"
import { BookingFlow, BookingService, BookingStaff } from "@/components/booking/BookingFlow"
import { CalendarOff, User, Phone, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const DEMO_BOOKING_SERVICES: BookingService[] = [
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
  {
    id: "s5",
    name: "Orthodontic Consultation",
    slug: "orthodontic-consultation",
    description: "Specialized orthodontic evaluation for smile alignment and bite correction.",
    shortDescription: "Assessment for braces, clear aligners, and teeth alignment plans.",
    image: null,
    price: 1000,
    durationMinutes: 30,
    bufferAfterMinutes: 10,
    category: { name: "Orthodontics" },
  },
  {
    id: "s6",
    name: "Dental Implant Consultation",
    slug: "dental-implant-consultation",
    description: "3D imaging and candidacy evaluation for permanent tooth replacement.",
    shortDescription: "3D imaging and candidacy evaluation for permanent tooth replacement.",
    image: null,
    price: 2000,
    durationMinutes: 60,
    bufferAfterMinutes: 10,
    category: { name: "Implantology" },
  },
]

const DEMO_BOOKING_STAFF: BookingStaff[] = [
  {
    id: "st1",
    name: "Dr. Maria Santos",
    slug: "dr-maria-santos",
    photo: "/uploads/dentists/dr-maria-santos.jpg",
    specialty: "General & Preventive Dentistry",
    role: "Lead Dentist",
    services: [
      { service: { id: "s1", name: "Dental Consultation" } },
      { service: { id: "s2", name: "Teeth Cleaning (Prophylaxis)" } },
      { service: { id: "s3", name: "Dental Filling" } },
    ],
  },
  {
    id: "st2",
    name: "Dr. Daniel Cruz",
    slug: "dr-daniel-cruz",
    photo: "/uploads/dentists/dr-daniel-cruz.jpg",
    specialty: "Orthodontics & Clear Aligners",
    role: "Orthodontist",
    services: [
      { service: { id: "s1", name: "Dental Consultation" } },
      { service: { id: "s5", name: "Orthodontic Consultation" } },
    ],
  },
  {
    id: "st3",
    name: "Dr. Sofia Reyes",
    slug: "dr-sofia-reyes",
    photo: "/uploads/dentists/dr-sofia-reyes.jpg",
    specialty: "Aesthetic Dentistry & Whitening",
    role: "Cosmetic Dentist",
    services: [
      { service: { id: "s1", name: "Dental Consultation" } },
      { service: { id: "s4", name: "In-Office Teeth Whitening" } },
    ],
  },
  {
    id: "st4",
    name: "Dr. James Navarro",
    slug: "dr-james-navarro",
    photo: "/uploads/dentists/dr-james-navarro.jpg",
    specialty: "Oral Surgery & Implants",
    role: "Oral Surgeon",
    services: [
      { service: { id: "s1", name: "Dental Consultation" } },
      { service: { id: "s6", name: "Dental Implant Consultation" } },
    ],
  },
]

export function BookingPage() {
  const { business, settings, terminology } = useBusiness()
  const [searchParams] = useSearchParams()
  const preselectedServiceId = searchParams.get("service") || searchParams.get("treatment")
  const preselectedStaffId = searchParams.get("staff") || searchParams.get("dentist") || searchParams.get("doctor")

  const [services, setServices] = useState<BookingService[]>(DEMO_BOOKING_SERVICES)
  const [staff, setStaff] = useState<BookingStaff[]>(DEMO_BOOKING_STAFF)
  const [acceptingBookings, setAcceptingBookings] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/booking/services-staff")
      .then(res => res.json())
      .then(data => {
        if (data.services && data.services.length > 0) setServices(data.services)
        if (data.staff && data.staff.length > 0) setStaff(data.staff)
        if (data.acceptingBookings !== undefined) {
          setAcceptingBookings(data.acceptingBookings)
        }
      })
      .catch(err => console.warn("Using fallback booking data:", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  // If new patient bookings are paused by the admin
  if (!acceptingBookings) {
    return (
      <div className="py-16 sm:py-24 bg-[rgb(var(--background))]">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <CalendarOff className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Online Schedule Notice
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))] tracking-tight">
              New Patient Bookings Currently Paused
            </h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-lg mx-auto leading-relaxed">
              {business.name} is not accepting new online bookings at this time. Existing patients can view and manage their scheduled appointments in the Patient Portal.
            </p>
          </div>

          <div className="p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] max-w-md mx-auto space-y-3 text-left shadow-sm">
            <p className="text-xs font-semibold text-[rgb(var(--foreground))]">
              What you can do:
            </p>
            <ul className="text-xs text-[rgb(var(--muted-foreground))] space-y-2 list-disc pl-4">
              <li>Log in to the <strong>Patient Portal</strong> to review or manage existing appointments.</li>
              <li>Reach out directly via our <strong>Contact Page</strong> for urgent dental concerns.</li>
              <li>Browse our treatment catalog on the <strong>Services</strong> page.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/portal" className="w-full sm:w-auto">
              <Button size="default" className="w-full sm:w-auto gap-2">
                <User className="h-4 w-4" />
                Access Patient Portal
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="default" className="w-full sm:w-auto gap-2">
                <Phone className="h-4 w-4" />
                Contact Clinic
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12 bg-[rgb(var(--background))] pb-28 lg:pb-16 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <BookingFlow
          services={services}
          staff={staff}
          terminology={terminology}
          business={business}
          preselectedServiceId={preselectedServiceId}
          preselectedStaffId={preselectedStaffId}
        />
      </div>
    </div>
  )
}
