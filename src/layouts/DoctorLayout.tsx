import React from "react"
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useBusiness } from "@/context/BusinessContext"
import { LayoutDashboard, CalendarDays, Clock, LogOut, Stethoscope, User, Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DoctorNotificationBell } from "@/components/doctor/DoctorNotificationBell"
import { cn } from "@/lib/utils"

export function DoctorLayout() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const { business } = useBusiness()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading portal...</div>
  }

  if (!isAuthenticated || (user?.role !== "STAFF" && user?.role !== "ADMIN")) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const navItems = [
    { href: "/doctor", icon: LayoutDashboard, label: "Doctor Dashboard", exact: true },
    { href: "/doctor/appointments", icon: CalendarDays, label: "My Appointments" },
    { href: "/doctor/schedule", icon: Clock, label: "My Working Schedule" },
    { href: "/doctor/notifications", icon: Bell, label: "Notifications" },
    { href: "/doctor/profile", icon: User, label: "My Profile Settings" },
  ]

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-5 border-b border-[rgb(var(--border))]">
          <Link to="/doctor" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[var(--radius)] bg-[rgb(var(--primary))] flex items-center justify-center text-[rgb(var(--primary-foreground))] shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[rgb(var(--foreground))] truncate">{business.name}</div>
              <div className="text-[11px] text-[rgb(var(--primary))] font-medium">Doctor Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-colors",
                  active
                    ? "bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]"
                    : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Doctor Info */}
        <div className="border-t border-[rgb(var(--border))] px-3 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-[rgb(var(--border))]">
              <AvatarFallback className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-semibold">
                {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) ?? "DR"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">{user?.name ?? "Doctor"}</div>
              <div className="text-xs text-[rgb(var(--muted-foreground))] truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-[var(--radius)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Portal Header */}
        <header className="h-16 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[rgb(var(--foreground))]">
              {user?.name || "Doctor Portal"}
            </span>
            <span className="hidden sm:inline-block text-xs text-[rgb(var(--muted-foreground))]">
              • Clinical Account
            </span>
          </div>

          <div className="flex items-center gap-3">
            <DoctorNotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
