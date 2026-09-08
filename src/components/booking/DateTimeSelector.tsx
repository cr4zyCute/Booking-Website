"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Clock,
  Sun,
  Sunset,
  Moon,
  Check,
  ArrowRight
} from "lucide-react"
import {
  format,
  addDays,
  startOfDay,
  isBefore,
  addMonths,
  subMonths,
  isSameDay,
  getDay,
  parse
} from "date-fns"
import type { BookingService, BookingStaff } from "./BookingFlow"

interface DateTimeSelectorProps {
  service: BookingService
  staff: BookingStaff | null
  businessId: string
  timezone: string
  currencySymbol: string
  selected: {
    date: string | null
    timeSlot: any | null
  }
  onSelect: (date: string, timeSlot: any) => void
  onBack: () => void
}

export function DateTimeSelector({
  service,
  staff,
  businessId,
  timezone,
  selected,
  onSelect,
  onBack,
}: DateTimeSelectorProps) {
  const today = startOfDay(new Date())
  const [currentMonth, setCurrentMonth] = useState(
    selected.date ? new Date(selected.date + "T00:00:00") : new Date()
  )
  const [selectedDate, setSelectedDate] = useState<Date>(
    selected.date ? new Date(selected.date + "T00:00:00") : today
  )
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any | null>(selected.timeSlot)

  const fetchSlots = useCallback(
    async (date: Date) => {
      setLoading(true)
      setSlots([])
      try {
        const dateStr = format(date, "yyyy-MM-dd")
        const params = new URLSearchParams({
          businessId,
          serviceId: service.id,
          date: dateStr,
          timezone,
        })
        if (staff) params.set("staffId", staff.id)
        else params.set("staffId", "any")

        const res = await fetch(`/api/booking/availability?${params}`)
        const data = await res.json()
        setSlots(data.slots ?? [])
      } catch {
        setSlots([])
      } finally {
        setLoading(false)
      }
    },
    [businessId, service.id, staff, timezone]
  )

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate)
    }
  }, [selectedDate, fetchSlots])

  // Calendar calculations
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startPad = getDay(firstDayOfMonth)
  const days: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => addDays(firstDayOfMonth, i)),
  ]

  const maxDate = addDays(today, 90)

  // Helper to format time slot strings (e.g. "09:00" -> "9:00 AM")
  const formatTimeSlotDisplay = (timeStr: string) => {
    try {
      const parsedTime = parse(timeStr, "HH:mm", new Date())
      return format(parsedTime, "h:mm a")
    } catch {
      return timeStr
    }
  }

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: any[] = []
    const afternoon: any[] = []
    const evening: any[] = []

    slots.forEach(slot => {
      const [hourStr] = slot.startTime.split(":")
      const hour = parseInt(hourStr, 10)
      if (hour < 12) {
        morning.push(slot)
      } else if (hour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })

    return { morning, afternoon, evening }
  }, [slots])

  const handleSlotClick = (slot: any) => {
    setSelectedSlot(slot)
  }

  const handleContinue = () => {
    if (!selectedSlot || !selectedDate) return
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    onSelect(dateStr, selectedSlot)
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[rgb(var(--primary))]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">
            Choose Date & Time
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
          Select an appointment date and an available consultation time slot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calendar Date Picker */}
        <div className="lg:col-span-5 bg-[rgb(var(--muted)/0.25)] p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              disabled={isBefore(currentMonth, today) && isSameDay(currentMonth, today)}
              className="p-1.5 rounded-[var(--radius)] hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-[rgb(var(--foreground))]">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-[var(--radius)] hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
              <div key={d} className="text-[11px] font-bold text-[rgb(var(--muted-foreground))] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={"empty-" + i} className="h-9 w-full" />
              const isPast = isBefore(day, today)
              const isTooFar = isBefore(maxDate, day)
              const isDisabled = isPast || isTooFar
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, today)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedDate(day)
                      setSelectedSlot(null) // reset slot when date changes
                    }
                  }}
                  disabled={isDisabled}
                  className={`h-9 w-full rounded-md text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[rgb(var(--primary))] text-white shadow-sm font-bold scale-105"
                      : isToday
                      ? "border border-[rgb(var(--primary))] text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]"
                      : isDisabled
                      ? "opacity-25 cursor-not-allowed text-[rgb(var(--muted-foreground))]"
                      : "hover:bg-[rgb(var(--card))] text-[rgb(var(--foreground))]"
                  }`}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-[rgb(var(--border))] text-center">
            <span className="text-[11px] text-[rgb(var(--muted-foreground))] font-medium">
              Selected: <strong className="text-[rgb(var(--foreground))]">{format(selectedDate, "EEEE, MMMM d, yyyy")}</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Grouped Time Slots */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[rgb(var(--border))]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
              <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
              Available Time Slots
            </div>
            <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium">
              {format(selectedDate, "MMM d, yyyy")}
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-7 w-7 animate-spin text-[rgb(var(--primary))]" />
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Checking doctor schedule availability...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[rgb(var(--border))] rounded-[var(--radius)] p-6 space-y-2">
              <Clock className="h-8 w-8 mx-auto text-[rgb(var(--muted-foreground))] opacity-40" />
              <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">No available slots on this date</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-xs mx-auto">
                All appointment slots for {format(selectedDate, "MMMM d")} are fully booked. Please choose another date on the calendar.
              </p>
            </div>
          ) : (
            <div className="space-y-5 max-h-[380px] overflow-y-auto pr-1">
              {/* Morning Slots */}
              {groupedSlots.morning.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--muted-foreground))]">
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    Morning
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {groupedSlots.morning.map(slot => {
                      const isSelected = selectedSlot?.startAt === slot.startAt && selectedSlot?.staffId === slot.staffId
                      return (
                        <button
                          key={slot.startAt + slot.staffId}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 select-none ${
                            isSelected
                              ? "bg-[rgb(var(--primary))] text-white border-[rgb(var(--primary))] shadow-sm ring-2 ring-[rgb(var(--primary)/0.3)]"
                              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--primary)/0.05)]"
                          }`}
                        >
                          {formatTimeSlotDisplay(slot.startTime)}
                          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Afternoon Slots */}
              {groupedSlots.afternoon.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--muted-foreground))]">
                    <Sunset className="h-3.5 w-3.5 text-orange-500" />
                    Afternoon
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {groupedSlots.afternoon.map(slot => {
                      const isSelected = selectedSlot?.startAt === slot.startAt && selectedSlot?.staffId === slot.staffId
                      return (
                        <button
                          key={slot.startAt + slot.staffId}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 select-none ${
                            isSelected
                              ? "bg-[rgb(var(--primary))] text-white border-[rgb(var(--primary))] shadow-sm ring-2 ring-[rgb(var(--primary)/0.3)]"
                              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--primary)/0.05)]"
                          }`}
                        >
                          {formatTimeSlotDisplay(slot.startTime)}
                          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Evening Slots */}
              {groupedSlots.evening.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--muted-foreground))]">
                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                    Evening
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {groupedSlots.evening.map(slot => {
                      const isSelected = selectedSlot?.startAt === slot.startAt && selectedSlot?.staffId === slot.staffId
                      return (
                        <button
                          key={slot.startAt + slot.staffId}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 select-none ${
                            isSelected
                              ? "bg-[rgb(var(--primary))] text-white border-[rgb(var(--primary))] shadow-sm ring-2 ring-[rgb(var(--primary)/0.3)]"
                              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--primary)/0.05)]"
                          }`}
                        >
                          {formatTimeSlotDisplay(slot.startTime)}
                          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} size="sm">
          ← Back
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!selectedSlot || loading}
          size="default"
          className="gap-2 font-semibold text-xs h-10 px-6 shadow-sm"
        >
          Continue to Patient Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default DateTimeSelector