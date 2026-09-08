import React, { useState, useEffect, useRef } from "react"
import { Bell, Check, Calendar, XCircle, Clock, Info, CheckCheck, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate, Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export interface DoctorNotificationItem {
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

export function DoctorNotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<DoctorNotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
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
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (e) {
      console.error("Fetch doctor notifications error:", e)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/doctor/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (e) {
      console.error("Mark read error:", e)
    }
  }

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
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast.success("All notifications marked as read")
      }
    } catch (e) {
      console.error("Mark all read error:", e)
      toast.error("Failed to mark notifications as read")
    } finally {
      setMarkingAll(false)
    }
  }

  const handleNotificationClick = (item: DoctorNotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id)
    }
    setIsOpen(false)
    if (item.appointmentId) {
      navigate(`/doctor/appointments/${item.appointmentId}`)
    } else {
      navigate("/doctor/notifications")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_APPOINTMENT":
        return <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case "APPOINTMENT_CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case "APPOINTMENT_RESCHEDULED":
        return <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "CLINIC_ANNOUNCEMENT":
      default:
        return <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    }
  }

  // Quick preview displays top 6 items
  const previewItems = notifications.slice(0, 6)

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications()
        }}
        aria-label="Doctor Notifications"
        className="relative p-2 rounded-full text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.2)]"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-75 duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel (Quick Preview) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[rgb(var(--foreground))]">Notifications</span>
              {unreadCount > 0 ? (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-700 dark:text-red-300 font-bold border-none">
                  {unreadCount} unread
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-[rgb(var(--muted-foreground))]">
                  All caught up
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[11px] font-semibold text-[rgb(var(--primary))] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                Mark all read
              </button>
            )}
          </div>

          {/* List Body */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-[rgb(var(--border)/0.6)]">
            {previewItems.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))] mx-auto">
                  <Check className="h-5 w-5 opacity-40 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-[rgb(var(--foreground))]">You're all caught up.</p>
                <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                  New appointment bookings, cancellations, and schedule changes will appear here.
                </p>
              </div>
            ) : (
              previewItems.map(item => {
                const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 select-none ${
                      !item.isRead
                        ? "bg-[rgb(var(--primary)/0.05)] hover:bg-[rgb(var(--primary)/0.1)]"
                        : "hover:bg-[rgb(var(--muted)/0.4)]"
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] shrink-0 shadow-2xs">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs truncate ${!item.isRead ? "font-bold text-[rgb(var(--foreground))]" : "font-semibold text-[rgb(var(--foreground)/0.8)]"}`}>
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[rgb(var(--primary))] shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pt-0.5 text-[10px] text-[rgb(var(--muted-foreground))]">
                        <span>{timeAgo}</span>
                        {item.appointmentId ? (
                          <span className="font-semibold text-[rgb(var(--primary))] hover:underline flex items-center gap-0.5">
                            Open Appointment →
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Quick Preview Footer linking to full notifications page */}
          <div className="p-2.5 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.2)] flex items-center justify-center">
            <Link
              to="/doctor/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[rgb(var(--primary))] hover:underline flex items-center gap-1.5 py-1"
            >
              View all notifications ({notifications.length}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorNotificationBell
