import React, { useState, useEffect, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Clock,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  ExternalLink,
  Info,
  ChevronLeft,
  ChevronRight,
  ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency, formatDuration } from "@/lib/utils"

export interface TreatmentModalData {
  id: string
  name: string
  slug: string
  shortDescription?: string | null
  description?: string | null
  image?: string | null
  images?: string[]
  price: number | string
  durationMinutes: number
  category?: { name: string } | null
  staffServices?: Array<{
    id: string
    staff?: {
      id: string
      name: string
      role?: string | null
      specialty?: string | null
      photo?: string | null
    }
  }>
}

interface TreatmentPreviewModalProps {
  service: TreatmentModalData | null
  isOpen: boolean
  onClose: () => void
  currencySymbol: string
  serviceSingular?: string
}

export function TreatmentPreviewModal({
  service,
  isOpen,
  onClose,
  currencySymbol,
  serviceSingular = "Treatment",
}: TreatmentPreviewModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Extract all images belonging to this specific treatment
  const allImages = React.useMemo(() => {
    if (!service) return []
    if (service.images && Array.isArray(service.images) && service.images.length > 0) {
      return service.images.filter(Boolean)
    }
    if (service.image) return [service.image]
    return []
  }, [service])

  // Reset index when service changes
  useEffect(() => {
    setActiveImageIndex(0)
    setIsPaused(false)
  }, [service?.id])

  // Automatic slideshow with 4.5s interval when multiple images exist
  useEffect(() => {
    if (!isOpen || allImages.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % allImages.length)
    }, 4500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen, allImages.length, isPaused])

  // Pause timer on manual interaction and auto-resume after 8 seconds of inactivity
  const handleUserInteraction = useCallback(() => {
    setIsPaused(true)
    if (timerRef.current) clearInterval(timerRef.current)
    const resumeTimer = setTimeout(() => {
      setIsPaused(false)
    }, 8000)
    return () => clearTimeout(resumeTimer)
  }, [])

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    handleUserInteraction()
    setActiveImageIndex(prev => (prev + 1) % allImages.length)
  }

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    handleUserInteraction()
    setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleDotClick = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    handleUserInteraction()
    setActiveImageIndex(index)
  }

  // Prevent background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!service) return null

  const priceFormatted = formatCurrency(Number(service.price), currencySymbol)
  const durationFormatted = formatDuration(service.durationMinutes)
  const staffMembers = service.staffServices?.map(ss => ss.staff).filter(Boolean) || []

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-treatment-title"
            className="relative w-full max-w-3xl max-h-[90vh] bg-[rgb(var(--card))] rounded-[calc(var(--radius)+6px)] border border-[rgb(var(--border))] shadow-2xl overflow-hidden flex flex-col z-10 my-auto text-[rgb(var(--foreground))]"
          >
            {/* Modal Header Bar with Close Button */}
            <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
                  {serviceSingular} Preview
                </span>
                {service.category?.name && (
                  <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                    {service.category.name}
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
              {/* Top Hero Grid: Image Slideshow + Core Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Treatment Image Gallery / Slideshow */}
                <div
                  className="md:col-span-6 aspect-[4/3] rounded-[var(--radius)] overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--muted))] relative shadow-sm group select-none"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {allImages.length > 0 ? (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={allImages[activeImageIndex] || activeImageIndex}
                        src={allImages[activeImageIndex]}
                        alt={`${service.name} - Image ${activeImageIndex + 1}`}
                        initial={{ opacity: 0.6, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--muted-foreground))] bg-gradient-to-br from-[rgb(var(--muted)/0.4)] to-[rgb(var(--muted))] p-6 text-center">
                      <ImageIcon className="h-10 w-10 mb-2 opacity-30 text-[rgb(var(--primary))]" />
                      <span className="text-xs font-medium">Veridian Dental Studio</span>
                    </div>
                  )}

                  {/* Duration Badge */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                      <Clock className="h-3 w-3 text-cyan-300" />
                      {durationFormatted}
                    </span>
                  </div>

                  {/* Image Counter Badge (if multiple images) */}
                  {allImages.length > 1 && (
                    <div className="absolute top-3 right-3 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/15">
                        {activeImageIndex + 1} / {allImages.length}
                      </span>
                    </div>
                  )}

                  {/* Manual Prev / Next Arrow Controls (Shown ONLY when > 1 image) */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        aria-label="Previous image"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-sm opacity-80 hover:opacity-100 shadow-md cursor-pointer z-10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleNextImage}
                        aria-label="Next image"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-sm opacity-80 hover:opacity-100 shadow-md cursor-pointer z-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Pagination Dots (Shown ONLY when > 1 image) */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
                        <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                          {allImages.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => handleDotClick(idx, e)}
                              aria-label={`Jump to image ${idx + 1}`}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                idx === activeImageIndex
                                  ? "w-4 bg-cyan-400 shadow-sm shadow-cyan-400/50"
                                  : "w-1.5 bg-white/50 hover:bg-white/80"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Title, Price, Summary */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <h2
                      id="modal-treatment-title"
                      className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--foreground))] leading-tight"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {service.name}
                    </h2>
                    {service.shortDescription && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2 leading-relaxed">
                        {service.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Price Banner */}
                  <div className="p-3.5 bg-[rgb(var(--background))] rounded-[var(--radius)] border border-[rgb(var(--border))] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[rgb(var(--muted-foreground))] uppercase font-semibold tracking-wider">
                        Standard Fee
                      </span>
                      <div className="text-2xl font-black text-[rgb(var(--primary))]">
                        {priceFormatted}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[rgb(var(--muted-foreground))] uppercase font-semibold tracking-wider">
                        Session Length
                      </span>
                      <div className="text-sm font-semibold text-[rgb(var(--foreground))] flex items-center gap-1 justify-end">
                        <Clock className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                        {durationFormatted}
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button inside modal */}
                  <div className="pt-2">
                    <Link to={`/booking?service=${service.slug}`} onClick={onClose} className="block">
                      <Button
                        size="lg"
                        className="w-full gap-2 font-semibold text-sm shadow-md shadow-[rgb(var(--primary)/0.25)] h-11"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Book {serviceSingular} Appointment
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Full Description Section */}
              {service.description && (
                <div className="space-y-2.5 pt-4 border-t border-[rgb(var(--border))]">
                  <h3 className="text-base font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[rgb(var(--primary))]" />
                    About This {serviceSingular}
                  </h3>
                  <div className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))] leading-relaxed whitespace-pre-line bg-[rgb(var(--muted)/0.2)] p-4 rounded-[var(--radius)] border border-[rgb(var(--border))]">
                    {service.description}
                  </div>
                </div>
              )}

              {/* Assigned Specialists / Doctors */}
              {staffMembers.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-[rgb(var(--primary))]" />
                    Available Specialists
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {staffMembers.map((staff: any) => {
                      const initials = staff.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                      return (
                        <div
                          key={staff.id}
                          className="flex items-center gap-3 p-3 bg-[rgb(var(--background))] rounded-[var(--radius)] border border-[rgb(var(--border))]"
                        >
                          <Avatar className="h-10 w-10 border border-[rgb(var(--border))]">
                            <AvatarImage src={staff.photo ?? undefined} alt={staff.name} />
                            <AvatarFallback className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs text-[rgb(var(--foreground))] truncate">
                              {staff.name}
                            </h4>
                            <p className="text-[11px] text-[rgb(var(--muted-foreground))] truncate">
                              {staff.role || staff.specialty}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer Bar */}
            <div className="p-3.5 sm:px-6 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] flex items-center justify-between gap-3 shrink-0">
              <Link
                to={`/treatments/${service.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
                View Full Page
                <ExternalLink className="h-3 w-3" />
              </Link>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
                  Close
                </Button>
                <Link to={`/booking?service=${service.slug}`} onClick={onClose}>
                  <Button size="sm" className="gap-1.5 text-xs h-8">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default TreatmentPreviewModal
