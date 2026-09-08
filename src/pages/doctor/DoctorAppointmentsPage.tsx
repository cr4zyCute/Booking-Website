import React, { useState, useEffect } from "react"
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  Play,
  RotateCcw,
  Loader2,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  FileText,
  CalendarCheck,
  Ban
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { useBusiness } from "@/context/BusinessContext"

export interface DoctorAppointmentItem {
  id: string
  businessId: string
  serviceId: string
  staffId: string
  customerId: string
  startAt: string
  endAt: string
  status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  confirmationCode: string
  priceAtBooking?: number
  durationAtBooking?: number
  serviceName: string
  staffName: string
  customerNotes?: string | null
  staffNotes?: string | null
  cancellationReason?: string | null
  customer: {
    id: string
    name: string
    email: string
    phone?: string | null
    notes?: string | null
  }
  service: {
    id: string
    name: string
    price: number
    durationMinutes: number
    shortDescription?: string
  }
}

type TimeframeFilter = "all" | "today" | "tomorrow" | "this-week" | "upcoming" | "in-progress" | "completed" | "cancelled" | "no-show"

export function DoctorAppointmentsPage() {
  const { business, terminology } = useBusiness()
  const currencySymbol = business?.currencySymbol || "₱"

  const [appointments, setAppointments] = useState<DoctorAppointmentItem[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<TimeframeFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/doctor/appointments", {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
        if (data.summary) {
          setSummary(data.summary)
        }
      } else {
        toast.error("Failed to load appointments")
      }
    } catch (e) {
      console.error("Error fetching appointments:", e)
      toast.error("Network error while loading appointments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Transition status: e.g. CONFIRMED -> IN_PROGRESS, or IN_PROGRESS -> COMPLETED
  const handleUpdateStatus = async (appointmentId: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setUpdatingId(appointmentId)

    try {
      const res = await fetch(`/api/doctor/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const data = await res.json()
        setAppointments(prev =>
          prev.map(a => (a.id === appointmentId ? { ...a, status: newStatus as any } : a))
        )
        toast.success(
          newStatus === "IN_PROGRESS"
            ? "Appointment marked In Progress."
            : newStatus === "COMPLETED"
            ? "✓ Appointment marked as Completed."
            : `Status updated to ${newStatus}`
        )
        // Refresh KPI summary counters
        fetchAppointments()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update appointment status")
      }
    } catch (e) {
      console.error("Update status error:", e)
      toast.error("Network error while updating appointment")
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered Appointments
  const filteredAppointments = appointments.filter(item => {
    const start = new Date(item.startAt)
    const now = new Date()

    // Timeframe / Status filters
    if (activeFilter === "today" && !isToday(start)) return false
    if (activeFilter === "tomorrow" && !isTomorrow(start)) return false
    if (activeFilter === "this-week" && !isThisWeek(start)) return false
    if (activeFilter === "upcoming" && (start < now || ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(item.status))) return false
    if (activeFilter === "in-progress" && item.status !== "IN_PROGRESS") return false
    if (activeFilter === "completed" && item.status !== "COMPLETED") return false
    if (activeFilter === "cancelled" && item.status !== "CANCELLED") return false
    if (activeFilter === "no-show" && item.status !== "NO_SHOW") return false

    // Search query (Patient Name, Treatment, or Confirmation Code)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const patientMatch = item.customer?.name?.toLowerCase().includes(q)
      const serviceMatch = item.serviceName?.toLowerCase().includes(q) || item.service?.name?.toLowerCase().includes(q)
      const codeMatch = item.confirmationCode?.toLowerCase().includes(q)
      const phoneMatch = item.customer?.phone?.includes(q)
      return patientMatch || serviceMatch || codeMatch || phoneMatch
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 font-bold text-xs gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> In Progress
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 font-bold text-xs gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Completed
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-300 font-bold text-xs gap-1">
            <Ban className="h-3 w-3 text-red-600" /> Cancelled
          </Badge>
        )
      case "NO_SHOW":
        return (
          <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300 font-bold text-xs gap-1">
            <AlertCircle className="h-3 w-3" /> No Show
          </Badge>
        )
      case "CONFIRMED":
      default:
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 font-bold text-xs gap-1">
            <CalendarCheck className="h-3 w-3 text-blue-600" /> Confirmed
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">
              Doctor Appointments Workspace
            </h1>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Manage patient consultations, treatments, clinical statuses, and notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAppointments}
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveFilter("today")}
          className={`p-3.5 rounded-[var(--radius)] border transition-all cursor-pointer select-none ${
            activeFilter === "today"
              ? "bg-[rgb(var(--primary)/0.1)] border-[rgb(var(--primary))]"
              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:bg-[rgb(var(--muted)/0.3)]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Today's Visits</span>
          <div className="text-2xl font-extrabold text-[rgb(var(--foreground))] mt-1">{summary.today}</div>
          <span className="text-[10px] text-[rgb(var(--primary))] font-semibold">Scheduled today</span>
        </div>

        <div
          onClick={() => setActiveFilter("upcoming")}
          className={`p-3.5 rounded-[var(--radius)] border transition-all cursor-pointer select-none ${
            activeFilter === "upcoming"
              ? "bg-[rgb(var(--primary)/0.1)] border-[rgb(var(--primary))]"
              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:bg-[rgb(var(--muted)/0.3)]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Upcoming</span>
          <div className="text-2xl font-extrabold text-[rgb(var(--foreground))] mt-1">{summary.upcoming}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Future bookings</span>
        </div>

        <div
          onClick={() => setActiveFilter("in-progress")}
          className={`p-3.5 rounded-[var(--radius)] border transition-all cursor-pointer select-none ${
            activeFilter === "in-progress"
              ? "bg-amber-500/10 border-amber-500"
              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:bg-[rgb(var(--muted)/0.3)]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">In Progress</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{summary.inProgress}</div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">In chair now</span>
        </div>

        <div
          onClick={() => setActiveFilter("completed")}
          className={`p-3.5 rounded-[var(--radius)] border transition-all cursor-pointer select-none ${
            activeFilter === "completed"
              ? "bg-emerald-500/10 border-emerald-500"
              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:bg-[rgb(var(--muted)/0.3)]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{summary.completed}</div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Treated</span>
        </div>

        <div
          onClick={() => setActiveFilter("cancelled")}
          className={`p-3.5 rounded-[var(--radius)] border transition-all cursor-pointer select-none ${
            activeFilter === "cancelled"
              ? "bg-red-500/10 border-red-500"
              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:bg-[rgb(var(--muted)/0.3)]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Cancelled</span>
          <div className="text-2xl font-extrabold text-red-600 mt-1">{summary.cancelled}</div>
          <span className="text-[10px] text-red-700 dark:text-red-300 font-semibold">Call cancellations</span>
        </div>

        <div
          onClick={() => setActiveFilter("all")}
          className={`p-3.5 rounded-[var(--radius)] border transition-all cursor-pointer select-none ${
            activeFilter === "all"
              ? "bg-[rgb(var(--primary)/0.1)] border-[rgb(var(--primary))]"
              : "bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:bg-[rgb(var(--muted)/0.3)]"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">All History</span>
          <div className="text-2xl font-extrabold text-[rgb(var(--foreground))] mt-1">{summary.total}</div>
          <span className="text-[10px] text-[rgb(var(--muted-foreground))] font-semibold">Total records</span>
        </div>
      </div>

      {/* Filter Tabs & Search Control */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Timeframe Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setActiveFilter("today")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "today"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Today
            </button>

            <button
              onClick={() => setActiveFilter("tomorrow")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "tomorrow"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Tomorrow
            </button>

            <button
              onClick={() => setActiveFilter("this-week")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "this-week"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              This Week
            </button>

            <button
              onClick={() => setActiveFilter("upcoming")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "upcoming"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Upcoming
            </button>

            <button
              onClick={() => setActiveFilter("in-progress")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "in-progress"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              In Progress
            </button>

            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "completed"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Completed
            </button>

            <button
              onClick={() => setActiveFilter("cancelled")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === "cancelled"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
            <Input
              placeholder="Search patient name, treatment, code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8.5 text-xs pl-8 bg-[rgb(var(--background))]"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center space-y-3 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))]">
            <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--primary))] mx-auto" />
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Loading appointments schedule...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))]">
            <div className="h-12 w-12 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center mx-auto text-[rgb(var(--muted-foreground))]">
              <CalendarDays className="h-6 w-6 opacity-40" />
            </div>
            <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">No appointments found</h3>
            <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
              {searchQuery
                ? "No appointments match your search criteria. Try a different search term."
                : "No appointments scheduled for this filter timeframe."}
            </p>
          </div>
        ) : (
          filteredAppointments.map(appt => {
            const startDate = new Date(appt.startAt)
            const endDate = new Date(appt.endAt)
            const formattedDate = format(startDate, "EEE, MMMM d, yyyy")
            const timeRange = `${format(startDate, "hh:mm a")} – ${format(endDate, "hh:mm a")}`
            const duration = appt.durationAtBooking || appt.service?.durationMinutes || 30
            const isUpdating = updatingId === appt.id

            return (
              <div
                key={appt.id}
                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                className={`p-4 sm:p-5 rounded-[var(--radius)] border transition-all cursor-pointer ${
                  appt.status === "IN_PROGRESS"
                    ? "bg-amber-500/5 border-amber-500/30 shadow-xs ring-1 ring-amber-500/20"
                    : appt.status === "CONFIRMED"
                    ? "bg-[rgb(var(--card))] border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] shadow-2xs"
                    : "bg-[rgb(var(--card))] border-[rgb(var(--border))] opacity-90 hover:opacity-100"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Time & Patient info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Time Slot Tile */}
                    <div className="w-24 sm:w-28 shrink-0 p-2.5 rounded-md bg-[rgb(var(--muted)/0.4)] border border-[rgb(var(--border))] text-center space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-[rgb(var(--primary))] block">
                        {format(startDate, "hh:mm a")}
                      </span>
                      <span className="text-[11px] font-semibold text-[rgb(var(--foreground))] block">
                        {duration} mins
                      </span>
                      <span className="text-[9px] text-[rgb(var(--muted-foreground))] block truncate">
                        {format(startDate, "MMM d")}
                      </span>
                    </div>

                    {/* Patient & Treatment Details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--foreground))] truncate">
                          {appt.customer?.name || "Patient"}
                        </h3>
                        {getStatusBadge(appt.status)}
                        <span className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted))] px-1.5 py-0.5 rounded">
                          {appt.confirmationCode}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[rgb(var(--primary))]">
                        {appt.serviceName || appt.service?.name}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))] flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{timeRange}</span>
                        </div>
                        {appt.customer?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{appt.customer.phone}</span>
                          </div>
                        )}
                        {appt.customer?.email && (
                          <div className="flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{appt.customer.email}</span>
                          </div>
                        )}
                      </div>

                      {appt.customerNotes && (
                        <p className="text-[11px] text-[rgb(var(--muted-foreground))] italic line-clamp-1 pt-0.5">
                          Note: "{appt.customerNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Workflow Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[rgb(var(--border))]">
                    {/* Status lifecycle actions */}
                    {appt.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={e => handleUpdateStatus(appt.id, "IN_PROGRESS", e)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8.5 font-semibold px-3.5 gap-1.5 shadow-xs"
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
                        Start Appointment
                      </Button>
                    )}

                    {appt.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={e => handleUpdateStatus(appt.id, "COMPLETED", e)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8.5 font-semibold px-3.5 gap-1.5 shadow-xs"
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Mark Completed
                      </Button>
                    )}

                    <Link
                      to={`/doctor/appointments/${appt.id}`}
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8.5 font-semibold px-3 gap-1"
                      >
                        View Details
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default DoctorAppointmentsPage
