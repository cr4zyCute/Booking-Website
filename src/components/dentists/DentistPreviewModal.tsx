import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  GraduationCap,
  Award,
  Globe,
  Clock,
  ArrowRight,
  User,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface DentistModalData {
  id: string
  name: string
  slug: string
  photo?: string | null
  images?: string[]
  role?: string | null
  specialty?: string | null
  specialties?: string[]
  bio?: string | null
  biography?: string | null
  credentials?: string[]
  education?: string[]
  experience?: string | null
  languages?: string[]
  acceptingAppointments?: boolean
  services?: Array<{
    id: string
    service?: {
      id: string
      name: string
      slug: string
      price?: number
      durationMinutes?: number
    }
  }>
}

interface DentistPreviewModalProps {
  dentist: DentistModalData | null
  isOpen: boolean
  onClose: () => void
  terminologyStaffSingular?: string
}

export function DentistPreviewModal({
  dentist,
  isOpen,
  onClose,
  terminologyStaffSingular = "Dentist",
}: DentistPreviewModalProps) {
  const navigate = useNavigate()

  // Prevent background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!dentist) return null

  const doctorPhoto = dentist.photo || (dentist.images && dentist.images.length > 0 ? dentist.images[0] : null)
  const bioText = dentist.biography || dentist.bio || "Dedicated dental specialist providing personalized, gentle care."
  const specialtiesList = dentist.specialties && dentist.specialties.length > 0
    ? dentist.specialties
    : (dentist.specialty ? [dentist.specialty] : ["General Dentistry"])
  const servicesList = dentist.services?.map(s => s.service).filter(Boolean) || []
  const languagesList = dentist.languages && dentist.languages.length > 0 ? dentist.languages : ["English", "Filipino"]
  const credentialsList = dentist.credentials && dentist.credentials.length > 0 ? dentist.credentials : []
  const educationList = dentist.education && dentist.education.length > 0 ? dentist.education : []

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-dentist-title"
            className="relative w-full max-w-3xl max-h-[90vh] bg-[rgb(var(--card))] rounded-[calc(var(--radius)+6px)] border border-[rgb(var(--border))] shadow-2xl overflow-hidden flex flex-col z-10 my-auto text-[rgb(var(--foreground))]"
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))] flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" />
                  {terminologyStaffSingular} Profile Preview
                </span>
                {dentist.role && (
                  <Badge variant="secondary" className="text-[11px] px-2 py-0.5 font-medium">
                    {dentist.role}
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Doctor Portrait & Quick Credentials */}
                <div className="md:col-span-5 space-y-4">
                  <div className="aspect-[4/5] rounded-[var(--radius)] overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--muted))] relative shadow-sm">
                    {doctorPhoto ? (
                      <img
                        src={doctorPhoto}
                        alt={dentist.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--muted-foreground))] bg-gradient-to-br from-[rgb(var(--muted)/0.4)] to-[rgb(var(--muted))] p-6 text-center">
                        <User className="h-16 w-16 mb-2 opacity-30 text-[rgb(var(--primary))]" />
                        <span className="text-xs font-medium">{dentist.name}</span>
                      </div>
                    )}

                    {/* Verified Specialist Badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                        <ShieldCheck className="h-3 w-3 text-cyan-300" />
                        Verified Specialist
                      </span>
                    </div>

                    {dentist.experience && (
                      <div className="absolute bottom-3 inset-x-3 pointer-events-none">
                        <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/15 flex items-center justify-between">
                          <span className="text-white/75 text-[11px]">Experience</span>
                          <span className="font-semibold text-cyan-300">{dentist.experience}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Languages pill */}
                  <div className="p-3 bg-[rgb(var(--muted)/0.3)] rounded-[var(--radius)] border border-[rgb(var(--border))] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))] font-semibold uppercase text-[10px] tracking-wider">
                      <Globe className="h-3 w-3 text-[rgb(var(--primary))]" />
                      Languages Spoken
                    </div>
                    <p className="font-medium text-[rgb(var(--foreground))]">
                      {languagesList.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Right: Info, Specialties, Bio, CTA */}
                <div className="md:col-span-7 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2
                        id="modal-dentist-title"
                        className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--foreground))] leading-tight"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {dentist.name}
                      </h2>
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--primary))] mt-1">
                      {dentist.specialty || "Dental Specialist"} • {dentist.role || "Associate Dentist"}
                    </p>
                  </div>

                  {/* Clinical Specialties Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[rgb(var(--muted-foreground))] uppercase font-bold tracking-wider block">
                      Clinical Focus & Specialties
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {specialtiesList.map((spec, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs bg-[rgb(var(--muted)/0.4)] border-[rgb(var(--border))] font-medium py-0.5"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1 text-[rgb(var(--primary))]" />
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[rgb(var(--muted-foreground))] uppercase font-bold tracking-wider block">
                      About the Specialist
                    </span>
                    <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
                      {bioText}
                    </p>
                  </div>

                  {/* Education / Credentials if available */}
                  {(credentialsList.length > 0 || educationList.length > 0) && (
                    <div className="space-y-2 pt-1 border-t border-[rgb(var(--border))]">
                      {credentialsList.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] text-[rgb(var(--muted-foreground))] uppercase font-bold tracking-wider flex items-center gap-1">
                            <Award className="h-3 w-3 text-[rgb(var(--primary))]" />
                            Credentials & Certifications
                          </span>
                          <ul className="text-xs text-[rgb(var(--foreground))] space-y-0.5 list-disc list-inside">
                            {credentialsList.slice(0, 2).map((c, i) => (
                              <li key={i} className="truncate">{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Services / Treatments */}
                  {servicesList.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-[rgb(var(--border))]">
                      <span className="text-[11px] text-[rgb(var(--muted-foreground))] uppercase font-bold tracking-wider block">
                        Treatments Provided by {dentist.name.split(" ")[1] || dentist.name}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {servicesList.slice(0, 4).map((svc: any) => (
                          <Link
                            key={svc.id}
                            to={`/treatments/${svc.slug}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-[rgb(var(--muted)/0.5)] hover:bg-[rgb(var(--primary)/0.15)] text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] border border-[rgb(var(--border))] transition-colors"
                          >
                            <Sparkles className="h-2.5 w-2.5 text-[rgb(var(--primary))]" />
                            {svc.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booking & Full Profile CTA Buttons */}
                  <div className="pt-3 border-t border-[rgb(var(--border))] flex flex-col sm:flex-row items-center gap-2.5">
                    <Link
                      to={`/booking?staff=${dentist.slug || dentist.id}`}
                      onClick={onClose}
                      className="w-full sm:flex-1 block"
                    >
                      <Button
                        size="default"
                        className="w-full gap-2 font-semibold text-sm shadow-md shadow-[rgb(var(--primary)/0.25)] h-10"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Book with {dentist.name.split(" ")[0]} {dentist.name.split(" ")[1] || ""}
                      </Button>
                    </Link>

                    <Link
                      to={`/dentists/${dentist.slug || dentist.id}`}
                      onClick={onClose}
                      className="w-full sm:w-auto block"
                    >
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full gap-1.5 text-xs font-semibold h-10 px-4"
                      >
                        View Full Profile
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
