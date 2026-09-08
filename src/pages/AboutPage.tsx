import React from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CalendarDays, ShieldCheck, HeartHandshake, MapPin } from "lucide-react"
import { BusinessMap } from "@/components/common/BusinessMap"

export function AboutPage() {
  const { business, terminology } = useBusiness()

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-sm font-medium text-[rgb(var(--primary))] mb-3 uppercase tracking-wider">About Us</p>
          <h1 className="text-4xl font-bold text-[rgb(var(--foreground))] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            About {business.name}
          </h1>
          {business.description && (
            <p className="text-lg text-[rgb(var(--muted-foreground))] leading-relaxed">{business.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-3">
            <div className="h-10 w-10 rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center">
              <HeartHandshake className="h-5 w-5 text-[rgb(var(--primary))]" />
            </div>
            <h2 className="font-semibold text-[rgb(var(--foreground))] text-lg">Our Mission</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
              We are committed to delivering exceptional {terminology.serviceLabel.toLowerCase()} with a patient-first approach. 
              Our team combines clinical expertise with genuine care to create outstanding experiences for every {terminology.customerSingular.toLowerCase()}.
            </p>
          </div>

          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-3">
            <div className="h-10 w-10 rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-[rgb(var(--primary))]" />
            </div>
            <h2 className="font-semibold text-[rgb(var(--foreground))] text-lg">Clinical Safety & Comfort</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
              Our studio strictly follows hospital-grade sterilization protocols and modern ergonomic equipment designed to keep you relaxed and confident during every visit.
            </p>
          </div>
        </div>

        {/* Studio Location Map */}
        <div className="mb-12 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[rgb(var(--primary))]" />
              Our Location & Studio
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Conveniently located with accessible parking and public transit connections.
            </p>
          </div>
          <BusinessMap height="360px" />
        </div>

        <div className="bg-[rgb(var(--muted)/0.4)] rounded-[calc(var(--radius)+8px)] p-8 text-center space-y-4 border border-[rgb(var(--border))]">
          <h3 className="text-2xl font-bold text-[rgb(var(--foreground))]">Experience the difference</h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-md mx-auto">
            Book your appointment online in minutes and let our experienced team take care of your dental health.
          </p>
          <div className="pt-2">
            <Link to="/booking">
              <Button size="lg" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Book {terminology.appointmentSingular}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
