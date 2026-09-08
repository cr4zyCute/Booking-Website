import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Business, BusinessSettings, BusinessTerminology, FeatureSettings, ThemeSettings } from "@prisma/client"

export interface BusinessContextType {
  business: Business
  settings: BusinessSettings | null
  terminology: BusinessTerminology
  features: FeatureSettings | null
  theme: ThemeSettings | null
  loading: boolean
  refresh: () => Promise<void>
}

const DEFAULT_BUSINESS: Business = {
  id: "demo",
  name: "Veridian Dental Studio",
  type: "DENTAL",
  description: "A premium dental care studio offering comprehensive dental services in a comfortable, modern environment.",
  logo: null,
  favicon: null,
  address: "2F Veridian Building, 123 Ayala Avenue, Makati City, Metro Manila",
  latitude: 14.5547,
  longitude: 121.0244,
  mapZoom: 15,
  phone: "+63 2 8123 4567",
  email: "hello@veridian.com",
  website: "https://veridian.com",
  timezone: "Asia/Manila",
  currency: "PHP",
  currencySymbol: "₱",
  createdAt: new Date(),
  updatedAt: new Date(),
}

const DEFAULT_TERMINOLOGY: BusinessTerminology = {
  id: "default",
  businessId: "demo",
  staffLabel: "Dentists",
  staffSingular: "Dentist",
  serviceLabel: "Treatments",
  serviceSingular: "Treatment",
  appointmentLabel: "Appointments",
  appointmentSingular: "Appointment",
  customerLabel: "Patients",
  customerSingular: "Patient",
  createdAt: new Date(),
  updatedAt: new Date(),
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<Business>(DEFAULT_BUSINESS)
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [terminology, setTerminology] = useState<BusinessTerminology>(DEFAULT_TERMINOLOGY)
  const [features, setFeatures] = useState<FeatureSettings | null>(null)
  const [theme, setTheme] = useState<ThemeSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchContext = useCallback(async () => {
    try {
      const res = await fetch("/api/business/context")
      if (res.ok) {
        const data = await res.json()
        if (data.business) setBusiness(data.business)
        if (data.settings) setSettings(data.settings)
        if (data.terminology) setTerminology(data.terminology)
        if (data.features) setFeatures(data.features)
        if (data.theme) {
          setTheme(data.theme)
          if (data.theme.theme) {
            document.documentElement.setAttribute("data-theme", data.theme.theme)
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load business context, using default:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  return (
    <BusinessContext.Provider
      value={{
        business,
        settings,
        terminology,
        features,
        theme,
        loading,
        refresh: fetchContext,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider")
  }
  return context
}
