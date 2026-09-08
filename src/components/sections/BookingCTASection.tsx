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
    <section id="booking-cta" className="py-16 lg:py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[calc(var(--radius)+8px)] bg-[rgb(var(--primary))] px-8 py-12 md:px-12 md:py-16">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--primary-foreground))] mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              {heading}
            </h2>
            <p className="text-[rgb(var(--primary-foreground)/0.8)] text-lg mb-8 leading-relaxed">
              {subheading}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/booking">
                <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto">
                  <CalendarDays className="h-4 w-4" />
                  Book {appointmentLabel}
                </Button>
              </Link>
              <Link to="/#treatments">
                <Button
                  size="lg"
                  variant="ghost"
                  className="gap-2 w-full sm:w-auto border border-white/40 text-white hover:bg-white/10 hover:text-white"
                >
                  Explore Treatments
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 rounded-full bg-white/5 -z-0" />
          <div className="absolute right-16 bottom-0 translate-y-1/2 h-48 w-48 rounded-full bg-white/5 -z-0" />
        </div>
      </div>
    </section>
  )
}