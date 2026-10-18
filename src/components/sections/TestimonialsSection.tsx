import React, { useState, useEffect, useRef, useCallback } from "react"
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Combine verified patient reviews and testimonials from PostgreSQL or default fallbacks
  const combinedItems: ReviewItem[] = [
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

  const total = combinedItems.length

  // Scroll to a specific card index smoothly and center it in viewport
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cards = container.children
    if (cards[index]) {
      const targetCard = cards[index] as HTMLElement
      const targetLeft = targetCard.offsetLeft - (container.offsetWidth - targetCard.offsetWidth) / 2
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      })
    }
    setCurrentIndex(index)
  }, [])

  const handleNext = useCallback(() => {
    if (total === 0) return
    const nextIndex = (currentIndex + 1) % total
    scrollToIndex(nextIndex)
  }, [currentIndex, total, scrollToIndex])

  const handlePrev = useCallback(() => {
    if (total === 0) return
    const prevIndex = (currentIndex - 1 + total) % total
    scrollToIndex(prevIndex)
  }, [currentIndex, total, scrollToIndex])

  // Track active index as the user scrolls or drags horizontally (relative to container center)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const containerCenter = container.scrollLeft + container.offsetWidth / 2
    const cards = Array.from(container.children) as HTMLElement[]
    if (cards.length === 0) return

    let closestIndex = 0
    let minDistance = Infinity
    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(cardCenter - containerCenter)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = idx
      }
    })
    setCurrentIndex(closestIndex)
  }

  // 3-second auto-slide interval (pauses on user hover or interaction)
  useEffect(() => {
    if (total <= 1 || isPaused || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      handleNext()
    }, 3000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [total, isPaused, isHovered, handleNext])

  if (!combinedItems.length) return null

  return (
    <section id="testimonials" className="py-16 lg:py-24 scroll-mt-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Title and Sliding Controls */}
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

          {/* Controls: Prev, Play/Pause Indicator, Next, Counter */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="h-9 w-9 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] cursor-pointer shadow-xs transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume auto-slide (3s)" : "Pause auto-slide"}
              className="h-9 px-3 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              {isPaused ? (
                <>
                  <Play className="h-3 w-3 fill-current text-[rgb(var(--primary))]" />
                  <span>Paused</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>3s Auto</span>
                </>
              )}
            </button>

            <span className="text-xs font-semibold text-[rgb(var(--foreground))] px-3 py-1.5 rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-xs">
              {currentIndex + 1} / {total}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-9 w-9 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] cursor-pointer shadow-xs transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Straight Horizontal Line-Up Slider */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group/carousel"
        >
          {/* Scrollable Single Straight Row Track with Center Stage Focus */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-6 px-[6vw] sm:px-[15vw] md:px-[20vw]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {combinedItems.map((item, index) => {
              const authorName = item.customerName || item.name || (item as any).authorName || "Verified Patient"
              const reviewText = item.comment || item.quote || (item as any).content || ""
              const initials = authorName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)

              const isFocused = index === currentIndex

              return (
                <div
                  key={item.id}
                  onClick={() => scrollToIndex(index)}
                  className={`snap-center shrink-0 w-[84vw] sm:w-[420px] md:w-[480px] lg:w-[520px] bg-[rgb(var(--card))] rounded-[var(--radius)] border p-6 sm:p-7 flex flex-col justify-between cursor-pointer select-none transition-all duration-500 ease-out ${
                    isFocused
                      ? "scale-105 sm:scale-110 z-20 border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.3)] shadow-2xl opacity-100 bg-[rgb(var(--card))]"
                      : "scale-95 sm:scale-95 z-10 border-[rgb(var(--border))] opacity-60 hover:opacity-85 hover:border-[rgb(var(--primary)/0.5)] shadow-sm bg-[rgb(var(--card)/0.8)]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`transition-all duration-300 ${
                              isFocused ? "h-4.5 w-4.5" : "h-3.5 w-3.5"
                            } ${
                              i < item.rating ? "fill-amber-400 text-amber-400" : "text-[rgb(var(--border))]"
                            }`}
                          />
                        ))}
                      </div>

                      {item.isVerified && (
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 border transition-colors ${
                          isFocused
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-emerald-500/10 text-emerald-600/80 border-emerald-500/15"
                        }`}>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Verified Booking
                        </span>
                      )}
                    </div>

                    <p className={`text-[rgb(var(--foreground))] leading-relaxed italic transition-all duration-300 line-clamp-4 ${
                      isFocused ? "text-base sm:text-lg font-medium" : "text-xs sm:text-sm"
                    }`}>
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
                    <Avatar className={`border transition-all duration-300 ${
                      isFocused
                        ? "h-11 w-11 border-[rgb(var(--primary)/0.6)] ring-2 ring-[rgb(var(--primary)/0.2)]"
                        : "h-9 w-9 border-[rgb(var(--border))]"
                    }`}>
                      <AvatarImage src={item.image ?? undefined} alt={authorName} />
                      <AvatarFallback className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className={`font-bold text-[rgb(var(--foreground))] transition-all duration-300 ${
                        isFocused ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                      }`}>
                        {authorName}
                      </div>
                      {item.role && <div className="text-xs text-[rgb(var(--muted-foreground))]">{item.role}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Pagination Dots Bar */}
          <div className="mt-6 flex items-center justify-center gap-1.5 flex-wrap">
            {combinedItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-7 bg-[rgb(var(--primary))]"
                    : "w-2 bg-[rgb(var(--border))] hover:bg-[rgb(var(--primary)/0.5)]"
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