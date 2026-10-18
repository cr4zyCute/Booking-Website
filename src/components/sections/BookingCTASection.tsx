import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CalendarDays, ArrowRight } from "lucide-react"

interface BookingCTASectionProps {
  content: Record<string, any> | null
  appointmentLabel: string
  businessName: string
}

export function BookingCTASection({ content, appointmentLabel, businessName }: BookingCTASectionProps) {
  const heading = content?.heading ?? `Ready to book your ${appointmentLabel}?`
  const subheading = content?.subheading ?? `Schedule online in minutes. No phone call required.`

  return (
    <section id="booking-cta" className="py-16 lg:py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[var(--radius)] bg-[rgb(var(--primary))] px-8 py-12 md:px-14 md:py-16 border border-[rgb(var(--primary))] shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {heading}
            </h2>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed font-normal">
              {subheading}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/booking">
                <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto h-11 px-6 font-semibold bg-white text-[rgb(var(--primary))] hover:bg-white/90">
                  <CalendarDays className="h-4 w-4" />
                  Book {appointmentLabel}
                </Button>
              </Link>
              <Link to="/#treatments">
                <Button
                  size="lg"
                  variant="ghost"
                  className="gap-2 w-full sm:w-auto h-11 px-6 font-semibold border border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Explore Treatments
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}