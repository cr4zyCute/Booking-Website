"use client"
import React from "react"
import { Clock, ArrowRight, Sparkles, Check, Stethoscope } from "lucide-react"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BookingService, BookingStaff } from "./BookingFlow"

interface ServiceSelectorProps {
  services: BookingService[]
  selectedStaff: BookingStaff | null
  terminology: any
  currencySymbol: string
  selected: BookingService | null
  onSelect: (service: BookingService) => void
  onBack?: () => void
}

export function ServiceSelector({
  services,
  selectedStaff,
  terminology,
  currencySymbol,
  selected,
  onSelect,
  onBack,
}: ServiceSelectorProps) {
  // If a specific dentist is already chosen, only show treatments provided by this dentist
  const filteredServices = selectedStaff
    ? services.filter(service =>
        selectedStaff.services?.some(
          ss => ss.service.id === service.id || (ss.service as any).slug === service.slug
        )
      )
    : services

  const serviceSingular = terminology?.serviceSingular || "Treatment"
  const serviceLabel = terminology?.serviceLabel || "Treatments"

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[rgb(var(--primary))]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">
            {selectedStaff ? `Choose a Treatment with ${selectedStaff.name}` : `Select a ${serviceSingular}`}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
          {selectedStaff
            ? `Showing treatments provided by Dr. ${selectedStaff.name.split(" ")[1] || selectedStaff.name}. Please select one to schedule your appointment.`
            : `Choose the clinical ${serviceSingular.toLowerCase()} you would like to book.`}
        </p>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-12 text-[rgb(var(--muted-foreground))] border border-dashed border-[rgb(var(--border))] rounded-[var(--radius)] p-8">
          <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30 text-[rgb(var(--primary))]" />
          <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
            No {serviceLabel.toLowerCase()} available
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            {selectedStaff
              ? `${selectedStaff.name} has no publicly configured treatments at the moment.`
              : "Please check back soon or contact the clinic."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredServices.map(service => {
            const isSelected = selected?.id === service.id

            return (
              <div
                key={service.id}
                onClick={() => onSelect(service)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelect(service)
                  }
                }}
                className={`text-left p-5 rounded-[var(--radius)] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isSelected
                    ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.06)] ring-2 ring-[rgb(var(--primary)/0.2)] shadow-sm"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.5)] hover:shadow-md"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {service.category?.name && (
                        <span className="text-[10px] font-bold text-[rgb(var(--primary))] uppercase tracking-wider block">
                          {service.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-base text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors">
                        {service.name}
                      </h3>
                    </div>

                    {isSelected ? (
                      <span className="h-6 w-6 rounded-full bg-[rgb(var(--primary))] text-white flex items-center justify-center shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="h-6 w-6 rounded-full border border-[rgb(var(--border))] group-hover:border-[rgb(var(--primary))] flex items-center justify-center shrink-0 text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--primary))] transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  {service.shortDescription && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2">
                      {service.shortDescription}
                    </p>
                  )}
                </div>

                {/* Footer price & duration */}
                <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--border))] text-xs">
                  <span className="font-bold text-sm text-[rgb(var(--foreground))]">
                    {formatCurrency(service.price, currencySymbol)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[rgb(var(--muted-foreground))] font-medium">
                    <Clock className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                    {formatDuration(service.durationMinutes)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

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

export default ServiceSelector