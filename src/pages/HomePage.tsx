import React, { useEffect, useState } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { HeroSection } from "@/components/sections/HeroSection"
import { QuickBookingBar } from "@/components/booking/QuickBookingBar"
import { TrustStatsSection } from "@/components/sections/TrustStatsSection"
import { InsuranceTrustStrip } from "@/components/sections/InsuranceTrustStrip"
import { ServicesSection } from "@/components/sections/ServicesSection"
import { StaffSection } from "@/components/sections/StaffSection"
import { TestimonialsSection } from "@/components/sections/TestimonialsSection"
import { FAQSection } from "@/components/sections/FAQSection"
import { ContactSection } from "@/components/sections/ContactSection"
import {
  DEFAULT_SERVICES,
  DEFAULT_STAFF,
  DEFAULT_TESTIMONIALS,
  DEFAULT_FAQS,
} from "@/lib/defaultData"

export function HomePage() {
  const { business, terminology } = useBusiness()
  const [sections, setSections] = useState<any[]>([])
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES)
  const [staff, setStaff] = useState<any[]>(DEFAULT_STAFF)
  const [testimonials, setTestimonials] = useState<any[]>(DEFAULT_TESTIMONIALS)
  const [reviews, setReviews] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>(DEFAULT_FAQS)

  const fetchHomepageData = () => {
    fetch("/api/public/home", { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("API offline or in static preview")
        return res.json()
      })
      .then(data => {
        if (data.sections && data.sections.length > 0) setSections(data.sections)
        if (data.services && data.services.length > 0) setServices(data.services)
        if (data.staff && data.staff.length > 0) setStaff(data.staff)
        if (data.testimonials && data.testimonials.length > 0) setTestimonials(data.testimonials)
        if (data.reviews && data.reviews.length > 0) setReviews(data.reviews)
        if (data.faqs && data.faqs.length > 0) setFaqs(data.faqs)
      })
      .catch(err => console.warn("Using default homepage data:", err.message))
  }

  useEffect(() => {
    // 1. Initial Load
    fetchHomepageData()

    // 2. Live Broadcast Channel for instant 0ms update across open tabs
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel("website_customization_sync")
      channel.onmessage = (event) => {
        if (event.data?.type === "CUSTOMIZATION_UPDATED") {
          fetchHomepageData()
        }
      }
    } catch {
      // BroadcastChannel not supported in legacy environment
    }

    // 3. Regular background sync interval (every 4 seconds when tab is active)
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchHomepageData()
      }
    }, 4000)

    return () => {
      if (channel) channel.close()
      clearInterval(interval)
    }
  }, [])

  const getSectionContent = (type: string) =>
    sections.find(s => s.type === type)?.content as Record<string, any> | null

  // Fallback default ordered sections if database sections list is not yet loaded
  const activeSections = sections.length > 0
    ? [...sections].filter(s => s.isEnabled !== false && s.type !== "BOOKING_CTA").sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [
        { type: "HERO", isEnabled: true, order: 0, content: null },
        { type: "TRUST_STATS", isEnabled: true, order: 1, content: null },
        { type: "SERVICES", isEnabled: true, order: 2, content: null },
        { type: "STAFF", isEnabled: true, order: 3, content: null },
        { type: "TESTIMONIALS", isEnabled: true, order: 4, content: null },
        { type: "FAQ", isEnabled: true, order: 5, content: null },
        { type: "CONTACT", isEnabled: true, order: 6, content: null },
      ]

  const renderSection = (section: any) => {
    const type = section.type
    const content = section.content || getSectionContent(type)

    switch (type) {
      case "HERO":
        return (
          <HeroSection
            key={section.id || "hero"}
            content={content}
            businessName={business.name}
            appointmentLabel={terminology.appointmentSingular}
            bookingBar={
              <QuickBookingBar
                services={services}
                staff={staff}
                serviceLabel={terminology.serviceSingular}
                staffLabel={terminology.staffSingular}
              />
            }
          />
        )
      case "TRUST_STATS":
        return (
          <React.Fragment key={section.id || "trust_stats"}>
            <TrustStatsSection content={content} />
            <InsuranceTrustStrip />
          </React.Fragment>
        )
      case "SERVICES":
        return (
          <ServicesSection
            key={section.id || "services"}
            services={services}
            serviceLabel={terminology.serviceLabel}
            currencySymbol={business.currencySymbol}
            content={content}
          />
        )
      case "STAFF":
        return (
          <StaffSection
            key={section.id || "staff"}
            staff={staff}
            staffLabel={terminology.staffLabel}
            content={content}
          />
        )
      case "TESTIMONIALS":
        return <TestimonialsSection key={section.id || "testimonials"} testimonials={testimonials} reviews={reviews} />
      case "FAQ":
        return <FAQSection key={section.id || "faq"} faqs={faqs} />
      case "CONTACT":
        return <ContactSection key={section.id || "contact"} />
      default:
        return null
    }
  }

  return <div>{activeSections.map(renderSection)}</div>
}


