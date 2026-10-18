import React, { useState, useEffect, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Stethoscope,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Loader2,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Globe,
  Award,
  ChevronDown,
  RotateCcw,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useBusiness } from "@/context/BusinessContext"
import { DentistPreviewModal, DentistModalData } from "@/components/dentists/DentistPreviewModal"
import { DEFAULT_STAFF } from "@/lib/defaultData"

export function DentistsPage() {
  const { terminology } = useBusiness()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dentists, setDentists] = useState<DentistModalData[]>(DEFAULT_STAFF)
  const [loading, setLoading] = useState(false)

  // Drawer / Popover State for "More Filters"
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)

  // Dentist Preview Modal State
  const [selectedDentist, setSelectedDentist] = useState<DentistModalData | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const staffLabel = terminology?.staffLabel || "Dentists"
  const staffSingular = terminology?.staffSingular || "Dentist"

  // URL Query Parameters State
  const searchQuery = searchParams.get("q") || ""
  const selectedSpecialty = searchParams.get("specialty") || "All"
  const selectedAvailability = searchParams.get("availability") || "all" // "all" | "today" | "this-week"
  const selectedLanguage = searchParams.get("language") || "All"
  const selectedTreatment = searchParams.get("treatment") || "All"
  const sortBy = searchParams.get("sort") || "recommended" // "recommended" | "name-asc" | "name-desc" | "experience"

  // Fetch Dentists Data
  useEffect(() => {
    fetch("/api/public/dentists")
      .then(res => {
        if (!res.ok) throw new Error("API not reachable")
        return res.json()
      })
      .then(data => {
        if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
          setDentists(data.staff)
        } else if (data.dentists && Array.isArray(data.dentists) && data.dentists.length > 0) {
          setDentists(data.dentists)
        }
      })
      .catch(err => console.warn("Using default dentists data:", err.message))
      .finally(() => setLoading(false))
  }, [])

  // Helper to update query parameters smoothly
  const updateFilter = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "All" || value === "all" || (key === "sort" && value === "recommended")) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    setSearchParams(newParams, { replace: true })
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  // Derive dynamic list of specialties from database
  const availableSpecialties = useMemo(() => {
    const set = new Set<string>()
    dentists.forEach(d => {
      if (d.specialty) set.add(d.specialty)
      if (d.specialties && Array.isArray(d.specialties)) {
        d.specialties.forEach(s => set.add(s))
      }
    })
    return ["All", ...Array.from(set)]
  }, [dentists])

  // Derive dynamic list of treatments/services from database
  const availableTreatments = useMemo(() => {
    const map = new Map<string, string>() // slug/id -> name
    dentists.forEach(d => {
      d.services?.forEach(s => {
        if (s.service?.name) {
          map.set(s.service.slug || s.service.name, s.service.name)
        }
      })
    })
    return [
      { key: "All", label: "All Treatments" },
      ...Array.from(map.entries()).map(([key, label]) => ({ key, label })),
    ]
  }, [dentists])

  // Derive dynamic list of languages stored for dentists
  const availableLanguages = useMemo(() => {
    const set = new Set<string>()
    dentists.forEach(d => {
      if (d.languages && Array.isArray(d.languages)) {
        d.languages.forEach(l => set.add(l))
      }
    })
    const list = Array.from(set)
    if (list.length === 0) return ["All", "English", "Filipino"]
    return ["All", ...list]
  }, [dentists])

  // Top 4 quick filter specialties for the main chips bar
  const quickSpecialties = useMemo(() => {
    return availableSpecialties.slice(0, 5) // "All" + up to 4 specialties
  }, [availableSpecialties])

  // Count active secondary filters for badge
  const secondaryFilterCount = useMemo(() => {
    let count = 0
    if (selectedAvailability !== "all") count++
    if (selectedLanguage !== "All") count++
    if (selectedTreatment !== "All") count++
    if (selectedSpecialty !== "All" && !quickSpecialties.includes(selectedSpecialty)) count++
    return count
  }, [selectedAvailability, selectedLanguage, selectedTreatment, selectedSpecialty, quickSpecialties])

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedSpecialty !== "All" ||
    selectedAvailability !== "all" ||
    selectedLanguage !== "All" ||
    selectedTreatment !== "All"

  // Check real availability for a dentist
  const checkAvailability = (dentist: DentistModalData, filterType: string): boolean => {
    if (filterType === "all") return true
    const schedules = (dentist as any).schedules || []
    if (!Array.isArray(schedules) || schedules.length === 0) return true // fallback to available

    const todayDay = new Date().getDay() // 0 = Sunday, 1 = Monday, ...

    if (filterType === "today") {
      const todaySched = schedules.find((s: any) => s.dayOfWeek === todayDay)
      return Boolean(todaySched && todaySched.isWorking)
    }

    if (filterType === "this-week") {
      return schedules.some((s: any) => s.isWorking)
    }

    return true
  }

  // Filter and sort dentists
  const filteredAndSortedDentists = useMemo(() => {
    const filtered = dentists.filter(dentist => {
      // 1. Specialty Filter
      if (selectedSpecialty !== "All") {
        const matchesMain = dentist.specialty === selectedSpecialty
        const matchesSub = dentist.specialties && dentist.specialties.includes(selectedSpecialty)
        if (!matchesMain && !matchesSub) return false
      }

      // 2. Availability Filter
      if (selectedAvailability !== "all") {
        if (!checkAvailability(dentist, selectedAvailability)) return false
      }

      // 3. Language Filter
      if (selectedLanguage !== "All") {
        const hasLang = dentist.languages && dentist.languages.includes(selectedLanguage)
        if (!hasLang) return false
      }

      // 4. Treatment / Service Filter
      if (selectedTreatment !== "All") {
        const providesTreatment = dentist.services?.some(
          s => s.service?.slug === selectedTreatment || s.service?.name.toLowerCase() === selectedTreatment.toLowerCase()
        )
        if (!providesTreatment) return false
      }

      // 5. Broad Search Query Match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()

        // Name match
        const nameMatch = dentist.name.toLowerCase().includes(query)
        // Specialty match
        const specialtyMatch = dentist.specialty?.toLowerCase().includes(query) || false
        const specialtiesMatch = dentist.specialties?.some(s => s.toLowerCase().includes(query)) || false
        // Role match
        const roleMatch = dentist.role?.toLowerCase().includes(query) || false
        // Treatment / Services match
        const servicesMatch = dentist.services?.some(s => s.service?.name.toLowerCase().includes(query)) || false
        // Bio / Biography match
        const bioMatch = (dentist.biography || dentist.bio || "").toLowerCase().includes(query)
        // Credentials / Education match
        const credsMatch = dentist.credentials?.some(c => c.toLowerCase().includes(query)) || false
        const eduMatch = dentist.education?.some(e => e.toLowerCase().includes(query)) || false

        // Common synonym aliases for patient search convenience:
        const isBracesSearch = query.includes("brace") || query.includes("aligner") || query.includes("invisalign")
        const isOrthodonticDoctor =
          (dentist.specialty && dentist.specialty.toLowerCase().includes("orthodont")) ||
          dentist.specialties?.some(s => s.toLowerCase().includes("orthodont") || s.toLowerCase().includes("aligner")) ||
          dentist.services?.some(s => s.service?.name.toLowerCase().includes("orthodont"))

        const isWhiteningSearch = query.includes("whiten") || query.includes("bleach")
        const isWhiteningDoctor =
          (dentist.specialty && dentist.specialty.toLowerCase().includes("cosmetic")) ||
          dentist.specialties?.some(s => s.toLowerCase().includes("whiten") || s.toLowerCase().includes("cosmetic")) ||
          dentist.services?.some(s => s.service?.name.toLowerCase().includes("whiten"))

        const isImplantSearch = query.includes("implant") || query.includes("surgery") || query.includes("wisdom") || query.includes("extract")
        const isImplantDoctor =
          (dentist.specialty && (dentist.specialty.toLowerCase().includes("surgery") || dentist.specialty.toLowerCase().includes("implant"))) ||
          dentist.specialties?.some(s => s.toLowerCase().includes("implant") || s.toLowerCase().includes("surgery")) ||
          dentist.services?.some(s => s.service?.name.toLowerCase().includes("implant"))

        const matchesSynonym =
          (isBracesSearch && isOrthodonticDoctor) ||
          (isWhiteningSearch && isWhiteningDoctor) ||
          (isImplantSearch && isImplantDoctor)

        if (
          !nameMatch &&
          !specialtyMatch &&
          !specialtiesMatch &&
          !roleMatch &&
          !servicesMatch &&
          !bioMatch &&
          !credsMatch &&
          !eduMatch &&
          !matchesSynonym
        ) {
          return false
        }
      }

      return true
    })

    // Sort Results
    return filtered.sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name)
      }
      if (sortBy === "experience") {
        const getExpYears = (exp?: string | null) => {
          if (!exp) return 0
          const match = exp.match(/\d+/)
          return match ? parseInt(match[0], 10) : 0
        }
        return getExpYears(b.experience) - getExpYears(a.experience)
      }
      // Default: Recommended (sortOrder)
      const orderA = (a as any).sortOrder ?? 0
      const orderB = (b as any).sortOrder ?? 0
      return orderA - orderB
    })
  }, [dentists, selectedSpecialty, selectedAvailability, selectedLanguage, selectedTreatment, searchQuery, sortBy])

  const handleOpenPreview = (dentist: DentistModalData, e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedDentist(dentist)
    setIsPreviewOpen(true)
  }

  // Format count text with proper singular/plural grammar
  const resultCountText = useMemo(() => {
    const count = filteredAndSortedDentists.length
    if (count === 0) return `No ${staffLabel.toLowerCase()} found`
    if (count === 1) return `1 ${staffSingular.toLowerCase()} found`
    return `${count} ${staffLabel.toLowerCase()} found`
  }, [filteredAndSortedDentists.length, staffLabel, staffSingular])

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] pb-20">
      {/* 1. Top Search Header Area */}
      <section className="relative py-12 sm:py-16 lg:py-20 border-b border-[rgb(var(--border))] bg-gradient-to-b from-[rgb(var(--muted)/0.4)] to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="h-3.5 w-3.5" />
            Dental Specialists Directory
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[rgb(var(--foreground))]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Find the Right Dentist
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed">
            Search our dental team by name, specialty, or treatment.
          </p>

          {/* Search Input Box */}
          <div className="max-w-2xl mx-auto pt-3">
            <div className="relative flex items-center shadow-md rounded-[var(--radius)] overflow-hidden border border-[rgb(var(--border))] focus-within:border-[rgb(var(--primary))] focus-within:ring-2 focus-within:ring-[rgb(var(--primary)/0.2)] bg-[rgb(var(--card))] transition-all">
              <Search className="absolute left-4 h-5 w-5 text-[rgb(var(--muted-foreground))] pointer-events-none" />
              <Input
                type="text"
                placeholder="Search dentists, specialties, or treatments..."
                value={searchQuery}
                onChange={e => updateFilter({ q: e.target.value })}
                className="w-full pl-12 pr-10 h-13 text-sm sm:text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[rgb(var(--muted-foreground)/0.7)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateFilter({ q: null })}
                  aria-label="Clear search query"
                  className="absolute right-3.5 p-1 rounded-full text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Visible Filters Chips */}
          <div className="pt-2 flex items-center justify-center flex-wrap gap-2">
            {quickSpecialties.map(spec => {
              const isSelected = selectedSpecialty === spec
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => updateFilter({ specialty: spec })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-[rgb(var(--primary))] text-white shadow-sm ring-2 ring-[rgb(var(--primary)/0.3)]"
                      : "bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--muted)/0.5)]"
                  }`}
                >
                  {spec === "All" ? `All ${staffLabel}` : spec}
                </button>
              )
            })}

            {/* "More Filters" Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMoreFiltersOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none border ${
                secondaryFilterCount > 0
                  ? "bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] border-[rgb(var(--primary)/0.4)]"
                  : "bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--muted)/0.5)]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              More Filters
              {secondaryFilterCount > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-[rgb(var(--primary))] text-white text-[10px] flex items-center justify-center font-bold">
                  {secondaryFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Directory Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Active Filters Removable Chips Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-3 p-3 bg-[rgb(var(--muted)/0.3)] rounded-[var(--radius)] border border-[rgb(var(--border))] flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[rgb(var(--muted-foreground))] font-semibold mr-1">Active Filters:</span>

              {/* Search query chip */}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-medium">
                  Search: "{searchQuery}"
                  <button
                    type="button"
                    onClick={() => updateFilter({ q: null })}
                    className="hover:text-red-500 ml-0.5"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Specialty chip */}
              {selectedSpecialty !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-medium">
                  Specialty: {selectedSpecialty}
                  <button
                    type="button"
                    onClick={() => updateFilter({ specialty: "All" })}
                    className="hover:text-red-500 ml-0.5"
                    aria-label="Remove specialty filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Availability chip */}
              {selectedAvailability !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-medium">
                  Availability: {selectedAvailability === "today" ? "Available Today" : "Available This Week"}
                  <button
                    type="button"
                    onClick={() => updateFilter({ availability: "all" })}
                    className="hover:text-red-500 ml-0.5"
                    aria-label="Remove availability filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Language chip */}
              {selectedLanguage !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-medium">
                  Language: {selectedLanguage}
                  <button
                    type="button"
                    onClick={() => updateFilter({ language: "All" })}
                    className="hover:text-red-500 ml-0.5"
                    aria-label="Remove language filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Treatment chip */}
              {selectedTreatment !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-medium">
                  Treatment: {availableTreatments.find(t => t.key === selectedTreatment)?.label || selectedTreatment}
                  <button
                    type="button"
                    onClick={() => updateFilter({ treatment: "All" })}
                    className="hover:text-red-500 ml-0.5"
                    aria-label="Remove treatment filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Clear All Action */}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[rgb(var(--primary))] hover:underline shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Clear all
            </button>
          </div>
        )}

        {/* Results Header: Count & Sorting Control */}
        <div className="flex items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-4">
          <div className="text-sm font-bold text-[rgb(var(--foreground))]">
            {resultCountText}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium hidden sm:inline">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => updateFilter({ sort: e.target.value })}
                className="text-xs font-semibold bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-md px-3 py-1.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-[rgb(var(--primary))]"
                aria-label="Sort dentists"
              >
                <option value="recommended">Recommended</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="experience">Most Experienced</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-[rgb(var(--muted-foreground))] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3. Dentist Grid / Loading / Empty States */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Loading dental specialists...</p>
          </div>
        ) : filteredAndSortedDentists.length === 0 ? (
          /* Helpful No Results State */
          <div className="py-20 text-center rounded-[calc(var(--radius)+4px)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 space-y-4 shadow-sm max-w-lg mx-auto">
            <div className="h-16 w-16 mx-auto rounded-full bg-[rgb(var(--muted)/0.6)] flex items-center justify-center text-[rgb(var(--primary))]">
              <Stethoscope className="h-8 w-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">No dentists match your search.</h2>
              <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                Try searching with different keywords, or clear some filters to see all available dental specialists.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2 text-xs font-semibold mt-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Dentist Cards 4-Column Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedDentists.map(dentist => {
              const photoUrl = dentist.photo || (dentist.images && dentist.images.length > 0 ? dentist.images[0] : null)
              const roleTitle = dentist.role || "Dental Specialist"
              const primarySpecialty = dentist.specialty || "General Dentistry"
              const bioSnippet = dentist.bio || "Dedicated dental specialist delivering personalized care."

              return (
                <div
                  key={dentist.id}
                  className="group bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden flex flex-col justify-between hover:border-[rgb(var(--primary)/0.5)] hover:shadow-lg transition-all duration-300"
                >
                  {/* Portrait Header */}
                  <div
                    onClick={(e) => handleOpenPreview(dentist, e)}
                    className="aspect-[4/4.5] overflow-hidden bg-[rgb(var(--muted))] relative cursor-pointer select-none"
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={dentist.name}
                        className="object-cover object-top w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--muted)/0.4)] to-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
                        <Stethoscope className="h-12 w-12 opacity-30 text-[rgb(var(--primary))]" />
                      </div>
                    )}

                    {/* Verified Specialist Seal */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/15">
                        <ShieldCheck className="h-2.5 w-2.5 text-cyan-300" />
                        Verified
                      </span>
                    </div>

                    {dentist.experience && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/15">
                          {dentist.experience}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h2 className="font-bold text-base text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors leading-snug">
                        {dentist.name}
                      </h2>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-[rgb(var(--primary))]">
                          {primarySpecialty}
                        </span>
                        <span className="text-[10px] text-[rgb(var(--muted-foreground))]">•</span>
                        <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium">
                          {roleTitle}
                        </span>
                      </div>

                      {bioSnippet && (
                        <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2 pt-1">
                          {bioSnippet}
                        </p>
                      )}

                      {/* Specialties badges */}
                      {dentist.specialties && dentist.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {dentist.specialties.slice(0, 2).map((sp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--muted-foreground))]"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-3 border-t border-[rgb(var(--border))]">
                      {dentist.acceptingAppointments !== false ? (
                        <Link
                          to={`/booking?staff=${dentist.slug || dentist.id}`}
                          className="block w-full"
                        >
                          <Button
                            size="sm"
                            className="w-full gap-1.5 font-semibold text-xs h-9 shadow-sm"
                          >
                            <CalendarDays className="h-3.5 w-3.5" />
                            Book Appointment
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          className="w-full gap-1.5 font-semibold text-xs h-9 opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500"
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                          Currently Unavailable
                        </Button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleOpenPreview(dentist, e)}
                          className="text-xs h-8 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] cursor-pointer"
                        >
                          Quick View
                        </Button>

                        <Link
                          to={`/dentists/${dentist.slug || dentist.id}`}
                          className="block"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 gap-1 font-medium"
                          >
                            Profile
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 4. "More Filters" Slide-Over Drawer / Modal */}
      <AnimatePresence>
        {isMoreFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-center sm:items-stretch justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMoreFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Filter Drawer / Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-md bg-[rgb(var(--card))] border-l border-[rgb(var(--border))] shadow-2xl h-full flex flex-col z-10 text-[rgb(var(--foreground))]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[rgb(var(--primary))]" />
                  <h2 className="font-bold text-base text-[rgb(var(--foreground))]">Filter Dental Specialists</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreFiltersOpen(false)}
                  className="p-1 rounded-full text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-7">
                {/* 1. Specialty Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                    Clinical Specialty
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {availableSpecialties.map(spec => {
                      const isSelected = selectedSpecialty === spec
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => updateFilter({ specialty: spec })}
                          className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                            isSelected
                              ? "bg-[rgb(var(--primary)/0.15)] text-[rgb(var(--primary))] font-semibold border border-[rgb(var(--primary)/0.3)]"
                              : "hover:bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--foreground))]"
                          }`}
                        >
                          <span>{spec === "All" ? `All Specialties` : spec}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Availability Filter */}
                <div className="space-y-3 pt-4 border-t border-[rgb(var(--border))]">
                  <label className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                    Availability
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { key: "all", label: "Any Schedule / Availability" },
                      { key: "today", label: "Available Today" },
                      { key: "this-week", label: "Available This Week" },
                    ].map(opt => {
                      const isSelected = selectedAvailability === opt.key
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => updateFilter({ availability: opt.key })}
                          className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                            isSelected
                              ? "bg-[rgb(var(--primary)/0.15)] text-[rgb(var(--primary))] font-semibold border border-[rgb(var(--primary)/0.3)]"
                              : "hover:bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--foreground))]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Treatments & Procedures Filter */}
                {availableTreatments.length > 1 && (
                  <div className="space-y-3 pt-4 border-t border-[rgb(var(--border))]">
                    <label className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      Treatment / Procedure
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {availableTreatments.map(t => {
                        const isSelected = selectedTreatment === t.key
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => updateFilter({ treatment: t.key })}
                            className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                              isSelected
                                ? "bg-[rgb(var(--primary)/0.15)] text-[rgb(var(--primary))] font-semibold border border-[rgb(var(--primary)/0.3)]"
                                : "hover:bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--foreground))]"
                            }`}
                          >
                            <span className="truncate">{t.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[rgb(var(--primary))] shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Languages Spoken Filter */}
                {availableLanguages.length > 1 && (
                  <div className="space-y-3 pt-4 border-t border-[rgb(var(--border))]">
                    <label className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      Languages Spoken
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableLanguages.map(lang => {
                        const isSelected = selectedLanguage === lang
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => updateFilter({ language: lang })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-[rgb(var(--primary))] text-white shadow-sm"
                                : "bg-[rgb(var(--muted)/0.5)] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                            }`}
                          >
                            {lang === "All" ? "All Languages" : lang}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold"
                >
                  Clear all
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsMoreFiltersOpen(false)}
                  className="flex-1 text-xs font-semibold shadow-sm"
                >
                  Show {filteredAndSortedDentists.length} Result{filteredAndSortedDentists.length === 1 ? "" : "s"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Dentist Interactive Preview Modal */}
      <DentistPreviewModal
        dentist={selectedDentist}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setSelectedDentist(null)
        }}
        terminologyStaffSingular={staffSingular}
      />
    </div>
  )
}

export default DentistsPage
