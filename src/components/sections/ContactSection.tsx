import React, { useState } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { MapPin, Phone, Mail, Clock, Send, X, ArrowRight, ExternalLink, Loader2, CheckCircle2, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export function ContactSection() {
  const { business } = useBusiness()
  const [activePanel, setActivePanel] = useState<"hours" | "map" | "email">("hours")

  // Email form state
  const [senderName, setSenderName] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message.")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: senderName.trim(),
          email: senderEmail.trim(),
          message: message.trim(),
          recipient: business.email,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSentSuccess(true)
        toast.success(data.message || "Message sent successfully!")
        setSenderName("")
        setSenderEmail("")
        setMessage("")
      } else {
        toast.error(data.error || "Failed to send message")
      }
    } catch {
      toast.error("Network error while sending message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  // Construct map query from latitude/longitude or address
  const mapQuery =
    business.latitude && business.longitude
      ? `${business.latitude},${business.longitude}`
      : business.address || "123 Ayala Avenue, Makati City"

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=${
    business.mapZoom || 15
  }&ie=UTF8&iwloc=&output=embed`

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    business.address || mapQuery
  )}`

  return (
    <section id="contact" className="py-16 lg:py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-medium text-[rgb(var(--primary))] mb-3 uppercase tracking-wider">Contact</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))] mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Get in touch
          </h2>
          <p className="text-[rgb(var(--muted-foreground))] leading-relaxed text-lg">
            We would love to hear from you. Reach us through any of the following channels or visit our studio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column: Interactive Contact Information Cards */}
          <div className="space-y-4">
            {/* 1. Clinic Address Card (Clickable -> Opens Map) */}
            {business.address && (
              <div
                onClick={() => setActivePanel(activePanel === "map" ? "hours" : "map")}
                className={`group flex items-start gap-4 p-5 bg-[rgb(var(--card))] rounded-[var(--radius)] border cursor-pointer transition-all duration-200 shadow-sm ${
                  activePanel === "map"
                    ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.02)]"
                    : "border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] hover:shadow-md"
                }`}
                role="button"
                tabIndex={0}
                aria-label="View clinic location map"
              >
                <div className="h-10 w-10 shrink-0 rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MapPin className="h-5 w-5 text-[rgb(var(--primary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[rgb(var(--foreground))] mb-1">Clinic Address</h3>
                    <span className="text-xs font-medium text-[rgb(var(--primary))] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {activePanel === "map" ? "Viewing Map" : "View Map"}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-[rgb(var(--muted-foreground))] text-sm leading-relaxed">{business.address}</p>
                </div>
              </div>
            )}

            {/* 2. Phone Number Card */}
            {business.phone && (
              <div className="flex items-start gap-4 p-5 bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] shadow-sm">
                <div className="h-10 w-10 shrink-0 rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center">
                  <Phone className="h-5 w-5 text-[rgb(var(--primary))]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[rgb(var(--foreground))] mb-1">Phone Number</h3>
                  <a
                    href={`tel:${business.phone}`}
                    className="text-[rgb(var(--primary))] text-sm font-medium hover:underline inline-flex items-center gap-1.5"
                  >
                    {business.phone}
                  </a>
                </div>
              </div>
            )}

            {/* 3. Email Address Card (Clickable -> Opens Email Form Panel) */}
            {business.email && (
              <div
                onClick={() => {
                  setSentSuccess(false)
                  setActivePanel(activePanel === "email" ? "hours" : "email")
                }}
                className={`group flex items-start gap-4 p-5 bg-[rgb(var(--card))] rounded-[var(--radius)] border cursor-pointer transition-all duration-200 shadow-sm ${
                  activePanel === "email"
                    ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.2)] bg-[rgb(var(--primary)/0.02)]"
                    : "border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)] hover:shadow-md"
                }`}
                role="button"
                tabIndex={0}
                aria-label="Send an email message"
              >
                <div className="h-10 w-10 shrink-0 rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mail className="h-5 w-5 text-[rgb(var(--primary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[rgb(var(--foreground))] mb-1">Email Address</h3>
                    <span className="text-xs font-medium text-[rgb(var(--primary))] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {activePanel === "email" ? "Writing Message" : "Send Email"}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-[rgb(var(--primary))] text-sm font-medium">{business.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Animated Dynamic Panel (Clinic Hours / Map / Email Form) */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden shadow-sm min-h-[380px] flex flex-col relative">
            <AnimatePresence mode="wait">
              {/* VIEW 1: Clinic Hours */}
              {activePanel === "hours" && (
                <motion.div
                  key="hours-panel"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="p-8 flex flex-col items-center justify-center text-center flex-1 space-y-6 my-auto"
                >
                  <div className="h-16 w-16 rounded-full bg-[rgb(var(--primary)/0.1)] flex items-center justify-center text-[rgb(var(--primary))]">
                    <Clock className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[rgb(var(--foreground))] mb-3">Clinic Hours</h3>
                    <div className="space-y-1.5 text-sm text-[rgb(var(--muted-foreground))]">
                      <p className="font-medium text-[rgb(var(--foreground))]">Monday – Friday: 9:00 AM – 6:00 PM</p>
                      <p>Saturday: 9:00 AM – 4:00 PM</p>
                      <p className="text-rose-500/80 dark:text-rose-400/80 font-medium">Sunday: Closed</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePanel("map")}
                      className="gap-1.5 text-xs"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      View Location Map
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSentSuccess(false)
                        setActivePanel("email")
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <Mail className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      Send Inquiries
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* VIEW 2: Interactive Location Map */}
              {activePanel === "map" && (
                <motion.div
                  key="map-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col h-full flex-1"
                >
                  {/* Map Header */}
                  <div className="p-4 border-b border-[rgb(var(--border))] flex items-center justify-between bg-[rgb(var(--muted)/0.3)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[rgb(var(--primary))]" />
                      <span className="font-semibold text-sm text-[rgb(var(--foreground))]">Clinic Location</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel("hours")}
                      className="h-8 px-2 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close Map
                    </Button>
                  </div>

                  {/* Embedded Google Map iframe */}
                  <div className="flex-1 w-full min-h-[260px] bg-[rgb(var(--muted))] relative">
                    <iframe
                      title="Clinic Location Map"
                      src={mapEmbedUrl}
                      className="w-full h-full border-0 absolute inset-0"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>

                  {/* Map Footer Bar */}
                  <div className="p-3.5 bg-[rgb(var(--card))] border-t border-[rgb(var(--border))] flex items-center justify-between gap-3 text-xs">
                    <span className="text-[rgb(var(--muted-foreground))] truncate">
                      {business.address || "Makati City, Metro Manila"}
                    </span>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 font-semibold text-[rgb(var(--primary))] hover:underline"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get Directions
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              )}

              {/* VIEW 3: Smooth Slide-In Email Contact Form */}
              {activePanel === "email" && (
                <motion.div
                  key="email-panel"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col h-full flex-1 p-6 space-y-4"
                >
                  {/* Email Header */}
                  <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                    <div>
                      <h3 className="font-bold text-base text-[rgb(var(--foreground))] flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[rgb(var(--primary))]" />
                        Send a Message
                      </h3>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        To: <span className="font-medium text-[rgb(var(--foreground))]">{business.email}</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel("hours")}
                      className="h-8 px-2 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>

                  {/* Success State or Contact Form */}
                  {sentSuccess ? (
                    <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 my-auto">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <h4 className="font-semibold text-[rgb(var(--foreground))] text-base">Message Sent!</h4>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-xs">
                        Thank you for reaching out. Our reception team will get back to you at your provided email shortly.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSentSuccess(false)
                          setActivePanel("hours")
                        }}
                        className="mt-2 text-xs"
                      >
                        Back to Contact Information
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendEmail} className="space-y-3.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="contact-name" className="text-xs font-medium">
                              Your Name
                            </Label>
                            <Input
                              id="contact-name"
                              placeholder="Juan Dela Cruz"
                              value={senderName}
                              onChange={e => setSenderName(e.target.value)}
                              required
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="contact-email" className="text-xs font-medium">
                              Your Email
                            </Label>
                            <Input
                              id="contact-email"
                              type="email"
                              placeholder="juan@example.com"
                              value={senderEmail}
                              onChange={e => setSenderEmail(e.target.value)}
                              required
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="contact-message" className="text-xs font-medium">
                            Message
                          </Label>
                          <textarea
                            id="contact-message"
                            rows={4}
                            placeholder="Write your inquiry, appointment question, or feedback..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            className="w-full rounded-[var(--radius)] border border-[rgb(var(--input))] bg-[rgb(var(--background))] px-3 py-2 text-xs text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] resize-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[rgb(var(--border))] flex items-center justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivePanel("hours")}
                          className="text-xs text-[rgb(var(--muted-foreground))]"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={sending} className="gap-1.5 text-xs">
                          {sending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
