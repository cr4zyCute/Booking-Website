import { Router } from "express"
import { prisma, isDbConnected } from "../../src/lib/db/prisma"

import { getBusinessContext, invalidateBusinessCache } from "../../src/lib/db/business"
import { inMemoryHeroSection, inMemoryServices, getInMemoryServices, setAllInMemoryServices } from "../lib/store"

export const publicRouter = Router()

const FALLBACK_SERVICES = [
  {
    id: "s1",
    name: "Dental Consultation",
    slug: "dental-consultation",
    shortDescription: "Comprehensive examination and personalized treatment planning.",
    description: "A thorough examination with digital X-rays and full oral assessment.",
    price: 800,
    durationMinutes: 30,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "s2",
    name: "Teeth Cleaning (Prophylaxis)",
    slug: "teeth-cleaning",
    shortDescription: "Professional prophylaxis to remove plaque, tartar, and stains.",
    description: "Gentle and thorough deep cleaning with fluoride protection.",
    price: 1500,
    durationMinutes: 45,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "s3",
    name: "Teeth Whitening",
    slug: "teeth-whitening",
    shortDescription: "In-office laser whitening for a brighter, more confident smile.",
    description: "Advanced cosmetic whitening treatment with instant results.",
    price: 5000,
    durationMinutes: 60,
    isFeatured: true,
    isActive: true,
  },
  {
    id: "s4",
    name: "Orthodontic Assessment",
    slug: "orthodontic-assessment",
    shortDescription: "Complete scan & plan for braces and clear aligners.",
    description: "Specialized orthodontic evaluation for smile alignment.",
    price: 1000,
    durationMinutes: 30,
    isFeatured: true,
    isActive: true,
  },
]

const FALLBACK_STAFF = [
  {
    id: "st1",
    name: "Dr. Maria Santos",
    photo: null,
    role: "Lead Dentist",
    specialty: "General & Preventive Dentistry",
    bio: "Over 12 years of clinical excellence in restorative and preventive dentistry.",
    slug: "dr-maria-santos",
    isActive: true,
  },
  {
    id: "st2",
    name: "Dr. Daniel Cruz",
    photo: null,
    role: "Orthodontist",
    specialty: "Orthodontics & Clear Aligners",
    bio: "Transforming smiles with modern braces and aligner technology.",
    slug: "dr-daniel-cruz",
    isActive: true,
  },
  {
    id: "st3",
    name: "Dr. Sofia Reyes",
    photo: null,
    role: "Cosmetic Dentist",
    specialty: "Aesthetic Dentistry & Whitening",
    bio: "Specializing in natural aesthetic smile makeovers and whitening.",
    slug: "dr-sofia-reyes",
    isActive: true,
  },
]

