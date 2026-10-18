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

  return (
    <section className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.25)] py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <div className="shrink-0 flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[rgb(var(--primary))]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--foreground))]">
              Accepted Insurance & Direct-Billing Networks
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 text-xs">
            {insuranceNetworks.map((network, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] font-medium text-xs"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>{network}</span>
              </span>
            ))}
            <span className="text-xs text-[rgb(var(--muted-foreground))] pl-2 hidden sm:inline">
              • HSA/FSA & CareCredit Accepted
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}


