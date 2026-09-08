import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/booking_platform"
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Clean up existing data
  await prisma.appointment.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.staffService.deleteMany()
  await prisma.scheduleShift.deleteMany()
  await prisma.scheduleBreak.deleteMany()
  await prisma.staffSchedule.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.service.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.navigationItem.deleteMany()
  await prisma.websiteSection.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.themeSettings.deleteMany()
  await prisma.featureSettings.deleteMany()
  await prisma.businessTerminology.deleteMany()
  await prisma.businessSettings.deleteMany()
  await prisma.openingHours.deleteMany()
  await prisma.business.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const hashedPw = await bcrypt.hash("password", 12)
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@veridian.com",
      password: hashedPw,
      role: "ADMIN",
    },
  })
  console.log("Admin user created:", admin.email)

  // Create business
  const business = await prisma.business.create({
    data: {
      name: "Veridian Dental Studio",
      type: "DENTAL",
      description:
        "A premium dental care studio offering comprehensive dental services in a comfortable, modern environment. We combine clinical excellence with a patient-first approach.",
      address: "2F Veridian Building, 123 Ayala Avenue, Makati City, Metro Manila",
      phone: "+63 2 8123 4567",
      email: "hello@veridian.com",
      website: "https://veridian.com",
      timezone: "Asia/Manila",
      currency: "PHP",
      currencySymbol: "PHP",
    },
  })
  console.log("Business created:", business.name)

  // Settings
  await prisma.businessSettings.create({
    data: {
      businessId: business.id,
      minNoticeHours: 2,
      maxBookingDays: 90,
      slotIntervalMinutes: 15,
      defaultBufferMinutes: 10,
      cancellationWindowHours: 24,
      allowSameDayBooking: true,
      allowCustomerCancel: true,
      allowCustomerReschedule: true,
      sendConfirmationEmail: false,
      sendReminderEmail: false,
    },
  })

  // Terminology
  await prisma.businessTerminology.create({
    data: {
      businessId: business.id,
      staffLabel: "Dentists",
      staffSingular: "Dentist",
      serviceLabel: "Treatments",
      serviceSingular: "Treatment",
      appointmentLabel: "Appointments",
      appointmentSingular: "Appointment",
      customerLabel: "Patients",
      customerSingular: "Patient",
    },
  })

  // Features
  await prisma.featureSettings.create({
    data: {
      businessId: business.id,
      onlineBooking: true,
      staffProfiles: true,
      services: true,
      testimonials: true,
      faq: true,
      blog: false,
      gallery: false,
      contactForm: true,
      customerAccounts: false,
      payments: false,
      notifications: false,
    },
  })

  // Theme
  await prisma.themeSettings.create({
    data: { businessId: business.id, theme: "CLINICAL_SWISS" },
  })

  // Opening hours (Mon-Sat)
  const openHours = [
    { day: 0, open: false },
    { day: 1, open: true, from: "09:00", to: "18:00" },
    { day: 2, open: true, from: "09:00", to: "18:00" },
    { day: 3, open: true, from: "09:00", to: "18:00" },
    { day: 4, open: true, from: "09:00", to: "18:00" },
    { day: 5, open: true, from: "09:00", to: "18:00" },
    { day: 6, open: true, from: "09:00", to: "14:00" },
  ]
  for (const h of openHours) {
    await prisma.openingHours.create({
      data: {
        businessId: business.id,
        dayOfWeek: h.day,
        isOpen: h.open,
        openTime: (h as any).from ?? "09:00",
        closeTime: (h as any).to ?? "18:00",
      },
    })
  }

  // Navigation
  const navItems = [
    { label: "Home", href: "/", order: 0 },
    { label: "Treatments", href: "/services", order: 1 },
    { label: "Our Dentists", href: "/staff", order: 2 },
    { label: "About", href: "/about", order: 3 },
    { label: "Contact", href: "/contact", order: 4 },
  ]
  for (const nav of navItems) {
    await prisma.navigationItem.create({ data: { businessId: business.id, ...nav, isActive: true } })
  }

  // Website Sections
  const sections = [
    {
      type: "HERO", order: 0, isEnabled: true,
      content: {
        heading: "Exceptional dental care.\nDesigned around you.",
        subheading: "Professional dental services delivered by experienced specialists in a comfortable, modern studio.",
        primaryCta: "Book Appointment",
        secondaryCta: "Explore Treatments",
        image: "/hero-dental.jpg",
      },
    },
    { type: "TRUST_STATS", order: 1, isEnabled: true,
      content: {
        stats: [
          { icon: "users", value: "2,500+", label: "Patients Treated" },
          { icon: "star", value: "4.9", label: "Average Rating" },
          { icon: "clock", value: "10+", label: "Years Experience" },
          { icon: "shield", value: "100%", label: "Safe & Sterile" },
        ],
      },
    },
    { type: "SERVICES", order: 2, isEnabled: true, content: { heading: "Our Treatments", subheading: "Comprehensive dental care from routine check-ups to advanced cosmetic procedures." } },
    { type: "STAFF", order: 3, isEnabled: true, content: { heading: "Meet Our Dentists", subheading: "Board-certified dental professionals with specialized expertise." } },
    { type: "TESTIMONIALS", order: 4, isEnabled: true, content: null },
    { type: "FAQ", order: 5, isEnabled: true, content: null },
    { type: "BOOKING_CTA", order: 6, isEnabled: true,
      content: {
        heading: "Ready to book your appointment?",
        subheading: "Schedule online in minutes. No phone call required.",
      },
    },
    { type: "CONTACT", order: 7, isEnabled: true, content: null },
  ]
  for (const s of sections) {
    await prisma.websiteSection.create({ data: { businessId: business.id, type: s.type as any, order: s.order, isEnabled: s.isEnabled, content: s.content } })
  }

  // Service categories
  const generalCat = await prisma.serviceCategory.create({
    data: { businessId: business.id, name: "General Dentistry", slug: "general", order: 0 },
  })
  const cosmeticCat = await prisma.serviceCategory.create({
    data: { businessId: business.id, name: "Cosmetic Dentistry", slug: "cosmetic", order: 1 },
  })
  const orthodonticCat = await prisma.serviceCategory.create({
    data: { businessId: business.id, name: "Orthodontics", slug: "orthodontics", order: 2 },
  })

  // Services
  const services = [
    {
      name: "Dental Consultation",
      slug: "dental-consultation",
      shortDescription: "Comprehensive examination and personalized treatment planning.",
      description: "A thorough dental examination including X-rays, gum assessment, and a personalized treatment plan. Our dentists take time to understand your concerns and explain all available options.",
      price: 800,
      durationMinutes: 30,
      categoryId: generalCat.id,
      isFeatured: true,
    },
    {
      name: "Teeth Cleaning",
      slug: "teeth-cleaning",
      shortDescription: "Professional prophylaxis to remove plaque and tartar buildup.",
      description: "Professional teeth cleaning (prophylaxis) removes plaque, tartar, and surface stains. Includes polishing and fluoride treatment for a fresh, healthy smile.",
      price: 1500,
      durationMinutes: 45,
      categoryId: generalCat.id,
      isFeatured: true,
    },
    {
      name: "Dental Filling",
      slug: "dental-filling",
      shortDescription: "Tooth-colored composite fillings for a natural-looking restoration.",
      description: "Restore damaged teeth with tooth-colored composite resin fillings. Our biocompatible materials blend seamlessly with your natural teeth.",
      price: 1200,
      durationMinutes: 45,
      categoryId: generalCat.id,
      isFeatured: false,
    },
    {
      name: "Teeth Whitening",
      slug: "teeth-whitening",
      shortDescription: "Professional in-office whitening for a brighter, more confident smile.",
      description: "Advanced in-office whitening treatment that lightens teeth by several shades in a single visit. Safe, effective, and long-lasting results.",
      price: 5000,
      durationMinutes: 60,
      categoryId: cosmeticCat.id,
      isFeatured: true,
    },
    {
      name: "Orthodontic Consultation",
      slug: "orthodontic-consultation",
      shortDescription: "Assessment for braces, aligners, and orthodontic treatment options.",
      description: "Comprehensive orthodontic assessment to determine the best treatment approach for your smile. Includes digital scans and discussion of all treatment options.",
      price: 1000,
      durationMinutes: 30,
      categoryId: orthodonticCat.id,
      isFeatured: true,
    },
    {
      name: "Dental Implant Consultation",
      slug: "dental-implant-consultation",
      shortDescription: "Expert evaluation for dental implant candidacy and planning.",
      description: "Detailed implant consultation including 3D imaging analysis, bone density assessment, and comprehensive treatment planning for tooth replacement.",
      price: 2000,
      durationMinutes: 60,
      categoryId: generalCat.id,
      isFeatured: false,
    },
  ]
  const createdServices: any[] = []
  for (let i = 0; i < services.length; i++) {
    const s = services[i]
    const svc = await prisma.service.create({
      data: {
        businessId: business.id,
        categoryId: s.categoryId,
        name: s.name,
        slug: s.slug,
        shortDescription: s.shortDescription,
        description: s.description,
        price: s.price,
        durationMinutes: s.durationMinutes,
        bufferAfterMinutes: 10,
        isFeatured: s.isFeatured,
        isActive: true,
        sortOrder: i,
      },
    })
    createdServices.push(svc)
  }
  console.log("Services created:", createdServices.length)

  // Staff / Dentists (4 Complete Profiles)
  const staffData = [
    {
      name: "Dr. Maria Santos",
      slug: "dr-maria-santos",
      role: "Lead Dentist",
      specialty: "General Dentistry",
      specialties: ["General Dentistry", "Preventive Care", "Restorative Dentistry", "Dental Implants"],
      bio: "Dr. Santos has over 12 years of experience in general and preventive dentistry. She is passionate about patient education and creating comfortable dental experiences for all ages.",
      biography: "Dr. Maria Santos is the Lead Dental Specialist at Veridian Dental Studio. With over 12 years of specialized clinical experience, Dr. Santos focuses on comprehensive oral health diagnostics, preventive dentistry, and advanced restorative procedures. She graduated from the University of the Philippines College of Dentistry and completed advanced clinical fellowships in restorative prosthodontics and implantology. Dr. Santos is dedicated to creating calm, anxiety-free dental visits and personalized treatment plans tailored to each patient's lifestyle.",
      photo: "/uploads/dentists/dr-maria-santos.jpg",
      images: ["/uploads/dentists/dr-maria-santos.jpg"],
      credentials: ["DMD (Doctor of Dental Medicine)", "Fellow, International Congress of Oral Implantologists (FICOI)", "Certified Digital Smile Designer"],
      education: ["University of the Philippines - Doctor of Dental Medicine (DMD)", "Philippine Dental Association - Advanced Restorative Fellowship"],
      experience: "12+ Years Clinical Practice",
      languages: ["English", "Filipino", "Tagalog"],
      serviceIndexes: [0, 1, 2, 5],
    },
    {
      name: "Dr. Daniel Cruz",
      slug: "dr-daniel-cruz",
      role: "Orthodontist",
      specialty: "Orthodontics",
      specialties: ["Orthodontics", "Clear Aligners / Invisalign", "Traditional Braces", "Bite Correction"],
      bio: "Dr. Cruz specializes in orthodontic treatment including traditional braces and clear aligners. He has transformed thousands of smiles over his 8 years of specialized practice.",
      biography: "Dr. Daniel Cruz is a board-certified Orthodontist with over 8 years of specialized focus in contemporary orthodontics, dentofacial orthopedics, and clear aligner therapies. Having successfully transformed thousands of smiles, Dr. Cruz combines 3D digital treatment planning with gentle force mechanics to deliver efficient and aesthetic smile corrections. He is a premier provider for clear aligner therapy.",
      photo: "/uploads/dentists/dr-daniel-cruz.jpg",
      images: ["/uploads/dentists/dr-daniel-cruz.jpg"],
      credentials: ["DMD (Doctor of Dental Medicine)", "Master of Science in Orthodontics (MS)", "Certified Invisalign Platinum Provider"],
      education: ["University of the East - Doctor of Dental Medicine (DMD)", "Ateneo - Advanced Master of Science in Orthodontics"],
      experience: "8+ Years Specialized Orthodontic Practice",
      languages: ["English", "Filipino", "Cebuano"],
      serviceIndexes: [4, 0],
    },
    {
      name: "Dr. Sofia Reyes",
      slug: "dr-sofia-reyes",
      role: "Cosmetic Dentist",
      specialty: "Cosmetic Dentistry",
      specialties: ["Cosmetic Dentistry", "Teeth Whitening", "Veneers & Aesthetics", "Smile Makeovers"],
      bio: "Dr. Reyes is a renowned cosmetic dentist with expertise in smile makeovers, teeth whitening, and aesthetic restorations. Her meticulous attention to detail produces stunning results.",
      biography: "Dr. Sofia Reyes specializes in aesthetic dentistry, smile makeovers, and minimally invasive cosmetic restorations. Known for her meticulous artistic precision, Dr. Reyes utilizes digital smile design and premium ceramic materials to create radiant, natural-looking smiles. She regularly participates in international aesthetic dentistry masterclasses and is passionate about boosting patients' confidence.",
      photo: "/uploads/dentists/dr-sofia-reyes.jpg",
      images: ["/uploads/dentists/dr-sofia-reyes.jpg"],
      credentials: ["DMD (Doctor of Dental Medicine)", "Member, American Academy of Cosmetic Dentistry (AACD)", "Certified Biomimetic Aesthetic Restorative Dentist"],
      education: ["Centro Escolar University - Doctor of Dental Medicine (DMD)", "UCLA Extension - Aesthetic Continuum Certification"],
      experience: "7+ Years Aesthetic & Cosmetic Dentistry",
      languages: ["English", "Filipino", "Spanish (Basic)"],
      serviceIndexes: [3, 0, 1],
    },
    {
      name: "Dr. James Navarro",
      slug: "dr-james-navarro",
      role: "Oral Surgeon",
      specialty: "Oral Surgery",
      specialties: ["Oral Surgery", "Dental Implants", "Wisdom Tooth Extraction", "Bone Grafting"],
      bio: "Dr. Navarro brings over 14 years of surgical excellence, specializing in dental implants, complex wisdom tooth extractions, and guided bone regeneration.",
      biography: "Dr. James Navarro brings over 14 years of surgical excellence to Veridian Dental Studio. Specializing in oral and maxillofacial surgery, dental implants, complex wisdom tooth extractions, and guided bone regeneration, Dr. Navarro provides safe, comfortable, and precise surgical care. He is trained in IV sedation dentistry to ensure complete comfort for surgical patients.",
      photo: "/uploads/dentists/dr-james-navarro.jpg",
      images: ["/uploads/dentists/dr-james-navarro.jpg"],
      credentials: ["DMD, MD", "Diplomate, Philippine Board of Oral and Maxillofacial Surgery", "Fellow, International Association of Oral and Maxillofacial Surgeons"],
      education: ["University of the Philippines - Doctor of Dental Medicine (DMD)", "PGH - Oral & Maxillofacial Surgery Residency"],
      experience: "14+ Years Oral & Maxillofacial Surgery",
      languages: ["English", "Filipino", "Ilocano"],
      serviceIndexes: [5, 0, 2],
    },
  ]

  const createdStaff: any[] = []
  for (let i = 0; i < staffData.length; i++) {
    const sd = staffData[i]
    const staffUser = await prisma.user.create({
      data: {
        name: sd.name,
        email: `${sd.slug}@veridian.com`,
        password: hashedPw,
        role: "STAFF",
      },
    })
    const s = await prisma.staff.create({
      data: {
        businessId: business.id,
        userId: staffUser.id,
        name: sd.name,
        slug: sd.slug,
        role: sd.role,
        specialty: sd.specialty,
        specialties: sd.specialties,
        bio: sd.bio,
        biography: sd.biography,
        photo: sd.photo,
        images: sd.images,
        credentials: sd.credentials,
        education: sd.education,
        experience: sd.experience,
        languages: sd.languages,
        email: `${sd.slug}@veridian.com`,
        isActive: true,
        sortOrder: i,
      },
    })
    // Assign services
    for (const svcIdx of sd.serviceIndexes) {
      await prisma.staffService.create({
        data: { staffId: s.id, serviceId: createdServices[svcIdx].id },
      })
    }
    createdStaff.push(s)
  }
  console.log("Staff created:", createdStaff.length)

  // Schedules
  const workDays = [1, 2, 3, 4, 5]
  for (const staff of createdStaff) {
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      const isWorking = workDays.includes(day)
      const schedule = await prisma.staffSchedule.create({
        data: { staffId: staff.id, dayOfWeek: day, isWorking },
      })
      if (isWorking) {
        await prisma.scheduleShift.create({
          data: { scheduleId: schedule.id, startTime: "09:00", endTime: "12:00" },
        })
        await prisma.scheduleShift.create({
          data: { scheduleId: schedule.id, startTime: "13:00", endTime: "17:00" },
        })
        await prisma.scheduleBreak.create({
          data: { scheduleId: schedule.id, startTime: "12:00", endTime: "13:00", label: "Lunch" },
        })
      }
    }
  }
  console.log("Schedules created")

  // Testimonials
  const testimonials = [
    { name: "Ana Reyes", role: "Patient since 2022", quote: "Veridian Dental Studio completely changed my relationship with the dentist. Dr. Santos is incredibly gentle and thorough. My teeth have never felt cleaner!", rating: 5 },
    { name: "Marco Villanueva", role: "Orthodontic Patient", quote: "Dr. Cruz's expertise in orthodontics is unmatched. My alignment journey was smooth and the results are beyond what I hoped for. Highly recommend!", rating: 5 },
    { name: "Jessa Tan", role: "Cosmetic Dentistry Patient", quote: "After my whitening treatment with Dr. Reyes, I cannot stop smiling. The results are so natural-looking. The whole team is professional and warm.", rating: 5 },
    { name: "Robert Lim", role: "Patient since 2021", quote: "I was nervous about dental implants, but the team at Veridian walked me through everything. The process was comfortable and the result is incredible.", rating: 5 },
    { name: "Patricia Santos", role: "Regular Patient", quote: "I have been coming here for 3 years. The care is consistently excellent, the clinic is spotless, and booking online is so convenient.", rating: 5 },
    { name: "Kevin Navarro", role: "New Patient", quote: "First visit was amazing. Reception was warm, Dr. Santos was thorough and explained everything clearly. I finally found a dental clinic I trust.", rating: 5 },
  ]
  for (let i = 0; i < testimonials.length; i++) {
    await prisma.testimonial.create({
      data: { businessId: business.id, ...testimonials[i], isPublished: true, sortOrder: i },
    })
  }

  // FAQs
  const faqs = [
    { question: "How do I book an appointment?", answer: "You can book online anytime through our website. Simply click 'Book Appointment', choose your preferred treatment and dentist, select a date and time that works for you, and complete your details. You will receive a confirmation instantly." },
    { question: "What should I bring to my first appointment?", answer: "For your first visit, please bring a valid ID. If you have recent dental X-rays or records from a previous dentist, feel free to bring those as well - though we will take updated X-rays as needed." },
    { question: "How far in advance do I need to book?", answer: "We require at least 2 hours advance notice for online bookings. For complex procedures or specific time preferences, we recommend booking 1-2 weeks ahead to secure your preferred slot." },
    { question: "Can I cancel or reschedule my appointment?", answer: "Yes. You can cancel or reschedule up to 24 hours before your appointment at no charge. Same-day cancellations may be subject to a fee. Please contact us as early as possible if you need to change your booking." },
    { question: "Do you accept dental insurance?", answer: "We work with several major dental insurance providers. Please contact us before your appointment to verify your coverage. We will help you understand your benefits and any out-of-pocket costs." },
    { question: "What safety protocols do you follow?", answer: "We maintain the highest standards of sterilization and infection control. All instruments are sterilized between every patient, and we use hospital-grade disinfectants throughout the clinic." },
    { question: "Is teeth whitening safe?", answer: "Yes, professional teeth whitening performed by our dentists is safe and effective. We use clinically tested materials at concentrations appropriate for your tooth sensitivity level." },
    { question: "How often should I visit the dentist?", answer: "We recommend a professional cleaning and check-up every 6 months for most patients. Depending on your oral health, your dentist may recommend more frequent visits." },
  ]
  for (let i = 0; i < faqs.length; i++) {
    await prisma.fAQ.create({
      data: { businessId: business.id, ...faqs[i], isActive: true, sortOrder: i },
    })
  }

  // Customers
  const customers = [
    { name: "Ana Reyes", email: "ana.reyes@example.com", phone: "+63 917 111 2222" },
    { name: "Marco Villanueva", email: "marco.v@example.com", phone: "+63 918 333 4444" },
    { name: "Jessa Tan", email: "jessa.tan@example.com", phone: "+63 919 555 6666" },
  ]
  for (const c of customers) {
    await prisma.customer.create({ data: { businessId: business.id, ...c } })
  }

  const allCustomers = await prisma.customer.findMany({ where: { businessId: business.id } })
  const now = new Date()

  // Past appointments
  const pastAppts = [
    { customerIdx: 0, staffIdx: 0, serviceIdx: 1, hoursAgo: 48, status: "COMPLETED" },
    { customerIdx: 1, staffIdx: 1, serviceIdx: 4, hoursAgo: 72, status: "COMPLETED" },
    { customerIdx: 2, staffIdx: 2, serviceIdx: 3, hoursAgo: 24, status: "COMPLETED" },
  ]

  for (const appt of pastAppts) {
    const startAt = new Date(now.getTime() - appt.hoursAgo * 3600000)
    startAt.setMinutes(0, 0, 0)
    const svc = createdServices[appt.serviceIdx]
    const endAt = new Date(startAt.getTime() + svc.durationMinutes * 60000)
    await prisma.appointment.create({
      data: {
        businessId: business.id,
        customerId: allCustomers[appt.customerIdx].id,
        staffId: createdStaff[appt.staffIdx].id,
        serviceId: svc.id,
        startAt,
        endAt,
        status: appt.status as any,
        confirmationCode: "VD-" + (10000 + appt.customerIdx + appt.staffIdx),
        priceAtBooking: svc.price,
        durationAtBooking: svc.durationMinutes,
        serviceName: svc.name,
        staffName: createdStaff[appt.staffIdx].name,
      },
    })
  }

  console.log("Seed complete!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })