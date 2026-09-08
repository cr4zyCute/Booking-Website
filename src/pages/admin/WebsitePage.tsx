import React, { useState, useEffect, useRef } from "react"
import { useBusiness } from "@/context/BusinessContext"
import {
  Loader2,
  Globe,
  Layout,
  Layers,
  Save,
  CheckCircle2,
  AlignLeft,
  AlignRight,
  Maximize2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  Star,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Award,
  Type,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Clock,
  Briefcase,
  Stethoscope
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { TreatmentCard, ServiceItem } from "@/components/sections/ServicesSection"
import { DentistCard, DentistCardStyle, StaffMember } from "@/components/sections/StaffSection"
import { TreatmentImageManager } from "@/components/treatments/TreatmentImageManager"

const notifyHomepageUpdate = () => {
  try {
    const channel = new BroadcastChannel("website_customization_sync")
    channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
    channel.close()
  } catch {
    // Ignore
  }
}

export function WebsitePage() {
  const { business } = useBusiness()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingHero, setSavingHero] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // ==========================================
  // HERO SECTION CUSTOMIZATION STATE
  // ==========================================
  const [savedConfig, setSavedConfig] = useState<{
    imagePosition: "left" | "right" | "center"
    heading: string
    subheading: string
    image: string
    showBadge: boolean
    badgeText: string
    stat1Value: string
    stat1Label: string
    stat2Value: string
    stat2Label: string
  }>({
    imagePosition: "right",
    heading: "Exceptional care.\nDesigned around you.",
    subheading: "Professional services delivered by an experienced team in Veridian Dental Studio.",
    image: "/hero-dental.jpg",
    showBadge: true,
    badgeText: "Now accepting new patient bookings",
    stat1Value: "500+",
    stat1Label: "Satisfied Patients",
    stat2Value: "12",
    stat2Label: "Certified Dental Specialists",
  })

  // Live active hero state
  const [imagePosition, setImagePosition] = useState<"left" | "right" | "center">("right")
  const [heading, setHeading] = useState("Exceptional care.\nDesigned around you.")
  const [subheading, setSubheading] = useState(
    "Professional services delivered by an experienced team in Veridian Dental Studio."
  )
  const [image, setImage] = useState("/hero-dental.jpg")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Customizable banner & statistics elements
  const [showBadge, setShowBadge] = useState<boolean>(true)
  const [badgeText, setBadgeText] = useState<string>("Now accepting new patient bookings")
  const [stat1Value, setStat1Value] = useState<string>("500+")
  const [stat1Label, setStat1Label] = useState<string>("Satisfied Patients")
  const [stat2Value, setStat2Value] = useState<string>("12")
  const [stat2Label, setStat2Label] = useState<string>("Certified Dental Specialists")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ==========================================
  // TREATMENT SECTION CUSTOMIZATION STATE
  // ==========================================
  const [services, setServices] = useState<ServiceItem[]>([])
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
  const [isCreatingNewTreatment, setIsCreatingNewTreatment] = useState<boolean>(false)

  // Treatment edit fields
  const [treatmentName, setTreatmentName] = useState<string>("")
  const [treatmentShortDesc, setTreatmentShortDesc] = useState<string>("")
  const [treatmentPrice, setTreatmentPrice] = useState<number>(800)
  const [treatmentDuration, setTreatmentDuration] = useState<number>(30)
  const [treatmentCardStyle, setTreatmentCardStyle] = useState<"default" | "image_card" | "overlay" | "blurred-image-reveal" | "blurred_reveal">("default")
  const [treatmentImages, setTreatmentImages] = useState<string[]>([])
  const [treatmentImage, setTreatmentImage] = useState<string | null>(null)
  const [treatmentImagePreview, setTreatmentImagePreview] = useState<string | null>(null)
  const [treatmentSelectedFile, setTreatmentSelectedFile] = useState<File | null>(null)

  const [savingTreatment, setSavingTreatment] = useState<boolean>(false)
  const [uploadingTreatmentImage, setUploadingTreatmentImage] = useState<boolean>(false)
  const treatmentFileInputRef = useRef<HTMLInputElement>(null)

  // ==========================================
  // DENTIST / STAFF SECTION CUSTOMIZATION STATE
  // ==========================================
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null)
  const [savedDentistCardStyle, setSavedDentistCardStyle] = useState<DentistCardStyle>("clinical")
  const [dentistCardStyle, setDentistCardStyle] = useState<DentistCardStyle>("clinical")
  const [savingDentistStyle, setSavingDentistStyle] = useState<boolean>(false)

  // Fetch all website & services data
  const fetchWebsiteData = async () => {
    try {
      const [webRes, heroRes, servicesRes, staffRes] = await Promise.all([
        fetch("/api/admin/website", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
        fetch("/api/admin/website/hero", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
        fetch("/api/admin/services", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
        fetch("/api/admin/staff", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
      ])

      if (webRes.ok) {
        const webData = await webRes.json()
        setData(webData)
        if (webData.sections) {
          const staffSec = webData.sections.find((s: any) => s.type === "STAFF")
          if (staffSec?.content?.cardStyle) {
            setSavedDentistCardStyle(staffSec.content.cardStyle)
            setDentistCardStyle(staffSec.content.cardStyle)
          }
        }
      }

      if (heroRes.ok) {
        const heroData = await heroRes.json()
        if (heroData.hero) {
          const pos = heroData.hero.imagePosition || "right"
          const head = heroData.hero.heading || "Exceptional care.\nDesigned around you."
          const sub =
            heroData.hero.subheading ||
            `Professional services delivered by an experienced team in ${business.name || "Veridian Dental Studio"}.`
          const img = heroData.hero.image || "/hero-dental.jpg"
          const badge = heroData.hero.showBadge !== false
          const bText = heroData.hero.badgeText || "Now accepting new patient bookings"
          const s1Val = heroData.hero.stat1Value || "500+"
          const s1Lbl = heroData.hero.stat1Label || "Satisfied Patients"
          const s2Val = heroData.hero.stat2Value || "12"
          const s2Lbl = heroData.hero.stat2Label || "Certified Dental Specialists"

          setImagePosition(pos)
          setHeading(head)
          setSubheading(sub)
          setImage(img)
          setImagePreview(img)
          setShowBadge(badge)
          setBadgeText(bText)
          setStat1Value(s1Val)
          setStat1Label(s1Lbl)
          setStat2Value(s2Val)
          setStat2Label(s2Lbl)

          setSavedConfig({
            imagePosition: pos,
            heading: head,
            subheading: sub,
            image: img,
            showBadge: badge,
            badgeText: bText,
            stat1Value: s1Val,
            stat1Label: s1Lbl,
            stat2Value: s2Val,
            stat2Label: s2Lbl,
          })
        }
      }

      if (servicesRes.ok) {
        const servData = await servicesRes.json()
        if (servData.cardStyle) {
          setTreatmentCardStyle(servData.cardStyle)
        }
        if (servData.services && servData.services.length > 0) {
          setServices(servData.services)
          if (!selectedTreatmentId) {
            populateTreatmentForm(servData.services[0])
          }
        }
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        if (staffData.cardStyle) {
          setSavedDentistCardStyle(staffData.cardStyle)
          setDentistCardStyle(staffData.cardStyle)
        }
        if (staffData.staff && staffData.staff.length > 0) {
          setStaffList(staffData.staff)
          if (!selectedDentistId) {
            setSelectedDentistId(staffData.staff[0].id)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWebsiteData()
  }, [])

  // ==========================================
  // HERO HANDLERS
  // ==========================================
  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WebP, AVIF)")
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        setImage(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHeroUploadImage = async () => {
    if (!selectedFile) return
    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)

      const res = await fetch("/api/admin/website/hero/upload", {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.imageUrl) {
        setImage(data.imageUrl)
        setImagePreview(data.imageUrl)
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        toast.success("Hero image uploaded successfully")
      } else {
        toast.error(data.error || "Failed to upload image")
      }
    } catch (err) {
      toast.error("Network error while uploading image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleResetHeroToDefault = async () => {
    const defaultImg = "/hero-dental.jpg"
    setImage(defaultImg)
    setImagePreview(defaultImg)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    await handleSaveHeroChanges(defaultImg)
    toast.success("Reset to default hero image & saved live!")
  }

  const handleRemoveHeroImage = async () => {
    setImage("")
    setImagePreview("")
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    toast.info("Image removed from preview. Click 'Save Changes' to update public site.")
  }

  const handleSaveHeroChanges = async (overrideImage?: string) => {
    setSavingHero(true)

    try {
      let finalImageUrl = overrideImage !== undefined ? overrideImage : image

      if (selectedFile && overrideImage === undefined) {
        const formData = new FormData()
        formData.append("image", selectedFile)

        const uploadRes = await fetch("/api/admin/website/hero/upload", {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
          body: formData,
        })

        const uploadData = await uploadRes.json()
        if (uploadRes.ok && uploadData.imageUrl) {
          finalImageUrl = uploadData.imageUrl
          setImage(finalImageUrl)
          setImagePreview(finalImageUrl)
          setSelectedFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ""
        }
      }

      const payload = {
        imagePosition,
        heading,
        subheading,
        image: finalImageUrl,
        showBadge,
        badgeText,
        stat1Value,
        stat1Label,
        stat2Value,
        stat2Label,
      }

      const res = await fetch("/api/admin/website/hero", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify(payload),
      })

      const resData = await res.json()
      if (res.ok) {
        setSavedConfig(payload)
        toast.success("Hero section customized & saved successfully!")
        notifyHomepageUpdate()
      } else {
        toast.error(resData.error || "Failed to save hero customization")
      }
    } catch (err) {
      toast.error("Network error while saving changes")
    } finally {
      setSavingHero(false)
    }
  }

  const hasUnsavedHeroChanges =
    imagePosition !== savedConfig.imagePosition ||
    heading !== savedConfig.heading ||
    subheading !== savedConfig.subheading ||
    image !== savedConfig.image ||
    showBadge !== savedConfig.showBadge ||
    badgeText !== savedConfig.badgeText ||
    stat1Value !== savedConfig.stat1Value ||
    stat1Label !== savedConfig.stat1Label ||
    stat2Value !== savedConfig.stat2Value ||
    stat2Label !== savedConfig.stat2Label ||
    selectedFile !== null

  // ==========================================
  // GLOBAL TREATMENT CARD STYLE HANDLER
  // ==========================================
  const handleSelectGlobalCardStyle = async (newStyle: "default" | "image_card" | "overlay") => {
    setTreatmentCardStyle(newStyle)
    try {
      const res = await fetch("/api/admin/website/treatment-card-style", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ cardStyle: newStyle }),
      })
      if (res.ok) {
        toast.success(
          `Global treatment card style updated to ${
            newStyle === "overlay"
              ? "Style 3 (Frosted Glass Reveal)"
              : newStyle === "image_card"
              ? "Style 2 (Image Card)"
              : "Style 1 (Default)"
          }`
        )
        notifyHomepageUpdate()
      } else {
        toast.error("Failed to save global card style to database")
      }
    } catch (err) {
      console.error("Failed to save global card style:", err)
      toast.error("Network error while updating global card style")
    }
  }

  // ==========================================
  // GLOBAL DENTIST CARD STYLE HANDLERS (EXPLICIT SAVE WORKFLOW)
  // ==========================================
  const hasUnsavedDentistCardStyle = dentistCardStyle !== savedDentistCardStyle

  const handleSelectPendingDentistCardStyle = (newStyle: DentistCardStyle) => {
    setDentistCardStyle(newStyle)
  }

  const handleCancelDentistCardStyle = () => {
    setDentistCardStyle(savedDentistCardStyle)
    toast.info("Card presentation changes reverted.")
  }

  const handleSaveDentistCardStyle = async () => {
    setSavingDentistStyle(true)
    try {
      const res = await fetch("/api/admin/website/dentist-card-style", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ cardStyle: dentistCardStyle }),
      })
      if (res.ok) {
        setSavedDentistCardStyle(dentistCardStyle)
        toast.success(
          `✓ Changes saved! Dentist card style updated to ${
            dentistCardStyle === "editorial"
              ? "Style 2 (Editorial)"
              : dentistCardStyle === "overlay"
              ? "Style 3 (Profile Overlay)"
              : dentistCardStyle === "minimal"
              ? "Style 4 (Minimal)"
              : "Style 1 (Clinical)"
          }`
        )
        notifyHomepageUpdate()
      } else {
        toast.error("Failed to save global dentist card style to database")
      }
    } catch (err) {
      console.error("Failed to save global dentist card style:", err)
      toast.error("Network error while saving global dentist card style")
    } finally {
      setSavingDentistStyle(false)
    }
  }

  // ==========================================
  // TREATMENT HANDLERS
  // ==========================================
  const populateTreatmentForm = (service: ServiceItem) => {
    setSelectedTreatmentId(service.id)
    setIsCreatingNewTreatment(false)
    setTreatmentName(service.name)
    setTreatmentShortDesc(service.shortDescription || service.description || "")
    setTreatmentPrice(Number(service.price))
    setTreatmentDuration(service.durationMinutes)
    const sImages = service.images && Array.isArray(service.images) && service.images.length > 0
      ? service.images
      : (service.image ? [service.image] : [])
    setTreatmentImages(sImages)
  }

  const handleSelectTreatment = (service: ServiceItem) => {
    populateTreatmentForm(service)
  }

  const handleAddNewTreatment = () => {
    setSelectedTreatmentId("new")
    setIsCreatingNewTreatment(true)
    setTreatmentName("New Treatment")
    setTreatmentShortDesc("Comprehensive dental procedure tailored for oral wellness and cosmetic brightness.")
    setTreatmentPrice(1200)
    setTreatmentDuration(30)
    setTreatmentImages([])
  }

  const handleSaveTreatment = async () => {
    if (!treatmentName.trim()) {
      toast.error("Treatment name is required")
      return
    }

    setSavingTreatment(true)

    try {
      const primaryImage = treatmentImages.length > 0 ? treatmentImages[0] : null

      const payload = {
        name: treatmentName,
        shortDescription: treatmentShortDesc,
        description: treatmentShortDesc,
        price: Number(treatmentPrice),
        durationMinutes: Number(treatmentDuration),
        image: primaryImage,
        images: treatmentImages,
        isFeatured: true,
        isActive: true,
      }

      let res: Response
      if (isCreatingNewTreatment || selectedTreatmentId === "new") {
        res = await fetch("/api/admin/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/services/${selectedTreatmentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
          body: JSON.stringify(payload),
        })
      }

      const resData = await res.json()
      if (res.ok) {
        toast.success(`Treatment "${treatmentName}" saved & published live!`)
        notifyHomepageUpdate()
        // Refetch services list
        const sRes = await fetch("/api/admin/services", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        })
        const sData = await sRes.json()
        if (sData.services) {
          setServices(sData.services)
          const matched = sData.services.find((s: ServiceItem) => s.id === resData.service?.id) || sData.services[0]
          if (matched) populateTreatmentForm(matched)
        }
      } else {
        toast.error(resData.error || "Failed to save treatment")
      }
    } catch (err) {
      toast.error("Network error while saving treatment")
    } finally {
      setSavingTreatment(false)
    }
  }

  const handleDeleteTreatment = async (service: ServiceItem) => {
    if (!window.confirm(`Are you sure you want to delete treatment "${service.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })

      if (res.ok) {
        toast.success(`Treatment "${service.name}" removed`)
        notifyHomepageUpdate()
        const remaining = services.filter(s => s.id !== service.id)
        setServices(remaining)
        if (remaining.length > 0) {
          populateTreatmentForm(remaining[0])
        } else {
          handleAddNewTreatment()
        }
      } else {
        toast.error("Failed to delete treatment")
      }
    } catch (err) {
      toast.error("Network error while deleting treatment")
    }
  }

  const handleMoveTreatmentOrder = async (index: number, direction: "up" | "down") => {
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
      toast.success("Treatment order updated & saved")
      notifyHomepageUpdate()
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

  const navItems = data?.navItems ?? []
  const sections = data?.sections ?? []

  // Live preview treatment object
  const livePreviewTreatment: ServiceItem = {
    id: selectedTreatmentId || "preview-id",
    name: treatmentName || "Treatment Name",
    slug: (treatmentName || "treatment").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    shortDescription: treatmentShortDesc || "Professional treatment designed to deliver lasting dental health and confidence.",
    price: treatmentPrice || 800,
    durationMinutes: treatmentDuration || 30,
    image: treatmentImages[0] || (treatmentCardStyle !== "default" ? "/hero-dental.jpg" : null),
    images: treatmentImages,
    cardStyle: treatmentCardStyle,
  }

  // Live preview dentist object
  const livePreviewDentist: StaffMember = staffList.find(s => s.id === selectedDentistId) || staffList[0] || {
    id: "preview-dentist",
    name: "Dr. Maria Santos",
    slug: "dr-maria-santos",
    photo: "/dr_maria_santos_1788091688653.jpg",
    role: "Lead Cosmetic & Restorative Dentist",
    specialty: "Cosmetic & Restorative Dentistry",
    bio: "Dr. Maria Santos specializes in aesthetic smile transformations, porcelain veneers, and complex restorative dental procedures.",
    experience: "12+ Years Experience",
    languages: ["English", "Filipino"],
    isActive: true,
  }

  return (
    <div className="space-y-10 max-w-6xl pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Website Customization</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Customize your public website sections, hero layout, treatment card styles, and live appearance.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. FIRST SECTION (HERO) CUSTOMIZATION                                    */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgb(var(--border))]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                First Section (Hero) Customization
              </h2>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Select hero layout, customize clinical statistics, manage photography, and review the live preview canvas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => handleSaveHeroChanges()}
              size="sm"
              disabled={savingHero}
              className="gap-2 font-semibold shadow-sm text-xs h-9 px-4"
            >
              {savingHero ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Hero Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 2-Part Layout: Left Control Panel + Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Hero Layout Selector & Statistics */}
          <div className="lg:col-span-4 space-y-4">
            {/* Choose Hero Layout */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                  Choose Hero Layout
                </span>
                <span className="text-[10px] text-[rgb(var(--muted-foreground))]">3 Layout Options</span>
              </div>

              <div className="space-y-2">
                {/* 1. Left Option */}
                <button
                  type="button"
                  onClick={() => setImagePosition("left")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    imagePosition === "left"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-9 rounded border border-dashed border-[rgb(var(--border))] overflow-hidden flex shrink-0 bg-[rgb(var(--muted)/0.5)]">
                    <div className="w-1/2 bg-[rgb(var(--primary)/0.4)] border-r border-[rgb(var(--border))]" />
                    <div className="w-1/2 p-0.5 space-y-0.5 flex flex-col justify-center">
                      <div className="h-1 w-full bg-[rgb(var(--muted-foreground)/0.4)] rounded" />
                      <div className="h-1 w-2/3 bg-[rgb(var(--muted-foreground)/0.2)] rounded" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Left</span>
                      {imagePosition === "left" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Image on left, text on right</p>
                  </div>
                </button>

                {/* 2. Right Option */}
                <button
                  type="button"
                  onClick={() => setImagePosition("right")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    imagePosition === "right"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-9 rounded border border-dashed border-[rgb(var(--border))] overflow-hidden flex shrink-0 bg-[rgb(var(--muted)/0.5)]">
                    <div className="w-1/2 p-0.5 space-y-0.5 flex flex-col justify-center">
                      <div className="h-1 w-full bg-[rgb(var(--muted-foreground)/0.4)] rounded" />
                      <div className="h-1 w-2/3 bg-[rgb(var(--muted-foreground)/0.2)] rounded" />
                    </div>
                    <div className="w-1/2 bg-[rgb(var(--primary)/0.4)] border-l border-[rgb(var(--border))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Right</span>
                      {imagePosition === "right" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Image on right, text on left</p>
                  </div>
                </button>

                {/* 3. Center Option */}
                <button
                  type="button"
                  onClick={() => setImagePosition("center")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    imagePosition === "center"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-9 rounded border border-dashed border-[rgb(var(--border))] overflow-hidden relative shrink-0 bg-slate-900 text-white flex flex-col items-center justify-center p-1">
                    <div className="h-1.5 w-3/4 bg-cyan-400 rounded mb-0.5" />
                    <div className="h-1 w-1/2 bg-white/60 rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Center / Full Section</span>
                      {imagePosition === "center" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Full background with overlay</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Editable Statistics */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                Hero Statistics
              </span>

              {/* Stat 1: Satisfied Patients */}
              <div className="space-y-2 p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))]">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  Statistic #1
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-[rgb(var(--muted-foreground))]">Number / Value</Label>
                    <Input
                      value={stat1Value}
                      onChange={e => setStat1Value(e.target.value)}
                      placeholder="500+"
                      className="h-8 text-xs font-bold mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[rgb(var(--muted-foreground))]">Label</Label>
                    <Input
                      value={stat1Label}
                      onChange={e => setStat1Label(e.target.value)}
                      placeholder="Satisfied Patients"
                      className="h-8 text-xs mt-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Stat 2: Certified Dental Specialists */}
              <div className="space-y-2 p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))]">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-cyan-500" />
                  Statistic #2
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-[rgb(var(--muted-foreground))]">Number / Value</Label>
                    <Input
                      value={stat2Value}
                      onChange={e => setStat2Value(e.target.value)}
                      placeholder="12"
                      className="h-8 text-xs font-bold mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[rgb(var(--muted-foreground))]">Label</Label>
                    <Input
                      value={stat2Label}
                      onChange={e => setStat2Label(e.target.value)}
                      placeholder="Certified Specialists"
                      className="h-8 text-xs mt-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Area: Hero Image Management + Live Hero Canvas + Text Copy */}
          <div className="lg:col-span-8 space-y-4">
            {/* Top Image Management Bar */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[var(--radius)] overflow-hidden bg-[rgb(var(--muted))] border border-[rgb(var(--border))] shrink-0 flex items-center justify-center">
                    {imagePreview || image ? (
                      <img src={imagePreview || image} alt="Hero thumbnail" className="object-cover w-full h-full" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-[rgb(var(--muted-foreground))]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[rgb(var(--foreground))]">Active Hero Photography</h3>
                    <p className="text-[11px] text-[rgb(var(--muted-foreground))] truncate max-w-xs sm:max-w-sm">
                      {selectedFile ? `Selected: ${selectedFile.name}` : image || "No image set"}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleHeroFileChange}
                  accept="image/png, image/jpeg, image/webp, image/avif"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Upload className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                    Upload Image
                  </Button>

                  {selectedFile && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleHeroUploadImage}
                      disabled={uploadingImage}
                      className="gap-1.5 text-xs h-8 bg-[rgb(var(--primary))]"
                    >
                      {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Apply Image
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetHeroToDefault}
                    className="gap-1 text-xs h-8 text-[rgb(var(--muted-foreground))]"
                    title="Reset to default hero dental image"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Default
                  </Button>

                  {image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveHeroImage}
                      className="gap-1 text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Remove image"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Framed Live Hero Preview Canvas */}
            <div className="rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-[rgb(var(--muted)/0.5)] border-b border-[rgb(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[rgb(var(--primary))]" />
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">Live Hero Preview Canvas</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)]">
                    Layout: {imagePosition}
                  </Badge>
                </div>
                <span className="text-[10px] text-[rgb(var(--muted-foreground))]">Real-time sync</span>
              </div>

              <div className="p-4 sm:p-6 bg-[rgb(var(--background))] overflow-hidden">
                {imagePosition === "center" ? (
                  <div className="relative rounded-[var(--radius)] overflow-hidden min-h-[360px] flex items-center justify-center p-6 text-center text-white border border-white/10 shadow-lg">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                      style={{ backgroundImage: `url('${imagePreview || image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-950/70 backdrop-blur-[2px]" />
                    <div className="relative z-10 space-y-4 max-w-xl">
                      {showBadge && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 backdrop-blur-md text-[11px] font-medium text-emerald-300 shadow-sm mx-auto">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {badgeText}
                        </div>
                      )}
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                        {heading.split("\n").map((line, i) => (
                          <span key={i} className={i > 0 ? "block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200" : "block"}>
                            {line}
                          </span>
                        ))}
                      </h1>
                      <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                        {subheading}
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Button size="sm" className="gap-1.5 text-xs font-semibold px-4">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Book Appointment
                        </Button>
                      </div>
                      <div className="pt-2 flex items-center justify-center gap-3 text-[10px] text-white/80">
                        {stat1Value && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <strong>{stat1Value}</strong> <span>{stat1Label}</span>
                          </div>
                        )}
                        {stat2Value && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
                            <ShieldCheck className="h-3 w-3 text-cyan-400" />
                            <strong>{stat2Value}</strong> <span>{stat2Label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
                    <div className={`space-y-3 ${imagePosition === "left" ? "md:order-2" : "md:order-1"}`}>
                      {showBadge && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {badgeText}
                        </div>
                      )}
                      <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-[rgb(var(--foreground))]">
                        {heading.split("\n").map((line, i) => (
                          <span key={i} className={i > 0 ? "block text-[rgb(var(--primary))]" : "block"}>
                            {line}
                          </span>
                        ))}
                      </h1>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed line-clamp-3">
                        {subheading}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" className="gap-1.5 text-xs">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Book Appointment
                        </Button>
                      </div>
                      {stat2Value && (
                        <div className="pt-1 flex items-center gap-1.5 text-[10px] text-[rgb(var(--muted-foreground))]">
                          <ShieldCheck className="h-3 w-3 text-[rgb(var(--primary))]" />
                          <span><strong>{stat2Value}</strong> {stat2Label}</span>
                        </div>
                      )}
                    </div>

                    <div className={`relative ${imagePosition === "left" ? "md:order-1" : "md:order-2"}`}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-[rgb(var(--muted))] border border-[rgb(var(--border))] shadow-md">
                        {imagePreview || image ? (
                          <img src={imagePreview || image} alt="Hero" className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[rgb(var(--muted-foreground))] text-xs">
                            No photo set
                          </div>
                        )}
                      </div>
                      {stat1Value && (
                        <div className="absolute -bottom-2 -left-2 bg-[rgb(var(--card))] rounded-[var(--radius)] shadow-lg border border-[rgb(var(--border))] px-3 py-1.5 text-left">
                          <div className="text-sm font-bold text-[rgb(var(--primary))]">{stat1Value}</div>
                          <div className="text-[9px] text-[rgb(var(--muted-foreground))]">{stat1Label}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Text Copy Editor (Placed directly below preview) */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[rgb(var(--border))]">
                <Type className="h-4 w-4 text-[rgb(var(--primary))]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                  Hero Text Copy Editor
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">Main Heading</span>
                  <textarea
                    rows={2}
                    value={heading}
                    onChange={e => setHeading(e.target.value)}
                    placeholder="Enter main hero heading (supports line breaks)..."
                    className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary))]"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">Subheading / Description</span>
                  <textarea
                    rows={2}
                    value={subheading}
                    onChange={e => setSubheading(e.target.value)}
                    placeholder="Enter descriptive subtitle text..."
                    className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary))]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TREATMENT SECTION CUSTOMIZATION (DIRECTLY UNDERNEATH HERO)             */}
      {/* ========================================================================= */}
      <div id="treatments-section" className="space-y-6 pt-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgb(var(--border))]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Treatment Section Customization
              </h2>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Customize how your treatments appear on the public website. Choose between 3 card presentation styles, upload photography, and preview in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddNewTreatment}
              className="gap-1.5 text-xs h-9"
            >
              <Plus className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              Add Treatment
            </Button>

            <Button
              type="button"
              onClick={handleSaveTreatment}
              size="sm"
              disabled={savingTreatment}
              className="gap-2 font-semibold shadow-sm text-xs h-9 px-4"
            >
              {savingTreatment ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Treatment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 2-Part Treatment Customization Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel (lg:col-span-4): Treatments Selector, Style Picker & Price/Duration */}
          <div className="lg:col-span-4 space-y-4">
            {/* Treatment Selector & Order List */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                  Select Treatment to Customize
                </span>
                <span className="text-[10px] text-[rgb(var(--muted-foreground))]">{services.length} Total</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 divide-y divide-[rgb(var(--border))]">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className={`pt-1.5 pb-1.5 px-2 rounded-[var(--radius)] flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      selectedTreatmentId === service.id && !isCreatingNewTreatment
                        ? "bg-[rgb(var(--primary)/0.1)] border border-[rgb(var(--primary)/0.3)]"
                        : "hover:bg-[rgb(var(--muted)/0.5)]"
                    }`}
                    onClick={() => handleSelectTreatment(service)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[rgb(var(--foreground))] truncate">{service.name}</p>
                      <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">
                        {business.currencySymbol}{service.price} · {service.durationMinutes} mins
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => handleMoveTreatmentOrder(index, "up")}
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === services.length - 1}
                        onClick={() => handleMoveTreatmentOrder(index, "down")}
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteTreatment(service)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Choose Global Treatment Card Presentation Style */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))] block">
                    Global Card Presentation Style
                  </span>
                  <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
                    Applies universally to Homepage, All Treatments catalog, and previews
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.1)] px-2 py-0.5 rounded-full">
                  Global Setting
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {/* Style 1: Default (Classic Clean) */}
                <button
                  type="button"
                  onClick={() => handleSelectGlobalCardStyle("default")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    treatmentCardStyle === "default"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-9 rounded border border-dashed border-[rgb(var(--border))] p-1 flex flex-col justify-center gap-0.5 bg-[rgb(var(--muted)/0.4)] shrink-0">
                    <div className="h-1 w-3/4 bg-[rgb(var(--primary)/0.6)] rounded" />
                    <div className="h-0.5 w-full bg-[rgb(var(--muted-foreground)/0.3)] rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Style 1 — Default</span>
                      {treatmentCardStyle === "default" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Clean card without image (Default)</p>
                  </div>
                </button>

                {/* Style 2: Image Treatment Card */}
                <button
                  type="button"
                  onClick={() => handleSelectGlobalCardStyle("image_card")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    treatmentCardStyle === "image_card"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-9 rounded border border-dashed border-[rgb(var(--border))] overflow-hidden flex flex-col bg-[rgb(var(--muted)/0.4)] shrink-0">
                    <div className="h-4 bg-[rgb(var(--primary)/0.3)] border-b border-[rgb(var(--border))]" />
                    <div className="p-0.5">
                      <div className="h-0.5 w-3/4 bg-[rgb(var(--primary)/0.6)] rounded" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Style 2 — Image Card</span>
                      {treatmentCardStyle === "image_card" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Top clinical photography header</p>
                  </div>
                </button>

                {/* Style 3: Blurred Image Reveal */}
                <button
                  type="button"
                  onClick={() => handleSelectGlobalCardStyle("overlay")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    treatmentCardStyle === "overlay" || treatmentCardStyle === "blurred-image-reveal" || treatmentCardStyle === "blurred_reveal"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-9 rounded border border-dashed border-[rgb(var(--border))] p-1 flex flex-col justify-end gap-0.5 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-800/40 text-white shrink-0 overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="h-1 w-3/4 bg-cyan-400 rounded mb-0.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Style 3 — Frosted Glass Reveal</span>
                      {(treatmentCardStyle === "overlay" || treatmentCardStyle === "blurred-image-reveal" || treatmentCardStyle === "blurred_reveal") && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      )}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Clear photo + frosted lower overlay reveal on hover</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Price & Duration */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                Pricing & Duration
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-[rgb(var(--muted-foreground))]">Price ({business.currencySymbol})</Label>
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={treatmentPrice}
                    onChange={e => setTreatmentPrice(Number(e.target.value))}
                    className="h-8 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-[rgb(var(--muted-foreground))]">Duration (Mins)</Label>
                  <Input
                    type="number"
                    min="5"
                    step="5"
                    value={treatmentDuration}
                    onChange={e => setTreatmentDuration(Number(e.target.value))}
                    className="h-8 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel (lg:col-span-8): Image Uploader + Framed Live Preview + Text Editor */}
          <div className="lg:col-span-8 space-y-4">
            {/* Treatment Image Management */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
              <TreatmentImageManager
                images={treatmentImages}
                onChange={setTreatmentImages}
              />
            </div>

            {/* Framed Live Treatment Card Preview Canvas */}
            <div className="rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-[rgb(var(--muted)/0.5)] border-b border-[rgb(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[rgb(var(--primary))]" />
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">Live Treatment Card Preview</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)]">
                    Style: {treatmentCardStyle === "overlay" || treatmentCardStyle === "blurred-image-reveal" || treatmentCardStyle === "blurred_reveal" ? "Blurred Image Reveal" : treatmentCardStyle === "image_card" ? "Image Card" : "Default"}
                  </Badge>
                </div>
                <span className="text-[10px] text-[rgb(var(--muted-foreground))]">Real-time sync</span>
              </div>

              <div className="p-6 sm:p-8 bg-[rgb(var(--background))] flex justify-center items-center min-h-[300px]">
                <div className="w-full max-w-sm">
                  <TreatmentCard
                    service={livePreviewTreatment}
                    currencySymbol={business.currencySymbol}
                    globalCardStyle={treatmentCardStyle}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>

            {/* Treatment Name & Description Editor (Placed directly below preview) */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[rgb(var(--border))]">
                <Type className="h-4 w-4 text-[rgb(var(--primary))]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                  Treatment Details Editor
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">Treatment Name *</span>
                  <Input
                    value={treatmentName}
                    onChange={e => setTreatmentName(e.target.value)}
                    placeholder="e.g. Teeth Whitening"
                    className="text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">Description</span>
                  <textarea
                    rows={3}
                    value={treatmentShortDesc}
                    onChange={e => setTreatmentShortDesc(e.target.value)}
                    placeholder="Enter short description highlighting treatment procedure & benefits..."
                    className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary))]"
                  />
                </div>
              </div>
            </div>

            {/* Treatment Bottom Action Bar */}
            <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="text-xs text-[rgb(var(--muted-foreground))]">
                <span className="text-green-600 font-medium flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Ready to publish treatment changes live to the public website.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleSaveTreatment}
                  size="default"
                  disabled={savingTreatment}
                  className="gap-2 px-6 font-semibold shadow-sm"
                >
                  {savingTreatment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Treatment...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Treatment Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DENTIST / STAFF SECTION CUSTOMIZATION                                  */}
      {/* ========================================================================= */}
      <div id="dentists-section" className="space-y-6 pt-4 border-t border-[rgb(var(--border))]">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgb(var(--border))]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Dentist Card Presentation Style
              </h2>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Choose how your dental team appears on the public homepage. Choose between 4 distinct styles with live preview using real database profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.location.assign("/admin/staff")}
              className="gap-1.5 text-xs h-9"
            >
              <Briefcase className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              Manage Doctor Accounts
            </Button>
          </div>
        </div>

        {/* 2-Part Dentist Customization Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel (lg:col-span-4): Doctor Selector & Style Picker */}
          <div className="lg:col-span-4 space-y-4">
            {/* Choose Global Dentist Card Presentation Style */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))] block">
                    Global Card Presentation Style
                  </span>
                  <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
                    Applies universally to all dentist cards on the Homepage
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.1)] px-2 py-0.5 rounded-full">
                  Global Setting
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {/* Style 1: Clinical */}
                <button
                  type="button"
                  onClick={() => handleSelectPendingDentistCardStyle("clinical")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    dentistCardStyle === "clinical"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-10 rounded border border-dashed border-[rgb(var(--border))] p-1 flex flex-col justify-between bg-[rgb(var(--muted)/0.4)] shrink-0 overflow-hidden">
                    <div className="h-4 bg-[rgb(var(--primary)/0.3)] rounded-t" />
                    <div className="space-y-0.5">
                      <div className="h-1 w-3/4 bg-[rgb(var(--primary)/0.6)] rounded" />
                      <div className="h-0.5 w-1/2 bg-[rgb(var(--muted-foreground)/0.3)] rounded" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Style 1 — Clinical</span>
                      {dentistCardStyle === "clinical" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Clean professional medical profile card</p>
                  </div>
                </button>

                {/* Style 2: Editorial */}
                <button
                  type="button"
                  onClick={() => handleSelectPendingDentistCardStyle("editorial")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    dentistCardStyle === "editorial"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-10 rounded border border-dashed border-[rgb(var(--border))] p-1 flex flex-col justify-between bg-slate-900 text-white shrink-0 overflow-hidden relative">
                    <div className="h-1 w-1/2 bg-amber-400 rounded" />
                    <div className="space-y-0.5">
                      <div className="h-1 w-3/4 bg-cyan-300 rounded" />
                      <div className="h-0.5 w-full bg-white/40 rounded" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Style 2 — Editorial</span>
                      {dentistCardStyle === "editorial" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Premium luxury editorial layout</p>
                  </div>
                </button>

                {/* Style 3: Profile Overlay */}
                <button
                  type="button"
                  onClick={() => handleSelectPendingDentistCardStyle("overlay")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    dentistCardStyle === "overlay"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-10 rounded border border-dashed border-[rgb(var(--border))] p-1 flex flex-col justify-end gap-0.5 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-800/40 text-white shrink-0 overflow-hidden relative">
                    <div className="relative z-10 space-y-0.5">
                      <div className="h-1 w-3/4 bg-cyan-400 rounded" />
                      <div className="h-0.5 w-1/2 bg-white/60 rounded" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Style 3 — Profile Overlay</span>
                      {dentistCardStyle === "overlay" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Cinematic image-focused card with frosted overlay</p>
                  </div>
                </button>

                {/* Style 4: Minimal */}
                <button
                  type="button"
                  onClick={() => handleSelectPendingDentistCardStyle("minimal")}
                  className={`w-full p-2.5 rounded-[var(--radius)] border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    dentistCardStyle === "minimal"
                      ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.25)] bg-[rgb(var(--primary)/0.05)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary)/0.4)]"
                  }`}
                >
                  <div className="w-12 h-10 rounded border border-dashed border-[rgb(var(--border))] p-1.5 flex items-center gap-1 bg-[rgb(var(--muted)/0.3)] shrink-0 overflow-hidden">
                    <div className="h-6 w-6 rounded bg-[rgb(var(--primary)/0.4)] shrink-0" />
                    <div className="space-y-0.5 flex-1">
                      <div className="h-1 w-full bg-[rgb(var(--primary)/0.7)] rounded" />
                      <div className="h-0.5 w-3/4 bg-[rgb(var(--muted-foreground)/0.4)] rounded" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[rgb(var(--foreground))]">Style 4 — Minimal</span>
                      {dentistCardStyle === "minimal" && <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />}
                    </div>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">Simple refined healthcare directory style</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Doctor Profile Selector for Preview */}
            <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                  Select Doctor to Preview
                </span>
                <span className="text-[10px] text-[rgb(var(--muted-foreground))]">{staffList.length} In Database</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 divide-y divide-[rgb(var(--border))]">
                {staffList.map((doctor) => {
                  const docPhoto = doctor.photo || (doctor.images && doctor.images.length > 0 ? doctor.images[0] : null)
                  const isSelected = selectedDentistId === doctor.id

                  return (
                    <div
                      key={doctor.id}
                      className={`pt-1.5 pb-1.5 px-2 rounded-[var(--radius)] flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[rgb(var(--primary)/0.1)] border border-[rgb(var(--primary)/0.3)]"
                          : "hover:bg-[rgb(var(--muted)/0.5)]"
                      }`}
                      onClick={() => setSelectedDentistId(doctor.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-full overflow-hidden bg-[rgb(var(--muted))] border border-[rgb(var(--border))] shrink-0">
                          {docPhoto ? (
                            <img src={docPhoto} alt={doctor.name} className="object-cover w-full h-full" />
                          ) : (
                            <Stethoscope className="h-3.5 w-3.5 text-[rgb(var(--primary))] m-auto mt-1.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[rgb(var(--foreground))] truncate">{doctor.name}</p>
                          <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate">
                            {doctor.specialty || "Dental Specialist"}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-bold text-[rgb(var(--primary))] shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Panel (lg:col-span-8): Framed Live Preview Canvas & Explicit Action Bar */}
          <div className="lg:col-span-8 space-y-4">
            {/* Framed Live Dentist Card Preview Canvas */}
            <div className="rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-[rgb(var(--muted)/0.5)] border-b border-[rgb(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[rgb(var(--primary))]" />
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">Live Dentist Card Preview</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.08)]">
                    Style: {dentistCardStyle === "editorial" ? "Editorial" : dentistCardStyle === "overlay" ? "Profile Overlay" : dentistCardStyle === "minimal" ? "Minimal" : "Clinical"}
                  </Badge>
                </div>

                {hasUnsavedDentistCardStyle ? (
                  <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 text-[10px] font-semibold animate-pulse">
                    Unsaved Preview
                  </Badge>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Saved Live
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-8 bg-[rgb(var(--background))] flex justify-center items-center min-h-[340px]">
                <div className="w-full max-w-sm">
                  <DentistCard
                    dentist={livePreviewDentist}
                    cardStyle={dentistCardStyle}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>

            {/* Explicit Action Bar: Save / Cancel / Status */}
            <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="text-xs text-[rgb(var(--muted-foreground))] space-y-0.5">
                {hasUnsavedDentistCardStyle ? (
                  <p className="font-semibold text-amber-600 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    You have unsaved changes. Click Save Changes to publish style to public website.
                  </p>
                ) : (
                  <p className="font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Current card presentation is saved and active on public homepage.
                  </p>
                )}
                <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                  Previewing with: {livePreviewDentist.name} • Saved in database: {savedDentistCardStyle.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDentistCardStyle}
                  disabled={!hasUnsavedDentistCardStyle || savingDentistStyle}
                  className="gap-1.5 text-xs h-9"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveDentistCardStyle}
                  disabled={!hasUnsavedDentistCardStyle || savingDentistStyle}
                  className="gap-1.5 text-xs h-9 font-semibold px-4 shadow-sm"
                >
                  {savingDentistStyle ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. NAVBAR NAVIGATION & SECTION ORDER OVERVIEW                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[rgb(var(--border))]">
        {/* Navigation Items */}
        <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
            <Globe className="h-5 w-5 text-[rgb(var(--primary))]" />
            Navbar Navigation
          </h2>
          <div className="divide-y divide-[rgb(var(--border))]">
            {navItems.map((item: any) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[rgb(var(--foreground))]">{item.label}</span>
                  <span className="text-[rgb(var(--muted-foreground))] ml-2 font-mono">{item.href}</span>
                </div>
                <Badge variant={item.isActive ? "default" : "outline"} className="text-[10px]">
                  {item.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
            <Layers className="h-5 w-5 text-[rgb(var(--primary))]" />
            Page Section Order
          </h2>
          <div className="divide-y divide-[rgb(var(--border))]">
            {sections.map((s: any) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[rgb(var(--foreground))]">{s.type}</span>
                  <span className="text-[rgb(var(--muted-foreground))] ml-2">Position #{s.order + 1}</span>
                </div>
                <Badge variant={s.isEnabled ? "default" : "outline"} className="text-[10px]">
                  {s.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
