"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDuration } from "@/lib/utils"
import {
  CalendarDays,
  Clock,
  User,
  Mail,
  Phone,
  Loader2,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2
} from "lucide-react"
import { format, parse } from "date-fns"
import type { BookingSelection } from "./BookingFlow"

interface BookingSummaryProps {
  selection: BookingSelection
  business: any
  terminology: any
  onConfirm: () => Promise<void>
  onBack: () => void
}

export function BookingSummary({
  selection,
  business,
  terminology,
  onConfirm,
  onBack,
}: BookingSummaryProps) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      await onConfirm()
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to confirm appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const { service, timeSlot, customer, date, staff } = selection
  if (!service || !timeSlot || !customer || !date) return null

  const startDate = new Date(timeSlot.startAt)
  const currencySymbol = business.currencySymbol || "₱"
  const appointmentSingular = terminology.appointmentSingular || "Appointment"
  const serviceSingular = terminology.serviceSingular || "Treatment"
  const staffSingular = terminology.staffSingular || "Dentist"

  // Format time display
  const formatTimeRange = () => {
    try {
      const parsedStart = parse(timeSlot.startTime, "HH:mm", new Date())
      const parsedEnd = parse(timeSlot.endTime, "HH:mm", new Date())
      return `${format(parsedStart, "h:mm a")} – ${format(parsedEnd, "h:mm a")}`
    } catch {
      return `${timeSlot.startTime} – ${timeSlot.endTime}`
    }
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[rgb(var(--primary))]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">
            Review Your {appointmentSingular}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
          Please verify your appointment and patient details before confirming your booking.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-[var(--radius)] bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Treatment Details */}
        <div className="bg-[rgb(var(--muted)/0.25)] rounded-[var(--radius)] p-5 border border-[rgb(var(--border))] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--primary))] uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            {serviceSingular} Information
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-[rgb(var(--foreground))]">{service.name}</h3>
            {service.category?.name && (
              <p className="text-xs text-[rgb(var(--muted-foreground))]">{service.category.name}</p>
            )}
          </div>

          <div className="pt-2 border-t border-[rgb(var(--border))] flex items-center justify-between text-xs">
            <span className="font-bold text-sm text-[rgb(var(--foreground))]">
              {formatCurrency(service.price, currencySymbol)}
            </span>
            <span className="inline-flex items-center gap-1 text-[rgb(var(--muted-foreground))] font-medium">
              <Clock className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              {formatDuration(service.durationMinutes)}
            </span>
          </div>
        </div>

        {/* Card 2: Schedule & Doctor Details */}
        <div className="bg-[rgb(var(--muted)/0.25)] rounded-[var(--radius)] p-5 border border-[rgb(var(--border))] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--primary))] uppercase tracking-wider">
            <CalendarDays className="h-4 w-4" />
            Schedule & {staffSingular}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[rgb(var(--foreground))] font-semibold text-sm">
              <CalendarDays className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
              <span>{format(startDate, "EEEE, MMMM d, yyyy")}</span>
            </div>

            <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))] font-medium">
              <Clock className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
              <span>{formatTimeRange()}</span>
            </div>

            <div className="flex items-center gap-2 text-[rgb(var(--foreground))] font-medium">
              <Stethoscope className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
              <span>{timeSlot.staffName}</span>
            </div>

            <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
              <Building2 className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
              <span className="truncate">{business.name}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Patient Information (Full-width) */}
        <div className="md:col-span-2 bg-[rgb(var(--muted)/0.25)] rounded-[var(--radius)] p-5 border border-[rgb(var(--border))] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--primary))] uppercase tracking-wider">
            <User className="h-4 w-4" />
            Patient Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-[rgb(var(--muted-foreground))] uppercase font-bold tracking-wider block">
                Name
              </span>
              <span className="font-semibold text-sm text-[rgb(var(--foreground))]">{customer.name}</span>
            </div>

            <div>
              <span className="text-[10px] text-[rgb(var(--muted-foreground))] uppercase font-bold tracking-wider block">
                Email
              </span>
              <span className="font-semibold text-sm text-[rgb(var(--foreground))] truncate">{customer.email}</span>
            </div>

            <div>
              <span className="text-[10px] text-[rgb(var(--muted-foreground))] uppercase font-bold tracking-wider block">
                Phone
              </span>
              <span className="font-semibold text-sm text-[rgb(var(--foreground))]">{customer.phone}</span>
            </div>
          </div>

          {customer.notes && (
            <div className="pt-2 border-t border-[rgb(var(--border))] text-xs text-[rgb(var(--muted-foreground))]">
              <span className="font-bold text-[rgb(var(--foreground))]">Notes: </span>
              {customer.notes}
            </div>
          )}
        </div>
      </div>

      {/* Guarantee Badge */}
      <div className="p-3.5 rounded-lg bg-[rgb(var(--primary)/0.05)] border border-[rgb(var(--primary)/0.2)] flex items-center gap-3 text-xs text-[rgb(var(--foreground))]">
        <ShieldCheck className="h-5 w-5 text-[rgb(var(--primary))] shrink-0" />
        <span>No upfront payment required. You will receive an instant appointment confirmation code upon submission.</span>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} size="sm" disabled={loading}>
          ← Edit Details
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          size="default"
          className="gap-2 font-bold text-xs h-11 px-8 shadow-md shadow-[rgb(var(--primary)/0.25)]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming {appointmentSingular}...
            </>
          ) : (
            `Confirm ${appointmentSingular}`
          )}
        </Button>
      </div>
    </div>
  )
}

export default BookingSummary