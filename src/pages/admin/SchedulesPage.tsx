import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Loader2, Clock } from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function SchedulesPage() {
  const { terminology } = useBusiness()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/schedules", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
      },
    })
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  const staff = data?.staff ?? []
  const openingHours = data?.openingHours ?? []

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Working Hours & Schedules</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Configure clinic operating hours and individual {terminology.staffSingular.toLowerCase()} work shifts.
        </p>
      </div>

      {/* Opening Hours */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Clinic Opening Hours</h2>
        <div className="space-y-3 max-w-xl">
          {DAYS.map((day, i) => {
            const hour = openingHours.find((h: any) => h.dayOfWeek === i + 1)
            return (
              <div key={day} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border))] text-sm">
                <span className="font-medium text-[rgb(var(--foreground))] w-32">{day}</span>
                {hour && !hour.isClosed ? (
                  <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {hour.openTime} – {hour.closeTime}
                  </span>
                ) : (
                  <span className="text-xs font-semibold uppercase text-red-500">Closed</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
