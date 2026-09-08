import React, { useState, useEffect, useMemo } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { TreatmentCard, ServiceItem } from "@/components/sections/ServicesSection"
import { TreatmentPreviewModal } from "@/components/treatments/TreatmentPreviewModal"
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  DollarSign
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

const ITEMS_PER_PAGE = 12

export function TreatmentsPage() {
  const { business, terminology } = useBusiness()

  const [services, setServices] = useState<ServiceItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [globalCardStyle, setGlobalCardStyle] = useState<"default" | "image_card" | "overlay">("default")
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [selectedDuration, setSelectedDuration] = useState<string>("ALL")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Preview Modal State
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  const loadTreatmentsData = () => {
    fetch("/api/public/services", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.services) setServices(data.services)
        if (data.categories) setCategories(data.categories)
        if (data.cardStyle) setGlobalCardStyle(data.cardStyle)
      })
      .catch(err => console.warn("Failed to load treatments:", err))
      .finally(() => setLoading(false))
  }

  // Fetch all treatments and categories from PostgreSQL
  useEffect(() => {
    loadTreatmentsData()

    // Live sync channel listener
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel("website_customization_sync")
      channel.onmessage = () => {
        loadTreatmentsData()
      }
    } catch {
      // BroadcastChannel unsupported
    }
    return () => {
      channel?.close()
    }
  }, [])

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery.trim()) count++
    if (selectedCategory !== "ALL") count++
    if (minPrice.trim() || maxPrice.trim()) count++
    if (selectedDuration !== "ALL") count++
    return count
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedDuration])

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("ALL")
    setMinPrice("")
    setMaxPrice("")
    setSelectedDuration("ALL")
    setCurrentPage(1)
  }

  // Filtered Services based on database fields
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // 1. Category Filter
      if (selectedCategory !== "ALL") {
        const catName = service.category?.name
        const catId = (service as any).categoryId
        if (catName !== selectedCategory && catId !== selectedCategory) {
          return false
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = service.name.toLowerCase().includes(query)
        const matchShort = service.shortDescription?.toLowerCase().includes(query)
        const matchLong = service.description?.toLowerCase().includes(query)
        const matchCat = service.category?.name.toLowerCase().includes(query)
        if (!matchName && !matchShort && !matchLong && !matchCat) {
          return false
        }
      }

      // 3. Price Filter
      const priceNum = Number(service.price)
      if (minPrice.trim() && !isNaN(Number(minPrice))) {
        if (priceNum < Number(minPrice)) return false
      }
      if (maxPrice.trim() && !isNaN(Number(maxPrice))) {
        if (priceNum > Number(maxPrice)) return false
      }

      // 4. Duration Filter
      const dur = service.durationMinutes || 0
      if (selectedDuration === "30") {
        if (dur > 30) return false
      } else if (selectedDuration === "45") {
        if (dur !== 45) return false
      } else if (selectedDuration === "60") {
        if (dur < 60) return false
      }

      return true
    })
  }, [services, selectedCategory, searchQuery, minPrice, maxPrice, selectedDuration])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedDuration])

  // Pagination Slicing
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredServices.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredServices, currentPage])

  // Reusable Filter Controls Panel
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="treatment-search" className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
          Search {terminology.serviceLabel}
        </Label>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
          <Input
            id="treatment-search"
            placeholder={`Search by name, treatment...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
          Category
        </Label>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`flex items-center justify-between px-3 py-2 rounded-[var(--radius)] text-xs font-medium transition-all ${
              selectedCategory === "ALL"
                ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow-xs"
                : "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
            }`}
          >
            <span>All Categories</span>
            <span className="text-[11px] opacity-75">{services.length}</span>
          </button>

          {categories.map(cat => {
            const count = services.filter(
              s => s.category?.name === cat.name || (s as any).categoryId === cat.id
            ).length
            const isSelected = selectedCategory === cat.name || selectedCategory === cat.id

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center justify-between px-3 py-2 rounded-[var(--radius)] text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow-xs"
                    : "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                }`}
              >
                <span className="truncate text-left">{cat.name}</span>
                <span className="text-[11px] opacity-75">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2.5 pt-4 border-t border-[rgb(var(--border))]">
        <Label className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
          Price Range ({business.currencySymbol})
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-[rgb(var(--muted-foreground))]">Min</span>
            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="h-8 text-xs mt-0.5"
            />
          </div>
          <div>
            <span className="text-[10px] text-[rgb(var(--muted-foreground))]">Max</span>
            <Input
              type="number"
              placeholder="10000"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="h-8 text-xs mt-0.5"
            />
          </div>
        </div>
      </div>

      {/* Duration Filter */}
      <div className="space-y-2.5 pt-4 border-t border-[rgb(var(--border))]">
        <Label className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
          Duration
        </Label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "ALL", label: "Any Duration" },
            { id: "30", label: "≤ 30 mins" },
            { id: "45", label: "45 mins" },
            { id: "60", label: "60+ mins" },
          ].map(dur => (
            <button
              key={dur.id}
              onClick={() => setSelectedDuration(dur.id)}
              className={`px-2.5 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all text-center border ${
                selectedDuration === dur.id
                  ? "bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
                  : "bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
              }`}
            >
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Action */}
      {activeFiltersCount > 0 && (
        <div className="pt-2 border-t border-[rgb(var(--border))]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full gap-2 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear All Filters ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen py-8 lg:py-12 bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Mobile Filter Toggle Button Bar */}
        <div className="lg:hidden flex items-center justify-between p-3.5 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-xs">
          <div className="text-xs font-semibold text-[rgb(var(--foreground))]">
            Showing {filteredServices.length} {terminology.serviceLabel.toLowerCase()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            className="gap-2 text-xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="h-4 px-1.5 text-[10px] ml-0.5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Main Catalog Layout (Sidebar + Results Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar - Sticky with navbar offset & viewport scroll */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20 z-10 space-y-4">
            <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 shadow-xs max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgb(var(--border))] sticky -top-5 -mt-5 pt-5 bg-[rgb(var(--card))] z-10">
                <span className="font-bold text-sm text-[rgb(var(--foreground))] flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-[rgb(var(--primary))]" />
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-[rgb(var(--primary))] hover:underline font-medium cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <FilterControls />
            </div>
          </aside>

          {/* Treatments Grid & Pagination Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Header info bar on desktop */}
            <div className="hidden lg:flex items-center justify-between text-xs text-[rgb(var(--muted-foreground))]">
              <span>
                Displaying <strong className="text-[rgb(var(--foreground))]">{filteredServices.length}</strong> {terminology.serviceLabel.toLowerCase()}
              </span>
              {totalPages > 1 && (
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-24 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
              </div>
            ) : filteredServices.length === 0 ? (
              /* Clean Empty State */
              <div className="py-20 px-6 text-center space-y-4 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-xs">
                <div className="h-12 w-12 mx-auto rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))]">
                  <Search className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[rgb(var(--foreground))]">No treatments found</h3>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
                    We could not find any {terminology.serviceLabel.toLowerCase()} matching your filter criteria. Try adjusting or clearing your filters.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleClearFilters} className="gap-2 text-xs mt-2">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear All Filters
                </Button>
              </div>
            ) : (
              /* Grid of Treatment Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedServices.map(service => (
                  <TreatmentCard
                    key={service.id}
                    service={service}
                    currencySymbol={business.currencySymbol}
                    globalCardStyle={globalCardStyle}
                    onClick={svc => setSelectedService(svc)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="gap-1 text-xs h-8"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-[var(--radius)] text-xs font-semibold transition-all ${
                          pageNum === currentPage
                            ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow-xs"
                            : "bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="gap-1 text-xs h-8"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-xs h-full bg-[rgb(var(--card))] border-l border-[rgb(var(--border))] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[rgb(var(--border))]">
                  <span className="font-bold text-sm text-[rgb(var(--foreground))] flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[rgb(var(--primary))]" />
                    Filter {terminology.serviceLabel}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileFilterOpen(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <FilterControls />
              </div>

              <div className="pt-6 border-t border-[rgb(var(--border))]">
                <Button
                  className="w-full text-xs font-semibold"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Show {filteredServices.length} Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Treatment Preview Modal */}
      <TreatmentPreviewModal
        service={selectedService}
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        currencySymbol={business.currencySymbol}
        serviceSingular={terminology.serviceSingular}
      />
    </div>
  )
}

export default TreatmentsPage
