import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Clock,
  ShieldCheck,
  GraduationCap,
  Award,
  Globe,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Loader2,
  CalendarCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useBusiness } from "@/context/BusinessContext"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { DEFAULT_STAFF } from "@/lib/defaultData"

export function DentistDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { business, terminology } = useBusiness()

  const [dentist, setDentist] = useState<any>(() => {
    return DEFAULT_STAFF.find(d => d.slug === slug || d.id === slug) || null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const staffLabel = terminology?.staffLabel || "Dentists"
  const staffSingular = terminology?.staffSingular || "Dentist"
  const currencySymbol = business?.currencySymbol || "₱"

  useEffect(() => {
    if (!slug) return

    fetch(`/api/public/dentists/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Dentist profile not found")
        return res.json()
      })
      .then(data => {
        const doc = data.dentist || data.staff
        if (doc) {
          setDentist(doc)
        }
      })
      .catch(err => {
        const fallback = DEFAULT_STAFF.find(d => d.slug === slug || d.id === slug)
        if (fallback) {
          setDentist(fallback)
        } else {
          setError("Unable to load dentist profile")
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[rgb(var(--background))]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
        <p className="text-xs text-[rgb(var(--muted-foreground))]">Loading clinical profile...</p>
      </div>
    )
  }

  if (error || !dentist) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[rgb(var(--background))]">
        <div className="h-16 w-16 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))]">
          <Stethoscope className="h-8 w-8 opacity-40 text-[rgb(var(--primary))]" />
        </div>
        <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">{error || "Dentist Not Found"}</h2>
        <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-md">
          The requested {staffSingular.toLowerCase()} profile could not be located. They may have updated their schedule or profile link.
        </p>
        <Link to="/dentists">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to All {staffLabel}
          </Button>
        </Link>
      </div>
    )
  }

  const doctorPhoto = dentist.photo || (dentist.images && dentist.images.length > 0 ? dentist.images[0] : null)
  const roleTitle = dentist.role || "Dental Specialist"
  const primarySpecialty = dentist.specialty || "General Dentistry"
  const bioText = dentist.biography || dentist.bio || "Dedicated dental specialist providing personalized, gentle care."
  const specialtiesList: string[] = dentist.specialties && dentist.specialties.length > 0
    ? dentist.specialties
    : (dentist.specialty ? [dentist.specialty] : ["General Dentistry"])
  const servicesList = dentist.services?.map((s: any) => s.service).filter(Boolean) || []
  const credentialsList: string[] = dentist.credentials && dentist.credentials.length > 0 ? dentist.credentials : []
  const educationList: string[] = dentist.education && dentist.education.length > 0 ? dentist.education : []
  const languagesList: string[] = dentist.languages && dentist.languages.length > 0 ? dentist.languages : ["English", "Filipino"]

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const schedulesList = dentist.schedules || []

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] pb-20">
      {/* Breadcrumb & Top Bar */}
      <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.25)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))] flex-wrap">
            <Link to="/" className="hover:text-[rgb(var(--primary))] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/dentists" className="hover:text-[rgb(var(--primary))] transition-colors">{staffLabel}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-[rgb(var(--foreground))]">{dentist.name}</span>
          </div>

          <Link to="/dentists" className="hidden sm:inline-flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            All {staffLabel}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* 1. Top Hero Profile Card */}
        <div className="bg-[rgb(var(--card))] rounded-[calc(var(--radius)+4px)] border border-[rgb(var(--border))] p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Portrait & Quick Badges */}
            <div className="lg:col-span-4 space-y-4">
              <div className="aspect-[4/5] rounded-[var(--radius)] overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--muted))] relative shadow-sm">
                {doctorPhoto ? (
                  <img
                    src={doctorPhoto}
                    alt={dentist.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--muted-foreground))] bg-gradient-to-br from-[rgb(var(--muted)/0.4)] to-[rgb(var(--muted))] p-6 text-center">
                    <User className="h-20 w-20 mb-2 opacity-30 text-[rgb(var(--primary))]" />
                    <span className="text-xs font-medium">{dentist.name}</span>
                  </div>
                )}

                {/* Verified Specialist Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                    Verified Specialist
                  </span>
                </div>
              </div>

              {/* Quick Contact Info */}
              {(dentist.email || dentist.phone) && (
                <div className="p-3.5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.2)] text-xs space-y-1.5">
                  {dentist.email && (
                    <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
                      <Mail className="h-3.5 w-3.5 text-[rgb(var(--primary))] shrink-0" />
                      <span className="truncate">{dentist.email}</span>
                    </div>
                  )}
                  {dentist.phone && (
                    <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
                      <Phone className="h-3.5 w-3.5 text-[rgb(var(--primary))] shrink-0" />
                      <span>{dentist.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Full Header Details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                    {roleTitle}
                  </Badge>
                  <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium">
                    {business.name}
                  </span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[rgb(var(--foreground))] tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {dentist.name}
                </h1>

                <p className="text-base sm:text-lg font-semibold text-[rgb(var(--primary))]">
                  {primarySpecialty}
                </p>
              </div>

              {/* Quick Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Experience</span>
                  <div className="text-sm font-bold text-[rgb(var(--foreground))]">{dentist.experience || "10+ Years"}</div>
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Primary Field</span>
                  <div className="text-sm font-bold text-[rgb(var(--foreground))] truncate">{primarySpecialty}</div>
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Languages</span>
                  <div className="text-sm font-bold text-[rgb(var(--foreground))] truncate">{languagesList.slice(0, 2).join(", ")}</div>
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Status</span>
                  {dentist.acceptingAppointments !== false ? (
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Accepting Appointments
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Not Accepting Appointments
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {dentist.acceptingAppointments !== false ? (
                  <Link
                    to={`/booking?staff=${dentist.slug || dentist.id}`}
                    className="w-full sm:w-auto block"
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto gap-2 px-8 font-bold text-sm h-12 shadow-lg shadow-[rgb(var(--primary)/0.25)]"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Book Appointment with Dr. {dentist.name.split(" ")[1] || dentist.name}
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-1 w-full sm:w-auto">
                    <Button
                      size="lg"
                      disabled
                      className="w-full sm:w-auto gap-2 px-8 font-bold text-sm h-12 opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Currently Not Accepting New Appointments
                    </Button>
                    <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                      Dr. {dentist.name.split(" ")[1] || dentist.name} is temporarily not accepting online bookings. Please check back later or choose another dentist.
                    </p>
                  </div>
                )}

                <a
                  href="#schedule"
                  className="text-xs font-semibold text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                >
                  View Weekly Hours ↓
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section: Bio & Details on Left, Schedule & Services on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Biography, Specialties, Education, Credentials */}
          <div className="lg:col-span-8 space-y-8">
            {/* About the Specialist */}
            <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
                <Stethoscope className="h-5 w-5 text-[rgb(var(--primary))]" />
                <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                  About {dentist.name}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed whitespace-pre-line">
                {bioText}
              </p>
            </section>

            {/* Clinical Specialties & Areas of Care */}
            <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
                <Sparkles className="h-5 w-5 text-[rgb(var(--primary))]" />
                <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                  Areas of Clinical Expertise
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {specialtiesList.map((spec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.2)] flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-[rgb(var(--foreground))]">{spec}</h3>
                      <p className="text-[11px] text-[rgb(var(--muted-foreground))] mt-0.5">
                        Comprehensive clinical evaluation & personalized treatment protocols.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education & Credentials */}
            {(credentialsList.length > 0 || educationList.length > 0) && (
              <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
                  <GraduationCap className="h-5 w-5 text-[rgb(var(--primary))]" />
                  <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                    Education & Credentials
                  </h2>
                </div>

                {educationList.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block">
                      Academic Training & Degrees
                    </span>
                    <ul className="space-y-2">
                      {educationList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
                          <GraduationCap className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {credentialsList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[rgb(var(--border))]">
                    <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block">
                      Board Certifications & Memberships
                    </span>
                    <ul className="space-y-2">
                      {credentialsList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
                          <Award className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Treatments & Services Provided */}
            {servicesList.length > 0 && (
              <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[rgb(var(--primary))]" />
                    <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                      Treatments Provided by {dentist.name}
                    </h2>
                  </div>
                  <Link to="/treatments" className="text-xs text-[rgb(var(--primary))] font-semibold hover:underline">
                    View All Treatments →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {servicesList.map((svc: any) => (
                    <div
                      key={svc.id}
                      className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.15)] flex flex-col justify-between space-y-3 hover:border-[rgb(var(--primary)/0.4)] transition-all"
                    >
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-[rgb(var(--foreground))]">
                          {svc.name}
                        </h3>
                        {svc.shortDescription && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))] line-clamp-2">
                            {svc.shortDescription}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[rgb(var(--border))] flex items-center justify-between">
                        <div className="text-xs font-bold text-[rgb(var(--primary))]">
                          {formatCurrency(Number(svc.price), currencySymbol)}
                        </div>

                        <Link
                          to={`/booking?service=${svc.slug}&staff=${dentist.slug || dentist.id}`}
                          className="text-xs font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] inline-flex items-center gap-1"
                        >
                          Book Treatment
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Working Schedule & Direct Appointment Booking Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Weekly Schedule */}
            <div id="schedule" className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm scroll-mt-20">
              <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
                <Clock className="h-5 w-5 text-[rgb(var(--primary))]" />
                <h3 className="font-bold text-base text-[rgb(var(--foreground))]">
                  Weekly Operating Schedule
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {daysOfWeek.map((dayName, idx) => {
                  const schedule = schedulesList.find((s: any) => s.dayOfWeek === idx)
                  const isWorking = schedule ? schedule.isWorking : idx >= 1 && idx <= 5
                  const shifts = schedule?.shifts || []

                  return (
                    <div
                      key={dayName}
                      className={`flex items-center justify-between py-1.5 px-2.5 rounded ${
                        isWorking ? "bg-[rgb(var(--muted)/0.3)]" : "opacity-50"
                      }`}
                    >
                      <span className="font-semibold text-[rgb(var(--foreground))]">{dayName}</span>
                      {isWorking ? (
                        <span className="font-medium text-[rgb(var(--primary))]">
                          {shifts.length > 0
                            ? shifts.map((sh: any) => `${sh.startTime} - ${sh.endTime}`).join(", ")
                            : "09:00 AM – 05:00 PM"}
                        </span>
                      ) : (
                        <span className="text-[rgb(var(--muted-foreground))]">Off Clinic</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="pt-3 border-t border-[rgb(var(--border))]">
                <Link
                  to={`/booking?staff=${dentist.slug || dentist.id}`}
                  className="block w-full"
                >
                  <Button
                    size="default"
                    className="w-full gap-2 font-semibold text-xs h-10 shadow-sm"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Select Appointment Time Slot
                  </Button>
                </Link>
              </div>
            </div>

            {/* Clinic Notice */}
            <div className="bg-[rgb(var(--muted)/0.3)] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 space-y-2 text-xs text-[rgb(var(--muted-foreground))]">
              <div className="font-bold text-[rgb(var(--foreground))] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--primary))]" />
                Patient Care Guarantee
              </div>
              <p className="leading-relaxed">
                Consultations include full digital diagnostics and personalized treatment roadmaps. Appointments can be rescheduled online up to 24 hours prior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DentistDetailPage
