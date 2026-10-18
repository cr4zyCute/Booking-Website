import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CalendarDays, ArrowRight, Star, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react"

interface HeroSectionProps {
  content: Record<string, any> | null
  businessName: string
  appointmentLabel: string
  bookingBar?: React.ReactNode
}

// High-definition dental smile photography reference from Unsplash
const DEFAULT_SMILE_HERO_IMAGE = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=2400&q=85"

export function HeroSection({ content, businessName, appointmentLabel, bookingBar }: HeroSectionProps) {
  const heading = content?.heading ?? `A radiant smile.\nDesigned around you.`
  const subheading = content?.subheading ?? `World-class dental aesthetics, digital smile design, and gentle personalized care at ${businessName}.`
  const primaryCta = content?.primaryCta ?? `Book ${appointmentLabel}`
  const secondaryCta = content?.secondaryCta ?? "Explore Services"

  // Use custom image if set in customizer, otherwise default to high-res smile photography
  const rawImage = content?.image
  const heroImage = (rawImage && rawImage !== "/hero-dental.jpg" && rawImage.trim().length > 0)
    ? rawImage
    : DEFAULT_SMILE_HERO_IMAGE

  // Centralized booking status & statistics configuration
  const acceptingBookings = content?.showBadge !== false
  const badgeText = content?.badgeText || "Now accepting new patient bookings"
  const stat1Value = content?.stat1Value || "2,500+"
  const stat1Label = content?.stat1Label || "Smiles Transformed"
  const stat2Value = content?.stat2Value || "12"
  const stat2Label = content?.stat2Label || "Certified Dental Specialists"

  return (
    <section
      id="home"
      className="relative overflow-hidden scroll-mt-20 min-h-[calc(100svh-100px)] lg:min-h-[820px] flex flex-col justify-between"
    >
      {/* 1. Full-Bleed Whole Photographic Background (Radiant Smile Focus) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-no-repeat transition-all duration-700 bg-[center_right_15%] sm:bg-[center_right_25%] lg:bg-[center_right_35%]"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />

      {/* 2. Editorial Multi-Stop Vignette (Dribbble Dental Standard) */}
      {/* Desktop: Rich dark contrast on left for crystal-clear readability, fading to reveal luminous smile on right */}
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-slate-950/95 via-slate-950/85 via-slate-950/50 to-slate-950/20 hidden lg:block" />
      {/* Mobile/Tablet: Vertical darkening gradient to ensure full readability over the whole image */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950/95 lg:hidden" />

      {/* Subtle Hairline Border at Top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-2" />

      {/* 3. Main Hero Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: High-Contrast Editorial Storytelling */}
          <div className="lg:col-span-7 space-y-6 max-w-2xl text-left">
            {/* Dynamic Booking Status Banner */}
            {acceptingBookings ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/70 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {badgeText}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/70 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-xs">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                New patient bookings currently paused
              </div>
            )}

            {/* Main Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-md"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading.split("\n").map((line: string, i: number) => (
                <span
                  key={i}
                  className={i > 0 ? "block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-white" : "block"}
                >
                  {line}
                </span>
              ))}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal max-w-xl drop-shadow-xs">
              {subheading}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <Link to="/booking">
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto h-12 px-7 font-bold shadow-lg shadow-[rgb(var(--primary)/0.3)] cursor-pointer"
                >
                  <CalendarDays className="h-4.5 w-4.5" />
                  {primaryCta}
                </Button>
              </Link>
              <Link to="/#treatments">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 w-full sm:w-auto h-12 px-7 font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-md cursor-pointer transition-all"
                >
                  {secondaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Clinical Trust & Quality Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300 border-t border-white/15">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-white font-semibold">{stat2Value}</strong> {stat2Label}
                </span>
              </div>
              <span className="text-white/25">•</span>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                <span>
                  <strong className="text-white font-semibold">{stat1Value}</strong> {stat1Label}
                </span>
              </div>
              <span className="text-white/25 hidden sm:inline">•</span>
              <div className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Painless & Gentle Care Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dribbble Floating Micro-Widgets Framing the Smile */}
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-between items-end h-[340px] pointer-events-none pr-4">
            {/* Floating Micro-Card 1: Next Available Slot */}
            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-xs transition-all hover:scale-105 duration-300">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Next Available Slot
                </div>
                <div className="text-sm font-bold text-white mt-0.5">Today at 2:30 PM</div>
              </div>
            </div>

            {/* Floating Micro-Card 2: Patient Satisfaction & Smile Count */}
            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl space-y-2 max-w-xs transition-all hover:scale-105 duration-300">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  4.9 / 5.0
                </span>
              </div>
              <div className="text-xs font-medium text-slate-300">
                <strong className="text-white font-bold">{stat1Value}</strong> radiant smiles transformed with digital precision care.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Docked Instant Appointment Finder Bar */}
      {bookingBar && (
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
          {bookingBar}
        </div>
      )}
    </section>
  )
}

export default HeroSection