import React, { useState } from "react"
import { Link } from "react-router-dom"
import { ShieldAlert, PhoneCall, CalendarDays, X, Clock, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmergencyQuickDockProps {
  phone?: string | null
  hours?: string
}

export function EmergencyQuickDock({
  phone = "+63 2 8123 4567",
  hours = "8:00 AM - 7:00 PM",
}: EmergencyQuickDockProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const displayPhone = phone || "+63 2 8123 4567"

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Expanded Emergency Card */}
      {isOpen && (
        <div className="mb-3 w-[320px] rounded-[calc(var(--radius)+6px)] border border-amber-500/30 bg-[rgb(var(--card))] shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[rgb(var(--border))]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[rgb(var(--foreground))]">
                  Dental Emergency Triage
                </h4>
                <p className="text-[10px] text-[rgb(var(--muted-foreground))]">
                  Same-day slots reserved daily
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-[var(--radius)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
              aria-label="Close emergency triage"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <p className="text-[11px] text-[rgb(var(--muted-foreground))] leading-relaxed">
              Experiencing severe toothache, chipped tooth, bleeding, or dental trauma? Call our emergency team immediately.
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Walk-ins welcome today ({hours})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgb(var(--border))]">
            <a
              href={`tel:${displayPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius)] text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Call Clinic</span>
            </a>

            <Link
              to="/booking"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius)] text-xs font-bold text-[rgb(var(--primary-foreground))] bg-[rgb(var(--primary))] hover:opacity-95 transition-opacity shadow-xs"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Book Slot</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[rgb(var(--card))] border border-amber-500/40 text-[rgb(var(--foreground))] shadow-lg hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer backdrop-blur-md"
          aria-expanded={isOpen}
          aria-label="Open emergency triage"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Emergency Care
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-[rgb(var(--muted-foreground))] group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  )
}

