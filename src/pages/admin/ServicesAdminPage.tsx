import React, { useState, useEffect, useRef } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Clock,
  Loader2,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Layout,
  Layers,
  Save,
  X,
  Eye,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { TreatmentCard, ServiceItem } from "@/components/sections/ServicesSection"
import { TreatmentImageManager } from "@/components/treatments/TreatmentImageManager"

export function ServicesAdminPage() {
  const { business, terminology } = useBusiness()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  // Editor Modal State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Global Card Style State
  const [globalCardStyle, setGlobalCardStyle] = useState<"default" | "image_card" | "overlay">("default")

  // Form State
  const [name, setName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [price, setPrice] = useState<number>(800)
  const [durationMinutes, setDurationMinutes] = useState<number>(30)
  const [images, setImages] = useState<string[]>([])

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services", {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })
      const data = await res.json()
      if (data.services) {
        setServices(data.services)
      }
      if (data.cardStyle) {
        setGlobalCardStyle(data.cardStyle)
      }
    } catch (err) {
      console.error("Failed to fetch treatments:", err)
      toast.error("Failed to load treatments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleOpenAddModal = () => {
    setEditingService(null)
    setName("")
    setShortDescription("")
    setPrice(1000)
    setDurationMinutes(30)
    setImages([])
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingService(service)
    setName(service.name)
    setShortDescription(service.shortDescription || service.description || "")
    setPrice(Number(service.price))
    setDurationMinutes(service.durationMinutes)
    const sImages = service.images && Array.isArray(service.images) && service.images.length > 0
      ? service.images
      : (service.image ? [service.image] : [])
    setImages(sImages)
    setIsModalOpen(true)
  }

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Treatment name is required")
      return
    }

    setSaving(true)

    try {
      const primaryImage = images.length > 0 ? images[0] : null

      const payload = {
        name,
        shortDescription,
        description: shortDescription,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        image: primaryImage,
        images,
        isFeatured: true,
        isActive: true,
      }

      let res: Response
      if (editingService) {
        res = await fetch(`/api/admin/services/${editingService.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/admin/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
          body: JSON.stringify(payload),
        })
      }

      const resData = await res.json()
      if (res.ok) {
        toast.success(
          editingService
            ? `Treatment "${name}" updated successfully!`
            : `Treatment "${name}" added successfully!`
        )
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        setIsModalOpen(false)
        fetchServices()
      } else {
        toast.error(resData.error || "Failed to save treatment")
      }
    } catch (err) {
      toast.error("Network error while saving treatment")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTreatment = async (service: ServiceItem) => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })

      if (res.ok) {
        toast.success(`Treatment "${service.name}" removed`)
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        fetchServices()
      } else {
        toast.error("Failed to delete treatment")
      }
    } catch (err) {
      toast.error("Network error while deleting treatment")
    }
  }

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= services.length) return

    const newServices = [...services]
    const temp = newServices[index]
    newServices[index] = newServices[newIndex]
    newServices[newIndex] = temp

    setServices(newServices)

    try {
      await fetch("/api/admin/services/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ orderedIds: newServices.map(s => s.id) }),
      })
      toast.success("Treatment order updated")
      try {
        const channel = new BroadcastChannel("website_customization_sync")
        channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
        channel.close()
      } catch {}
    } catch (err) {
      toast.error("Failed to persist order")
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  // Live preview dummy service
  const previewService: ServiceItem = {
    id: editingService?.id || "preview-id",
    name: name || "Treatment Name",
    slug: (name || "treatment").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    shortDescription: shortDescription || "Comprehensive treatment description will be displayed here.",
    price: price || 1000,
    durationMinutes: durationMinutes || 30,
    image: images[0] || (globalCardStyle !== "default" ? "/hero-dental.jpg" : null),
    images,
    cardStyle: globalCardStyle,
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2.5">
            <Layout className="h-6 w-6 text-[rgb(var(--primary))]" />
            Treatments & Services Management
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Manage treatment details, pricing, duration, and clinical images. (Global presentation style is configured in Website Customization).
          </p>
        </div>
        <Button onClick={handleOpenAddModal} className="gap-2 shadow-sm shrink-0">
          <Plus className="h-4 w-4" />
          Add New Treatment
        </Button>
      </div>

      {/* Treatments List */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] divide-y divide-[rgb(var(--border))] shadow-sm overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center text-[rgb(var(--muted-foreground))]">
            <Layers className="h-10 w-10 mx-auto mb-2 opacity-30 text-[rgb(var(--primary))]" />
            <p className="font-semibold text-base text-[rgb(var(--foreground))]">No treatments configured yet</p>
            <p className="text-xs mt-1">Click "Add New Treatment" above to create your first clinical service.</p>
          </div>
        ) : (
          services.map((service, index) => (
            <div key={service.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[rgb(var(--muted)/0.3)] transition-colors">
              {/* Thumbnail / Style Icon */}
              <div className="h-14 w-14 rounded-[var(--radius)] overflow-hidden bg-[rgb(var(--muted))] border border-[rgb(var(--border))] shrink-0 flex items-center justify-center relative">
                {service.image ? (
                  <img src={service.image} alt={service.name} className="object-cover w-full h-full" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-[rgb(var(--muted-foreground))] opacity-40" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[rgb(var(--foreground))]">{service.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-[rgb(var(--muted-foreground))]">
                    {globalCardStyle === "overlay" || (globalCardStyle as any) === "blurred-image-reveal"
                      ? "Style 3: Reveal"
                      : globalCardStyle === "image_card"
                      ? "Style 2: Image Card"
                      : "Style 1: Default"}
                  </Badge>
                </div>

                {service.shortDescription && (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] truncate max-w-xl">
                    {service.shortDescription}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))] pt-0.5">
                  <span className="font-semibold text-[rgb(var(--foreground))]">
                    {formatCurrency(Number(service.price), business.currencySymbol)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(service.durationMinutes)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:self-center shrink-0">
                {/* Reorder Up/Down */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => handleMoveOrder(index, "up")}
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === services.length - 1}
                  onClick={() => handleMoveOrder(index, "down")}
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>

                {/* Edit */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditModal(service)}
                  className="gap-1.5 text-xs h-8 ml-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit & Style
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTreatment(service)}
                  className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete Treatment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= EDIT / ADD TREATMENT MODAL WITH LIVE PREVIEW ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-[rgb(var(--border))] flex items-center justify-between bg-[rgb(var(--muted)/0.3)]">
              <div>
                <h2 className="text-lg font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[rgb(var(--primary))]" />
                  {editingService ? `Edit Treatment: ${editingService.name}` : "Add New Treatment"}
                </h2>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Configure treatment info, image, card presentation style, and preview in real time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-[var(--radius)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns (Form on left, Live Preview on right) */}
            <form onSubmit={handleSaveTreatment} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Controls (Left Column) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="treatment-name" className="text-xs font-semibold">Treatment Name *</Label>
                    <Input
                      id="treatment-name"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Teeth Whitening"
                      className="text-sm font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="treatment-desc" className="text-xs font-semibold">Description</Label>
                    <textarea
                      id="treatment-desc"
                      rows={2}
                      value={shortDescription}
                      onChange={e => setShortDescription(e.target.value)}
                      placeholder="Short summary of procedure, benefits, and results..."
                      className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary))]"
                    />
                  </div>

                  {/* Price & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="treatment-price" className="text-xs font-semibold">Price ({business.currencySymbol})</Label>
                      <Input
                        id="treatment-price"
                        type="number"
                        min="0"
                        step="50"
                        value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        className="text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="treatment-duration" className="text-xs font-semibold">Duration (Minutes)</Label>
                      <Input
                        id="treatment-duration"
                        type="number"
                        min="5"
                        step="5"
                        value={durationMinutes}
                        onChange={e => setDurationMinutes(Number(e.target.value))}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* ================= GLOBAL CARD STYLE INFO ================= */}
                  <div className="p-3.5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[rgb(var(--primary))]" />
                      <span className="font-medium text-[rgb(var(--foreground))]">
                        Active Presentation Style:{" "}
                        <strong>
                          {globalCardStyle === "overlay" || (globalCardStyle as any) === "blurred-image-reveal"
                            ? "Style 3 — Frosted Glass Reveal"
                            : globalCardStyle === "image_card"
                            ? "Style 2 — Image Card"
                            : "Style 1 — Default"}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-[rgb(var(--muted-foreground))]">
                      Applied globally to all treatments
                    </span>
                  </div>

                  {/* ================= TREATMENT IMAGE MANAGEMENT ================= */}
                  <div className="p-3.5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.15)]">
                    <TreatmentImageManager
                      images={images}
                      onChange={setImages}
                    />
                  </div>
                </div>

                {/* Live Card Preview (Right Column) */}
                <div className="lg:col-span-5 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))] flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                    Live Treatment Card Preview
                  </Label>
                  <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                    Exact representation of how this treatment will appear on the public website:
                  </p>

                  <div className="pt-2">
                    <TreatmentCard
                      service={previewService}
                      currencySymbol={business.currencySymbol}
                      globalCardStyle={globalCardStyle}
                      isPreview={true}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="default"
                  disabled={saving}
                  className="gap-2 px-6 font-semibold shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Treatment...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save & Apply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
