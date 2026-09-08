import React, { useState } from "react"
import { Star, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

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

const ITEMS_PER_PAGE = 6

export function TestimonialsSection({ testimonials = [], reviews = [] }: TestimonialsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState(0)

  // Combine verified patient reviews and testimonials from PostgreSQL
  const combinedItems: ReviewItem[] = [
    ...reviews.map(r => ({
      id: `rev-${r.id}`,
      customerName: r.customerName || "Verified Patient",
      comment: r.comment,
      rating: r.rating || 5,
      isVerified: true,
      service: r.service,
      staff: r.staff,
    })),
    ...testimonials.map(t => ({
      id: `test-${t.id}`,
      name: t.name,
      role: t.role,
      quote: t.quote,
      image: t.image,
      rating: t.rating || 5,
      isVerified: false,
    })),
  ]

  if (!combinedItems.length) return null

  const totalPages = Math.ceil(combinedItems.length / ITEMS_PER_PAGE)
  const hasMultiplePages = totalPages > 1

  const handlePrev = () => {
    if (currentPage > 0) {
      setDirection(-1)
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1)
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePageSelect = (pageIndex: number) => {
    setDirection(pageIndex > currentPage ? 1 : -1)
    setCurrentPage(pageIndex)
  }

  // Get current page items (maximum 6 per page: 3 rows × 2 columns)
  const currentItems = combinedItems.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  )

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  }

  return (
    <section id="testimonials" className="py-16 lg:py-24 scroll-mt-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Title and Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[rgb(var(--primary))] mb-3 uppercase tracking-wider">
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

          {/* Top Pagination Controls (Visible only when more than 6 reviews) */}
          {hasMultiplePages && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="h-9 w-9 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] disabled:opacity-40"
                aria-label="Previous testimonials page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-xs font-semibold text-[rgb(var(--foreground))] px-3 py-1 rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-xs">
                {currentPage + 1} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
                className="h-9 w-9 rounded-full border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] disabled:opacity-40"
                aria-label="Next testimonials page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Testimonials 3 rows × 2 columns Grid Container */}
        <div className="relative min-h-[420px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {currentItems.map(item => {
                const authorName = item.customerName || item.name || "Patient"
                const reviewText = item.comment || item.quote || ""
                const initials = authorName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)

                return (
                  <div
                    key={item.id}
                    className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 flex flex-col justify-between shadow-xs hover:border-[rgb(var(--primary)/0.3)] transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < item.rating ? "fill-amber-400 text-amber-400" : "text-[rgb(var(--border))]"
                              }`}
                            />
                          ))}
                        </div>

                        {item.isVerified && (
                          <span className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            Verified Booking
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed italic">
                        &ldquo;{reviewText}&rdquo;
                      </p>

                      {(item.service?.name || item.staff?.name) && (
                        <div className="text-[11px] text-[rgb(var(--muted-foreground))] pt-1 border-t border-[rgb(var(--border))]">
                          {item.service?.name && (
                            <span>
                              Treatment:{" "}
                              <span className="font-medium text-[rgb(var(--foreground))]">{item.service.name}</span>
                            </span>
                          )}
                          {item.service?.name && item.staff?.name && <span> • </span>}
                          {item.staff?.name && (
                            <span>
                              Doctor:{" "}
                              <span className="font-medium text-[rgb(var(--foreground))]">{item.staff.name}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-[rgb(var(--border))]">
                      <Avatar className="h-9 w-9 border border-[rgb(var(--border))]">
                        <AvatarImage src={item.image ?? undefined} alt={authorName} />
                        <AvatarFallback className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold text-[rgb(var(--foreground))]">{authorName}</div>
                        {item.role && <div className="text-xs text-[rgb(var(--muted-foreground))]">{item.role}</div>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Pagination Dots (Visible only when more than 6 reviews) */}
        {hasMultiplePages && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageSelect(idx)}
                aria-label={`Go to page ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentPage
                    ? "w-8 bg-[rgb(var(--primary))]"
                    : "w-2 bg-[rgb(var(--border))] hover:bg-[rgb(var(--primary)/0.5)]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TestimonialsSection