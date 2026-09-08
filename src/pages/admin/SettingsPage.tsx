import React from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Building, Clock, MapPin, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function SettingsPage() {
  const { business, settings } = useBusiness()

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Business & Booking Settings</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Review business identity, clinic address, and booking constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Info */}
        <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
            <Building className="h-5 w-5 text-[rgb(var(--primary))]" />
            Clinic Details
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Clinic Name</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{business.name}</p>
            </div>
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Email</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{business.email}</p>
            </div>
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Phone</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{business.phone}</p>
            </div>
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Timezone</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{business.timezone}</p>
            </div>
          </div>
        </div>

        {/* Booking Constraints */}
        <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
            <Clock className="h-5 w-5 text-[rgb(var(--primary))]" />
            Booking Rules
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Slot Interval</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{settings?.slotIntervalMinutes ?? 15} minutes</p>
            </div>
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Minimum Advance Notice</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{settings?.minNoticeHours ?? 2} hours</p>
            </div>
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Maximum Booking Window</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{settings?.maxBookingDays ?? 90} days</p>
            </div>
            <div>
              <span className="text-xs text-[rgb(var(--muted-foreground))]">Cancellation Window</span>
              <p className="font-medium text-[rgb(var(--foreground))]">{settings?.cancellationWindowHours ?? 24} hours</p>
            </div>
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="md:col-span-2 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[rgb(var(--primary))]" />
              Map & Location Management
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Current Address: <span className="font-medium text-[rgb(var(--foreground))]">{business.address || "Not configured"}</span>
            </p>
          </div>
          <Link to="/admin/location">
            <Button className="gap-2 shrink-0">
              Manage Map & Coordinates
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
