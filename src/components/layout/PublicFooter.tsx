import React from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Phone, Mail, MapPin, Navigation } from "lucide-react"
import type { Business } from "@prisma/client"
import { BusinessMap } from "@/components/common/BusinessMap"

interface PublicFooterProps {
  business: Business
  appointmentLabel: string
}

export function PublicFooter({ business, appointmentLabel }: PublicFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-[var(--radius)] bg-[rgb(var(--primary))] flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-[rgb(var(--primary-foreground))]" />
              </div>
              <span className="font-semibold text-[rgb(var(--foreground))]">{business.name}</span>
            </div>
            {business.description && (
              <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed max-w-xs">
                {business.description.slice(0, 120)}
              </p>
            )}
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">Contact</h3>
            <div className="space-y-2">
              {business.address && (
                <div className="flex items-start gap-2.5 text-sm text-[rgb(var(--muted-foreground))]">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[rgb(var(--primary))]" />
                  <span>{business.address}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2.5 text-sm text-[rgb(var(--muted-foreground))]">
                  <Phone className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
                  <a href={`tel:${business.phone}`} className="hover:text-[rgb(var(--foreground))] transition-colors">
                    {business.phone}
                  </a>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-2.5 text-sm text-[rgb(var(--muted-foreground))]">
                  <Mail className="h-4 w-4 shrink-0 text-[rgb(var(--primary))]" />
                  <a href={`mailto:${business.email}`} className="hover:text-[rgb(var(--foreground))] transition-colors">
                    {business.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "Treatments", href: "/#treatments" },
                { label: "Dentists", href: "/#dentists" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/#contact" },
                { label: `Book ${appointmentLabel}`, href: "/booking" },
              ].map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Location Map */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              Location
            </h3>
            <BusinessMap
              height="150px"
              showAddressCard={false}
              showDirectionsButton={false}
              className="w-full shadow-none border-[rgb(var(--border))]"
            />
            {business.address && (
              <p className="text-xs text-[rgb(var(--muted-foreground))] line-clamp-2">
                {business.address}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            &copy; {year} {business.name}. All rights reserved.
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Powered by BookingPlatform
          </p>
        </div>
      </div>
    </footer>
  )
}