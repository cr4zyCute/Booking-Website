import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  Stethoscope,
  Heart,
  ChevronRight,
} from "lucide-react"
import { BusinessMap } from "@/components/common/BusinessMap"
import { DEFAULT_STAFF } from "@/lib/defaultData"

export function AboutPage() {
  const { business, terminology } = useBusiness()
  const [staffList, setStaffList] = useState(DEFAULT_STAFF)

  useEffect(() => {
    fetch("/api/public/staff")
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && Array.isArray(data.staff) && data.staff.length > 0) {
          setStaffList(data.staff)
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_STAFF is already loaded
      })
  }, [])

  const standards = [
    {
      icon: Stethoscope,
      title: "Comprehensive Digital Diagnostics",
      description:
        "We utilize low-radiation digital X-rays and intraoral imaging to detect issues early and provide accurate assessments before beginning any procedure.",
    },
    {
      icon: Heart,
      title: "Gentle Patient Comfort",
      description:
        "Every visit is conducted at a relaxed, unhurried pace with modern gentle numbing techniques and clear communication so you remain at ease throughout.",
    },
    {
      icon: ShieldCheck,
      title: "Strict Sterilization & Safety",
      description:
        "All clinical instruments and treatment rooms undergo medical-grade autoclave sterilization and surface disinfection following standard healthcare protocols.",
    },
    {
      icon: CheckCircle2,
      title: "Transparent Consultations & Pricing",
      description:
        "We explain every treatment option in plain language and provide clear, itemized price estimates upfront with no hidden fees.",
    },
  ]

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      {/* 1. Header Section */}
      <section className="py-12 lg:py-16 border-b border-[rgb(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--primary))]">
              About Our Clinic
            </p>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              About {business.name}
            </h1>
            <p className="text-base sm:text-lg text-[rgb(var(--muted-foreground))] leading-relaxed">
              {business.description ||
                "Providing patient-first dental care, preventive health, and restorative treatments in a modern, welcoming environment."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/booking">
                <Button size="lg" className="gap-2 cursor-pointer">
                  <CalendarDays className="h-4 w-4" />
                  Book {terminology.appointmentSingular}
                </Button>
              </Link>
              <Link to="/treatments">
                <Button variant="outline" size="lg" className="gap-2 cursor-pointer">
                  View {terminology.serviceLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Clinic Overview & Philosophy */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Clinic Image */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-[rgb(var(--border))] shadow-sm aspect-[4/3] bg-[rgb(var(--muted))]">
                <img
                  src="/hero-dentix.jpg"
                  alt={`${business.name} treatment room`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Narrative */}
            <div className="lg:col-span-6 space-y-5">
              <h2
                className="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our Approach to Patient Care
              </h2>

              <p className="text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed">
                At <strong className="text-[rgb(var(--foreground))]">{business.name}</strong>, we focus on delivering high-quality, conservative dental care. We believe patients deserve honest recommendations, unhurried appointments, and clear answers about their dental health.
              </p>

              <p className="text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed">
                Whether you visit us for regular teeth cleaning, a filling, orthodontics, or restorative dental work, our team takes the time to explain your options thoroughly so you are always in control of your care plan.
              </p>

              <div className="pt-2 space-y-2.5 text-sm text-[rgb(var(--foreground))] font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
                  <span>Personalized treatment plans tailored to your needs and budget</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
                  <span>Modern digital diagnostics with minimal radiation exposure</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
                  <span>Comprehensive care for adults, teens, and young patients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Meet the Dental Team */}
      <section className="py-14 lg:py-20 bg-[rgb(var(--muted)/0.35)] border-y border-[rgb(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--primary))]">
              Our Dentists & Specialists
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Meet Our Dental Team
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Our licensed practitioners bring specialized training and years of dedicated clinical experience to every appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staffList.slice(0, 4).map(dentist => {
              const photo = dentist.photo || (dentist.images && dentist.images[0]) || "/hero-smile-macro.jpg"
              const specialty = dentist.specialty || (dentist.specialties && dentist.specialties[0]) || "General Dentistry"

              return (
                <div
                  key={dentist.id}
                  className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[rgb(var(--muted))]">
                      <img
                        src={photo}
                        alt={dentist.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          if (target.src.indexOf("hero-smile-macro") === -1) {
                            target.src = "/hero-smile-macro.jpg"
                          }
                        }}
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="inline-block text-[11px] font-semibold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] px-2.5 py-0.5 rounded-full">
                        {specialty}
                      </span>
                      <h3 className="font-bold text-base text-[rgb(var(--foreground))]">
                        {dentist.name}
                      </h3>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] line-clamp-1">
                        {dentist.role || "Dental Specialist"}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-2 pt-1">
                        {dentist.bio || dentist.biography || "Dedicated to providing gentle and thorough dental care for all patients."}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/dentists/${dentist.slug || dentist.id}`}
                      className="inline-flex items-center text-xs font-semibold text-[rgb(var(--primary))] hover:underline"
                    >
                      View profile & schedule
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <Link to="/dentists" className="text-sm font-semibold text-[rgb(var(--primary))] hover:underline inline-flex items-center gap-1.5">
              <span>View all {terminology.staffLabel.toLowerCase()} and clinical specialties</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Practice Standards */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--primary))]">
              Quality & Safety
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Our Practice Standards
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Every appointment is guided by proven safety protocols, modern equipment, and ethical patient communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {standards.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl p-6 space-y-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-[rgb(var(--primary)/0.1)] flex items-center justify-center text-[rgb(var(--primary))]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-[rgb(var(--foreground))]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Location, Transit & Operating Hours */}
      <section className="py-14 lg:py-20 bg-[rgb(var(--muted)/0.35)] border-t border-[rgb(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--primary))]">
              Visit Us
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Clinic Location & Hours
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Conveniently accessible by public transit and car, with on-site parking for patients.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Practical Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[rgb(var(--primary))] uppercase tracking-wider">
                  <MapPin className="h-4 w-4" />
                  <span>Clinic Address</span>
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  {business.address || "2F Veridian Building, 123 Ayala Avenue, Makati City"}
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Patient parking spaces are available in the basement lot.
                </p>
              </div>

              <div className="bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[rgb(var(--primary))] uppercase tracking-wider">
                  <Clock className="h-4 w-4" />
                  <span>Clinic Hours</span>
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  Monday – Saturday: 8:00 AM – 7:00 PM
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Sunday: Closed
                </p>
              </div>

              <div className="bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[rgb(var(--primary))] uppercase tracking-wider">
                  <Phone className="h-4 w-4" />
                  <span>Contact Information</span>
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  {business.phone || "+63 2 8123 4567"}
                </div>
                {business.email && (
                  <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center gap-1.5 pt-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{business.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
              <BusinessMap height="360px" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Clean Booking Call to Action */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ready to Schedule Your Visit?
            </h2>
            <p className="text-sm sm:text-base text-[rgb(var(--muted-foreground))] max-w-xl mx-auto leading-relaxed">
              Book your appointment online in a few clicks, or reach out to our clinic team if you have any questions before visiting.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/booking">
                <Button size="lg" className="gap-2 cursor-pointer">
                  <CalendarDays className="h-4 w-4" />
                  Book {terminology.appointmentSingular}
                </Button>
              </Link>
              <Link to="/treatments">
                <Button variant="outline" size="lg" className="cursor-pointer">
                  Explore Treatments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
