import React from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Sparkles,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  Phone,
  Microscope,
  Star,
  Users,
  Compass,
} from "lucide-react"
import { BusinessMap } from "@/components/common/BusinessMap"

export function AboutPage() {
  const { business, terminology } = useBusiness()

  const pillars = [
    {
      icon: HeartHandshake,
      title: "Gentle & Painless Philosophy",
      description:
        "We believe healthcare should never cause anxiety. Our studio utilizes computerized painless anesthetic delivery, ultra-quiet instruments, and tailored comfort amenities to ensure every visit feels calm and completely pain-free.",
      badge: "Patient Comfort First",
    },
    {
      icon: Microscope,
      title: "Digital Precision Diagnostics",
      description:
        "From ultra-low radiation 3D CBCT scans to intraoral 3D color impressions and digital smile simulations, we replace guesswork with microscopic surgical precision and predictable aesthetic outcomes.",
      badge: "Advanced Tech",
    },
    {
      icon: ShieldCheck,
      title: "Hospital-Grade Sterilization",
      description:
        "Your safety is uncompromising. Our multi-stage sterilization suite operates hospital-grade Class B autoclaves, continuous spore testing, multi-point water filtration, and HEPA air purification.",
      badge: "100% Sterile Protocol",
    },
    {
      icon: Award,
      title: "Transparent & Ethical Care",
      description:
        "No pressure and no hidden charges. We walk you through transparent, itemized treatment blueprints with before-and-after digital simulations so you are in complete control of your oral health decisions.",
      badge: "Ethical Practice",
    },
  ]

  const stats = [
    { value: "15,000+", label: "Smiles Restored", detail: "Over 14 years of cosmetic and restorative smile design" },
    { value: "99.4%", label: "Satisfaction Rate", detail: "Based on verified post-appointment patient feedback" },
    { value: "14+", label: "Years of Excellence", detail: "Serving Metro Manila since our founding in 2012" },
    { value: "12", label: "Certified Specialists", detail: "Board-certified orthodontists, prosthodontists, & surgeons" },
  ]

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      {/* 1. Luminous Editorial Hero Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[rgb(var(--border))]">
        {/* Subtle ambient background glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-[rgb(var(--primary)/0.08)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -z-10 h-72 w-72 rounded-full bg-blue-500/05 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.06)] text-xs font-semibold text-[rgb(var(--primary))]">
              <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              <span>About {business.name} • Est. 2012</span>
            </div>

            {/* Editorial Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Precision Dentistry.{" "}
              <span className="block font-serif italic font-normal text-[rgb(var(--primary))] mt-1">
                Crafted with Empathy.
              </span>
            </h1>

            {/* Narrative Subtitle */}
            <p className="text-base sm:text-lg text-[rgb(var(--muted-foreground))] leading-relaxed max-w-2xl font-normal">
              {business.description ||
                `${business.name} was established with a singular mission: to provide world-class, biomimetic dental aesthetics and comprehensive oral healthcare in an environment designed for absolute patient peace of mind.`}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link to="/booking">
                <Button size="lg" className="h-12 px-7 rounded-full font-bold shadow-md shadow-[rgb(var(--primary)/0.2)] cursor-pointer">
                  <CalendarDays className="h-4.5 w-4.5 mr-2" />
                  Book {terminology.appointmentSingular}
                </Button>
              </Link>
              <Link to="/treatments">
                <Button variant="outline" size="lg" className="h-12 px-7 rounded-full font-semibold border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] cursor-pointer">
                  Explore {terminology.serviceLabel}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Storyteller Section (Atmospheric Clinic Showcase) */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Visual Photography Mosaic (Left 6 Cols) */}
            <div className="lg:col-span-6 relative">
              {/* Primary Studio Treatment Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[rgb(var(--border))] aspect-[4/3] bg-slate-900 group">
                <img
                  src="/hero-dentix.jpg"
                  alt="Veridian Dental Studio clinical care room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Micro-Card 1: Hospital Grade Sterilization */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-[rgb(var(--card)/0.92)] dark:bg-slate-900/90 backdrop-blur-md border border-[rgb(var(--border))] rounded-xl p-3.5 shadow-xl flex items-center gap-3 max-w-sm">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[rgb(var(--foreground))]">Hospital-Grade Sterilization</div>
                    <div className="text-[11px] text-[rgb(var(--muted-foreground))]">Class B Autoclave & Daily Spore Testing</div>
                  </div>
                </div>
              </div>

              {/* Floating Floating Micro Card 2: Satisfied Patients Smile */}
              <div className="hidden sm:flex absolute -bottom-8 -right-4 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl p-4 shadow-2xl items-center gap-3.5 max-w-xs transition-all hover:scale-105 duration-300">
                <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-[rgb(var(--border))]">
                  <img src="/hero-smile-macro.jpg" alt="Smiling patient" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>4.95 / 5.0 Rating</span>
                  </div>
                  <div className="text-xs font-bold text-[rgb(var(--foreground))] mt-0.5">15,000+ Happy Patients</div>
                  <div className="text-[10px] text-[rgb(var(--muted-foreground))]">Natural, long-lasting aesthetic results</div>
                </div>
              </div>
            </div>

            {/* Narrative Editorial Story (Right 6 Cols) */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
                <Compass className="h-4 w-4" />
                <span>Our Philosophy</span>
              </div>

              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[rgb(var(--foreground))] leading-snug"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                A Sanctuary for Dental Wellness, Built Around You
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed">
                <p>
                  At <strong className="text-[rgb(var(--foreground))] font-semibold">{business.name}</strong>, we recognized that traditional dental visits too often felt sterile, rushed, and intimidating. We designed our studio from the ground up to redefine that narrative.
                </p>
                <p>
                  Every element of our space—from acoustically isolated treatment suites and ergonomic memory-foam dental lounges to warm natural lighting and personalized entertainment—was crafted to help you exhale the moment you step through our doors.
                </p>
                <p>
                  Our multidisciplinary team of board-certified specialists merges artistic biomimetic design with scientific rigor, ensuring your treatments are not only painless but endure with flawless function for decades to come.
                </p>
              </div>

              {/* Founder Signoff Card */}
              <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[rgb(var(--foreground))]">Dr. Maria Santos, DMD, FICOI</div>
                  <div className="text-xs text-[rgb(var(--muted-foreground))]">Clinical Director & Founder, {business.name}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-[rgb(var(--primary)/0.1)] flex items-center justify-center text-[rgb(var(--primary))]">
                  <Award className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Clinical Metrics & Trust Bar */}
      <section className="py-12 bg-[rgb(var(--card))] border-y border-[rgb(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1.5 p-4 rounded-xl transition-all hover:bg-[rgb(var(--muted)/0.5)]">
                <div
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[rgb(var(--primary))]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-[rgb(var(--foreground))]">{stat.label}</div>
                <div className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Four Core Care Pillars (High-Trust Feature Grid) */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 lg:mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
              The Veridian Standard
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Why Patients Entrust Their Smiles to Us
            </h2>
            <p className="text-sm sm:text-base text-[rgb(var(--muted-foreground))]">
              A comprehensive commitment to safety, technology, and patient-centered excellence in every procedure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {pillars.map((pillar, idx) => {
              const IconComp = pillar.icon
              return (
                <div
                  key={idx}
                  className="group relative bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] p-6 sm:p-8 hover:border-[rgb(var(--primary)/0.6)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-[rgb(var(--primary)/0.1)] flex items-center justify-center text-[rgb(var(--primary))] group-hover:bg-[rgb(var(--primary))] group-hover:text-[rgb(var(--primary-foreground))] transition-all duration-300">
                        <IconComp className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)] px-2.5 py-1 rounded-full border border-[rgb(var(--primary)/0.2)]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Studio Location, Transit & Practical Info */}
      <section className="py-16 lg:py-20 bg-[rgb(var(--muted)/0.3)] border-t border-[rgb(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))] flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>Studio Location</span>
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Visiting Our Makati Clinic
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Located conveniently in the heart of the business district with private patient parking and direct transit access.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Practical Information Cards (Left 5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Address card */}
              <div className="bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--primary))] uppercase tracking-wider">
                  <MapPin className="h-4 w-4" />
                  <span>Clinic Address</span>
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  {business.address || "2F Veridian Building, 123 Ayala Avenue, Makati City"}
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Complimentary 2-hour validated basement parking available for all registered patients.
                </p>
              </div>

              {/* Hours card */}
              <div className="bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Clock className="h-4 w-4" />
                  <span>Operating Hours</span>
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  Monday – Saturday: 8:00 AM – 7:00 PM
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Sunday: Closed for deep hospital-grade cleanroom sterilization cycles.
                </p>
              </div>

              {/* Direct Concierge Contact card */}
              <div className="bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Phone className="h-4 w-4" />
                  <span>Direct Inquiries & Concierge</span>
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--foreground))]">
                  {business.phone || "+63 2 8123 4567"}
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Same-day emergency walk-ins prioritized for acute pain, trauma, or broken restorations.
                </p>
              </div>
            </div>

            {/* Embedded Interactive Map (Right 7 cols) */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[rgb(var(--border))] shadow-md bg-[rgb(var(--card))]">
              <BusinessMap height="380px" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing High-Conversion CTA Banner */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                <span>Begin Your Journey to a Confident Smile</span>
              </div>

              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Experience the Veridian Standard for Yourself
              </h2>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
                Whether you need a routine check-up, gentle cleaning, or a complete digital smile makeover, our dedicated specialists are here to welcome you.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link to="/booking">
                  <Button size="lg" className="h-12 px-8 rounded-full font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/40 border-0 cursor-pointer">
                    <CalendarDays className="h-4.5 w-4.5 mr-2" />
                    Book Your Visit Online
                  </Button>
                </Link>
                <Link to="/#treatments">
                  <Button variant="outline" size="lg" className="h-12 px-7 rounded-full font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md cursor-pointer">
                    View All Treatments
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
