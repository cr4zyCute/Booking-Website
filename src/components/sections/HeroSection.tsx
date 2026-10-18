import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CalendarDays, ArrowRight, Star, ShieldCheck, Sparkles, Award, AlertCircle } from "lucide-react"
import { HeroBackground } from "./HeroBackground"

interface HeroSectionProps {
  content: Record<string, any> | null
  businessName: string
  appointmentLabel: string
}

export function HeroSection({ content, businessName, appointmentLabel }: HeroSectionProps) {
  const heading = content?.heading ?? `Exceptional care.\nDesigned around you.`
  const subheading = content?.subheading ?? `Professional services delivered by an experienced team in ${businessName}.`
  const primaryCta = content?.primaryCta ?? `Book ${appointmentLabel}`
  const secondaryCta = content?.secondaryCta ?? "Explore Services"
  const image = content?.image || "/hero-dental.jpg"
  const imagePosition: "left" | "right" | "center" = content?.imagePosition || "right"

  // Centralized booking status & statistics configuration
  const acceptingBookings = content?.showBadge !== false
  const badgeText = content?.badgeText || "Now accepting new patient bookings"
  const stat1Value = content?.stat1Value || "500+"
  const stat1Label = content?.stat1Label || "Satisfied Patients"
  const stat2Value = content?.stat2Value || "12"
  const stat2Label = content?.stat2Label || "Certified Dental Specialists"

  // 1. CENTER / FULL SECTION LAYOUT
  if (imagePosition === "center") {
    return (
      <section id="home" className="relative overflow-hidden scroll-mt-20 min-h-[70vh] lg:min-h-[75vh] flex items-center justify-center">
        {/* Full Section Background Image with Tailored Dark Overlay for Maximum Readability */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url('${image}')`,
          }}
        />

        {/* Readability Multi-Stop Vignette */}
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-slate-950/95 via-slate-950/85 to-slate-950/75" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center text-white space-y-8">
          {/* Booking Status Banner */}
          {acceptingBookings ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/60 text-xs font-medium text-emerald-300 mx-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {badgeText}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/60 text-xs font-medium text-amber-300 mx-auto">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              New patient bookings currently paused
            </div>
          )}

          {/* Heading */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading.split("\n").map((line: string, i: number) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {subheading}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/booking" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto px-8 h-12 text-base font-semibold shadow-md">
                <CalendarDays className="h-5 w-5" />
                {primaryCta}
              </Button>
            </Link>
            <Link to="/#treatments" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 w-full sm:w-auto px-8 h-12 text-base font-semibold border-white/30 text-white bg-white/5 hover:bg-white/15 hover:text-white"
              >
                {secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Clinical Assurance Line */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Licensed & Board-Certified Specialists
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              Top-Rated Dental Care
            </span>
          </div>
        </div>
      </section>
    )
  }

  // 2. SPLIT LAYOUTS: LEFT OR RIGHT IMAGE
  const isImageLeft = imagePosition === "left"

  return (
    <section id="home" className="relative overflow-hidden scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(78vh-4rem)] py-12 lg:py-16">
          {/* Text Column (Ordered 1 if image is right, 2 if image is left) */}
          <div className={`space-y-8 max-w-xl ${isImageLeft ? "lg:order-2" : "lg:order-1"}`}>
            {/* Dynamic Booking Status Banner */}
            {acceptingBookings ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {badgeText}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-medium text-amber-800 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                New patient bookings currently paused
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[rgb(var(--foreground))]" style={{ fontFamily: "var(--font-heading)" }}>
              {heading.split("\n").map((line: string, i: number) => (
                <span key={i} className={i > 0 ? "block text-[rgb(var(--primary))]" : "block"}>{line}</span>
              ))}
            </h1>

            <p className="text-lg text-[rgb(var(--muted-foreground))] leading-relaxed font-normal">
              {subheading}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/booking">
                <Button size="lg" className="gap-2 w-full sm:w-auto h-11 px-6 font-semibold">
                  <CalendarDays className="h-4 w-4" />
                  {primaryCta}
                </Button>
              </Link>
              <Link to="/#treatments">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto h-11 px-6 font-semibold">
                  {secondaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Grounded Clinical Quality Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--border)/0.6)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
                <span>
                  <strong className="text-[rgb(var(--foreground))] font-semibold">{stat2Value}</strong> {stat2Label}
                </span>
              </div>
              <span className="text-[rgb(var(--border))]">•</span>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>High Patient Satisfaction Rating</span>
              </div>
            </div>
          </div>

          {/* Image Column (Ordered 2 if image is right, 1 if image is left) */}
          <div className={`relative lg:block ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
            {/* Main Portrait Frame with Architectural Border and Crisp Natural Shadow */}
            <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden rounded-[calc(var(--radius)+8px)] bg-[rgb(var(--card))] shadow-xl border border-[rgb(var(--border))]">
              {image ? (
                <img src={image} alt="Veridian Dental Studio" className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="h-20 w-20 mx-auto rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-[rgb(var(--primary))]" />
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">Clinical Studio</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Architectural Clinical Background */}
      <HeroBackground variant="split" />
    </section>
  )
}