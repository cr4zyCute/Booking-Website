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
        {/* Full Section Background Image with Tailored Dark Gradient Mask for Maximum Readability */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-[1.01]"
          style={{
            backgroundImage: `url('${image}')`,
          }}
        />

        {/* Readability Multi-Stop Progressive Vignette */}
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-950/70 backdrop-blur-[1.5px]" />

        {/* Dual Ambient Luminous Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[rgb(var(--primary)/0.28)] rounded-full blur-[150px] pointer-events-none z-1" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-teal-400/15 rounded-full blur-[130px] pointer-events-none z-1" />

        {/* Architectural Fine Grid Overlay with Radial Mask */}
        <div className="absolute inset-0 z-1 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_30%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center text-white space-y-8">
          {/* Dynamic Booking Status Banner */}
          {acceptingBookings ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 backdrop-blur-md text-xs font-medium text-emerald-300 shadow-sm mx-auto animate-in fade-in duration-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {badgeText}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 backdrop-blur-md text-xs font-medium text-amber-300 shadow-sm mx-auto animate-in fade-in duration-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              New patient bookings currently not being accepted
            </div>
          )}

          {/* Heading */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading.split("\n").map((line: string, i: number) => (
              <span key={i} className={i > 0 ? "block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200" : "block"}>
                {line}
              </span>
            ))}
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
            {subheading}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/booking" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto px-8 h-12 text-base font-semibold shadow-lg shadow-[rgb(var(--primary)/0.3)]">
                <CalendarDays className="h-5 w-5" />
                {primaryCta}
              </Button>
            </Link>
            <Link to="/#treatments" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 w-full sm:w-auto px-8 h-12 text-base font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md hover:text-white"
              >
                {secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Floating Trust Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/80">
            {stat1Value && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{stat1Value}</span>
                <span>{stat1Label}</span>
              </div>
            )}
            {stat2Value && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-bold text-white">{stat2Value}</span>
                <span>{stat2Label}</span>
              </div>
            )}
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {badgeText}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-700 dark:text-amber-300 animate-in fade-in duration-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                New patient bookings currently not being accepted
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[rgb(var(--foreground))]" style={{ fontFamily: "var(--font-heading)" }}>
              {heading.split("\n").map((line: string, i: number) => (
                <span key={i} className={i > 0 ? "block text-[rgb(var(--primary))]" : "block"}>{line}</span>
              ))}
            </h1>

            <p className="text-lg text-[rgb(var(--muted-foreground))] leading-relaxed">
              {subheading}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/booking">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <CalendarDays className="h-4 w-4" />
                  {primaryCta}
                </Button>
              </Link>
              <Link to="/#treatments">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  {secondaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Additional Specialist & Guarantee Badges below CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
              {stat2Value && (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))] flex items-center justify-center font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    <strong className="text-[rgb(var(--foreground))] font-semibold">{stat2Value}</strong> {stat2Label}
                  </span>
                </div>
              )}
              <span className="hidden sm:inline text-[rgb(var(--border))]">•</span>
              <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))]">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Painless & Gentle Clinical Care</span>
              </div>
            </div>
          </div>

          {/* Image Column (Ordered 2 if image is right, 1 if image is left) */}
          <div className={`relative lg:block ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
            {/* Luminous Ambient Halo behind the Image Card */}
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-tr from-[rgb(var(--primary)/0.25)] to-teal-400/20 rounded-[calc(var(--radius)+18px)] blur-2xl opacity-75 pointer-events-none" />

            {/* Dribbble Signature 1: Top Floating "Next Available Slot" Live Micro-Card */}
            <div className={`absolute -top-3 ${isImageLeft ? "-right-3 sm:-right-4" : "-left-3 sm:-left-4"} z-20 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-[calc(var(--radius)+4px)] shadow-xl p-2.5 sm:p-3 flex items-center gap-2.5 backdrop-blur-md`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Next Available Slot
                </div>
                <div className="text-xs font-semibold text-[rgb(var(--foreground))]">
                  Today at 2:30 PM
                </div>
              </div>
            </div>

            {/* Main Portrait Frame with Refined Border and Shadow */}
            <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden rounded-[calc(var(--radius)+12px)] bg-[rgb(var(--card))] shadow-2xl border border-[rgb(var(--border))]">
              {image ? (
                <img src={image} alt="Hero" className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="h-20 w-20 mx-auto rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-[rgb(var(--primary))]" />
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">Hero image</p>
                  </div>
                </div>
              )}
              {/* Decorative inner contour */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[calc(var(--radius)+12px)]" />
            </div>

            {/* Dribbble Signature 2: Bottom Floating Patient Rating & Avatar Stack Micro-Card */}
            <div className={`absolute -bottom-4 ${isImageLeft ? "-left-3 sm:-left-5" : "-right-3 sm:-right-5"} z-20 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-[calc(var(--radius)+4px)] shadow-xl p-3 sm:p-3.5 space-y-1.5 min-w-[175px] backdrop-blur-md`}>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-[rgb(var(--foreground))] ml-1">4.9/5</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Overlapping Patient Avatars */}
                <div className="flex -space-x-1.5 overflow-hidden">
                  <span className="inline-flex h-5 w-5 rounded-full ring-2 ring-[rgb(var(--card))] bg-cyan-700 text-[9px] font-bold text-white items-center justify-center">M</span>
                  <span className="inline-flex h-5 w-5 rounded-full ring-2 ring-[rgb(var(--card))] bg-teal-600 text-[9px] font-bold text-white items-center justify-center">D</span>
                  <span className="inline-flex h-5 w-5 rounded-full ring-2 ring-[rgb(var(--card))] bg-emerald-600 text-[9px] font-bold text-white items-center justify-center">S</span>
                </div>
                <span className="text-[11px] text-[rgb(var(--muted-foreground))] font-medium">
                  {stat1Value} {stat1Label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-layered Luminous Clinical Background */}
      <HeroBackground variant="split" />
    </section>
  )
}