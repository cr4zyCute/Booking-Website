import "dotenv/config"
import { prisma } from "../src/lib/db/prisma"

async function populateStarterData() {
  console.log("Checking and populating database starter data...")

  // 1. Find the active business
  const business = await prisma.business.findFirst({
    include: { terminology: true, featureSettings: true, themeSettings: true },
  })

  if (!business) {
    console.error("No business found in database. Please run npm run db:seed first.")
    return
  }

  console.log(`Found active business: "${business.name}" (${business.type}) [ID: ${business.id}]`)

  const term = business.terminology
  const staffLabel = term?.staffLabel || "Dentists"
  const serviceLabel = term?.serviceLabel || "Treatments"
  const apptLabel = term?.appointmentLabel || "Appointments"
  const apptSingular = term?.appointmentSingular || "Appointment"
  const patientLabel = term?.customerLabel || "Patients"

  // 2. Ensure Website Sections are populated and enabled
  const expectedSections = [
    {
      type: "HERO",
      order: 0,
      isEnabled: true,
      content: {
        imagePosition: "right",
        heading: "Exceptional care.\nDesigned around you.",
        subheading: `Professional ${serviceLabel.toLowerCase()} delivered by an experienced team in ${business.name}.`,
        primaryCta: `Book ${apptSingular}`,
        secondaryCta: `Explore ${serviceLabel}`,
        image: "/hero-dental.jpg",
        showBadge: true,
        badgeText: `Now accepting new ${patientLabel.toLowerCase()} bookings`,
        stat1Value: "500+",
        stat1Label: `Satisfied ${patientLabel}`,
        stat2Value: "12",
        stat2Label: `Certified ${staffLabel}`,
      },
    },
    {
      type: "TRUST_STATS",
      order: 1,
      isEnabled: true,
      content: {
        stats: [
          { icon: "users", value: "2,500+", label: `${patientLabel} Treated` },
          { icon: "star", value: "4.9/5", label: "Client Rating" },
          { icon: "clock", value: "10+ Years", label: "Clinical Experience" },
          { icon: "shield", value: "100%", label: "Quality & Sterile Care" },
        ],
      },
    },
    {
      type: "SERVICES",
      order: 2,
      isEnabled: true,
      content: {
        heading: `Our ${serviceLabel}`,
        subheading: `Comprehensive ${business.type.toLowerCase()} care from routine check-ups to advanced specialized procedures.`,
      },
    },
    {
      type: "STAFF",
      order: 3,
      isEnabled: true,
      content: {
        heading: `Meet Our ${staffLabel}`,
        subheading: `Board-certified ${staffLabel.toLowerCase()} with specialized expertise and dedicated patient care.`,
      },
    },
    {
      type: "TESTIMONIALS",
      order: 4,
      isEnabled: true,
      content: {
        heading: `Verified ${patientLabel} Experiences`,
        subheading: `Read real feedback from ${patientLabel.toLowerCase()} who booked and completed ${serviceLabel.toLowerCase()} at our studio.`,
      },
    },
    {
      type: "FAQ",
      order: 5,
      isEnabled: true,
      content: {
        heading: "Frequently Asked Questions",
        subheading: `Find quick answers to common questions about ${apptLabel.toLowerCase()}, insurance, and ${serviceLabel.toLowerCase()}.`,
      },
    },
    {
      type: "CONTACT",
      order: 6,
      isEnabled: true,
      content: {
        heading: "Visit Our Studio",
        subheading: business.address || "2F Veridian Building, 123 Ayala Avenue, Makati City",
      },
    },
    {
      type: "BOOKING_CTA",
      order: 7,
      isEnabled: true,
      content: {
        heading: `Ready to book your ${apptSingular.toLowerCase()}?`,
        subheading: "Schedule online in minutes. Instant confirmation with zero hassle.",
        buttonText: `Book ${apptSingular} Now`,
        buttonLink: "/booking",
      },
    },
  ]

  for (const s of expectedSections) {
    const existing = await prisma.websiteSection.findFirst({
      where: { businessId: business.id, type: s.type as any },
    })

    if (!existing) {
      await prisma.websiteSection.create({
        data: {
          businessId: business.id,
          type: s.type as any,
          order: s.order,
          isEnabled: s.isEnabled,
          content: s.content,
        },
      })
      console.log(`Created missing section: ${s.type}`)
    } else if (!existing.content) {
      await prisma.websiteSection.update({
        where: { id: existing.id },
        data: { content: s.content },
      })
      console.log(`Updated empty content for section: ${s.type}`)
    }
  }

  // 3. Ensure Service Categories exist
  const categories = [
    { name: "General Dentistry", slug: "general", order: 0 },
    { name: "Cosmetic Dentistry", slug: "cosmetic", order: 1 },
    { name: "Orthodontics", slug: "orthodontics", order: 2 },
  ]

  const categoryMap: Record<string, string> = {}
  for (const cat of categories) {
    let existing = await prisma.serviceCategory.findFirst({
      where: { businessId: business.id, slug: cat.slug },
    })
    if (!existing) {
      existing = await prisma.serviceCategory.create({
        data: { businessId: business.id, ...cat },
      })
      console.log(`Created service category: ${cat.name}`)
    }
    categoryMap[cat.slug] = existing.id
  }

  // 4. Ensure Starter Services exist
  const starterServices = [
    {
      name: "Dental Consultation",
      slug: "dental-consultation",
      shortDescription: "Comprehensive oral examination, digital diagnostics, and personalized treatment planning.",
      description: "A thorough oral examination including digital X-rays, gum health analysis, and a transparent discussion of treatment options.",
      price: 800,
      durationMinutes: 30,
      categorySlug: "general",
      isFeatured: true,
      sortOrder: 0,
    },
    {
      name: "Teeth Cleaning (Prophylaxis)",
      slug: "teeth-cleaning",
      shortDescription: "Gentle and thorough deep cleaning with polish and fluoride protective treatment.",
      description: "Professional dental prophylaxis removing plaque, tartar, and surface stains. Includes gentle scaling, polish, and enamel fluoride treatment.",
      price: 1500,
      durationMinutes: 45,
      categorySlug: "general",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "Dental Filling",
      slug: "dental-filling",
      shortDescription: "Tooth-colored composite restoration blending seamlessly with your natural smile.",
      description: "Repair cavities or damaged enamel using durable, biocompatible composite resin matched precisely to your tooth shade.",
      price: 1200,
      durationMinutes: 45,
      categorySlug: "general",
      isFeatured: false,
      sortOrder: 2,
    },
    {
      name: "Teeth Whitening",
      slug: "teeth-whitening",
      shortDescription: "Advanced in-clinic laser whitening delivering instant, stunning smile brightness.",
      description: "Safe, highly effective cosmetic whitening lightening teeth by multiple shades in a single comfortable 60-minute session.",
      price: 5000,
      durationMinutes: 60,
      categorySlug: "cosmetic",
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: "Orthodontic Assessment",
      slug: "orthodontic-assessment",
      shortDescription: "Specialized orthodontic evaluation and digital 3D scans for braces and clear aligners.",
      description: "Complete bite analysis and 3D digital imaging to map out personalized aligner or traditional brace treatments for ideal smile alignment.",
      price: 1000,
      durationMinutes: 30,
      categorySlug: "orthodontics",
      isFeatured: true,
      sortOrder: 4,
    },
    {
      name: "Dental Implant Consultation",
      slug: "dental-implant-consultation",
      shortDescription: "Specialist evaluation and 3D bone density assessment for permanent tooth replacement.",
      description: "Detailed dental implant evaluation including high-resolution digital imaging, bone volume assessment, and custom treatment planning.",
      price: 2000,
      durationMinutes: 60,
      categorySlug: "general",
      isFeatured: false,
      sortOrder: 5,
    },
  ]

  const createdServices: any[] = []
  for (const s of starterServices) {
    let existing = await prisma.service.findFirst({
      where: { businessId: business.id, slug: s.slug },
    })
    if (!existing) {
      existing = await prisma.service.create({
        data: {
          businessId: business.id,
          categoryId: categoryMap[s.categorySlug],
          name: s.name,
          slug: s.slug,
          shortDescription: s.shortDescription,
          description: s.description,
          price: s.price,
          durationMinutes: s.durationMinutes,
          isFeatured: s.isFeatured,
          isActive: true,
          sortOrder: s.sortOrder,
        },
      })
      console.log(`Created starter service: ${s.name}`)
    }
    createdServices.push(existing)
  }

  // 5. Ensure Starter Testimonials exist
  const starterTestimonials = [
    {
      name: "Ana Reyes",
      role: "Patient since 2022",
      quote: "Veridian Dental Studio completely changed my relationship with the dentist. Dr. Santos was gentle, patient, and so thorough!",
      rating: 5,
      sortOrder: 0,
    },
    {
      name: "Marco Villanueva",
      role: "Orthodontic Patient",
      quote: "Dr. Cruz's aligner treatment was fast, smooth, and comfortable. Booking online made scheduling follow-ups completely effortless.",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "Jessa Tan",
      role: "Cosmetic Patient",
      quote: "The laser whitening treatment with Dr. Reyes gave me instant results for my wedding! The clinic ambience is calm and spotless.",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: "Robert Lim",
      role: "Implant Patient",
      quote: "I was nervous about dental implants, but the entire team guided me step by step. The results feel and look 100% natural.",
      rating: 5,
      sortOrder: 3,
    },
    {
      name: "Patricia Santos",
      role: "Regular Patient",
      quote: "Our whole family visits Veridian. Clean clinic, friendly staff, and top-tier clinical equipment. Highly recommended!",
      rating: 5,
      sortOrder: 4,
    },
    {
      name: "Kevin Navarro",
      role: "New Patient",
      quote: "First visit was exceptional. Warm reception, zero waiting time, and clear explanations with digital imaging.",
      rating: 5,
      sortOrder: 5,
    },
  ]

  for (const t of starterTestimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { businessId: business.id, name: t.name },
    })
    if (!existing) {
      await prisma.testimonial.create({
        data: {
          businessId: business.id,
          name: t.name,
          role: t.role,
          quote: t.quote,
          rating: t.rating,
          isPublished: true,
          sortOrder: t.sortOrder,
        },
      })
      console.log(`Created starter testimonial from: ${t.name}`)
    }
  }

  // 6. Ensure Starter FAQs exist
  const starterFaqs = [
    {
      question: "How do I book an appointment online?",
      answer: "Click the 'Book Appointment' button on the homepage or navigation bar. Select your desired treatment, choose your preferred dentist, select an available date and time slot, and fill in your details. You will receive an instant booking confirmation.",
      sortOrder: 0,
    },
    {
      question: "What should I bring to my first appointment?",
      answer: "Please bring a valid government ID. If you have dental insurance cards or recent X-rays / dental records from the past 6 months, feel free to bring them along.",
      sortOrder: 1,
    },
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 2 to 24 hours in advance. For prime weekend or evening time slots, booking 1 week ahead is recommended.",
      sortOrder: 2,
    },
    {
      question: "Can I reschedule or cancel my appointment?",
      answer: "Yes, appointments can be easily rescheduled or cancelled up to 24 hours before your scheduled time without any fee through your confirmation link or by calling our desk.",
      sortOrder: 3,
    },
    {
      question: "Do you accept health and dental insurance?",
      answer: "Yes, we accept major dental health insurance and HMO providers. Contact our reception before your appointment to verify your specific coverage.",
      sortOrder: 4,
    },
    {
      question: "Is in-clinic teeth whitening safe for sensitive teeth?",
      answer: "Yes! Our dentists assess your enamel sensitivity beforehand and apply specialized desensitizing agents to ensure a pain-free and comfortable treatment.",
      sortOrder: 5,
    },
  ]

  for (const f of starterFaqs) {
    const existing = await prisma.fAQ.findFirst({
      where: { businessId: business.id, question: f.question },
    })
    if (!existing) {
      await prisma.fAQ.create({
        data: {
          businessId: business.id,
          question: f.question,
          answer: f.answer,
          isActive: true,
          sortOrder: f.sortOrder,
        },
      })
      console.log(`Created starter FAQ: "${f.question}"`)
    }
  }

  console.log("Starter data population complete!")
}

populateStarterData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
