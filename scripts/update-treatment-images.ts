import { prisma } from "../src/lib/db/prisma"

const TREATMENT_IMAGES: Record<string, { image: string; images: string[] }> = {
  "dental-consultation": {
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80",
    ],
  },
  "teeth-cleaning": {
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    ],
  },
  "dental-filling": {
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80",
    ],
  },
  "teeth-whitening": {
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    ],
  },
  "orthodontic-consultation": {
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    ],
  },
  "dental-implant-consultation": {
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    ],
  },
}

async function main() {
  console.log("Updating services with high-definition dental photography...")
  const services = await prisma.service.findMany()

  for (const s of services) {
    const slug = s.slug || ""
    const matched = TREATMENT_IMAGES[slug] || TREATMENT_IMAGES["dental-consultation"]

    await prisma.service.update({
      where: { id: s.id },
      data: {
        image: matched.image,
        images: matched.images,
      },
    })
    console.log(`Updated service "${s.name}" (${s.slug}) -> ${matched.image}`)
  }

  // Update website_sections for SERVICES to set cardStyle to "image_card"
  const servicesSection = await prisma.websiteSection.findFirst({
    where: { type: "SERVICES" },
  })

  if (servicesSection) {
    const existingContent = (servicesSection.content as any) || {}
    await prisma.websiteSection.update({
      where: { id: servicesSection.id },
      data: {
        content: {
          ...existingContent,
          cardStyle: "image_card",
        },
      },
    })
    console.log("Updated website_section SERVICES to cardStyle: 'image_card'")
  }

  console.log("Database update completed successfully!")
}

main()
  .catch(err => {
    console.error("Error updating services:", err)
    process.exit(1)
  })
  .finally(async () => {
    // Graceful exit
  })
