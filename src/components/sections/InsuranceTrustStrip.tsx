import React from "react"
import { ShieldCheck, CreditCard, Award, CheckCircle2, HeartHandshake, Sparkles } from "lucide-react"

export function InsuranceTrustStrip() {
  const insuranceNetworks = [
    "Delta Dental",
    "MetLife",
    "Cigna Dental",
    "Aetna Health",
    "Guardian",
    "Blue Cross Blue Shield",
  ]

  const trustHighlights = [
    {
      icon: <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      title: "HSA / FSA Accepted",
      description: "Direct receipt integration for health savings accounts",
    },
    {
      icon: <CreditCard className="h-4 w-4 text-[rgb(var(--primary))]" />,
      title: "0% Interest Financing",
      description: "CareCredit & flexible clinic payment plans available",
    },
    {
      icon: <Award className="h-4 w-4 text-amber-500" />,
      title: "Board Certified Specialists",
      description: "ADA accredited with ongoing clinical certifications",
    },
    {
      icon: <Sparkles className="h-4 w-4 text-cyan-500" />,
      title: "Hospital-Grade Sterilization",
      description: "Exceeding CDC and OSHA safety standards",
    },
  ]

  return (
    <section className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.25)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Insurance Partners Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <div className="shrink-0 flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--foreground))]">
              Accepted Insurance & Direct-Billing Networks:
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 text-xs">
            {insuranceNetworks.map((network, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-medium shadow-2xs hover:border-[rgb(var(--primary)/0.5)] transition-colors"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>{network}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Clinical Guarantees Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[rgb(var(--border)/0.6)]">
          {trustHighlights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-[var(--radius)] bg-[rgb(var(--card))] border border-[rgb(var(--border)/0.8)] shadow-2xs"
            >
              <div className="p-2 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.5)] shrink-0">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[rgb(var(--foreground))]">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[rgb(var(--muted-foreground))] leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

