import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useBusiness } from "@/context/BusinessContext"
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Loader2,
  CalendarCheck,
  CalendarOff,
  Power,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function DashboardPage() {
  const { business } = useBusiness()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acceptingBookings, setAcceptingBookings] = useState<boolean>(true)
  const [togglingStatus, setTogglingStatus] = useState<boolean>(false)

  const fetchDashboardData = () => {
    fetch("/api/admin/dashboard", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
      },
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData)
        if (resData.acceptingBookings !== undefined) {
          setAcceptingBookings(resData.acceptingBookings)
        }
      })
      .catch(err => console.error("Dashboard error:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleToggleBookingStatus = async () => {
    const nextStatus = !acceptingBookings
    setTogglingStatus(true)

    try {
      const res = await fetch("/api/admin/booking-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
            ? `Bearer ${localStorage.getItem("token")}`
            : "",
        },
        body: JSON.stringify({ acceptingBookings: nextStatus }),
      })

      const resData = await res.json()
      if (res.ok) {
        setAcceptingBookings(nextStatus)
        if (nextStatus) {
          toast.success("New patient bookings are now ACTIVE and accepted online!")
        } else {
          toast.warning("New patient bookings are now PAUSED on the website and booking system.")
        }
      } else {
        toast.error(resData.error || "Failed to update booking status")
      }
    } catch (err) {
      toast.error("Network error while updating booking status")
    } finally {
      setTogglingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  const today = new Date()
  const statCards = [
    { label: "Today", value: (data?.todayAppts ?? 0).toString(), icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: (data?.pendingCount ?? 0).toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Confirmed", value: (data?.confirmedCount ?? 0).toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Customers", value: (data?.totalCustomers ?? 0).toString(), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  const statusConfig: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    PENDING: { label: "Pending", variant: "outline" },
    CONFIRMED: { label: "Confirmed", variant: "default" },
    COMPLETED: { label: "Completed", variant: "secondary" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
    NO_SHOW: { label: "No Show", variant: "destructive" },
  }

  const todaySchedule = data?.todaySchedule ?? []
  const recentAppts = data?.recentAppts ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Dashboard</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            {format(today, "EEEE, MMMM d, yyyy")} · {business.name}
          </p>
        </div>
      </div>

      {/* Centralized New Patient Booking Status Card (Admin Master Control) */}
      <div
        className={`p-5 sm:p-6 rounded-[var(--radius)] border transition-all shadow-sm ${
          acceptingBookings
            ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30"
            : "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                acceptingBookings
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-amber-500 text-white shadow-amber-500/20"
              }`}
            >
              {acceptingBookings ? (
                <CalendarCheck className="h-6 w-6" />
              ) : (
                <CalendarOff className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-[rgb(var(--foreground))]">
                  New Patient Booking Availability
                </h2>
                {acceptingBookings ? (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 gap-1 text-xs font-semibold py-0.5">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    ON — Accepting New Patient Bookings
                  </Badge>
                ) : (
                  <Badge className="bg-amber-600 text-white hover:bg-amber-700 gap-1 text-xs font-semibold py-0.5">
                    <AlertTriangle className="h-3 w-3" />
                    OFF — Not Accepting New Patient Bookings
                  </Badge>
                )}
              </div>

              <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed max-w-2xl">
                {acceptingBookings
                  ? "The public website hero displays active booking indicators and customers can schedule appointments online."
                  : "New online bookings are paused. The public website clearly displays paused status and blocks new submissions, while existing customer appointments remain intact."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant={acceptingBookings ? "outline" : "default"}
              size="default"
              onClick={handleToggleBookingStatus}
              disabled={togglingStatus}
              className={`gap-2 font-semibold shadow-sm text-xs h-10 px-5 ${
                acceptingBookings
                  ? "border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 hover:text-amber-800"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {togglingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : acceptingBookings ? (
                <>
                  <Power className="h-4 w-4 text-amber-500" />
                  Turn OFF Bookings
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 text-white" />
                  Turn ON Bookings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[rgb(var(--muted-foreground))]">{stat.label}</span>
              <div className={`h-8 w-8 rounded-[var(--radius)] ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--foreground))]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today Schedule */}
        <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-sm">
          <div className="p-5 border-b border-[rgb(var(--border))] flex items-center justify-between">
            <h2 className="font-semibold text-[rgb(var(--foreground))]">
              Today&apos;s Schedule
            </h2>
            <Link to="/admin/appointments" className="text-xs text-[rgb(var(--primary))] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-[rgb(var(--border))]">
            {todaySchedule.length === 0 ? (
              <div className="p-8 text-center text-[rgb(var(--muted-foreground))]">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No appointments today</p>
                <p className="text-xs mt-0.5">Your schedule is clear.</p>
              </div>
            ) : (
              todaySchedule.map((appt: any) => (
                <div key={appt.id} className="p-4 flex items-center gap-4">
                  <div className="text-sm font-medium text-[rgb(var(--foreground))] w-14">
                    {appt.startAt ? format(new Date(appt.startAt), "HH:mm") : "09:00"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                      {appt.customer?.name || "Customer"}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                      {appt.service?.name || "Dental Consultation"}
                    </p>
                  </div>
                  <Badge variant={statusConfig[appt.status]?.variant || "outline"} className="text-xs">
                    {statusConfig[appt.status]?.label || appt.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-sm">
          <div className="p-5 border-b border-[rgb(var(--border))] flex items-center justify-between">
            <h2 className="font-semibold text-[rgb(var(--foreground))]">
              Recent Activity
            </h2>
            <Link to="/admin/appointments" className="text-xs text-[rgb(var(--primary))] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-[rgb(var(--border))]">
            {recentAppts.length === 0 ? (
              <div className="p-8 text-center text-[rgb(var(--muted-foreground))]">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent bookings</p>
                <p className="text-xs mt-0.5">New bookings will appear here.</p>
              </div>
            ) : (
              recentAppts.map((appt: any) => (
                <div key={appt.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                      {appt.customer?.name || "Customer"}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                      {appt.service?.name || "Dental Consultation"} · {appt.staff?.name || "Doctor"}
                    </p>
                  </div>
                  <Badge variant={statusConfig[appt.status]?.variant || "outline"} className="text-xs">
                    {statusConfig[appt.status]?.label || appt.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
