import React from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useBusiness } from "@/context/BusinessContext"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Loader2 } from "lucide-react"

export function AdminLayout() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const { business, terminology, loading: businessLoading } = useBusiness()

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <AdminSidebar
        businessName={business.name ?? "Admin"}
        terminology={terminology}
        user={user}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
