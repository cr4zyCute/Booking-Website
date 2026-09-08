import React, { useState, useEffect, useCallback, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, CalendarDays, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"

export interface NavigationItemData {
  id: string
  label: string
  href: string
  order: number
  isActive: boolean
  isExternal?: boolean
}

interface PublicNavProps {
  businessName: string
  logo: string | null
  navItems: NavigationItemData[]
  bookingLabel: string
}

export function PublicNav({ businessName, logo, navItems, bookingLabel }: PublicNavProps) {
  const { user, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const isNavigatingRef = useRef(false)

  // Ensure body scroll is strictly unlocked whenever mobile menu closes or unmounts
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  // Always close mobile menu on route changes
  useEffect(() => {
    setMobileOpen(false)
    document.body.style.overflow = ""
  }, [pathname])

  // Close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
        document.body.style.overflow = ""
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false)
        document.body.style.overflow = ""
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Passive section observer on homepage for visual nav highlighting
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null)
      return
    }

    const sectionIds = ["home", "hero", "treatments", "services", "dentists", "staff", "testimonials", "faq", "contact", "booking-cta"]
    const observerCallback: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id
          if (id === "services") setActiveSection("treatments")
          else if (id === "staff") setActiveSection("dentists")
          else setActiveSection(id)
          break
        }
      }
    }

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-15% 0px -65% 0px",
      threshold: 0,
    })

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [pathname])

  // Smoothly scroll to a section on the homepage with header offset
  const scrollToSection = (sectionId: string) => {
    const targetEl = document.getElementById(sectionId) || (sectionId === "treatments" ? document.getElementById("services") : null) || (sectionId === "dentists" ? document.getElementById("staff") : null)
    if (!targetEl) return false

    const header = document.querySelector("header")
    const headerHeight = header ? header.getBoundingClientRect().height : 64
    const elementTop = targetEl.getBoundingClientRect().top + window.scrollY
    const targetPosition = Math.max(0, elementTop - headerHeight - 16)

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    })

    return true
  }

  const isItemActive = useCallback(
    (itemHref: string) => {
      if (pathname === "/") {
        if ((itemHref === "/" || itemHref === "/#home" || itemHref === "#home") && (!activeSection || activeSection === "home" || activeSection === "hero")) {
          return true
        }
        if (
          (itemHref === "/#treatments" || itemHref === "#treatments" || itemHref === "/#services" || itemHref === "#services" || itemHref === "/services") &&
          (activeSection === "treatments" || activeSection === "services")
        ) {
          return true
        }
        if (
          (itemHref === "/#dentists" || itemHref === "#dentists" || itemHref === "/#staff" || itemHref === "#staff" || itemHref === "/staff") &&
          (activeSection === "dentists" || activeSection === "staff")
        ) {
          return true
        }
        if (
          (itemHref === "/#contact" || itemHref === "#contact" || itemHref === "/contact") &&
          activeSection === "contact"
        ) {
          return true
        }
      }

      if (itemHref === pathname) return true

      if (itemHref !== "/" && !itemHref.startsWith("#") && !itemHref.startsWith("/#")) {
        if (pathname.startsWith(itemHref)) return true
      }

      return false
    },
    [pathname, activeSection]
  )

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isExternal?: boolean) => {
    if (isExternal) return

    // Immediately close mobile drawer and unlock scrolling
    setMobileOpen(false)
    document.body.style.overflow = ""

    // 1. Homepage link when already on homepage -> smooth scroll to top
    if (href === "/" && pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    // 2. Hash link or /#section link
    if (href.startsWith("#") || href.startsWith("/#")) {
      const sectionId = href.replace(/^(\/)?#/, "")

      if (pathname === "/") {
        e.preventDefault()
        scrollToSection(sectionId)
        window.history.pushState(null, "", href.startsWith("/") ? href : `/${href}`)
        return
      } else {
        // If on another page (e.g. /about), navigate back to Home with hash
        e.preventDefault()
        navigate(`/#${sectionId}`)
        return
      }
    }

    // 3. Backward-compatible route aliases
    if (href === "/services" || href === "/staff" || href === "/contact") {
      const sectionId = href === "/services" ? "treatments" : href === "/staff" ? "dentists" : "contact"
      e.preventDefault()
      if (pathname === "/") {
        scrollToSection(sectionId)
        window.history.pushState(null, "", `/#${sectionId}`)
      } else {
        navigate(`/#${sectionId}`)
      }
      return
    }

    // Otherwise standard React Router page navigation (e.g. /about, /booking) proceeds naturally
  }

  const activeNavItems = navItems.filter((i) => i.isActive).sort((a, b) => a.order - b.order)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgb(var(--border))] bg-[rgb(var(--card)/0.95)] backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, "/")}
            className="flex items-center gap-2.5 font-semibold text-[rgb(var(--foreground))] transition-opacity hover:opacity-90 cursor-pointer"
          >
            {logo ? (
              <img src={logo} alt={businessName} className="h-8 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-[var(--radius)] bg-[rgb(var(--primary))] flex items-center justify-center shadow-sm">
                  <CalendarDays className="h-4 w-4 text-[rgb(var(--primary-foreground))]" />
                </div>
                <span className="text-base font-semibold tracking-tight">{businessName}</span>
              </div>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {activeNavItems.map((item) => {
              const active = isItemActive(item.href)
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  onClick={(e) => handleNavClick(e, item.href, item.isExternal)}
                  className={`relative px-3.5 py-1.5 text-sm font-medium rounded-[var(--radius)] transition-all duration-150 cursor-pointer ${
                    active
                      ? "text-[rgb(var(--primary))] font-semibold bg-[rgb(var(--primary)/0.08)]"
                      : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="activePublicNavIndicator"
                      className="pointer-events-none absolute bottom-0 left-2 right-2 h-[2px] bg-[rgb(var(--primary))] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* CTA + Sign In + mobile menu toggle */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium text-[rgb(var(--foreground))] border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] shadow-xs"
              >
                Sign In
              </Button>
            </Link>

            <Link
              to="/booking"
              className="hidden sm:inline-flex"
              onClick={() => {
                setMobileOpen(false)
                document.body.style.overflow = ""
              }}
            >
              <Button size="sm" className="gap-2 shadow-sm transition-transform active:scale-95">
                <CalendarDays className="h-4 w-4" />
                {bookingLabel}
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-[var(--radius)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="md:hidden overflow-hidden border-t border-[rgb(var(--border))]"
            >
              <div className="py-3 space-y-1">
                {activeNavItems.map((item) => {
                  const active = isItemActive(item.href)
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      onClick={(e) => handleNavClick(e, item.href, item.isExternal)}
                      className={`block px-3.5 py-2.5 text-sm font-medium rounded-[var(--radius)] transition-colors cursor-pointer ${
                        active
                          ? "text-[rgb(var(--primary))] font-semibold bg-[rgb(var(--primary)/0.1)]"
                          : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <div className="pt-2 pb-1 px-1 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => {
                      setMobileOpen(false)
                      document.body.style.overflow = ""
                    }}
                  >
                    <Button variant="outline" className="w-full text-xs font-medium border-[rgb(var(--border))]">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    to="/booking"
                    onClick={() => {
                      setMobileOpen(false)
                      document.body.style.overflow = ""
                    }}
                  >
                    <Button className="w-full gap-2 shadow-sm">
                      <CalendarDays className="h-4 w-4" />
                      {bookingLabel}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}