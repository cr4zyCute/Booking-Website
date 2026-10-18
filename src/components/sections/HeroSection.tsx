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

// High-definition macro smile photography reference from Unsplash
const DEFAULT_MACRO_SMILE_IMAGE = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=2400&q=90"

export function HeroSection({ content, businessName, appointmentLabel, bookingBar }: HeroSectionProps) {
  const heading = content?.heading ?? `Healthy Smiles Begin With Exceptional Care.`
  const subheading = content?.subheading ?? `World-class cosmetic dentistry, digital smile design, and gentle personalized care at ${businessName}.`
  const primaryCta = content?.primaryCta ?? `Book ${appointmentLabel}`
  const secondaryCta = content?.secondaryCta ?? "Explore Treatments"

  // Use custom image if set in customizer, otherwise default to high-res macro smile photography
  const rawImage = content?.image
  const heroImage = (rawImage && rawImage !== "/hero-dental.jpg" && rawImage.trim().length > 0)
    ? rawImage
    : DEFAULT_MACRO_SMILE_IMAGE

  // Centralized booking status & statistics configuration
  const acceptingBookings = content?.showBadge !== false
  const badgeText = content?.badgeText || "Now accepting new patient bookings"
  const stat1Value = content?.stat1Value || "2,500+"
  const stat1Label = content?.stat1Label || "Happy Smiles"
  const stat2Value = content?.stat2Value || "12"
  const stat2Label = content?.stat2Label || "Certified Specialists"

  return (
    <section
      id="home"
      className="relative overflow-hidden scroll-mt-20 min-h-[calc(100svh-100px)] lg:min-h-[820px] flex flex-col justify-between"
    >
      {/* 1. Full-Bleed Whole Image Photographic Canvas (Focus on Radiant Smile) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src={heroImage}
          alt="Radiant healthy smile dental care"
          className="w-full h-full object-cover object-[center_right_15%] sm:object-[center_right_25%] lg:object-[center_right_35%]"
        />

        {/* 2. Dribbble-Inspired Editorial Vignette (Odentries / Dentora Style) */}
        {/* Desktop: Seamlessly transitions from clean solid background on the left to reveal the bright smiling teeth on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 via-white/40 to-transparent dark:from-slate-950/95 dark:via-slate-950/85 dark:via-slate-950/40 dark:to-transparent hidden lg:block" />
        {/* Mobile/Tablet: Vertical darkening gradient to ensure full readability directly over the whole image */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/90 dark:from-slate-950/95 dark:via-slate-950/85 dark:to-slate-950/90 lg:hidden" />

        {/* Top hairline border */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--border))] to-transparent" />
      </div>

      {/* 3. Main Hero Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: High-Contrast Editorial Storytelling */}
          <div className="lg:col-span-7 space-y-6 max-w-2xl text-left">
            {/* Dynamic Booking Status Banner */}
            {acceptingBookings ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-[rgb(var(--card)/0.8)] dark:bg-emerald-950/70 text-xs font-semibold text-emerald-700 dark:text-emerald-300 backdrop-blur-md shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {badgeText}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/25 bg-[rgb(var(--card)/0.8)] dark:bg-amber-950/70 text-xs font-semibold text-amber-700 dark:text-amber-300 backdrop-blur-md shadow-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                New patient bookings currently paused
              </div>
            )}

            {/* Dribbble Editorial Headline with Elegant Italic Serif Accent */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-[rgb(var(--foreground))] drop-shadow-xs"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Healthy Smiles Begin With{" "}
              <span className="font-serif italic font-normal text-[rgb(var(--primary))] block sm:inline">
                Exceptional Care.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[rgb(var(--muted-foreground))] leading-relaxed font-normal max-w-xl">
              {subheading}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <Link to="/booking">
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto h-12 px-7 font-bold shadow-lg shadow-[rgb(var(--primary)/0.25)] cursor-pointer"
                >
                  <CalendarDays className="h-4.5 w-4.5" />
                  {primaryCta}
                </Button>
              </Link>
              <Link to="/#treatments">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 w-full sm:w-auto h-12 px-7 font-semibold border-[rgb(var(--border))] text-[rgb(var(--foreground))] bg-[rgb(var(--card)/0.6)] hover:bg-[rgb(var(--muted))] backdrop-blur-md cursor-pointer transition-all"
                >
                  {secondaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Clinical Trust & Quality Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--border))]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-[rgb(var(--primary))] shrink-0" />
                <span>
                  <strong className="text-[rgb(var(--foreground))] font-semibold">{stat2Value}</strong> {stat2Label}
                </span>
              </div>
              <span className="text-[rgb(var(--border))]">•</span>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>
                  <strong className="text-[rgb(var(--foreground))] font-semibold">{stat1Value}</strong> {stat1Label}
                </span>
              </div>
              <span className="text-[rgb(var(--border))] hidden sm:inline">•</span>
              <div className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Painless & Gentle Care Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Dribbble Micro-Widgets directly framing the Whole-Image Smile */}
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-between items-end h-[340px] pointer-events-none pr-4">
            {/* Floating Micro-Card 1: Next Available Slot */}
            <div className="pointer-events-auto bg-[rgb(var(--card)/0.85)] dark:bg-slate-900/85 backdrop-blur-xl border border-[rgb(var(--border))] rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-xs transition-all hover:scale-105 duration-300">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Next Available Slot
                </div>
                <div className="text-sm font-bold text-[rgb(var(--foreground))] mt-0.5">Today at 2:30 PM</div>
              </div>
            </div>

            {/* Floating Micro-Card 2: Beautiful Smiles Start Here & Satisfaction */}
            <div className="pointer-events-auto bg-[rgb(var(--card)/0.85)] dark:bg-slate-900/85 backdrop-blur-xl border border-[rgb(var(--border))] rounded-2xl p-4 shadow-2xl space-y-2 max-w-xs transition-all hover:scale-105 duration-300">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--primary))] uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Beautiful Smiles</span>
                </div>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Star className="h-3 w-3 fill-amber-500" />
                  4.9 / 5.0
                </span>
              </div>
              <div className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                <strong className="text-[rgb(var(--foreground))] font-bold">{stat1Value}</strong> radiant smiles transformed with digital precision aesthetics.
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