import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { TreatmentPreviewModal } from "@/components/treatments/TreatmentPreviewModal"

export interface ServiceItem {
  id: string
  name: string
  slug: string
  shortDescription?: string | null
  description?: string | null
  image?: string | null
  images?: string[]
  cardStyle?: "default" | "image_card" | "overlay" | "blurred-image-reveal" | "blurred_reveal"
  price: number | string
  durationMinutes: number
  isFeatured?: boolean
  isActive?: boolean
  category?: { name: string } | null
  staffServices?: any[]
}

interface ServicesSectionProps {
  services: ServiceItem[]
  serviceLabel: string
  currencySymbol: string
  content: Record<string, any> | null
}

export function TreatmentCard({
  service,
  currencySymbol,
  globalCardStyle,
  onClick,
  isPreview = false,
}: {
  service: ServiceItem
  currencySymbol: string
  globalCardStyle?: "default" | "image_card" | "overlay" | "blurred-image-reveal" | "blurred_reveal"
  onClick?: (service: ServiceItem) => void
  isPreview?: boolean
}) {
  const [touchRevealed, setTouchRevealed] = useState(false)
  const style = globalCardStyle || service.cardStyle || "default"
  const priceFormatted = formatCurrency(Number(service.price), currencySymbol)
  const durationFormatted = formatDuration(service.durationMinutes)
  const descriptionText = service.shortDescription || service.description || ""
  const primaryImage = (service.images && service.images.length > 0) ? service.images[0] : (service.image || null)

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault()
      setTouchRevealed(!touchRevealed)
      return
    }
    // If on a touch device and not yet revealed in style 3, reveal on first tap
    if (window.matchMedia("(hover: none)").matches && !touchRevealed && (style === "overlay" || style === "blurred-image-reveal" || style === "blurred_reveal")) {
      e.preventDefault()
      setTouchRevealed(true)
      return
    }
    if (onClick) {
      e.preventDefault()
      onClick(service)
    }
  }

  // =========================================================================
  // STYLE 3: ATMOSPHERIC GRADIENT BLUR REVEAL
  // =========================================================================
  if (style === "overlay" || style === "blurred-image-reveal" || style === "blurred_reveal") {
    const cardImg = primaryImage || "/hero-dental.jpg"

    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${service.name}`}
        className="group relative rounded-[var(--radius)] overflow-hidden border border-[rgb(var(--border))] min-h-[320px] flex flex-col justify-end shadow-sm transition-all duration-500 hover:shadow-xl hover:border-[rgb(var(--primary)/0.6)] cursor-pointer select-none bg-slate-950"
      >
        {/* Dominant Clear Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('${cardImg}')` }}
        />

        {/* Seamless Progressive Backdrop Blur Gradient */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out backdrop-blur-[12px]"
          style={{
            maskImage: touchRevealed
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.4) 65%, transparent 80%)"
              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0.3) 28%, transparent 38%)",
            WebkitMaskImage: touchRevealed
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.4) 65%, transparent 80%)"
              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0.3) 28%, transparent 38%)",
          }}
        />

        {/* Smooth Darkening Gradient Vignette */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ease-out ${
            touchRevealed
              ? "bg-gradient-to-t from-slate-950/95 via-slate-950/75 via-slate-950/25 to-transparent opacity-95"
              : "bg-gradient-to-t from-slate-950/90 via-slate-950/45 via-transparent to-transparent opacity-90 group-hover:opacity-100 group-hover:bg-gradient-to-t group-hover:from-slate-950/95 group-hover:via-slate-950/70 group-hover:via-slate-950/25 group-hover:to-transparent"
          }`}
        />

        {/* Content Container */}
        <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-300 drop-shadow-sm">
              Treatment
            </span>
            <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-cyan-200 transition-colors duration-300 leading-snug drop-shadow-sm">
              {service.name}
            </h3>
          </div>

          <div
            className={`grid transition-all duration-400 ease-out ${
              touchRevealed
                ? "grid-rows-[1fr] opacity-100 mt-2.5"
                : "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:mt-2.5"
            }`}
          >
            <div className="overflow-hidden space-y-3 pt-1">
              {descriptionText && (
                <p className="text-xs text-white/90 leading-relaxed line-clamp-3 drop-shadow-xs">
                  {descriptionText}
                </p>
              )}

              <div className="flex items-center justify-between pt-2.5 border-t border-white/15">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm sm:text-base text-white">
                    {priceFormatted}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <Clock className="h-3 w-3" />
                    {durationFormatted}
                  </div>
                </div>

                <div className="h-7 w-7 rounded-full border border-white/30 bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[rgb(var(--primary))] group-hover:border-[rgb(var(--primary))] transition-all duration-300">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STYLE 2: IMAGE TREATMENT CARD (Top Header / Split Image)
  // =========================================================================
  if (style === "image_card") {
    const cardImg = primaryImage || "/hero-dental.jpg"

    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${service.name}`}
        className="group bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden flex flex-col hover:border-[rgb(var(--primary)/0.5)] hover:shadow-md transition-all duration-200 cursor-pointer select-none"
      >
        <div className="aspect-[16/10] overflow-hidden bg-[rgb(var(--muted))] relative">
          <img
            src={cardImg}
            alt={service.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-bold text-base sm:text-lg text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors leading-snug">
              {service.name}
            </h3>
            {descriptionText && (
              <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2">
                {descriptionText}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--border))] mt-auto">
            <div className="space-y-0.5">
              <div className="font-bold text-base text-[rgb(var(--foreground))]">
                {priceFormatted}
              </div>
              <div className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))]">
                <Clock className="h-3 w-3" />
                {durationFormatted}
              </div>
            </div>

            <div className="h-8 w-8 rounded-full border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--muted-foreground))] group-hover:bg-[rgb(var(--primary))] group-hover:border-[rgb(var(--primary))] group-hover:text-[rgb(var(--primary-foreground))] transition-all">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STYLE 1: DEFAULT CARD (Clean Minimalist Card)
  // =========================================================================
  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${service.name}`}
      className="group bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 flex flex-col justify-between hover:border-[rgb(var(--primary)/0.5)] hover:shadow-md transition-all duration-200 cursor-pointer select-none"
    >
      <div className="space-y-2">
        <h3 className="font-bold text-base sm:text-lg text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors leading-snug">
          {service.name}
        </h3>
        {descriptionText && (
          <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-3">
            {descriptionText}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-6 border-t border-[rgb(var(--border))]">
        <div className="space-y-0.5">
          <div className="font-bold text-base text-[rgb(var(--foreground))]">
            {priceFormatted}
          </div>
          <div className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))]">
            <Clock className="h-3 w-3" />
            {durationFormatted}
          </div>
        </div>

        <div className="h-8 w-8 rounded-full border border-[rgb(var(--border))] flex items-center justify-center text-[rgb(var(--muted-foreground))] group-hover:bg-[rgb(var(--primary))] group-hover:border-[rgb(var(--primary))] group-hover:text-[rgb(var(--primary-foreground))] transition-all">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export function ServicesSection({ services, serviceLabel, currencySymbol, content }: ServicesSectionProps) {
  const heading = content?.heading ?? `Our ${serviceLabel}`
  const subheading = content?.subheading ?? `Professional treatments tailored to your dental health and confidence.`

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  // Homepage displays a maximum of 6 treatments
  const displayedServices = services.slice(0, 6)

  return (
    <section id="treatments" className="py-16 lg:py-24 scroll-mt-20 relative">
      <span id="services" className="scroll-mt-20 absolute -top-20 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold text-[rgb(var(--primary))] mb-2 uppercase tracking-wider">{serviceLabel}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {heading}
          </h2>
          <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">{subheading}</p>
        </div>

        {/* Treatments Grid (Max 6 on homepage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map(service => (
            <TreatmentCard
              key={service.id}
              service={service}
              currencySymbol={currencySymbol}
              globalCardStyle={content?.cardStyle || "default"}
              onClick={svc => setSelectedService(svc)}
            />
          ))}
        </div>

        {/* Exactly ONE "See More" Button for the entire Treatments Section */}
        <div className="mt-12 text-center">
          <Link to="/treatments">
            <Button size="lg" className="gap-2 px-8 font-semibold shadow-md shadow-[rgb(var(--primary)/0.25)]">
              See More {serviceLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Full Treatment Preview Modal */}
      <TreatmentPreviewModal
        service={selectedService}
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        currencySymbol={currencySymbol}
        serviceSingular={serviceLabel.endsWith("s") ? serviceLabel.slice(0, -1) : serviceLabel}
      />
    </section>
  )
}