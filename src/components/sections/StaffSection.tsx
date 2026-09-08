import React, { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Stethoscope, ShieldCheck, Eye, CalendarDays, Award, Globe, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DentistPreviewModal, DentistModalData } from "@/components/dentists/DentistPreviewModal"

export type DentistCardStyle = "clinical" | "editorial" | "overlay" | "minimal"

export interface StaffMember {
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
  services?: any[]
  isActive?: boolean
  acceptingAppointments?: boolean
  sortOrder?: number
}

interface StaffSectionProps {
  staff: StaffMember[]
  staffLabel: string
  content: Record<string, any> | null
}

export function DentistCard({
  dentist,
  cardStyle = "clinical",
  onClick,
  isPreview = false,
}: {
  dentist: StaffMember
  cardStyle?: DentistCardStyle
  onClick?: (dentist: StaffMember, e: React.MouseEvent) => void
  isPreview?: boolean
}) {
  const [touchRevealed, setTouchRevealed] = useState(false)
  const photoUrl = dentist.photo || (dentist.images && dentist.images.length > 0 ? dentist.images[0] : null)
  const roleTitle = dentist.role || "Dental Specialist"
  const primarySpecialty = dentist.specialty || (dentist.specialties && dentist.specialties.length > 0 ? dentist.specialties[0] : "General Dentistry")
  const bioSnippet = dentist.bio || dentist.biography || "Dedicated dental specialist providing personalized, high-quality oral care."
  const languages = dentist.languages && Array.isArray(dentist.languages) && dentist.languages.length > 0 ? dentist.languages.slice(0, 2) : []
  const isAccepting = dentist.acceptingAppointments !== false

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault()
      setTouchRevealed(!touchRevealed)
      return
    }
    if (window.matchMedia("(hover: none)").matches && !touchRevealed && cardStyle === "overlay") {
      e.preventDefault()
      setTouchRevealed(true)
      return
    }
    if (onClick) {
      e.preventDefault()
      onClick(dentist, e)
    }
  }

  // =========================================================================
  // STYLE 2: EDITORIAL (Premium Luxury Composition)
  // =========================================================================
  if (cardStyle === "editorial") {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View clinical profile of ${dentist.name}`}
        className="group relative bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden flex flex-col justify-between hover:border-[rgb(var(--primary)/0.6)] hover:shadow-xl transition-all duration-300 cursor-pointer select-none"
      >
        {/* Top Portrait with Editorial Frame */}
        <div className="relative aspect-[3/3.8] overflow-hidden bg-slate-900">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={dentist.name}
              className="object-cover object-top w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Stethoscope className="h-12 w-12 opacity-30 text-[rgb(var(--primary))]" />
            </div>
          )}

          {/* Editorial Top Accent Badge */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-bold border border-white/20 shadow-xs">
              <Sparkles className="h-2.5 w-2.5 text-amber-300 shrink-0" />
              Specialist
            </span>
            {dentist.experience && (
              <span
                title={dentist.experience}
                className="shrink min-w-0 max-w-[58%] inline-flex items-center px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white/90 text-[9px] font-medium border border-white/15 shadow-xs"
              >
                <span className="truncate">{dentist.experience}</span>
              </span>
            )}
          </div>

          {/* Subtle bottom gradient on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

          {/* Overlay text on lower image area */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-[10px] uppercase tracking-widest text-cyan-300 font-semibold drop-shadow-sm">
              {primarySpecialty}
            </p>
            <h3 className="font-bold text-base text-white tracking-tight leading-snug drop-shadow-sm">
              {dentist.name}
            </h3>
          </div>
        </div>

        {/* Editorial Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[rgb(var(--card))]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[rgb(var(--muted-foreground))]">
              <span className="font-medium">{roleTitle}</span>
              {languages.length > 0 && (
                <span className="text-[10px] text-[rgb(var(--muted-foreground))] flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {languages.join(", ")}
                </span>
              )}
            </div>

            {bioSnippet && (
              <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2">
                {bioSnippet}
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[rgb(var(--border))] flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[rgb(var(--primary))] group-hover:underline inline-flex items-center gap-1">
              View Profile
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>

            {isAccepting ? (
              <Link
                to={`/booking?staff=${dentist.slug || dentist.id}`}
                onClick={(e) => {
                  if (isPreview) e.preventDefault()
                  e.stopPropagation()
                }}
                className="text-[11px] font-semibold text-[rgb(var(--primary-foreground))] bg-[rgb(var(--primary))] hover:opacity-90 px-3 py-1 rounded transition-opacity shadow-xs"
              >
                Book Now
              </Link>
            ) : (
              <span className="text-[10px] font-medium text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted)/0.6)] px-2.5 py-1 rounded">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STYLE 3: PROFILE OVERLAY (Cinematic Full-Bleed Atmospheric Card)
  // =========================================================================
  if (cardStyle === "overlay") {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View clinical profile of ${dentist.name}`}
        className="group relative rounded-[var(--radius)] overflow-hidden border border-[rgb(var(--border))] min-h-[380px] flex flex-col justify-end shadow-sm transition-all duration-500 hover:shadow-xl hover:border-[rgb(var(--primary)/0.6)] cursor-pointer select-none bg-slate-950"
      >
        {/* Full-bleed Portrait Background Image */}
        {photoUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-top transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url('${photoUrl}')` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-600">
            <Stethoscope className="h-16 w-16 opacity-30 text-[rgb(var(--primary))]" />
          </div>
        )}

        {/* Top Verified Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/20 shadow-sm">
            <ShieldCheck className="h-3 w-3 text-cyan-300" />
            Verified
          </span>
        </div>

        {/* Seamless Progressive Backdrop Blur Gradient */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out backdrop-blur-[10px]"
          style={{
            maskImage: touchRevealed
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.4) 70%, transparent 85%)"
              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 22%, rgba(0,0,0,0.3) 35%, transparent 45%)",
            WebkitMaskImage: touchRevealed
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.4) 70%, transparent 85%)"
              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 22%, rgba(0,0,0,0.3) 35%, transparent 45%)",
          }}
        />

        {/* Darkening Gradient Vignette */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ease-out ${
            touchRevealed
              ? "bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent opacity-95"
              : "bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-100 group-hover:bg-gradient-to-t group-hover:from-slate-950/95 group-hover:via-slate-950/70 group-hover:to-transparent"
          }`}
        />

        {/* Content Container */}
        <div className="relative z-10 p-5 flex flex-col justify-end text-white">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-300 drop-shadow-sm">
              {primarySpecialty}
            </span>
            <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-cyan-200 transition-colors duration-300 leading-snug drop-shadow-sm">
              {dentist.name}
            </h3>
            <p className="text-xs text-white/70 font-medium">
              {roleTitle}
            </p>
          </div>

          {/* Expandable Lower Details on Hover/Touch */}
          <div
            className={`grid transition-all duration-400 ease-out ${
              touchRevealed
                ? "grid-rows-[1fr] opacity-100 mt-2.5"
                : "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:mt-2.5"
            }`}
          >
            <div className="overflow-hidden space-y-3 pt-1">
              {bioSnippet && (
                <p className="text-xs text-white/90 leading-relaxed line-clamp-2 drop-shadow-xs">
                  {bioSnippet}
                </p>
              )}

              <div className="flex items-center justify-between pt-2.5 border-t border-white/15">
                <span className="text-xs font-semibold text-cyan-300 group-hover:underline inline-flex items-center gap-1">
                  View Profile
                  <ArrowRight className="h-3 w-3" />
                </span>

                {isAccepting ? (
                  <Link
                    to={`/booking?staff=${dentist.slug || dentist.id}`}
                    onClick={(e) => {
                      if (isPreview) e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="text-[11px] font-semibold text-white bg-[rgb(var(--primary))] hover:opacity-90 px-3 py-1 rounded transition-all shadow-xs"
                  >
                    Book
                  </Link>
                ) : (
                  <span className="text-[10px] font-medium text-white/50 bg-white/10 px-2 py-0.5 rounded">
                    Unavailable
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STYLE 4: MINIMAL (Modern Directory Profile Card)
  // =========================================================================
  if (cardStyle === "minimal") {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View clinical profile of ${dentist.name}`}
        className="group bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 flex flex-col justify-between hover:border-[rgb(var(--primary))] hover:shadow-md transition-all duration-300 cursor-pointer select-none space-y-4"
      >
        <div className="space-y-3">
          {/* Top Avatar Row */}
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-[var(--radius)] overflow-hidden bg-[rgb(var(--muted))] border border-[rgb(var(--border))] shrink-0 relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={dentist.name}
                  className="object-cover object-top w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted-foreground))]">
                  <Stethoscope className="h-6 w-6 opacity-40 text-[rgb(var(--primary))]" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-[rgb(var(--primary))] uppercase tracking-wider block truncate">
                {primarySpecialty}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors truncate">
                {dentist.name}
              </h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                {roleTitle}
              </p>
            </div>
          </div>

          {bioSnippet && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2">
              {bioSnippet}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[rgb(var(--border))] flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[rgb(var(--primary))] group-hover:underline inline-flex items-center gap-1">
            View Profile
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>

          {isAccepting ? (
            <Link
              to={`/booking?staff=${dentist.slug || dentist.id}`}
              onClick={(e) => {
                if (isPreview) e.preventDefault()
                e.stopPropagation()
              }}
              className="text-[11px] font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] bg-[rgb(var(--muted)/0.7)] hover:bg-[rgb(var(--primary)/0.15)] px-2.5 py-1 rounded transition-colors"
            >
              Book
            </Link>
          ) : (
            <span className="text-[10px] font-medium text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted)/0.5)] px-2.5 py-1 rounded">
              Unavailable
            </span>
          )}
        </div>
      </div>
    )
  }

  // =========================================================================
  // STYLE 1: CLINICAL (Default Clean Professional Medical Card)
  // =========================================================================
  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View clinical profile of ${dentist.name}`}
      className="group bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden flex flex-col justify-between hover:border-[rgb(var(--primary)/0.5)] hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
    >
      {/* Doctor Portrait Container */}
      <div className="aspect-[4/4.5] overflow-hidden bg-[rgb(var(--muted))] relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={dentist.name}
            className="object-cover object-top w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--muted)/0.4)] to-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
            <Stethoscope className="h-12 w-12 opacity-30 text-[rgb(var(--primary))]" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            <Eye className="h-3 w-3" />
            Quick Preview
          </span>
        </div>

        {/* Top verified specialist tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/15">
            <ShieldCheck className="h-2.5 w-2.5 text-cyan-300" />
            Verified
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors leading-snug">
            {dentist.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[rgb(var(--primary))]">
              {primarySpecialty}
            </span>
            <span className="text-[10px] text-[rgb(var(--muted-foreground))]">•</span>
            <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium">
              {roleTitle}
            </span>
          </div>
          {bioSnippet && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2 pt-1">
              {bioSnippet}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[rgb(var(--border))] flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[rgb(var(--primary))] group-hover:underline inline-flex items-center gap-1">
            View Profile
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>

          {isAccepting ? (
            <Link
              to={`/booking?staff=${dentist.slug || dentist.id}`}
              onClick={(e) => {
                if (isPreview) e.preventDefault()
                e.stopPropagation()
              }}
              className="text-[11px] font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] bg-[rgb(var(--muted)/0.6)] hover:bg-[rgb(var(--primary)/0.15)] px-2.5 py-1 rounded transition-colors"
            >
              Book
            </Link>
          ) : (
            <span className="text-[10px] font-medium text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted)/0.5)] px-2.5 py-1 rounded">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function StaffSection({ staff, staffLabel, content }: StaffSectionProps) {
  const [selectedDentist, setSelectedDentist] = useState<DentistModalData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const heading = content?.heading ?? `Meet Our ${staffLabel}`
  const subheading = content?.subheading ?? `Board-certified dental professionals with specialized clinical expertise.`
  const globalCardStyle: DentistCardStyle = (content?.cardStyle as DentistCardStyle) || "clinical"

  // Only take the first 4 active dentists for the homepage
  const activeStaff = staff.filter(s => s.isActive !== false)
  const displayStaff = activeStaff.slice(0, 4)

  const handleCardClick = (dentist: StaffMember, e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedDentist(dentist)
    setIsModalOpen(true)
  }

  return (
    <section id="dentists" className="py-16 lg:py-24 bg-[rgb(var(--muted)/0.35)] scroll-mt-20 relative">
      <span id="staff" className="scroll-mt-20 absolute -top-20 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold text-[rgb(var(--primary))] mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5" />
            {staffLabel.toUpperCase()}
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] mb-3 tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading}
          </h2>
          <p className="text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Cards Grid */}
        {displayStaff.length === 0 ? (
          <div className="p-12 text-center text-[rgb(var(--muted-foreground))] bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))]">
            <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30 text-[rgb(var(--primary))]" />
            <p className="text-sm font-semibold text-[rgb(var(--foreground))]">No dentists are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {displayStaff.map(member => (
              <DentistCard
                key={member.id}
                dentist={member}
                cardStyle={globalCardStyle}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {/* Dedicated "Book with Our Dentists" / View All Dentists button */}
        <div className="mt-12 text-center">
          <Link to="/dentists">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 font-semibold text-sm h-11 px-6 shadow-sm border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.05)] cursor-pointer"
            >
              Book with Our {staffLabel}
              <ArrowRight className="h-4 w-4 text-[rgb(var(--primary))]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Dentist Interactive Preview Modal */}
      <DentistPreviewModal
        dentist={selectedDentist}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDentist(null)
        }}
        terminologyStaffSingular={staffLabel.replace(/s$/, "")}
      />
    </section>
  )
}