import React from "react"
import { ShieldCheck, Award, Clock, HeartPulse } from "lucide-react"

interface TrustStatsSectionProps {
  content?: Record<string, any> | null
}

export function TrustStatsSection({ content }: TrustStatsSectionProps) {
  const pillars = [
    {
      icon: <Award className="h-4 w-4 text-[rgb(var(--primary))]" />,
      title: "Board-Certified Faculty",
      detail: "All dentists hold active clinical board credentials and specialized training.",
    },
    {
      icon: <ShieldCheck className="h-4 w-4 text-[rgb(var(--primary))]" />,
      detail: "Strict hospital-grade sterilization meeting and exceeding OSHA standards.",
      title: "Hospital-Grade Safety",
    },
    {
      icon: <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />,
      title: "Punctual Consultations",
      detail: "Dedicated time reserved for your appointment with zero rushed care.",
    },
    {
      icon: <HeartPulse className="h-4 w-4 text-[rgb(var(--primary))]" />,
      title: "Gentle Preventive Care",
      detail: "Focused on non-invasive diagnostics and comfortable smile preservation.",
    },
  ]

  return (
    <section className="border-y border-[rgb(var(--border))] bg-[rgb(var(--card))] py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pillars.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 text-[rgb(var(--primary))]">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--foreground))]">
                  {item.title}
                </h3>
                <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}