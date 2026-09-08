import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Play,
  Check,
  Ban,
  AlertCircle,
  Loader2,
  Save,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  History,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { useBusiness } from "@/context/BusinessContext"

export function DoctorAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { business } = useBusiness()
  const currencySymbol = business?.currencySymbol || "₱"

  const [appointment, setAppointment] = useState<any>(null)
  const [patientHistory, setPatientHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingNotes, setSavingNotes] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [staffNotes, setStaffNotes] = useState("")

  const fetchAppointmentDetail = async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })

      if (res.ok) {
        const data = await res.json()
        setAppointment(data.appointment)
        setPatientHistory(data.patientHistory || [])
        setStaffNotes(data.appointment?.staffNotes || "")
      } else if (res.status === 403) {
        toast.error("Access denied. You can only view appointments assigned to you.")
        navigate("/doctor/appointments")
      } else {
        toast.error("Appointment not found")
        navigate("/doctor/appointments")
      }
    } catch (e) {
      console.error("Fetch detail error:", e)
      toast.error("Network error while loading appointment details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointmentDetail()
  }, [id])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return
    setUpdatingStatus(true)

    try {
      const res = await fetch(`/api/doctor/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const data = await res.json()
        setAppointment(data.appointment)
        toast.success(
          newStatus === "IN_PROGRESS"
            ? "Appointment started and marked In Progress."
            : newStatus === "COMPLETED"
            ? "✓ Appointment successfully marked as Completed."
            : `Status updated to ${newStatus}`
        )
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update status")
      }
    } catch (e) {
      console.error("Update status error:", e)
      toast.error("Network error while updating status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!id) return
    setSavingNotes(true)

    try {
      const res = await fetch(`/api/doctor/appointments/${id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ staffNotes }),
      })

      if (res.ok) {
        toast.success("✓ Clinical notes saved to patient record.")
      } else {
        toast.error("Failed to save clinical notes")
      }
    } catch (e) {
      console.error("Save notes error:", e)
      toast.error("Network error while saving notes")
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
        <p className="text-xs text-[rgb(var(--muted-foreground))]">Loading clinical appointment record...</p>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-[rgb(var(--muted-foreground))]">Appointment not found.</p>
        <Link to="/doctor/appointments">
          <Button size="sm" variant="outline">Back to Appointments</Button>
        </Link>
      </div>
    )
  }

  const startDate = new Date(appointment.startAt)
  const endDate = new Date(appointment.endAt)
  const formattedDate = format(startDate, "EEEE, MMMM d, yyyy")
  const timeRange = `${format(startDate, "hh:mm a")} – ${format(endDate, "hh:mm a")}`
  const duration = appointment.durationAtBooking || appointment.service?.durationMinutes || 30
  const price = appointment.priceAtBooking || appointment.service?.price || 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 font-bold text-xs gap-1.5 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> In Progress
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 font-bold text-xs gap-1.5 px-3 py-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Completed
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-300 font-bold text-xs gap-1.5 px-3 py-1">
            <Ban className="h-3.5 w-3.5 text-red-600" /> Cancelled
          </Badge>
        )
      case "NO_SHOW":
        return (
          <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300 font-bold text-xs gap-1.5 px-3 py-1">
            <AlertCircle className="h-3.5 w-3.5" /> No Show
          </Badge>
        )
      case "CONFIRMED":
      default:
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 font-bold text-xs gap-1.5 px-3 py-1">
            <Check className="h-3.5 w-3.5 text-blue-600" /> Confirmed Booking
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Appointments Workspace
        </Link>

        {/* Primary Lifecycle Status Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {appointment.status === "CONFIRMED" && (
            <>
              <Button
                size="sm"
                onClick={() => handleUpdateStatus("IN_PROGRESS")}
                disabled={updatingStatus}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 font-semibold px-4 gap-1.5 shadow-xs"
              >
                {updatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                Start Appointment
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus("NO_SHOW")}
                disabled={updatingStatus}
                className="text-xs h-9 text-slate-700 dark:text-slate-300"
              >
                Mark No-Show
              </Button>
            </>
          )}

          {appointment.status === "IN_PROGRESS" && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus("COMPLETED")}
              disabled={updatingStatus}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold px-5 gap-1.5 shadow-sm"
            >
              {updatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Mark as Completed
            </Button>
          )}

          {appointment.status === "COMPLETED" && (
            <Badge variant="outline" className="text-emerald-700 bg-emerald-500/10 border-emerald-300 text-xs font-semibold px-3 py-1 gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Treatment Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
                Clinical Appointment Record
              </span>
              <span className="text-xs font-mono bg-[rgb(var(--muted))] px-2 py-0.5 rounded text-[rgb(var(--muted-foreground))]">
                {appointment.confirmationCode}
              </span>
              {getStatusBadge(appointment.status)}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--foreground))] tracking-tight">
              {appointment.customer?.name || "Patient"}
            </h1>

            <p className="text-sm font-semibold text-[rgb(var(--primary))]">
              {appointment.serviceName || appointment.service?.name} · {duration} mins
            </p>
          </div>

          <div className="text-right sm:border-l sm:pl-6 border-[rgb(var(--border))] shrink-0 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider block">
              Treatment Fee
            </span>
            <div className="text-xl font-bold text-[rgb(var(--foreground))]">
              {formatCurrency(Number(price), currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Appointment Details & Clinical Notes */}
        <div className="lg:col-span-8 space-y-6">
          {/* APPOINTMENT SCHEDULE & DETAILS */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
              <Calendar className="h-4 w-4 text-[rgb(var(--primary))]" />
              <h3 className="font-bold text-sm text-[rgb(var(--foreground))]">Schedule & Clinical Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-md bg-[rgb(var(--muted)/0.25)] border border-[rgb(var(--border))] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[rgb(var(--muted-foreground))] tracking-wider">
                  Date
                </span>
                <p className="font-semibold text-sm text-[rgb(var(--foreground))]">{formattedDate}</p>
              </div>

              <div className="p-3.5 rounded-md bg-[rgb(var(--muted)/0.25)] border border-[rgb(var(--border))] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[rgb(var(--muted-foreground))] tracking-wider">
                  Time Slot & Duration
                </span>
                <p className="font-semibold text-sm text-[rgb(var(--foreground))]">{timeRange}</p>
              </div>

              <div className="p-3.5 rounded-md bg-[rgb(var(--muted)/0.25)] border border-[rgb(var(--border))] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[rgb(var(--muted-foreground))] tracking-wider">
                  Treatment
                </span>
                <p className="font-semibold text-[rgb(var(--foreground))]">{appointment.serviceName || appointment.service?.name}</p>
                {appointment.service?.shortDescription && (
                  <p className="text-[11px] text-[rgb(var(--muted-foreground))]">{appointment.service.shortDescription}</p>
                )}
              </div>

              <div className="p-3.5 rounded-md bg-[rgb(var(--muted)/0.25)] border border-[rgb(var(--border))] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[rgb(var(--muted-foreground))] tracking-wider">
                  Assigned Dentist
                </span>
                <p className="font-semibold text-[rgb(var(--foreground))]">{appointment.staff?.name || appointment.staffName}</p>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Assigned Clinical Provider
                </span>
              </div>
            </div>

            {/* Patient Request Notes */}
            {appointment.customerNotes && (
              <div className="p-3.5 rounded-md bg-blue-500/5 border border-blue-500/20 text-xs space-y-1">
                <span className="font-bold text-[11px] text-blue-700 dark:text-blue-300">
                  Patient Notes at Booking:
                </span>
                <p className="text-[rgb(var(--foreground))] italic leading-relaxed">
                  "{appointment.customerNotes}"
                </p>
              </div>
            )}

            {/* Cancellation Reason if cancelled */}
            {appointment.status === "CANCELLED" && (
              <div className="p-3.5 rounded-md bg-red-500/5 border border-red-500/20 text-xs space-y-1">
                <span className="font-bold text-[11px] text-red-700 dark:text-red-300">
                  Cancellation Reason:
                </span>
                <p className="text-red-600 dark:text-red-400">
                  {appointment.cancellationReason || "Cancelled by clinic administration or patient request."}
                </p>
              </div>
            )}
          </div>

          {/* DOCTOR CLINICAL NOTES */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-bold text-sm text-[rgb(var(--foreground))]">Doctor's Clinical Notes</h3>
              </div>
              <span className="text-[10px] font-mono text-[rgb(var(--muted-foreground))]">Confidential</span>
            </div>

            <div className="space-y-3">
              <textarea
                rows={5}
                placeholder="Enter clinical observations, diagnostic findings, treatment performed, recommendations for follow-up..."
                value={staffNotes}
                onChange={e => setStaffNotes(e.target.value)}
                className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-3 text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.3)]"
              />

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                  Saved notes are securely retained in the patient's electronic clinical record.
                </p>

                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="text-xs h-8.5 px-4 font-semibold gap-1.5"
                >
                  {savingNotes ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Clinical Notes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Patient Profile & Visit History */}
        <div className="lg:col-span-4 space-y-6">
          {/* PATIENT INFO CARD */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
              <User className="h-4 w-4 text-[rgb(var(--primary))]" />
              <h3 className="font-bold text-sm text-[rgb(var(--foreground))]">Patient Profile</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">
                  Full Name
                </span>
                <p className="font-bold text-sm text-[rgb(var(--foreground))]">{appointment.customer?.name || "Patient"}</p>
              </div>

              {appointment.customer?.phone && (
                <div className="space-y-0.5 pt-2 border-t border-[rgb(var(--border))]">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">
                    Phone Number
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-[rgb(var(--foreground))]">
                    <Phone className="h-3 w-3 text-[rgb(var(--primary))]" />
                    <span>{appointment.customer.phone}</span>
                  </div>
                </div>
              )}

              {appointment.customer?.email && (
                <div className="space-y-0.5 pt-2 border-t border-[rgb(var(--border))]">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">
                    Email Address
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-[rgb(var(--foreground))] truncate">
                    <Mail className="h-3 w-3 text-[rgb(var(--primary))] shrink-0" />
                    <span className="truncate">{appointment.customer.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PAST VISIT HISTORY */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[rgb(var(--primary))]" />
                <h3 className="font-bold text-sm text-[rgb(var(--foreground))]">Visit History</h3>
              </div>
              <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
                {patientHistory.length} previous visits
              </span>
            </div>

            {patientHistory.length === 0 ? (
              <p className="text-xs text-[rgb(var(--muted-foreground))] italic">
                First recorded visit for this patient at Veridian Dental.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {patientHistory.map(past => (
                  <div
                    key={past.id}
                    className="p-2.5 rounded bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[rgb(var(--foreground))]">
                        {past.serviceName || past.service?.name}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {past.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))]">
                      {format(new Date(past.startAt), "MMM d, yyyy · hh:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorAppointmentDetailPage
