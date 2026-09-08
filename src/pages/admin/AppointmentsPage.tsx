import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserCog } from "lucide-react"
import { toast } from "sonner"

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "outline" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  NO_SHOW: { label: "No Show", variant: "destructive" },
}

export function AppointmentsPage() {
  const { business, terminology } = useBusiness()
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/appointments", {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      }),
      fetch("/api/admin/staff", {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      }),
    ])
      .then(async ([apptRes, staffRes]) => {
        if (apptRes.ok) {
          const apptData = await apptRes.json()
          if (apptData.appointments) setAppointments(apptData.appointments)
        }
        if (staffRes.ok) {
          const staffData = await staffRes.json()
          if (staffData.staff) setDoctors(staffData.staff)
        }
      })
      .catch(err => console.error("Appointments fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Appointment status updated to ${newStatus}`)
        setAppointments(prev =>
          prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
        )
      }
    } catch (e) {
      toast.error("Failed to update status")
    }
  }

  const handleReassignDoctor = async (id: string, newStaffId: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/reassign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ staffId: newStaffId }),
      })
      if (res.ok) {
        const assignedDoc = doctors.find(d => d.id === newStaffId)
        toast.success(`Appointment reassigned to ${assignedDoc?.name || "Doctor"}`)
        setAppointments(prev =>
          prev.map(a =>
            a.id === id
              ? { ...a, staffId: newStaffId, staff: assignedDoc || { name: assignedDoc?.name } }
              : a
          )
        )
      }
    } catch (e) {
      toast.error("Failed to reassign doctor")
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">{terminology.appointmentLabel}</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Manage all {terminology.appointmentLabel.toLowerCase()} and assign doctors to patient bookings.
        </p>
      </div>

      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden shadow-sm">
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-[rgb(var(--muted-foreground))]">
            <p className="font-medium text-[rgb(var(--foreground))]">No {terminology.appointmentLabel.toLowerCase()} yet</p>
            <p className="text-sm mt-1">Bookings will appear here when customers schedule.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.4)]">
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">{terminology.customerSingular}</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">{terminology.serviceSingular}</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Assigned {terminology.staffSingular}</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {appointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-[rgb(var(--muted)/0.3)] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-[rgb(var(--foreground))]">
                      {appt.confirmationCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[rgb(var(--foreground))]">{appt.customer?.name}</div>
                      <div className="text-xs text-[rgb(var(--muted-foreground))]">{appt.customer?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[rgb(var(--foreground))]">{appt.service?.name}</td>
                    <td className="py-3.5 px-4">
                      {/* Doctor Reassignment Picker */}
                      <select
                        value={appt.staffId || appt.staff?.id || ""}
                        onChange={e => handleReassignDoctor(appt.id, e.target.value)}
                        className="text-xs bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded px-2 py-1 cursor-pointer font-medium text-[rgb(var(--foreground))]"
                      >
                        {doctors.length > 0 ? (
                          doctors.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))
                        ) : (
                          <option value={appt.staffId}>{appt.staff?.name || "Dr. Maria Santos"}</option>
                        )}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[rgb(var(--foreground))]">{format(new Date(appt.startAt), "MMM d, yyyy")}</div>
                      <div className="text-xs text-[rgb(var(--muted-foreground))]">{format(new Date(appt.startAt), "h:mm a")}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[rgb(var(--foreground))]">
                      {formatCurrency(Number(appt.totalPrice || appt.priceAtBooking || 0), business.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={STATUS_CONFIG[appt.status]?.variant ?? "outline"}>
                        {STATUS_CONFIG[appt.status]?.label ?? appt.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={appt.status}
                        onChange={e => updateStatus(appt.id, e.target.value)}
                        className="text-xs bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded px-2 py-1 cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
