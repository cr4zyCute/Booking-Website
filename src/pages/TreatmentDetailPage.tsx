import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useBusiness } from "@/context/BusinessContext"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Clock,
  CalendarDays,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Loader2,
  Info
} from "lucide-react"

import { DEFAULT_SERVICES } from "@/lib/defaultData"

export function TreatmentDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { business, terminology } = useBusiness()

  const [service, setService] = useState<any | null>(() => {
    return DEFAULT_SERVICES.find(s => s.slug === slug || s.id === slug) || null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    fetch(`/api/public/services/${slug}`, { cache: "no-store" })
      .then(async res => {
        if (!res.ok) throw new Error("Treatment not found")
        const data = await res.json()
        if (data.service) {
          setService(data.service)
        }
      })
      .catch(err => {
        const fallback = DEFAULT_SERVICES.find(s => s.slug === slug || s.id === slug)
        if (fallback) {
          setService(fallback)
        } else {
          setError("Treatment not found")
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="py-32 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))]">
          <Info className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Treatment Not Found</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          The requested {terminology.serviceSingular.toLowerCase()} may have been updated or removed.
        </p>
        <Link to="/treatments">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to All {terminology.serviceLabel}
          </Button>
        </Link>
      </div>
    )
  }

  const priceFormatted = formatCurrency(Number(service.price), business.currencySymbol)
  const durationFormatted = formatDuration(service.durationMinutes)
  const imageUrl = service.image || "/hero-dental.jpg"
  const staffMembers = service.staffServices?.map((ss: any) => ss.staff).filter(Boolean) || []

  return (
    <div className="min-h-screen py-10 lg:py-16 bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
          <Link to="/" className="hover:text-[rgb(var(--foreground))] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/treatments" className="hover:text-[rgb(var(--foreground))] transition-colors">
            {terminology.serviceLabel}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[rgb(var(--foreground))] font-medium truncate max-w-xs">{service.name}</span>
        </nav>

        {/* Hero Banner with Image & Meta Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Top: Treatment Visual */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] rounded-[calc(var(--radius)+4px)] overflow-hidden border border-[rgb(var(--border))] shadow-md bg-[rgb(var(--muted))] relative">
              <img src={imageUrl} alt={service.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[calc(var(--radius)+4px)]" />
            </div>

            {/* Quick Badges Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {service.category?.name && (
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  {service.category.name}
                </Badge>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgb(var(--muted))] text-xs font-medium text-[rgb(var(--foreground))] border border-[rgb(var(--border))]">
                <Clock className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                {durationFormatted}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Clinical Protocol
              </div>
            </div>
          </div>

          {/* Right / Content Side: Heading, Pricing, Booking CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-[rgb(var(--primary))] uppercase tracking-wider">
                {terminology.serviceSingular} Overview
              </p>
              <h1
                className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {service.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs text-[rgb(var(--muted-foreground))]">Standard Consultation & Treatment</span>
                <div className="text-2xl font-bold text-[rgb(var(--foreground))]">{priceFormatted}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[rgb(var(--muted-foreground))]">Estimated Duration</span>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-1 justify-end">
                  <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
                  {durationFormatted}
                </div>
              </div>
            </div>

            {/* Short Description */}
            {service.shortDescription && (
              <p className="text-base text-[rgb(var(--muted-foreground))] leading-relaxed">
                {service.shortDescription}
              </p>
            )}

            {/* Actual Book Treatment Appointment Button */}
            <div className="pt-2">
              <Link to={`/booking?service=${service.slug}`} className="block">
                <Button size="lg" className="w-full gap-2 font-semibold text-base shadow-lg shadow-[rgb(var(--primary)/0.25)] h-12">
                  <CalendarDays className="h-5 w-5" />
                  Book {terminology.serviceSingular} Appointment
                </Button>
              </Link>
              <p className="text-[11px] text-center text-[rgb(var(--muted-foreground))] mt-2">
                Instant confirmation • No advance credit card required
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Full Description */}
        {service.description && service.description !== service.shortDescription && (
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[rgb(var(--primary))]" />
              Treatment Details & Clinical Approach
            </h2>
            <div className="text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed whitespace-pre-line">
              {service.description}
            </div>
          </div>
        )}

        {/* Available Specialists / Staff for this treatment */}
        {staffMembers.length > 0 && (
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-[rgb(var(--primary))]" />
                Specialists Available for This {terminology.serviceSingular}
              </h2>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                The following qualified {terminology.staffLabel.toLowerCase()} perform this treatment at {business.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {staffMembers.map((doc: any) => {
                const initials = doc.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3.5 p-3.5 bg-[rgb(var(--background))] rounded-[var(--radius)] border border-[rgb(var(--border))]"
                  >
                    <Avatar className="h-11 w-11 border border-[rgb(var(--border))]">
                      <AvatarImage src={doc.photo ?? undefined} alt={doc.name} />
                      <AvatarFallback className="bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-semibold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-[rgb(var(--foreground))] truncate">{doc.name}</h4>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{doc.role || doc.specialty}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Back Link Footer */}
        <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between">
          <Link to="/treatments">
            <Button variant="ghost" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" />
              Back to All {terminology.serviceLabel}
            </Button>
          </Link>
          <Link to={`/booking?service=${service.slug}`}>
            <Button size="sm" className="gap-1.5 text-xs">
              <CalendarDays className="h-3.5 w-3.5" />
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TreatmentDetailPage
