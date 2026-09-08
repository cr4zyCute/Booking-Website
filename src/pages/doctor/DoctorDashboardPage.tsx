import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Loader2,
  Sparkles,
  ArrowRight,
  Bell,
  Check,
  Play,
  CalendarCheck,
  Stethoscope,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { format, isToday, formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export function DoctorDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({ today: 0, upcoming: 0, inProgress: 0, completed: 0 })
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDoctorData = async () => {
    try {
      const [dashRes, apptRes, notifRes] = await Promise.all([
        fetch("/api/doctor/dashboard", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
        fetch("/api/doctor/appointments", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
        fetch("/api/doctor/notifications", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
      ])

      if (dashRes.ok) {
        const data = await dashRes.json()
        setDashboard(data)
      }
      if (apptRes.ok) {
        const data = await apptRes.json()
        setAppointments(data.appointments || [])
        if (data.summary) setSummary(data.summary)
      }
      if (notifRes.ok) {
        const data = await notifRes.json()
        setNotifications(data.notifications || [])
      }
    } catch (e) {
      console.error("Doctor data fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctorData()
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
        <p className="text-xs text-[rgb(var(--muted-foreground))]">Loading clinical dashboard overview...</p>
      </div>
    )
  }

  const doctorName = dashboard?.doctorProfile?.name || user?.name || "Doctor"
  const doctorSpecialty = dashboard?.doctorProfile?.specialty || "Dental Specialist"

  // Filter Today's Appointments
  const todayAppointments = appointments.filter(a => isToday(new Date(a.startAt)))

  // Filter Upcoming Appointments
  const upcomingAppointments = appointments.filter(
    a => new Date(a.startAt) >= new Date() && ["CONFIRMED", "IN_PROGRESS"].includes(a.status)
  ).slice(0, 5)

  // Unread or recent notifications
  const recentNotifications = notifications.slice(0, 4)
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Welcome Banner with Quick Actions */}
      <div className="bg-[rgb(var(--card))] p-6 sm:p-8 rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
              <Stethoscope className="h-4 w-4" />
              Doctor Clinical Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--foreground))] tracking-tight">
              Welcome back, {doctorName}
            </h1>
            <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
              {doctorSpecialty} · You have <span className="font-bold text-[rgb(var(--foreground))]">{todayAppointments.length} appointments</span> scheduled today.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link to="/doctor/appointments">
              <Button size="sm" className="gap-1.5 text-xs font-semibold h-9 px-4 shadow-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                View Appointments ({appointments.length})
              </Button>
            </Link>

            <Link to="/doctor/notifications">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold h-9 px-4">
                <Bell className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                Notifications {unreadCount > 0 && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold">{unreadCount}</span>}
              </Button>
            </Link>

            <Link to="/doctor/profile">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold h-9 px-4">
                <User className="h-3.5 w-3.5" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/doctor/appointments?timeframe=today" className="block group">
          <div className="p-4 rounded-[var(--radius)] bg-[rgb(var(--card))] border border-[rgb(var(--border))] group-hover:border-[rgb(var(--primary)/0.4)] transition-all shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Today's Visits</span>
            <div className="text-2xl font-extrabold text-[rgb(var(--foreground))]">{summary.today}</div>
            <span className="text-[10px] text-[rgb(var(--primary))] font-semibold flex items-center gap-0.5">
              Open workspace <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        <Link to="/doctor/appointments?timeframe=upcoming" className="block group">
          <div className="p-4 rounded-[var(--radius)] bg-[rgb(var(--card))] border border-[rgb(var(--border))] group-hover:border-[rgb(var(--primary)/0.4)] transition-all shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Upcoming Schedule</span>
            <div className="text-2xl font-extrabold text-blue-600">{summary.upcoming}</div>
            <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-0.5">
              Active bookings <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        <Link to="/doctor/appointments?timeframe=completed" className="block group">
          <div className="p-4 rounded-[var(--radius)] bg-[rgb(var(--card))] border border-[rgb(var(--border))] group-hover:border-[rgb(var(--primary)/0.4)] transition-all shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Completed</span>
            <div className="text-2xl font-extrabold text-emerald-600">{summary.completed}</div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-0.5">
              Patients treated <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        <Link to="/doctor/notifications" className="block group">
          <div className="p-4 rounded-[var(--radius)] bg-[rgb(var(--card))] border border-[rgb(var(--border))] group-hover:border-[rgb(var(--primary)/0.4)] transition-all shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Unread Alerts</span>
            <div className={`text-2xl font-extrabold ${unreadCount > 0 ? "text-red-600" : "text-[rgb(var(--foreground))]"}`}>{unreadCount}</div>
            <span className="text-[10px] text-[rgb(var(--muted-foreground))] font-semibold flex items-center gap-0.5">
              Notification center <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* 2-Column Main Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Appointments & Upcoming */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h2 className="font-bold text-base text-[rgb(var(--foreground))]">Today's Schedule</h2>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {format(new Date(), "EEEE, MMM d")}
                </Badge>
              </div>

              <Link to="/doctor/appointments?timeframe=today" className="text-xs font-semibold text-[rgb(var(--primary))] hover:underline flex items-center gap-1">
                Workspace <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center mx-auto text-[rgb(var(--muted-foreground))]">
                  <CalendarDays className="h-5 w-5 opacity-40" />
                </div>
                <p className="text-xs font-semibold text-[rgb(var(--foreground))]">No appointments scheduled for today.</p>
                <p className="text-[11px] text-[rgb(var(--muted-foreground))]">Your upcoming appointments are shown below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(appt => (
                  <div
                    key={appt.id}
                    onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                    className="p-3.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.15)] hover:bg-[rgb(var(--muted)/0.3)] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-center shrink-0">
                        <span className="text-[11px] font-bold text-[rgb(var(--primary))] block">
                          {format(new Date(appt.startAt), "hh:mm a")}
                        </span>
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-xs text-[rgb(var(--foreground))] truncate">
                          {appt.customer?.name}
                        </h4>
                        <p className="text-[11px] text-[rgb(var(--muted-foreground))] truncate">
                          {appt.serviceName || appt.service?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {appt.status}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                        Open →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments Preview */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h2 className="font-bold text-base text-[rgb(var(--foreground))]">Upcoming Patients</h2>
              </div>

              <Link to="/doctor/appointments" className="text-xs font-semibold text-[rgb(var(--primary))] hover:underline flex items-center gap-1">
                View all ({appointments.length}) <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-[rgb(var(--muted-foreground))] italic py-4 text-center">
                No upcoming patients in queue.
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingAppointments.map(appt => (
                  <div
                    key={appt.id}
                    onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                    className="p-3 rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted)/0.3)] transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[rgb(var(--foreground))]">{appt.customer?.name}</div>
                      <div className="text-[11px] text-[rgb(var(--muted-foreground))]">
                        {appt.serviceName || appt.service?.name} · {format(new Date(appt.startAt), "EEE, MMM d · hh:mm a")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {appt.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Alerts & Clinic Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Alerts Card */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-bold text-sm text-[rgb(var(--foreground))]">Recent Notifications</h3>
              </div>

              <Link to="/doctor/notifications" className="text-xs font-semibold text-[rgb(var(--primary))] hover:underline">
                View all →
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-xs text-[rgb(var(--muted-foreground))] italic py-4 text-center">
                You're all caught up.
              </p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.appointmentId) {
                        navigate(`/doctor/appointments/${item.appointmentId}`)
                      } else {
                        navigate("/doctor/notifications")
                      }
                    }}
                    className={`p-3 rounded-md border text-xs space-y-1 cursor-pointer transition-colors ${
                      !item.isRead
                        ? "bg-[rgb(var(--primary)/0.05)] border-[rgb(var(--primary)/0.2)]"
                        : "bg-[rgb(var(--muted)/0.2)] border-[rgb(var(--border))]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-semibold truncate ${!item.isRead ? "text-[rgb(var(--foreground))]" : "text-[rgb(var(--muted-foreground))]"}`}>
                        {item.title}
                      </span>
                      {!item.isRead && <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--primary))] shrink-0" />}
                    </div>

                    <p className="text-[11px] text-[rgb(var(--muted-foreground))] line-clamp-2">
                      {item.message}
                    </p>

                    <div className="text-[10px] text-[rgb(var(--muted-foreground))] pt-0.5">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Shift Schedule Quick Link */}
          <div className="bg-[rgb(var(--muted)/0.3)] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 space-y-3 text-xs">
            <div className="font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
              Working Shift Schedule
            </div>
            <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
              Review your weekly clinic operating shifts, lunch breaks, and scheduled overrides.
            </p>
            <Link to="/doctor/schedule" className="block w-full">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8.5">
                View My Shifts Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboardPage
