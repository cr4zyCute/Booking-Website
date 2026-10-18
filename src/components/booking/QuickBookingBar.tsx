import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Stethoscope, Sparkles, ArrowRight, Clock, ShieldCheck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface QuickBookingService {
  id: string
  name: string
  slug?: string
  price?: number | string
  durationMinutes?: number
  category?: { name: string } | null
}

export interface QuickBookingStaff {
  id: string
  name: string
  slug?: string
  specialty?: string | null
  role?: string | null
  acceptingAppointments?: boolean
}

interface QuickBookingBarProps {
  services: QuickBookingService[]
  staff: QuickBookingStaff[]
  serviceLabel?: string
  staffLabel?: string
  className?: string
}

export function QuickBookingBar({
  services = [],
  staff = [],
  serviceLabel = "Treatment",
  staffLabel = "Dentist",
  className = "",
}: QuickBookingBarProps) {
  const navigate = useNavigate()
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [selectedDayPreference, setSelectedDayPreference] = useState<string>("any")

  const handleSearchSlots = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (selectedServiceId) {
      params.set("service", selectedServiceId)
    }
    if (selectedStaffId && selectedStaffId !== "anyone") {
      params.set("staff", selectedStaffId)
    }
    if (selectedDayPreference && selectedDayPreference !== "any") {
      params.set("horizon", selectedDayPreference)
    }

    const targetUrl = params.toString() ? `/booking?${params.toString()}` : "/booking"
    navigate(targetUrl)
  }

  // Active staff members only
  const activeStaff = staff.filter(s => s.acceptingAppointments !== false)

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      <div className="relative rounded-[calc(var(--radius)+8px)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-xl p-4 sm:p-6 transition-all">
        {/* Top Header Label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-[var(--radius)] bg-[rgb(var(--primary)/0.12)] flex items-center justify-center text-[rgb(var(--primary))] shrink-0">
              <CalendarDays className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
              Instant Appointment Finder
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Verified Real-Time Slots
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">No Prepayment Required</span>
          </div>
        </div>

        {/* Interactive Filter Grid */}
        <form onSubmit={handleSearchSlots} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
          {/* 1. Select Service / Treatment */}
          <div className="lg:col-span-4 space-y-1.5">
            <label htmlFor="quick-treatment-select" className="block text-xs font-semibold text-[rgb(var(--foreground))]">
              1. Select {serviceLabel}
            </label>
            <div className="relative">
              <select
                id="quick-treatment-select"
                aria-label={`Select ${serviceLabel}`}
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full h-11 px-3 py-2 text-xs sm:text-sm bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-[var(--radius)] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent cursor-pointer transition-colors"
              >
                <option value="">Any Recommended {serviceLabel}</option>
                {services.map((svc) => (
                  <option key={svc.id} value={svc.slug || svc.id}>
                    {svc.name} {svc.durationMinutes ? `(${svc.durationMinutes} mins)` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Select Staff / Practitioner */}
          <div className="lg:col-span-3 space-y-1.5">
            <label htmlFor="quick-doctor-select" className="block text-xs font-semibold text-[rgb(var(--foreground))]">
              2. Preferred {staffLabel}
            </label>
            <div className="relative">
              <select
                id="quick-doctor-select"
                aria-label={`Select Preferred ${staffLabel}`}
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full h-11 px-3 py-2 text-xs sm:text-sm bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-[var(--radius)] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent cursor-pointer transition-colors"
              >
                <option value="anyone">First Available {staffLabel}</option>
                {activeStaff.map((member) => (
                  <option key={member.id} value={member.slug || member.id}>
                    {member.name} {member.specialty ? `• ${member.specialty}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Preferred Time Horizon */}
          <div className="lg:col-span-2 space-y-1.5">
            <label htmlFor="quick-time-select" className="block text-xs font-semibold text-[rgb(var(--foreground))]">
              3. When
            </label>
            <div className="relative">
              <select
                id="quick-time-select"
                aria-label="Select When"
                value={selectedDayPreference}
                onChange={(e) => setSelectedDayPreference(e.target.value)}
                className="w-full h-11 px-3 py-2 text-xs sm:text-sm bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-[var(--radius)] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent cursor-pointer transition-colors"
              >
                <option value="any">Earliest Date</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this-week">This Week</option>
                <option value="next-week">Next Week</option>
              </select>
            </div>
          </div>

          {/* 4. Action Button */}
          <div className="lg:col-span-3">
            <Button
              type="submit"
              size="lg"
              className="w-full h-11 font-semibold gap-2 shadow-md shadow-[rgb(var(--primary)/0.25)] hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Find Available Slots</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="pt-3 mt-3 border-t border-[rgb(var(--border)/0.6)] flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
          <span className="font-medium text-[rgb(var(--foreground))]">Popular:</span>
          {services.slice(0, 3).map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => {
                setSelectedServiceId(svc.slug || svc.id)
                navigate(`/booking?service=${svc.slug || svc.id}`)
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgb(var(--muted)/0.7)] hover:bg-[rgb(var(--primary)/0.12)] hover:text-[rgb(var(--primary))] transition-colors cursor-pointer text-[11px]"
            >
              <span>{svc.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

