"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { FAQ } from "@prisma/client"

interface FAQSectionProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <section id="faq" className="py-16 lg:py-24 bg-[rgb(var(--muted)/0.4)] scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-[rgb(var(--primary))] mb-3 uppercase tracking-wider">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))]" style={{ fontFamily: "var(--font-heading)" }}>
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map(faq => (
            <div key={faq.id} className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden">
              <button
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[rgb(var(--muted)/0.5)] transition-colors"
                aria-expanded={open === faq.id}
              >
                <span className="font-medium text-[rgb(var(--foreground))] pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-[rgb(var(--muted-foreground))] shrink-0 transition-transform duration-200 ${open === faq.id ? "rotate-180" : ""}`}
                />
              </button>
              {open === faq.id && (
                <div className="px-5 pb-5 text-sm text-[rgb(var(--muted-foreground))] leading-relaxed border-t border-[rgb(var(--border))] pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}