publicRouter.get("/home", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  try {
    const ctx = await getBusinessContext()
    let businessId = ctx?.business?.id

    if (isDbConnected() && (!businessId || businessId === "demo" || businessId === "demo-clinic")) {
      const dbBiz = await prisma.business.findFirst().catch(() => null)
      if (dbBiz) {
        businessId = dbBiz.id
      }
    }

    let sections: any[] = []
    let services: any[] = []
    let staff: any[] = []
    let testimonials: any[] = []
    let reviews: any[] = []
    let faqs: any[] = []

    if (isDbConnected()) {
      try {
      const [dbSections, dbServices, dbStaff, dbTestimonials, dbApprovedReviews, dbFaqs] = await Promise.all([
        prisma.websiteSection.findMany({
          where: { businessId, isEnabled: true },
          orderBy: { order: "asc" },
        }),
        prisma.service.findMany({
          where: { businessId, isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { category: true },
        }),
        prisma.staff.findMany({
          where: { businessId, isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            services: {
              include: { service: true },
            },
          },
        }),
        prisma.testimonial.findMany({
          where: { businessId, isPublished: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.review.findMany({
          where: { businessId, status: "APPROVED" },
          orderBy: { createdAt: "desc" },
        }),
        prisma.fAQ.findMany({
          where: { businessId, isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
      ])

      sections = dbSections
      testimonials = dbTestimonials
      reviews = dbApprovedReviews
      faqs = dbFaqs
      staff = dbStaff

      const servicesSection = dbSections.find((s: any) => s.type === "SERVICES")
      const globalCardStyle = (servicesSection?.content as any)?.cardStyle || "default"

      if (dbServices && dbServices.length > 0) {
        services = dbServices.map((s: any) => {
          const sImages = s.images && Array.isArray(s.images) && s.images.length > 0 ? s.images : s.image ? [s.image] : []
          return {
            id: s.id,
            name: s.name,
            slug: s.slug,
            shortDescription: s.shortDescription || s.description,
            description: s.description || s.shortDescription,
            price: Number(s.price),
            durationMinutes: s.durationMinutes,
            image: sImages[0] || s.image || null,
            images: sImages,
            cardStyle: globalCardStyle,
            sortOrder: s.sortOrder,
            isFeatured: s.isFeatured,
            isActive: s.isActive,
            category: s.category,
          }
        })
        setAllInMemoryServices(services)
      } catch (e) {
        console.warn("DB homepage query fallback:", e)
      }
    }

    // Emergency fallbacks only if DB connection is completely down
    if (services.length === 0) services = getInMemoryServices().map((s: any) => ({ ...s, images: s.images || (s.image ? [s.image] : []) }))

    // Ensure HERO section content is synchronized
    const heroIndex = sections.findIndex(s => s.type === "HERO")
    if (heroIndex >= 0) {
      sections[heroIndex].content = sections[heroIndex].content || inMemoryHeroSection
    } else {
      sections.unshift({
        type: "HERO",
        isEnabled: true,
        order: 0,
        content: inMemoryHeroSection,
      })
    }

    return res.json({
      sections,
      services,
      staff,
      testimonials,
      reviews,
      faqs,
    })
  } catch (error: any) {
    console.error("Error fetching homepage data:", error)
    return res.status(500).json({ error: "Failed to fetch homepage data", details: error?.message || String(error) })
  }
})

publicRouter.get("/services", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  try {
    const ctx = await getBusinessContext()
    let businessId = ctx?.business?.id
    if (!businessId || businessId === "demo" || businessId === "demo-clinic") {
      const dbBiz = await prisma.business.findFirst()
      if (dbBiz) businessId = dbBiz.id
    }

    let services: any[] = []
    let categories: any[] = []
    let globalCardStyle = "default"

    try {
      const [dbServices, dbCategories, servicesSection] = await Promise.all([
        prisma.service.findMany({
          where: { businessId, isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { category: true },
        }),
        prisma.serviceCategory.findMany({
          where: { businessId },
          orderBy: { order: "asc" },
        }),
        prisma.websiteSection.findFirst({
          where: { businessId, type: "SERVICES" },
        }),
      ])

      if (servicesSection?.content && (servicesSection.content as any).cardStyle) {
        globalCardStyle = (servicesSection.content as any).cardStyle
      }

      if (dbServices && dbServices.length > 0) {
        services = dbServices.map((s: any) => {
          const sImages = s.images && Array.isArray(s.images) && s.images.length > 0 ? s.images : s.image ? [s.image] : []
          return {
            id: s.id,
            name: s.name,
            slug: s.slug,
            shortDescription: s.shortDescription || s.description,
            description: s.description || s.shortDescription,
            price: Number(s.price),
            durationMinutes: s.durationMinutes,
            image: sImages[0] || s.image || null,
            images: sImages,
            cardStyle: globalCardStyle,
            sortOrder: s.sortOrder,
            isFeatured: s.isFeatured,
            isActive: s.isActive,
            category: s.category,
          }
        })
        setAllInMemoryServices(services)
      }
      categories = dbCategories
    } catch (e) {
      console.warn("DB services query fallback:", e)
    }

    if (services.length === 0) {
      services = getInMemoryServices().map((s: any) => ({
        ...s,
        images: s.images || (s.image ? [s.image] : []),
        cardStyle: globalCardStyle,
      }))
    }

    return res.json({ services, categories, cardStyle: globalCardStyle })
  } catch (error) {
    console.error("Error fetching services:", error)
    return res.json({ services: FALLBACK_SERVICES, categories: [] })
  }
})

publicRouter.get("/services/:slug", async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    let businessId = ctx?.business?.id
    if (!businessId || businessId === "demo" || businessId === "demo-clinic") {
      const dbBiz = await prisma.business.findFirst()
      if (dbBiz) businessId = dbBiz.id
    }
    const { slug } = req.params

    try {
      const service = await prisma.service.findFirst({
        where: { businessId, slug, isActive: true },
        include: {
          category: true,
          staffServices: {
            include: { staff: true },
          },
        },
      })
      if (service) return res.json({ service })
    } catch (e) {
      console.warn("DB service slug fallback:", e)
    }

    const fallback = FALLBACK_SERVICES.find(s => s.slug === slug)
    if (fallback) {
      return res.json({
        service: {
          ...fallback,
          staffServices: [{ id: "ss1", staff: FALLBACK_STAFF[0] }],
        },
      })
    }

    return res.status(404).json({ error: "Service not found" })
  } catch (error) {
    console.error("Error fetching service:", error)
    return res.status(500).json({ error: "Failed to fetch service" })
  }
})

publicRouter.get(["/staff", "/dentists"], async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    let businessId = ctx?.business?.id
    if (!businessId || businessId === "demo" || businessId === "demo-clinic") {
      const dbBiz = await prisma.business.findFirst()
      if (dbBiz) businessId = dbBiz.id
    }

    let staff: any[] = []
    try {
      staff = await prisma.staff.findMany({
        where: { businessId, isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          services: {
            include: {
              service: {
                include: { category: true },
              },
            },
          },
          schedules: {
            include: { shifts: true, breaks: true },
          },
        },
      })
    } catch (e) {
      console.warn("DB staff query fallback:", e)
    }

    if (staff.length === 0) staff = FALLBACK_STAFF

    return res.json({ staff, dentists: staff })
  } catch (error) {
    console.error("Error fetching staff:", error)
    return res.json({ staff: FALLBACK_STAFF, dentists: FALLBACK_STAFF })
  }
})

publicRouter.get(["/staff/:slug", "/dentists/:slug"], async (req, res) => {
  try {
    const ctx = await getBusinessContext()
    let businessId = ctx?.business?.id
    if (!businessId || businessId === "demo" || businessId === "demo-clinic") {
      const dbBiz = await prisma.business.findFirst()
      if (dbBiz) businessId = dbBiz.id
    }
    const slug = String(req.params.slug)

    try {
      const staffMember = await prisma.staff.findFirst({
        where: {
          businessId,
          OR: [{ slug }, { id: slug }],
          isActive: true,
        },
        include: {
          services: {
            include: {
              service: {
                include: { category: true },
              },
            },
          },
          schedules: {
            include: { shifts: true, breaks: true },
          },
        },
      })
      if (staffMember) return res.json({ staff: staffMember, dentist: staffMember })
    } catch (e) {
      console.warn("DB staff slug fallback:", e)
    }

    const fallback = FALLBACK_STAFF.find(s => s.slug === slug || s.id === slug)
    if (fallback) {
      return res.json({
        staff: {
          ...fallback,
          services: [{ id: "ss1", service: FALLBACK_SERVICES[0] }],
        },
        dentist: {
          ...fallback,
          services: [{ id: "ss1", service: FALLBACK_SERVICES[0] }],
        },
      })
    }

    return res.status(404).json({ error: "Dentist not found" })
  } catch (error) {
    console.error("Error fetching dentist:", error)
    return res.status(500).json({ error: "Failed to fetch dentist profile" })
  }
})

publicRouter.get("/nav", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  const fallbackNav = [
    { id: "1", label: "Home", href: "/", order: 0, isActive: true, isExternal: false },
    { id: "2", label: "Treatments", href: "/treatments", order: 1, isActive: true, isExternal: false },
    { id: "3", label: "Our Dentists", href: "/dentists", order: 2, isActive: true, isExternal: false },
    { id: "4", label: "About Us", href: "/about", order: 3, isActive: true, isExternal: false },
    { id: "5", label: "Contact", href: "/#contact", order: 4, isActive: true, isExternal: false },
  ]

  try {
    const ctx = await getBusinessContext()
    const businessId = ctx?.business.id ?? "demo"

    const navItems = await prisma.navigationItem.findMany({
      where: { businessId, isActive: true },
      orderBy: { order: "asc" },
    })

    if (navItems.length > 0) {
      // Normalize any legacy /services, /staff, or /contact links to their section anchors
      const normalizedNav = navItems.map(item => {
        let href = item.href
        if (href === "/services") href = "/#treatments"
        else if (href === "/staff") href = "/#dentists"
        else if (href === "/contact") href = "/#contact"
        return { ...item, href }
      })
      return res.json({ navItems: normalizedNav })
    }

    return res.json({ navItems: fallbackNav })
  } catch (error) {
    return res.json({ navItems: fallbackNav })
  }
})

publicRouter.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please provide your name, email, and message." })
    }
    console.log(`[Contact Message Received] From: ${name} (${email}): ${message}`)
    return res.json({
      success: true,
      message: "Thank you for contacting us! Your message has been received and our team will get back to you shortly.",
    })
  } catch (error) {
    console.error("Error submitting contact inquiry:", error)
    return res.status(500).json({ error: "Failed to send message. Please try again or call our clinic directly." })
  }
})
