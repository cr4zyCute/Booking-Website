"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Stethoscope, ShieldCheck, Check, Sparkles, Clock, CalendarCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BookingStaff, BookingService } from "./BookingFlow"

interface StaffSelectorProps {
  staff: BookingStaff[]
  selectedService: BookingService | null
  terminology: any
  selected: BookingStaff | null
  onSelect: (staff: BookingStaff | null) => void
  onBack?: () => void
}

export function StaffSelector({
  staff,
  selectedService,
  terminology,
  selected,
  onSelect,
  onBack,
}: StaffSelectorProps) {
  // Filter staff who provide the selected service
  const eligibleStaff = selectedService
    ? staff.filter(s =>
        s.services?.some(
          ss => ss.service.id === selectedService.id || (ss.service as any).slug === selectedService.slug
        )
      )
    : staff

  const staffSingular = terminology?.staffSingular || "Dentist"
  const staffLabel = terminology?.staffLabel || "Dentists"

  // Check if today is a working day for a staff member
  const isAvailableToday = (member: any): boolean => {
    const today = new Date().getDay()
    const schedules = member.schedules || []
    if (!Array.isArray(schedules) || schedules.length === 0) return true
    const todaySched = schedules.find((s: any) => s.dayOfWeek === today)
    return Boolean(todaySched && todaySched.isWorking)
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-[rgb(var(--primary))]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">
            {selectedService
              ? `Choose a ${staffSingular} for ${selectedService.name}`
              : `Choose a ${staffSingular}`}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
          {selectedService
            ? `Select your preferred specialist for ${selectedService.name}, or choose "Anyone Available".`
            : `Select your preferred ${staffSingular.toLowerCase()}, or let us assign the earliest available specialist.`}
        </p>
      </div>

      <div className="space-y-3">
        {/* Option 1: Anyone Available */}
        <div
          onClick={() => onSelect(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onSelect(null)
            }
          }}
          className={`p-4 sm:p-5 rounded-[var(--radius)] border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group select-none ${
            selected === null
              ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)] ring-2 ring-[rgb(var(--primary)/0.2)] shadow-sm"
              : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--muted)/0.3)]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--foreground))]">
                  Anyone Available
                </h3>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">
                  Fastest Availability
                </Badge>
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                We will automatically match you with the earliest available qualified {staffSingular.toLowerCase()}.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {selected === null ? (
              <span className="h-6 w-6 rounded-full bg-[rgb(var(--primary))] text-white flex items-center justify-center">
                <Check className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="h-6 w-6 rounded-full border border-[rgb(var(--border))] flex items-center justify-center group-hover:border-[rgb(var(--primary))]" />
            )}
          </div>
        </div>

        {/* Option 2: Specific Qualified Dentists */}
        {eligibleStaff.map(member => {
          const isSelected = selected?.id === member.id
          const availableToday = isAvailableToday(member)

          return (
            <div
              key={member.id}
              onClick={() => onSelect(member)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelect(member)
                }
              }}
              className={`p-4 sm:p-5 rounded-[var(--radius)] border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group select-none ${
                isSelected
                  ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)] ring-2 ring-[rgb(var(--primary)/0.2)] shadow-sm"
                  : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.5)] hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="h-14 w-14 border border-[rgb(var(--border))] rounded-lg shrink-0">
                  <AvatarImage src={member.photo ?? undefined} alt={member.name} className="object-cover object-top" />
                  <AvatarFallback className="text-sm bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-bold rounded-lg">
                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors truncate">
                      {member.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[rgb(var(--primary))] font-semibold">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))] flex-wrap">
                    {member.specialty && <span className="font-semibold text-[rgb(var(--foreground))]">{member.specialty}</span>}
                    {member.role && (
                      <>
                        <span>•</span>
                        <span>{member.role}</span>
                      </>
                    )}
                  </div>

                  {/* Availability badge */}
                  <div className="pt-0.5 flex items-center gap-2">
                    {availableToday ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Available today
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[rgb(var(--muted-foreground))]">
                        <CalendarCheck className="h-3 w-3 text-[rgb(var(--primary))]" />
                        Available this week
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {isSelected ? (
                  <span className="h-6 w-6 rounded-full bg-[rgb(var(--primary))] text-white flex items-center justify-center">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold h-8 pointer-events-none group-hover:border-[rgb(var(--primary))] group-hover:text-[rgb(var(--primary))]"
                  >
                    Select
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {onBack && (
        <div className="pt-4 border-t border-[rgb(var(--border))] flex justify-start">
          <Button variant="outline" onClick={onBack} size="sm">
            ← Back
          </Button>
        </div>
      )}
    </div>
  )
}

export default StaffSelector