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

// Verified high-definition clinical smile photography matching Dentix reference
const DEFAULT_CLINICAL_SMILE_IMAGE = "/hero-dentix.jpg"

export function HeroSection({ content, businessName, appointmentLabel, bookingBar }: HeroSectionProps) {
  const rawHeading = content?.heading || "Strong Teeth\nBright Smile"
  const headingParts = rawHeading.includes("\n")
    ? rawHeading.split("\n")
    : [rawHeading, "Bright Smile"]
  const headingTop = headingParts[0] || "Strong Teeth"
  const headingBottom = headingParts.slice(1).join(" ") || "Bright Smile"

  const subheading = content?.subheading ?? `Modern dentistry designed to keep your smile at its peak: painless, precise, and tailored to you at ${businessName}.`
  const primaryCta = content?.primaryCta ?? `Book ${appointmentLabel}`
  const secondaryCta = content?.secondaryCta ?? "Browse Services"

  // Use custom image if set in customizer, otherwise default to Dentix clinical smile photo
  const rawImage = content?.image
  const isOldPlaceholder = !rawImage || rawImage.includes("1588776814546") || rawImage.includes("1606811841689") || rawImage === "/hero-dental.jpg"
  const heroImage = (!isOldPlaceholder && rawImage.trim().length > 0)
    ? rawImage
    : DEFAULT_CLINICAL_SMILE_IMAGE

  // Centralized booking status & statistics configuration
  const stat1Value = content?.stat1Value || "15k+"
  const stat1Label = content?.stat1Label || "Satisfied Clients"

  return (
    <section
      id="home"
      className="relative overflow-hidden scroll-mt-20 min-h-[calc(100svh-90px)] lg:min-h-[820px] flex flex-col justify-between"
    >
      {/* 1. Full-Bleed Whole Image Photographic Canvas (Patient & Dentist Elevated for Optimal Framing) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src={heroImage}
          alt="Modern dental care smiling patient"
          className="w-full h-full object-cover object-[center_72%] sm:object-[center_70%] lg:object-[center_68%]"
        />

        {/* 2. Cinematic Gradient Vignette Overlay (Dentix Style) */}
        {/* Deep bottom vignette ensures bold white typography & cards stand out with 100% contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
        {/* Subtle top vignette for nav contrast */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-slate-950/60 to-transparent" />
        {/* Subtle left vignette on desktop */}
        <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-slate-950/50 via-slate-950/20 to-transparent hidden lg:block" />

        {/* Top hairline border */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/10" />
      </div>

      {/* 3. Main Hero Content Container (Dentix Bottom Split Layout with Elevated Clearances) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-end pb-5 lg:pb-8 pt-24 sm:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end w-full">
          {/* Left Column: Social Proof Chip & Iconic Dentix Headline */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {/* Social Proof Pill: Overlapping Patient Avatars + 15k+ Satisfied Clients */}
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white/60 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Patient"
                />
                <img
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white/60 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Patient"
                />
                <img
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white/60 object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Patient"
                />
              </div>
              <div className="text-xs font-semibold text-white/95 tracking-wide flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>
                  <strong className="text-white font-bold">{stat1Value}</strong> {stat1Label}
                </span>
              </div>
            </div>

            {/* Dentix Signature Headline: Bold Sans + Elegant Italic Serif */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white drop-shadow-md"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {headingTop}
              <span className="block font-serif italic font-normal text-white/95 mt-1 sm:mt-1.5">
                {headingBottom}
              </span>
            </h1>
          </div>

          {/* Right Column: Neatly Arranged Description & Action Buttons in Frosted Card */}
          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="bg-slate-950/50 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Modern Dental Care</span>
              </div>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal text-pretty drop-shadow-xs">
                {subheading}
              </p>

              {/* Action Pill Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-1">
                <Link to="/booking" className="flex-1 sm:flex-initial">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-11 px-6 rounded-full font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/35 border-0 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {primaryCta}
                  </Button>
                </Link>
                <Link to="/#treatments" className="flex-1 sm:flex-initial">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-11 px-6 rounded-full font-semibold bg-white/95 hover:bg-white text-slate-900 border-0 backdrop-blur-md shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {secondaryCta}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
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