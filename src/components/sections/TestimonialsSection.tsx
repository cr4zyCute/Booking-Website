import React, { useState, useEffect, useRef } from "react"
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
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
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const animFrameId = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

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

  // Duplicate the list 4 times for seamless, non-stop circular loop scrolling
  const loopItems = React.useMemo(() => {
    if (baseItems.length === 0) return []
    return [...baseItems, ...baseItems, ...baseItems, ...baseItems]
  }, [baseItems])

  const totalBase = baseItems.length

  // Continuous buttery-smooth 60fps marquee animation loop with pause controls
  useEffect(() => {
    const container = containerRef.current
    if (!container || totalBase === 0) return

    const speed = 0.55 // pixels per frame (~33px/sec for relaxed reading)

    const step = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const elapsed = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      if (!isPaused && !isHovered) {
        container.scrollLeft += speed * (elapsed / 16.67)

        // When scrolled halfway through the multi-loop array, wrap back smoothly to maintain seamless infinite illusion
        const halfWidth = container.scrollWidth / 2
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth
        }
      }

      // Calculate which card is closest to center of screen for dynamic magnification
      const containerCenter = container.scrollLeft + container.offsetWidth / 2
      const cards = Array.from(container.children) as HTMLElement[]
      if (cards.length > 0) {
        let closestIdx = 0
        let minDiff = Infinity
        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2
          const diff = Math.abs(cardCenter - containerCenter)
          if (diff < minDiff) {
            minDiff = diff
            closestIdx = idx % totalBase
          }
        })
        setActiveIndex(closestIdx)
      }

      animFrameId.current = requestAnimationFrame(step)
    }

    animFrameId.current = requestAnimationFrame(step)

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    }
  }, [isPaused, isHovered, totalBase])

  const handleScrollByCards = (direction: "left" | "right") => {
    if (!containerRef.current) return
    const container = containerRef.current
    const shift = 440 // approx width of one card + gap
    container.scrollBy({
      left: direction === "left" ? -shift : shift,
      behavior: "smooth",
    })
  }

  if (!baseItems.length) return null

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

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScrollByCards("left")}
              className="h-9 w-9 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] cursor-pointer shadow-xs transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume smooth animation loop" : "Pause animation"}
              className="h-9 px-3.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 fill-current text-[rgb(var(--primary))]" />
                  <span>Paused</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Auto Loop</span>
                </>
              )}
            </button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScrollByCards("right")}
              className="h-9 w-9 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] cursor-pointer shadow-xs transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Smooth Infinite Looping Track Container */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group/carousel py-4"
        >
          {/* Subtle Side Fade Overlays for Depth */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[rgb(var(--background))] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[rgb(var(--background))] to-transparent z-10" />

          {/* Continuous Scroll Container */}
          <div
            ref={containerRef}
            className="flex items-center gap-6 overflow-x-scroll scrollbar-none py-6 px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loopItems.map((item, index) => {
              const authorName = item.customerName || item.name || (item as any).authorName || "Verified Patient"
              const reviewText = item.comment || item.quote || (item as any).content || ""
              const initials = authorName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)

              const baseIdx = index % totalBase
              const isCenterFocus = baseIdx === activeIndex

              return (
                <div
                  key={`${item.id}-loop-${index}`}
                  className={`shrink-0 w-[84vw] sm:w-[420px] md:w-[480px] lg:w-[500px] bg-[rgb(var(--card))] rounded-[var(--radius)] border p-6 sm:p-7 flex flex-col justify-between select-none transition-all duration-500 ease-out ${
                    isCenterFocus
                      ? "scale-105 z-20 border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.3)] shadow-2xl opacity-100 bg-[rgb(var(--card))]"
                      : "scale-95 z-10 border-[rgb(var(--border))] opacity-70 hover:opacity-90 hover:border-[rgb(var(--primary)/0.4)] shadow-sm bg-[rgb(var(--card)/0.85)]"
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

          {/* Real-time Indicator Dots */}
          <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
            {baseItems.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-7 bg-[rgb(var(--primary))]"
                    : "w-2 bg-[rgb(var(--border))]"
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