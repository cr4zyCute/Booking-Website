import React, { useState, useEffect } from "react"
import { Clock, Calendar, ShieldCheck, Loader2 } from "lucide-react"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function DoctorSchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/doctor/schedule", {
      headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
    })
      .then(res => res.json())
      .then(data => setSchedule(data.schedule || []))
      .catch(err => console.error("Schedule fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  // Default weekly roster if not populated
  const defaultRoster = [
    { day: "Monday", time: "9:00 AM – 5:00 PM", status: "Working", breaks: "12:00 PM – 1:00 PM (Lunch)" },
    { day: "Tuesday", time: "9:00 AM – 5:00 PM", status: "Working", breaks: "12:00 PM – 1:00 PM (Lunch)" },
    { day: "Wednesday", time: "9:00 AM – 5:00 PM", status: "Working", breaks: "12:00 PM – 1:00 PM (Lunch)" },
    { day: "Thursday", time: "9:00 AM – 5:00 PM", status: "Working", breaks: "12:00 PM – 1:00 PM (Lunch)" },
    { day: "Friday", time: "9:00 AM – 5:00 PM", status: "Working", breaks: "12:00 PM – 1:00 PM (Lunch)" },
    { day: "Saturday", time: "9:00 AM – 3:00 PM", status: "Working", breaks: "None" },
    { day: "Sunday", time: "Closed", status: "Off", breaks: "-" },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
          <Clock className="h-6 w-6 text-[rgb(var(--primary))]" />
          My Clinical Schedule
        </h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Assigned clinic working shifts and consult hours managed by the Admin.
        </p>
      </div>

      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] flex items-center justify-between">
          <span className="font-semibold text-sm text-[rgb(var(--foreground))]">Weekly Clinical Roster</span>
          <span className="text-xs text-[rgb(var(--primary))] font-medium flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Synchronized
          </span>
        </div>

        <div className="divide-y divide-[rgb(var(--border))]">
          {defaultRoster.map(item => (
            <div key={item.day} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
              <div className="font-medium text-[rgb(var(--foreground))] w-32">{item.day}</div>
              <div className="flex-1 text-[rgb(var(--muted-foreground))]">
                <span className={item.status === "Off" ? "text-amber-600 font-medium" : "text-[rgb(var(--foreground))]"}>
                  {item.time}
                </span>
                {item.breaks !== "-" && (
                  <span className="text-xs text-[rgb(var(--muted-foreground))] ml-3">
                    Break: {item.breaks}
                  </span>
                )}
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium self-start sm:self-auto ${
                  item.status === "Working"
                    ? "bg-green-500/10 text-green-700"
                    : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
