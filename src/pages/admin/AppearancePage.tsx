import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Button } from "@/components/ui/button"
import { Loader2, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

const THEMES = [
  { id: "CLINICAL_SWISS", name: "Clinical Swiss", description: "Clean teal aesthetic with high clarity typography", primary: "#1c7396" },
  { id: "DARK_CLINICAL", name: "Dark Clinical", description: "Modern dark mode tailored for medical precision", primary: "#72d6c1" },
  { id: "PREMIUM_SOFT", name: "Premium Soft", description: "Warm beige and luxury editorial serif typography", primary: "#b69b6b" },
]

export function AppearancePage() {
  const { theme, refresh } = useBusiness()
  const [selectedTheme, setSelectedTheme] = useState<string>(theme?.theme ?? "CLINICAL_SWISS")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (theme?.theme) setSelectedTheme(theme.theme)
  }, [theme])

  const handleSave = async (themeId: string) => {
    setSelectedTheme(themeId)
    document.documentElement.setAttribute("data-theme", themeId)
    setSaving(true)
    try {
      const res = await fetch("/api/admin/appearance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token")
            ? `Bearer ${localStorage.getItem("token")}`
            : "",
        },
        body: JSON.stringify({ theme: themeId }),
      })
      if (res.ok) {
        toast.success("Theme updated successfully!")
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        refresh()
      }
    } catch (e) {
      toast.error("Failed to save theme")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Appearance & Themes</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Customize the visual identity, colors, and styling of your public clinic website.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {THEMES.map(t => {
          const isSelected = selectedTheme === t.id
          return (
            <div
              key={t.id}
              onClick={() => handleSave(t.id)}
              className={`bg-[rgb(var(--card))] rounded-[var(--radius)] border p-6 cursor-pointer transition-all duration-200 shadow-sm relative flex flex-col justify-between ${
                isSelected
                  ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.2)]"
                  : "border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: t.primary }} />
                  {isSelected && <Check className="h-5 w-5 text-[rgb(var(--primary))]" />}
                </div>
                <h3 className="font-semibold text-[rgb(var(--foreground))] text-base mb-1">{t.name}</h3>
                <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">{t.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between">
                <span className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                  {isSelected ? "Active Theme" : "Select Theme"}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
