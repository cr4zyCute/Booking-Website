"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, FileText, ArrowRight, ShieldCheck, Lock } from "lucide-react"

interface CustomerFormProps {
  customer: any
  terminology: any
  onSubmit: (customer: any) => void
  onBack: () => void
}

export function CustomerForm({ customer, terminology, onSubmit, onBack }: CustomerFormProps) {
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    notes: customer?.notes ?? "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const appointmentSingular = terminology?.appointmentSingular || "Appointment"

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Please enter your full name"
    if (!form.email.trim()) errs.email = "Please enter your email address"
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Please enter a valid email address"
    if (!form.phone.trim()) errs.phone = "Please enter your contact phone number"
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-[rgb(var(--primary))]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">
            Patient Contact Information
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
          We need a few details to confirm your {appointmentSingular.toLowerCase()} and send your appointment reminder.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-xl">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-name" className="text-xs font-semibold flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customer-name"
            value={form.name}
            onChange={e => {
              setForm(f => ({ ...f, name: e.target.value }))
              if (errors.name) setErrors(errs => ({ ...errs, name: "" }))
            }}
            placeholder="e.g. Maria Clara"
            className={`h-11 text-xs sm:text-sm bg-[rgb(var(--card))] ${
              errors.name ? "border-red-500 ring-1 ring-red-500/30" : ""
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer-email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-email"
              type="email"
              value={form.email}
              onChange={e => {
                setForm(f => ({ ...f, email: e.target.value }))
                if (errors.email) setErrors(errs => ({ ...errs, email: "" }))
              }}
              placeholder="maria@example.com"
              className={`h-11 text-xs sm:text-sm bg-[rgb(var(--card))] ${
                errors.email ? "border-red-500 ring-1 ring-red-500/30" : ""
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              Mobile Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-phone"
              type="tel"
              value={form.phone}
              onChange={e => {
                setForm(f => ({ ...f, phone: e.target.value }))
                if (errors.phone) setErrors(errs => ({ ...errs, phone: "" }))
              }}
              placeholder="+63 917 123 4567"
              className={`h-11 text-xs sm:text-sm bg-[rgb(var(--card))] ${
                errors.phone ? "border-red-500 ring-1 ring-red-500/30" : ""
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
          </div>
        </div>

        {/* Special Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-notes" className="text-xs font-semibold flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
            Clinical Notes or Concerns (Optional)
          </Label>
          <Textarea
            id="customer-notes"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Please mention any dental anxiety, medical conditions, or specific questions..."
            rows={3}
            className="text-xs sm:text-sm bg-[rgb(var(--card))] resize-none"
          />
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-lg bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] flex items-center gap-2.5 text-xs text-[rgb(var(--muted-foreground))]">
          <Lock className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
          <span>Your personal information is kept strictly confidential in accordance with healthcare privacy standards.</span>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between gap-4">
          <Button type="button" variant="outline" onClick={onBack} size="sm">
            ← Back
          </Button>

          <Button type="submit" size="default" className="gap-2 font-semibold text-xs h-10 px-6 shadow-sm">
            Review Appointment Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CustomerForm