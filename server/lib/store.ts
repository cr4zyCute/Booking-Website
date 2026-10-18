// Unified runtime store ensuring Admin customizer and Public Website share 100% synchronized state

export interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: "ADMIN" | "STAFF" | "CUSTOMER"
  staffId?: string
  customerId?: string
}

export interface HeroContent {
  imagePosition: "left" | "right" | "center"
  heading: string
  subheading: string
  primaryCta: string
  secondaryCta: string
  image: string
  showBadge: boolean
  badgeText: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
}

export type TreatmentCardStyle = "default" | "image_card" | "overlay" | "blurred-image-reveal" | "blurred_reveal"

export interface StoredService {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  image?: string | null
  images?: string[]
  cardStyle: TreatmentCardStyle
  price: number
  durationMinutes: number
  isFeatured?: boolean
  isActive?: boolean
  sortOrder?: number
  category?: { id?: string; name: string }
}

export const inMemoryUsers: Map<string, StoredUser> = new Map()

export let inMemoryHeroSection: HeroContent = {
  imagePosition: "right",
  heading: "A radiant smile.\nDesigned around you.",
  subheading: "World-class dental aesthetics, digital smile design, and gentle personalized care in Veridian Dental Studio.",
  primaryCta: "Book Appointment",
  secondaryCta: "Explore Services",
  image: "/hero-smile.jpg",
  showBadge: true,
  badgeText: "Now accepting new patient bookings",
  stat1Value: "2,500+",
  stat1Label: "Smiles Transformed",
  stat2Value: "12",
  stat2Label: "Certified Dental Specialists",
}

export function setInMemoryHero(hero: Partial<HeroContent>) {
  inMemoryHeroSection = { ...inMemoryHeroSection, ...hero }
}

export let inMemoryServices: StoredService[] = [
  {
    id: "s1",
    name: "Dental Consultation",
    slug: "dental-consultation",
    shortDescription: "Comprehensive examination, diagnostics, and personalized treatment planning.",
    description: "A thorough examination with digital X-rays and full oral assessment.",
    price: 800,
    durationMinutes: 30,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    ],
    cardStyle: "image_card",
    isFeatured: true,
    isActive: true,
    sortOrder: 0,
    category: { name: "General Dentistry" },
  },
  {
    id: "s2",
    name: "Teeth Cleaning (Prophylaxis)",
    slug: "teeth-cleaning",
    shortDescription: "Gentle and thorough deep cleaning with polish and fluoride protection.",
    description: "Professional prophylaxis to remove plaque, tartar, and surface stains.",
    price: 1500,
    durationMinutes: 45,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    ],
    cardStyle: "image_card",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    category: { name: "General Dentistry" },
  },
  {
    id: "s3",
    name: "Dental Filling",
    slug: "dental-filling",
    shortDescription: "Tooth-colored, biomimetic composite restorations that blend seamlessly.",
    description: "Durable, aesthetically invisible composite restorations to repair decay, micro-cracks, or chips.",
    price: 1200,
    durationMinutes: 45,
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80",
    ],
    cardStyle: "image_card",
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    category: { name: "General Dentistry" },
  },
  {
    id: "s4",
    name: "Teeth Whitening",
    slug: "teeth-whitening",
    shortDescription: "Advanced cosmetic whitening treatment with instant, visible results.",
    description: "Laser cosmetic whitening delivering instant brightening in one visit.",
    price: 5000,
    durationMinutes: 60,
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    ],
    cardStyle: "image_card",
    isFeatured: true,
    isActive: true,
    sortOrder: 3,
    category: { name: "Cosmetic Dentistry" },
  },
  {
    id: "s5",
    name: "Orthodontic Assessment",
    slug: "orthodontic-assessment",
    shortDescription: "Specialized orthodontic evaluation for smile alignment and clear aligners.",
    description: "Complete scan & alignment planning for braces and clear aligners.",
    price: 1000,
    durationMinutes: 30,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    ],
    cardStyle: "image_card",
    isFeatured: true,
    isActive: true,
    sortOrder: 4,
    category: { name: "Orthodontics" },
  },
  {
    id: "s6",
    name: "Dental Implant Consultation",
    slug: "dental-implant-consultation",
    shortDescription: "3D CBCT bone scan analysis and permanent tooth replacement planning.",
    description: "Expert evaluation for permanent titanium and zirconia dental implants.",
    price: 2000,
    durationMinutes: 60,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    ],
    cardStyle: "image_card",
    isFeatured: true,
    isActive: true,
    sortOrder: 5,
    category: { name: "Implantology" },
  },
]

export function getInMemoryServices(): StoredService[] {
  return [...inMemoryServices].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function setAllInMemoryServices(services: StoredService[]) {
  inMemoryServices = [...services].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function createInMemoryService(service: Partial<StoredService>): StoredService {
  const id = service.id || "s-" + Date.now()
  const slug = (service.name || "treatment").toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const newService: StoredService = {
    id,
    name: service.name || "New Treatment",
    slug: service.slug || slug,
    shortDescription: service.shortDescription || service.description || "Treatment description.",
    description: service.description || service.shortDescription || "Full treatment description.",
    price: Number(service.price) || 1000,
    durationMinutes: Number(service.durationMinutes) || 30,
    image: service.image || null,
    cardStyle: service.cardStyle || "default",
    isFeatured: service.isFeatured !== undefined ? service.isFeatured : true,
    isActive: service.isActive !== undefined ? service.isActive : true,
    sortOrder: service.sortOrder !== undefined ? service.sortOrder : inMemoryServices.length,
    category: service.category || { name: "General Dentistry" },
  }
  inMemoryServices.push(newService)
  return newService
}

export function updateInMemoryService(id: string, updates: Partial<StoredService>): StoredService {
  let index = inMemoryServices.findIndex(s => s.id === id || (updates.slug && s.slug === updates.slug))
  if (index === -1) {
    const created = createInMemoryService({ id, ...updates })
    return created
  }
  inMemoryServices[index] = {
    ...inMemoryServices[index],
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : inMemoryServices[index].price,
    durationMinutes: updates.durationMinutes !== undefined ? Number(updates.durationMinutes) : inMemoryServices[index].durationMinutes,
  }
  return inMemoryServices[index]
}

export function deleteInMemoryService(id: string): boolean {
  const prevLen = inMemoryServices.length
  inMemoryServices = inMemoryServices.filter(s => s.id !== id && s.slug !== id)
  return inMemoryServices.length < prevLen
}

export function reorderInMemoryServices(orderedIds: string[]) {
  inMemoryServices.forEach(s => {
    const newIdx = orderedIds.indexOf(s.id)
    if (newIdx !== -1) s.sortOrder = newIdx
  })
}
