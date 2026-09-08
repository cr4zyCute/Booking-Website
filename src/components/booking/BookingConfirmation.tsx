import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CheckCircle, CalendarDays, Clock, User, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { formatCurrency, formatDuration } from "@/lib/utils"
import type { BookingSelection } from "./BookingFlow"

interface BookingConfirmationProps {
  confirmationCode: string
  selection: BookingSelection
  business: any
  terminology: any
}

export function BookingConfirmation({ confirmationCode, selection, business, terminology }: BookingConfirmationProps) {
  const { service, timeSlot, customer } = selection
  if (!service || !timeSlot || !customer) return null

  const startDate = new Date(timeSlot.startAt)

  return (
    <div className="text-center py-10 px-6">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-[rgb(var(--primary)/0.1)] flex items-center justify-center">
          <CheckCircle className="h-9 w-9 text-[rgb(var(--primary))]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
        {terminology.appointmentSingular} Confirmed!
      </h2>
      <p className="text-[rgb(var(--muted-foreground))] mb-2">
        Thank you, {customer.name}. We look forward to seeing you.
      </p>
      <div className="inline-block bg-[rgb(var(--muted))] px-4 py-1.5 rounded-full text-sm font-mono font-semibold text-[rgb(var(--foreground))] mb-8">
        {confirmationCode}
      </div>

      <div className="max-w-sm mx-auto bg-[rgb(var(--muted)/0.4)] rounded-[var(--radius)] p-6 text-left space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[rgb(var(--primary)/0.1)] flex items-center justify-center shrink-0">
            <CalendarDays className="h-4 w-4 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <div className="text-xs text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-0.5">{terminology.serviceSingular}</div>
            <div className="font-medium text-[rgb(var(--foreground))]">{service.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[rgb(var(--primary)/0.1)] flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <div className="text-xs text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-0.5">Date & Time</div>
            <div className="font-medium text-[rgb(var(--foreground))]">{format(startDate, "EEEE, MMMM d, yyyy")}</div>
            <div className="text-sm text-[rgb(var(--muted-foreground))]">{timeSlot.startTime} – {timeSlot.endTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[rgb(var(--primary)/0.1)] flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <div className="text-xs text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-0.5">{terminology.staffSingular}</div>
            <div className="font-medium text-[rgb(var(--foreground))]">{timeSlot.staffName}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-[rgb(var(--border))] flex justify-between">
          <span className="text-sm text-[rgb(var(--muted-foreground))]">{formatDuration(service.durationMinutes)}</span>
          <span className="font-semibold text-[rgb(var(--foreground))]">
            {formatCurrency(service.price, business.currencySymbol)}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link to="/booking">
          <Button className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Book Another
          </Button>
        </Link>
      </div>

      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-6">
        A confirmation will be sent to {customer.email}
      </p>
    </div>
  )
}