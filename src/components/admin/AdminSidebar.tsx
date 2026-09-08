import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, CalendarDays, Users, Briefcase, UserCog,
  Settings, Globe, Palette, List, ChevronRight, LogOut,
  ClipboardList, BookOpen, MapPin, Star
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface AdminSidebarProps {
  businessName: string
  terminology: any
  user: any
}

function NavItem({ href, icon: Icon, label, exact = false }: { href: string; icon: any; label: string; exact?: boolean }) {
  const location = useLocation()
  const active = exact ? location.pathname === href : location.pathname.startsWith(href)
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors",
        active
          ? "bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]"
          : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 py-1.5 text-[10px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-widest">
        {label}
      </p>
      {children}
    </div>
  )
}

export function AdminSidebar({ businessName, terminology, user }: AdminSidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const staffLabel = terminology?.staffLabel ?? "Staff"
  const serviceLabel = terminology?.serviceLabel ?? "Services"

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <aside className="w-64 shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[rgb(var(--border))]">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-[var(--radius)] bg-[rgb(var(--primary))] flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-[rgb(var(--primary-foreground))]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">{businessName}</div>
            <div className="text-[10px] text-[rgb(var(--muted-foreground))]">Admin Dashboard</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" exact />

        <NavGroup label="Booking">
          <NavItem href="/admin/appointments" icon={ClipboardList} label="Appointments" />
          <NavItem href="/admin/calendar" icon={CalendarDays} label="Calendar" />
        </NavGroup>

        <NavGroup label="Customers">
          <NavItem href="/admin/customers" icon={Users} label={terminology?.customerLabel ?? "Customers"} />
        </NavGroup>

        <NavGroup label="Business">
          <NavItem href="/admin/staff" icon={UserCog} label={staffLabel} />
          <NavItem href="/admin/services" icon={Briefcase} label={serviceLabel} />
          <NavItem href="/admin/schedules" icon={CalendarDays} label="Schedules" />
        </NavGroup>

        <NavGroup label="Website">
          <NavItem href="/admin/website/homepage" icon={Globe} label="Homepage" />
          <NavItem href="/admin/reviews" icon={Star} label="Reviews Moderation" />
          <NavItem href="/admin/website/testimonials" icon={List} label="Testimonials" />
          <NavItem href="/admin/website/faq" icon={BookOpen} label="FAQ" />
        </NavGroup>

        <NavGroup label="Appearance">
          <NavItem href="/admin/appearance" icon={Palette} label="Themes" />
        </NavGroup>

        <NavGroup label="Settings">
          <NavItem href="/admin/location" icon={MapPin} label="Location & Map" />
          <NavItem href="/admin/settings" icon={Settings} label="Business Settings" />
        </NavGroup>
      </nav>

      {/* User */}
      <div className="border-t border-[rgb(var(--border))] px-3 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]">
              {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{user?.name ?? "Admin"}</div>
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
  )
}