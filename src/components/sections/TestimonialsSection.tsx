import React, { useState, useEffect, useRef, useCallback } from "react"
import { Star, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface ReviewItem {
  id: string
  name?: string
  customerName?: string
  quote?: string
  comment?: string
  role?: string | null
  image?: string | null
  rating: number
  isVerified?: boolean
  service?: { name: string } | null
  staff?: { name: string } | null
}

interface TestimonialsSectionProps {
  testimonials?: any[]
  reviews?: any[]
}

export function TestimonialsSection({ testimonials = [], reviews = [] }: TestimonialsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Combine verified patient reviews and testimonials from PostgreSQL or default fallbacks
  const baseItems: ReviewItem[] = [
    ...reviews.map(r => ({
      id: `rev-${r.id}`,
      customerName: r.customerName || r.name || (r as any).authorName || "Verified Patient",
      name: r.name || r.customerName || (r as any).authorName || "Verified Patient",
      comment: r.comment || r.quote || (r as any).content || "",
      quote: r.comment || r.quote || (r as any).content || "",
      role: r.role || "Verified Patient",
      rating: r.rating || 5,
      isVerified: true,
      service: r.service || (r.treatment ? { name: r.treatment } : null),
      staff: r.staff || (r.doctor ? { name: r.doctor } : null),
    })),
    ...testimonials.map(t => ({
      id: `test-${t.id}`,
      name: t.name || t.authorName || t.customerName || "Verified Patient",
      customerName: t.customerName || t.authorName || t.name || "Verified Patient",
      role: t.role || "Verified Patient",
      quote: t.quote || t.content || t.comment || "",
      comment: t.quote || t.content || t.comment || "",
      image: t.image,
      rating: t.rating || 5,
      isVerified: t.isVerified ?? true,
      service: t.service || (t.treatment ? { name: t.treatment } : null),
      staff: t.staff || (t.doctor ? { name: t.doctor } : null),
    })),
  ].filter(item => {
    const text = item.comment || item.quote || ""
    return text.trim().length > 0
  })

  const totalBase = baseItems.length

  // Build a 5-set virtual circular array for completely seamless infinite sliding in both directions
  const loopItems = React.useMemo(() => {
    if (totalBase === 0) return []
    return [...baseItems, ...baseItems, ...baseItems, ...baseItems, ...baseItems]
  }, [baseItems, totalBase])

  // Center on middle set (set 2, indices [2*N ... 3*N - 1])
  const [currentIndex, setCurrentIndex] = useState(() => (totalBase > 0 ? totalBase * 2 : 0))
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [cardWidth, setCardWidth] = useState(480)
  const gap = 24 // 1.5rem (gap-6)

  // Drag / touch state for smooth natural gestures
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)

  // Measure container and card dimensions dynamically
  const updateMeasurements = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
    if (trackRef.current && trackRef.current.children.length > 0) {
      const firstCard = trackRef.current.children[0] as HTMLElement
      if (firstCard && firstCard.offsetWidth > 0) {
        setCardWidth(firstCard.offsetWidth)
      }
    }
  }, [])

  useEffect(() => {
    updateMeasurements()
    window.addEventListener("resize", updateMeasurements)
    return () => window.removeEventListener("resize", updateMeasurements)
  }, [updateMeasurements])

  // Slide to next item infinitely
  const handleNext = () => {
    if (totalBase <= 1) return
    setIsTransitioning(true)
    setCurrentIndex(prev => prev + 1)
  }

  // Slide to previous item infinitely
  const handlePrev = () => {
    if (totalBase <= 1) return
    setIsTransitioning(true)
    setCurrentIndex(prev => prev - 1)
  }

  // When transition completes, if outside the middle block [2*N, 3*N - 1], instantly snap without transition
  const handleTransitionEnd = () => {
    setIsTransitioning(false)
    if (totalBase === 0) return

    if (currentIndex >= totalBase * 3) {
      // Re-anchor to identical index in the middle block
      const normalized = (currentIndex % totalBase) + totalBase * 2
      setCurrentIndex(normalized)
    } else if (currentIndex < totalBase * 2) {
      // Re-anchor to identical index in the middle block
      const offset = ((currentIndex % totalBase) + totalBase) % totalBase
      const normalized = offset + totalBase * 2
      setCurrentIndex(normalized)
    }
  }

  // Touch and drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartX(e.touches[0].clientX)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - dragStartX
    setDragOffset(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragOffset < -50) {
      handleNext()
    } else if (dragOffset > 50) {
      handlePrev()
    }
    setDragOffset(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragOffset(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const diff = e.clientX - dragStartX
    setDragOffset(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragOffset < -50) {
      handleNext()
    } else if (dragOffset > 50) {
      handlePrev()
    }
    setDragOffset(0)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      setDragOffset(0)
    }
  }

  // Direct dot jump
  const handleDotClick = (targetBaseIndex: number) => {
    const currentBaseIndex = ((currentIndex % totalBase) + totalBase) % totalBase
    const diff = targetBaseIndex - currentBaseIndex
    setIsTransitioning(true)
    setCurrentIndex(prev => prev + diff)
  }

  if (!baseItems.length) return null

  // Active base item index (0 to totalBase - 1)
  const activeBaseIndex = ((currentIndex % totalBase) + totalBase) % totalBase

  // Exact pixel transform to center the active card
  const stride = cardWidth + gap
  const baseTranslateX = (containerWidth / 2) - (currentIndex * stride) - (cardWidth / 2)
  const finalTranslateX = baseTranslateX + dragOffset

  return (
    <section id="testimonials" className="py-16 lg:py-24 scroll-mt-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Title and Control Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[rgb(var(--primary))] mb-2 uppercase tracking-wider">
              Patient Reviews
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Verified Patient Experiences
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
              Read real feedback from patients who booked and completed treatments at our clinic.
            </p>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono font-medium text-[rgb(var(--muted-foreground))] tracking-wider">
              {String(activeBaseIndex + 1).padStart(2, "0")} / {String(totalBase).padStart(2, "0")}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="h-10 w-10 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] cursor-pointer shadow-xs transition-colors"
              aria-label="Previous patient experience"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-10 w-10 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] cursor-pointer shadow-xs transition-colors"
              aria-label="Next patient experience"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Carousel Viewport Container */}
        <div
          ref={containerRef}
          className="relative py-8 overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle Side Fade Overlays for Depth */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-[rgb(var(--background))] to-transparent z-30" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-[rgb(var(--background))] to-transparent z-30" />

          {/* Smooth Sliding Track */}
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            className="flex items-center gap-6 will-change-transform"
            style={{
              transform: `translateX(${finalTranslateX}px)`,
              transition: isTransitioning && !isDragging
                ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
          >
            {loopItems.map((item, index) => {
              const authorName = item.customerName || item.name || (item as any).authorName || "Verified Patient"
              const reviewText = item.comment || item.quote || (item as any).content || ""
              const initials = authorName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)

              const isCenterFocus = index === currentIndex

              return (
                <div
                  key={`${item.id}-loop-${index}`}
                  onClick={() => {
                    if (index !== currentIndex) {
                      setIsTransitioning(true)
                      setCurrentIndex(index)
                    }
                  }}
                  className={`shrink-0 w-[84vw] sm:w-[420px] md:w-[480px] lg:w-[500px] bg-[rgb(var(--card))] rounded-[var(--radius)] border p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 ease-out ${
                    isCenterFocus
                      ? "scale-105 z-20 border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.35)] shadow-2xl opacity-100"
                      : "scale-95 z-10 border-[rgb(var(--border))] opacity-60 hover:opacity-85 shadow-sm hover:border-[rgb(var(--primary)/0.3)]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`transition-all duration-300 ${
                              isCenterFocus ? "h-4.5 w-4.5" : "h-3.5 w-3.5"
                            } ${
                              i < item.rating ? "fill-amber-400 text-amber-400" : "text-[rgb(var(--border))]"
                            }`}
                          />
                        ))}
                      </div>

                      {item.isVerified && (
                        <span
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 border transition-colors ${
                            isCenterFocus
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : "bg-emerald-500/10 text-emerald-600/80 border-emerald-500/15"
                          }`}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Verified Booking
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-[rgb(var(--foreground))] leading-relaxed italic transition-all duration-300 line-clamp-4 ${
                        isCenterFocus ? "text-base sm:text-lg font-medium" : "text-xs sm:text-sm"
                      }`}
                    >
                      &ldquo;{reviewText}&rdquo;
                    </p>

                    {(item.service?.name || item.staff?.name) && (
                      <div className="text-xs text-[rgb(var(--muted-foreground))] pt-2.5 border-t border-[rgb(var(--border))] flex items-center gap-2 flex-wrap">
                        {item.service?.name && (
                          <span>
                            Treatment:{" "}
                            <span className="font-semibold text-[rgb(var(--foreground))]">{item.service.name}</span>
                          </span>
                        )}
                        {item.service?.name && item.staff?.name && <span>•</span>}
                        {item.staff?.name && (
                          <span>
                            Doctor:{" "}
                            <span className="font-semibold text-[rgb(var(--foreground))]">{item.staff.name}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 mt-5 border-t border-[rgb(var(--border))]">
                    <Avatar
                      className={`border transition-all duration-300 ${
                        isCenterFocus
                          ? "h-11 w-11 border-[rgb(var(--primary)/0.6)] ring-2 ring-[rgb(var(--primary)/0.2)]"
                          : "h-9 w-9 border-[rgb(var(--border))]"
                      }`}
                    >
                      <AvatarImage src={item.image ?? undefined} alt={authorName} />
                      <AvatarFallback className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={`font-bold text-[rgb(var(--foreground))] transition-all duration-300 ${
                          isCenterFocus ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                        }`}
                      >
                        {authorName}
                      </div>
                      {item.role && <div className="text-xs text-[rgb(var(--muted-foreground))]">{item.role}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Interactive Pagination Indicators */}
          <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
            {baseItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeBaseIndex
                    ? "w-8 bg-[rgb(var(--primary))]"
                    : "w-2.5 bg-[rgb(var(--border))] hover:bg-[rgb(var(--primary)/0.4)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection