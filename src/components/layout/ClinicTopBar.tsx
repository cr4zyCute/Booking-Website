import React from "react"
import { PhoneCall, Clock, MapPin, ShieldAlert, Sparkles } from "lucide-react"

interface ClinicTopBarProps {
  businessName: string
  phone?: string | null
  address?: string | null
  hoursText?: string
}

export function ClinicTopBar({
  businessName,
  phone = "+63 2 8123 4567",
  address = "123 Ayala Avenue, Makati City",
  hoursText = "Mon - Sat: 8:00 AM - 7:00 PM",
}: ClinicTopBarProps) {
  const displayPhone = phone || "+63 2 8123 4567"

  return (
    <div className="w-full bg-[rgb(var(--card))] border-b border-[rgb(var(--border))] text-xs text-[rgb(var(--muted-foreground))] select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-9 items-center justify-between gap-3">
          {/* Left: Operational Status & Emergency Notice */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            {/* Live Open Status */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-[rgb(var(--foreground))]">Open Today</span>
              <span className="hidden md:inline text-[rgb(var(--muted-foreground))]">• {hoursText}</span>
            </div>

            {/* Emergency Triage Pill */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium shrink-0">
              <ShieldAlert className="h-3 w-3 shrink-0" />
              <span>Emergency & Same-Day Walk-ins Welcome</span>
            </div>
          </div>

          {/* Right: Direct Clinic Hotline & Map Pin */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
            {address && (
              <a
                href="#contact"
                className="hidden lg:flex items-center gap-1 hover:text-[rgb(var(--foreground))] transition-colors"
                title={address}
              >
                <MapPin className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                <span className="max-w-[180px] truncate">{address}</span>
              </a>
            )}

            <div className="flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              <span className="hidden xs:inline text-[rgb(var(--muted-foreground))]">Emergency:</span>
              <a
                href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                className="font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] transition-colors cursor-pointer"
              >
                {displayPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

