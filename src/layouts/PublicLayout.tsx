import React, { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useBusiness } from "@/context/BusinessContext"
import { ClinicTopBar } from "@/components/layout/ClinicTopBar"
import { PublicNav, NavigationItemData } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { EmergencyQuickDock } from "@/components/common/EmergencyQuickDock"
import { motion, AnimatePresence } from "framer-motion"

export function PublicLayout() {
  const { business, terminology } = useBusiness()
  const [navItems, setNavItems] = useState<NavigationItemData[]>([])
  const location = useLocation()

  useEffect(() => {
    fetch("/api/public/nav")
      .then((res) => res.json())
      .then((data) => {
        if (data.navItems) setNavItems(data.navItems)
      })
      .catch(() => {
        setNavItems([
          { id: "1", label: "Home", href: "/", order: 0, isActive: true, isExternal: false },
          { id: "2", label: "Treatments", href: "/treatments", order: 1, isActive: true, isExternal: false },
          { id: "3", label: "Our Dentists", href: "/dentists", order: 2, isActive: true, isExternal: false },
          { id: "4", label: "About Us", href: "/about", order: 3, isActive: true, isExternal: false },
          { id: "5", label: "Contact", href: "/#contact", order: 4, isActive: true, isExternal: false },
        ])
      })
  }, [])

  const appointmentLabel = terminology.appointmentSingular

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <ClinicTopBar
        businessName={business.name}
        phone={business.phone}
        address={business.address}
      />
      <PublicNav
        businessName={business.name}
        logo={business.logo}
        navItems={navItems}
        bookingLabel={`Book ${appointmentLabel}`}
      />
      <main className="flex-1 flex flex-col">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex-1 flex flex-col w-full"
        >
          <Outlet />
        </motion.div>
      </main>
      <PublicFooter business={business} appointmentLabel={appointmentLabel} />
      <EmergencyQuickDock phone={business.phone} />
    </div>
  )
}

