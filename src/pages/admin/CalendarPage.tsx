import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function CalendarPage() {
  const { terminology } = useBusiness()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/calendar", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.appointments) setAppointments(data.appointments)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Calendar</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Weekly schedule view of {terminology.appointmentLabel.toLowerCase()}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-[rgb(var(--foreground))] ml-2">
            {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, new Date())
            const dayAppts = appointments.filter(a => isSameDay(new Date(a.startAt), day))

            return (
              <div
                key={idx}
                className={`bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-4 min-h-[220px] flex flex-col ${
                  isToday ? "ring-2 ring-[rgb(var(--primary))]" : ""
                }`}
              >
                <div className="border-b border-[rgb(var(--border))] pb-2 mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[rgb(var(--muted-foreground))]">
                    {format(day, "EEE")}
                  </span>
                  <span className={`text-sm font-bold ${isToday ? "text-[rgb(var(--primary))]" : "text-[rgb(var(--foreground))]"}`}>
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {dayAppts.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-[rgb(var(--muted-foreground))]">
                      No bookings
                    </div>
                  ) : (
                    dayAppts.map(appt => (
                      <div
                        key={appt.id}
                        className="p-2 rounded bg-[rgb(var(--muted)/0.6)] border border-[rgb(var(--border))] text-left space-y-0.5"
                      >
                        <div className="text-[10px] font-bold text-[rgb(var(--primary))]">
                          {format(new Date(appt.startAt), "h:mm a")}
                        </div>
                        <div className="text-xs font-medium text-[rgb(var(--foreground))] truncate">
                          {appt.customer?.name}
                        </div>
                        <div className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">
                          {appt.service?.name}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
