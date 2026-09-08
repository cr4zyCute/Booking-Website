import React, { useState, useEffect } from "react"
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  XCircle,
  Clock,
  Info,
  Search,
  RotateCcw,
  Loader2,
  ExternalLink,
  Filter,
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  Mail,
  FileText,
  CalendarCheck,
  ShieldCheck,
  Ban,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export interface DoctorNotification {
  id: string
  staffId: string
  appointmentId?: string | null
  type: string
  title: string
  message: string
  isRead: boolean
  readAt?: string | null
  metadata?: any
  createdAt: string
  appointment?: any
}

type FilterTab = "ALL" | "UNREAD" | "NEW_APPOINTMENT" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "CLINIC_ANNOUNCEMENT"

export function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState<DoctorNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/doctor/notifications", {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })
      if (res.ok) {
        const data = await res.json()
        const items: DoctorNotification[] = data.notifications || []
        setNotifications(items)

        // Set initial selected item if not already set or invalid
        if (items.length > 0) {
          setSelectedId(prev => (prev && items.some(n => n.id === prev) ? prev : items[0].id))
        } else {
          setSelectedId(null)
        }
      } else {
        toast.error("Failed to load notifications")
      }
    } catch (e) {
      console.error("Error fetching notifications:", e)
      toast.error("Network error while loading notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Mark single as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      const res = await fetch(`/api/doctor/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        )
      }
    } catch (e) {
      console.error("Mark read error:", e)
    }
  }

  // Mark single as unread
  const handleMarkAsUnread = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    try {
      const res = await fetch(`/api/doctor/notifications/${id}/unread`, {
        method: "PATCH",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: false, readAt: null } : n))
        )
        toast.success("Notification marked as unread")
      }
    } catch (e) {
      console.error("Mark unread error:", e)
    }
  }

  // Handle clicking an item in the left list
  const handleSelectNotification = (item: DoctorNotification) => {
    setSelectedId(item.id)

    // If notification is unread, automatically mark as read upon clicking/selecting
    if (!item.isRead) {
      handleMarkAsRead(item.id)
    }
  }

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      const res = await fetch("/api/doctor/notifications/read-all", {
        method: "PATCH",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
        toast.success("All notifications marked as read")
      }
    } catch (e) {
      console.error("Mark all read error:", e)
      toast.error("Failed to mark all as read")
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const apptsCount = notifications.filter(n => n.type === "NEW_APPOINTMENT").length
  const cancelCount = notifications.filter(n => n.type === "APPOINTMENT_CANCELLED").length
  const reschedCount = notifications.filter(n => n.type === "APPOINTMENT_RESCHEDULED").length
  const announceCount = notifications.filter(n => n.type === "CLINIC_ANNOUNCEMENT").length

  // Filtered notifications
  const filteredNotifications = notifications.filter(item => {
    if (activeTab === "UNREAD" && item.isRead) return false
    if (activeTab === "NEW_APPOINTMENT" && item.type !== "NEW_APPOINTMENT") return false
    if (activeTab === "APPOINTMENT_CANCELLED" && item.type !== "APPOINTMENT_CANCELLED") return false
    if (activeTab === "APPOINTMENT_RESCHEDULED" && item.type !== "APPOINTMENT_RESCHEDULED") return false
    if (activeTab === "CLINIC_ANNOUNCEMENT" && item.type !== "CLINIC_ANNOUNCEMENT") return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = item.title?.toLowerCase().includes(q)
      const msgMatch = item.message?.toLowerCase().includes(q)
      const patientMatch = item.metadata?.customerName?.toLowerCase().includes(q)
      return titleMatch || msgMatch || patientMatch
    }
    return true
  })

  // Determine active selected notification
  const selectedNotification =
    filteredNotifications.find(n => n.id === selectedId) ||
    (filteredNotifications.length > 0 ? filteredNotifications[0] : null)

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "NEW_APPOINTMENT":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 font-semibold text-[11px] gap-1 shrink-0">
            <Calendar className="h-3 w-3" /> New Booking
          </Badge>
        )
      case "APPOINTMENT_CANCELLED":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-300 font-semibold text-[11px] gap-1 shrink-0">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        )
      case "APPOINTMENT_RESCHEDULED":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 font-semibold text-[11px] gap-1 shrink-0">
            <Clock className="h-3 w-3" /> Rescheduled
          </Badge>
        )
      case "CLINIC_ANNOUNCEMENT":
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 font-semibold text-[11px] gap-1 shrink-0">
            <Info className="h-3 w-3" /> Announcement
          </Badge>
        )
    }
  }

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
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header Bar */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">
              Doctor Notification Center
            </h1>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Click any alert to inspect clinical details, past history, and deep-link directly to appointment records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-xs h-9 gap-1.5 font-semibold"
            >
              {markingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
              Mark All as Read ({unreadCount})
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={fetchNotifications}
            className="text-xs h-9 px-2.5"
            title="Refresh notifications"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab("UNREAD")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "UNREAD"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>

            <button
              onClick={() => setActiveTab("NEW_APPOINTMENT")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "NEW_APPOINTMENT"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Bookings ({apptsCount})
            </button>

            <button
              onClick={() => setActiveTab("APPOINTMENT_CANCELLED")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "APPOINTMENT_CANCELLED"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Cancellations ({cancelCount})
            </button>

            <button
              onClick={() => setActiveTab("APPOINTMENT_RESCHEDULED")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "APPOINTMENT_RESCHEDULED"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Rescheduled ({reschedCount})
            </button>

            <button
              onClick={() => setActiveTab("CLINIC_ANNOUNCEMENT")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "CLINIC_ANNOUNCEMENT"
                  ? "bg-[rgb(var(--primary))] text-white shadow-xs"
                  : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              Announcements ({announceCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8.5 text-xs pl-8 bg-[rgb(var(--background))]"
            />
          </div>
        </div>
      </div>

      {/* Master-Detail 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notification Master List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-12 text-center space-y-3 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))]">
              <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--primary))] mx-auto" />
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))]">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">You're all caught up.</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-xs mx-auto">
                {searchQuery
                  ? "No notifications matching your search query."
                  : "No notifications found in this filter category."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredNotifications.map(item => {
                const isSelected = selectedNotification?.id === item.id
                const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectNotification(item)}
                    className={`p-4 rounded-[var(--radius)] border transition-all cursor-pointer select-none text-left relative overflow-hidden ${
                      isSelected
                        ? "bg-[rgb(var(--primary)/0.08)] border-[rgb(var(--primary))] shadow-sm ring-1 ring-[rgb(var(--primary))]"
                        : !item.isRead
                        ? "bg-[rgb(var(--card))] border-[rgb(var(--primary)/0.3)] shadow-2xs hover:border-[rgb(var(--primary)/0.5)]"
                        : "bg-[rgb(var(--card))] border-[rgb(var(--border))] opacity-85 hover:opacity-100 hover:bg-[rgb(var(--muted)/0.3)]"
                    }`}
                  >
                    {/* Active Selected Indicator Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[rgb(var(--primary))]" />
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        {getNotificationBadge(item.type)}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[rgb(var(--muted-foreground))]">{timeAgo}</span>
                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-[rgb(var(--primary))] shrink-0" title="Unread" />
                          )}
                        </div>
                      </div>

                      <h4 className={`text-xs truncate ${!item.isRead || isSelected ? "font-bold text-[rgb(var(--foreground))]" : "font-semibold text-[rgb(var(--foreground)/0.8)]"}`}>
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-[rgb(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Dedicated Full Notification Preview Panel */}
        <div className="lg:col-span-7 sticky top-20">
          {!selectedNotification ? (
            <div className="p-12 text-center space-y-3 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-sm">
              <div className="h-12 w-12 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center mx-auto text-[rgb(var(--muted-foreground))]">
                <Bell className="h-6 w-6 opacity-40" />
              </div>
              <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">No Notification Selected</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
                Select a notification from the list to view its complete details, clinical patient information, and deep-link actions.
              </p>
            </div>
          ) : (
            <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-sm divide-y divide-[rgb(var(--border))] overflow-hidden">
              {/* Preview Header */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {getNotificationBadge(selectedNotification.type)}
                    {selectedNotification.isRead ? (
                      <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Read
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded font-medium">
                        Unread
                      </span>
                    )}
                  </div>

                  {/* Read / Unread toggle */}
                  <div className="flex items-center gap-2">
                    {selectedNotification.isRead ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={e => handleMarkAsUnread(selectedNotification.id, e)}
                        className="text-xs h-8 px-2.5 text-[rgb(var(--muted-foreground))]"
                      >
                        Mark as Unread
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={e => handleMarkAsRead(selectedNotification.id, e)}
                        className="text-xs h-8 px-2.5 text-[rgb(var(--primary))]"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Mark as Read
                      </Button>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
                  {selectedNotification.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{format(new Date(selectedNotification.createdAt), "EEEE, MMMM d, yyyy · hh:mm a")}</span>
                  <span>({formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })})</span>
                </div>
              </div>

              {/* Preview Message Body */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-lg bg-[rgb(var(--muted)/0.2)] border border-[rgb(var(--border))] text-xs text-[rgb(var(--foreground))] leading-relaxed whitespace-pre-line">
                  {selectedNotification.message}
                </div>

                {/* Connected Appointment Details Card */}
                {selectedNotification.appointmentId && (
                  <div className="p-5 rounded-lg border border-[rgb(var(--primary)/0.3)] bg-[rgb(var(--primary)/0.03)] space-y-4">
                    <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-[rgb(var(--primary))]" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-[rgb(var(--foreground))]">
                          Associated Appointment Record
                        </h3>
                      </div>

                      {selectedNotification.appointment?.status && (
                        getStatusBadge(selectedNotification.appointment.status)
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Patient Name */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">
                          Patient
                        </span>
                        <div className="font-bold text-[rgb(var(--foreground))] flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                          <span>{selectedNotification.metadata?.customerName || selectedNotification.appointment?.customer?.name || "Patient"}</span>
                        </div>
                      </div>

                      {/* Treatment */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">
                          Treatment
                        </span>
                        <div className="font-bold text-[rgb(var(--primary))]">
                          {selectedNotification.metadata?.serviceName || selectedNotification.appointment?.service?.name || selectedNotification.appointment?.serviceName || "Clinical Consultation"}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">
                          Scheduled Time
                        </span>
                        <div className="font-medium text-[rgb(var(--foreground))]">
                          {selectedNotification.metadata?.date
                            ? `${selectedNotification.metadata.date} at ${selectedNotification.metadata.time}`
                            : selectedNotification.appointment?.startAt
                            ? format(new Date(selectedNotification.appointment.startAt), "MMMM d, yyyy · hh:mm a")
                            : "Scheduled Session"}
                        </div>
                      </div>

                      {/* Patient Contact if available */}
                      {(selectedNotification.appointment?.customer?.phone || selectedNotification.appointment?.customer?.email) && (
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">
                            Patient Contact
                          </span>
                          <div className="text-[11px] text-[rgb(var(--muted-foreground))] truncate">
                            {selectedNotification.appointment?.customer?.phone || selectedNotification.appointment?.customer?.email}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reschedule Comparison Details if available */}
                    {selectedNotification.type === "APPOINTMENT_RESCHEDULED" && selectedNotification.metadata?.oldDate && (
                      <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                        <div className="font-bold text-blue-700 dark:text-blue-300">Schedule Change:</div>
                        <div className="text-[11px] text-[rgb(var(--muted-foreground))]">
                          <span className="line-through mr-2">Previous: {selectedNotification.metadata.oldDate} at {selectedNotification.metadata.oldTime}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">→ New: {selectedNotification.metadata.newDate} at {selectedNotification.metadata.newTime}</span>
                        </div>
                      </div>
                    )}

                    {/* Cancellation Details if available */}
                    {selectedNotification.type === "APPOINTMENT_CANCELLED" && selectedNotification.metadata?.reason && (
                      <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs space-y-1">
                        <div className="font-bold text-red-700 dark:text-red-300">Cancellation Reason:</div>
                        <div className="text-[11px] text-red-600 dark:text-red-400">
                          {selectedNotification.metadata.reason}
                        </div>
                      </div>
                    )}

                    {/* Deep-link Action Button */}
                    <div className="pt-2">
                      <Link
                        to={`/doctor/appointments/${selectedNotification.appointmentId}`}
                        className="block w-full"
                      >
                        <Button className="w-full text-xs font-bold h-10 gap-2 shadow-xs">
                          View Appointment Details & Clinical Notes
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorNotificationsPage
