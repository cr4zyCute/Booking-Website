import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CalendarDays, ArrowRight, Star, ShieldCheck, Sparkles, CheckCircle2, HeartHandshake } from "lucide-react"

interface HeroSectionProps {
  content: Record<string, any> | null
  businessName: string
  appointmentLabel: string
  bookingBar?: React.ReactNode
}

// Premier close-up dental smile photography from Unsplash
const DEFAULT_MACRO_SMILE_IMAGE = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1600&q=90"
const SECONDARY_SMILE_FOCUS_IMAGE = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=90"

export function HeroSection({ content, businessName, appointmentLabel, bookingBar }: HeroSectionProps) {
  const heading = content?.heading ?? `Healthy Smiles Begin With Exceptional Care`
  const subheading = content?.subheading ?? `Experience gentle, state-of-the-art cosmetic dentistry and personalized smile design at ${businessName}.`
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
  const stat2Label = content?.stat2Label || "Specialists"

  return (
    <section
      id="home"
      className="relative overflow-hidden scroll-mt-20 min-h-[calc(100svh-100px)] lg:min-h-[820px] flex flex-col justify-between bg-gradient-to-b from-[rgb(var(--primary)/0.05)] via-[rgb(var(--background))] to-[rgb(var(--background))]"
    >
      {/* 1. Subtle Luminous Ambient Dental Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[rgb(var(--primary)/0.08)] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--border))] to-transparent" />

      {/* 2. Main Hero Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          {/* Left Column: Dribbble Editorial Storytelling */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Dynamic Booking Status Banner */}
            {acceptingBookings ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {badgeText}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-xs font-semibold text-amber-800 dark:text-amber-300 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                New patient bookings currently paused
              </div>
            )}

            {/* Dribbble Editorial Headline with Elegant Italic Serif Accent */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.12] text-[rgb(var(--foreground))]"
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <Link to="/booking">
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto h-12 px-7 font-bold shadow-lg shadow-[rgb(var(--primary)/0.2)] cursor-pointer"
                >
                  <CalendarDays className="h-4.5 w-4.5" />
                  {primaryCta}
                </Button>
              </Link>
              <Link to="/#treatments">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 w-full sm:w-auto h-12 px-7 font-semibold border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] cursor-pointer transition-all"
                >
                  {secondaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Social Proof & Clinical Indicators */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--border))]">
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
                <span>Painless Care Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Signature Dribbble Smile Focus with Zoom Lens Card */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Main Portrait Card: Macro Radiant Smile Photo */}
            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[14/10] lg:aspect-[4/3] rounded-[calc(var(--radius)+12px)] overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl">
              <img
                src={heroImage}
                alt="Radiant healthy smile dental care"
                className="object-cover w-full h-full object-center hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Top Floating Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-[rgb(var(--background)/0.85)] backdrop-blur-md border border-[rgb(var(--border))] rounded-full px-3.5 py-1 text-[11px] font-bold text-[rgb(var(--foreground))] shadow-md flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[rgb(var(--primary))]" />
                  <span>Digital Smile Design</span>
                </div>
              </div>

              {/* Bottom Subtle Gradient for Focus Badge Contrast */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgb(var(--card)/0.9)] via-[rgb(var(--card)/0.4)] to-transparent pointer-events-none" />
            </div>

            {/* Overlapping Focus Frame / Macro Teeth Zoom Badge (Signature Dribbble Reference) */}
            <div className="absolute -bottom-5 -left-2 sm:-left-6 z-30 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl p-3 sm:p-4 shadow-2xl max-w-[240px] sm:max-w-[270px] backdrop-blur-xl flex items-center gap-3 transition-transform hover:-translate-y-1 duration-300">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border border-[rgb(var(--primary)/0.3)] shrink-0 shadow-inner">
                <img
                  src={SECONDARY_SMILE_FOCUS_IMAGE}
                  alt="Teeth whitening close-up"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--primary))] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))]" />
                  Smile Focus
                </div>
                <div className="text-xs sm:text-sm font-bold text-[rgb(var(--foreground))] leading-tight">
                  Beautiful Smiles Start Here
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[rgb(var(--muted-foreground))]">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 Rating</span>
                </div>
              </div>
            </div>

            {/* Floating Live Slot Badge (Top Left Corner) */}
            <div className="absolute -top-4 -right-2 sm:-right-4 z-30 hidden sm:flex items-center gap-2 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-full px-4 py-2 shadow-xl backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-[rgb(var(--foreground))]">
                Next Slot: <strong className="text-[rgb(var(--primary))]">Today 2:30 PM</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Docked Instant Appointment Finder Bar */}
      {bookingBar && (
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
          {bookingBar}
        </div>
      )}
    </section>
  )
}

export default HeroSection