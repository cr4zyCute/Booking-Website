import React from "react"
import { Outlet, Link, useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useBusiness } from "@/context/BusinessContext"
import { CalendarDays, LogOut, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function CustomerLayout() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const { business } = useBusiness()
  const navigate = useNavigate()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading patient portal...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-[var(--radius)] bg-[rgb(var(--primary))] flex items-center justify-center shadow-sm">
                <CalendarDays className="h-4 w-4 text-[rgb(var(--primary-foreground))]" />
              </div>
              <span className="font-bold text-base text-[rgb(var(--foreground))]">{business.name}</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[rgb(var(--primary))] font-medium bg-[rgb(var(--primary)/0.08)] px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3" />
              Patient Portal
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/booking">
              <Button size="sm" className="gap-1.5 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                Book New Appointment
              </Button>
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-[rgb(var(--border))]">
              <Avatar className="h-8 w-8 border border-[rgb(var(--border))]">
                <AvatarFallback className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-semibold">
                  {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) ?? "P"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-[rgb(var(--foreground))]">{user?.name}</div>
                <div className="text-[10px] text-[rgb(var(--muted-foreground))]">{user?.email}</div>
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
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
