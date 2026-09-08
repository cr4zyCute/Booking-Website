import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useBusiness } from "@/context/BusinessContext"
import {
  User,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Save,
  Loader2,
  Lock,
  Sparkles,
  Award,
  Stethoscope,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Edit3,
  RotateCcw,
  GraduationCap,
  CalendarDays,
  Clock,
  Key,
  CalendarCheck,
  Info,
  Check,
  AlertCircle,
  Power,
  Bell,
  CheckCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { formatCurrency } from "@/lib/utils"

export function DoctorProfilePage() {
  const { user } = useAuth()
  const { business, terminology } = useBusiness()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingAvailability, setTogglingAvailability] = useState(false)
  const [showAvailabilityConfirm, setShowAvailabilityConfirm] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Notification Preferences State
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [prefForm, setPrefForm] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    notifyNewAppointment: true,
    notifyCancellation: true,
    notifyReschedule: true,
    notifyClinicAnnouncements: true,
    professionalEmail: "",
    emailVerified: true,
  })

  // Doctor Profile Data
  const [staff, setStaff] = useState<any>(null)
  const [form, setForm] = useState({
    photo: "",
    images: [] as string[],
    bio: "",
    biography: "",
    languages: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const currencySymbol = business?.currencySymbol || "₱"
  const staffLabel = terminology?.staffLabel || "Dentists"

  // Fetch Doctor Profile
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/doctor/profile", {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.staff) {
          setStaff(data.staff)
          resetFormWithData(data.staff)
          setPrefForm({
            emailNotifications: data.staff.emailNotifications !== false,
            inAppNotifications: data.staff.inAppNotifications !== false,
            notifyNewAppointment: data.staff.notifyNewAppointment !== false,
            notifyCancellation: data.staff.notifyCancellation !== false,
            notifyReschedule: data.staff.notifyReschedule !== false,
            notifyClinicAnnouncements: data.staff.notifyClinicAnnouncements !== false,
            professionalEmail: data.staff.email || "",
            emailVerified: data.staff.emailVerified !== false,
          })
        }
      } else {
        toast.error("Failed to load doctor profile")
      }
    } catch (e) {
      console.error("Fetch doctor profile error:", e)
      toast.error("Network error while loading profile")
    } finally {
      setLoading(false)
    }
  }

  const resetFormWithData = (staffData: any) => {
    setForm({
      photo: staffData.photo || (staffData.images && staffData.images.length > 0 ? staffData.images[0] : ""),
      images: staffData.images || [],
      bio: staffData.bio || "",
      biography: staffData.biography || staffData.bio || "",
      languages: Array.isArray(staffData.languages)
        ? staffData.languages.join(", ")
        : (staffData.languages || "English, Filipino"),
      phone: staffData.phone || "",
      email: staffData.email || "",
      password: "",
      confirmPassword: "",
    })
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Direct Appointment Availability Toggle (Independent of Edit Profile)
  const handleToggleAvailability = async (targetValue?: boolean) => {
    const nextValue = targetValue !== undefined ? targetValue : (staff?.acceptingAppointments === false)
    setTogglingAvailability(true)
    setShowAvailabilityConfirm(false)

    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({
          acceptingAppointments: nextValue,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.staff) {
          setStaff(data.staff)
        } else {
          setStaff((prev: any) => ({ ...prev, acceptingAppointments: nextValue }))
        }
        toast.success("✓ Appointment availability updated.")
      } else {
        const errData = await res.json()
        toast.error(errData.error || "Failed to update availability")
      }
    } catch (e) {
      console.error("Toggle availability error:", e)
      toast.error("Network error while updating availability")
    } finally {
      setTogglingAvailability(false)
    }
  }

  // Handle Photo Upload
  const handleUploadPhoto = async (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    setUploadingPhoto(true)

    try {
      const res = await fetch("/api/doctor/upload", {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setForm(f => ({
          ...f,
          photo: data.imageUrl,
          images: f.images.includes(data.imageUrl) ? f.images : [data.imageUrl, ...f.images],
        }))
        toast.success("Portrait photo uploaded!")
      } else {
        toast.error("Failed to upload photo")
      }
    } catch (e) {
      console.error("Upload error:", e)
      toast.error("Network error during photo upload")
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Handle Gallery Upload
  const handleUploadGallery = async (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    setUploadingGallery(true)

    try {
      const res = await fetch("/api/doctor/upload", {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setForm(f => ({
          ...f,
          images: [...f.images, data.imageUrl],
        }))
        toast.success("Gallery photo added!")
      } else {
        toast.error("Failed to upload gallery image")
      }
    } catch (e) {
      console.error("Gallery upload error:", e)
      toast.error("Network error during image upload")
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, idx) => idx !== idxToRemove),
    }))
  }

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    if (staff) {
      resetFormWithData(staff)
    }
    setIsEditing(false)
    toast.info("Profile edits discarded.")
  }

  // Save Doctor Profile Info (Calls PATCH /api/doctor/profile)
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (form.password && form.password !== form.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (form.password && form.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({
          photo: form.photo || null,
          images: form.images,
          bio: form.bio,
          biography: form.biography,
          languages: form.languages.split(",").map(s => s.trim()).filter(Boolean),
          phone: form.phone || null,
          email: form.email || null,
          password: form.password ? form.password : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.staff) {
          setStaff(data.staff)
          resetFormWithData(data.staff)
          setPrefForm(p => ({
            ...p,
            professionalEmail: data.staff.email || "",
            emailVerified: data.staff.emailVerified !== false,
          }))
        }
        setIsEditing(false)
        toast.success("✓ Profile updated successfully! Public page synchronized.")
      } else {
        const errData = await res.json()
        toast.error(errData.error || "Failed to update profile")
      }
    } catch (e) {
      console.error("Save profile error:", e)
      toast.error("Network error while saving profile")
    } finally {
      setSaving(false)
    }
  }

  // Save Notification Preferences
  const handleSavePreferences = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSavingPrefs(true)

    try {
      const res = await fetch("/api/doctor/notification-preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({
          emailNotifications: prefForm.emailNotifications,
          inAppNotifications: prefForm.inAppNotifications,
          notifyNewAppointment: prefForm.notifyNewAppointment,
          notifyCancellation: prefForm.notifyCancellation,
          notifyReschedule: prefForm.notifyReschedule,
          notifyClinicAnnouncements: prefForm.notifyClinicAnnouncements,
          professionalEmail: prefForm.professionalEmail,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.preferences) {
          setPrefForm(data.preferences)
          if (staff) {
            setStaff((prev: any) => ({
              ...prev,
              email: data.preferences.professionalEmail,
              emailVerified: data.preferences.emailVerified,
            }))
          }
        }
        toast.success(data.message || "✓ Notification preferences saved.")
      } else {
        toast.error("Failed to update notification preferences")
      }
    } catch (e) {
      console.error("Save preferences error:", e)
      toast.error("Network error while saving preferences")
    } finally {
      setSavingPrefs(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[rgb(var(--background))]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
        <p className="text-xs text-[rgb(var(--muted-foreground))]">Loading your clinical profile...</p>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))] mx-auto">
          <Stethoscope className="h-8 w-8 text-[rgb(var(--primary))] opacity-40" />
        </div>
        <h2 className="text-xl font-bold">Doctor Profile Not Found</h2>
        <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-md mx-auto">
          Unable to locate your assigned dentist profile. Please contact the clinic administrator.
        </p>
      </div>
    )
  }

  // Display Fields
  const isAccepting = staff.acceptingAppointments !== false
  const doctorPhoto = form.photo || staff.photo || (staff.images && staff.images.length > 0 ? staff.images[0] : null)
  const roleTitle = staff.role || "Dental Specialist"
  const primarySpecialty = staff.specialty || "General Dentistry"
  const bioText = isEditing ? form.biography : (staff.biography || staff.bio || "Dedicated dental specialist providing personalized, gentle care.")
  const shortBioText = isEditing ? form.bio : staff.bio
  const specialtiesList: string[] = staff.specialties && staff.specialties.length > 0
    ? staff.specialties
    : (staff.specialty ? [staff.specialty] : ["General Dentistry"])
  const servicesList = staff.services?.map((s: any) => s.service).filter(Boolean) || []
  const credentialsList: string[] = staff.credentials && staff.credentials.length > 0 ? staff.credentials : []
  const educationList: string[] = staff.education && staff.education.length > 0 ? staff.education : []
  const languagesList: string[] = form.languages
    ? form.languages.split(",").map(l => l.trim()).filter(Boolean)
    : (staff.languages && staff.languages.length > 0 ? staff.languages : ["English", "Filipino"])

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const schedulesList = staff.schedules || []
  const publicProfileUrl = `/dentists/${staff.slug || staff.id}`

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP CONTROL BAR (View Mode vs Edit Mode Header)                        */}
      {/* ========================================================================= */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--primary))]">
                Doctor Profile
              </span>

              {/* Live Status indicator */}
              <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-300 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Live on Public Website
              </Badge>

              {/* Availability Badge */}
              {isAccepting ? (
                <Badge className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                  🟢 Accepting Appointments
                </Badge>
              ) : (
                <Badge className="text-[10px] font-semibold bg-red-500/15 text-red-700 dark:text-red-300 border-red-300">
                  🔴 Not Accepting Appointments
                </Badge>
              )}

              {isEditing && (
                <Badge className="text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300">
                  Editing Profile Info
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))] tracking-tight">
              {staff.name}
            </h1>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              {roleTitle} · {primarySpecialty}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {!isEditing ? (
              <>
                <Link
                  to={publicProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Live Public Page
                  </Button>
                </Link>

                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 text-xs h-9 font-semibold px-4 shadow-sm"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="gap-1.5 text-xs h-9"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Cancel
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="gap-1.5 text-xs h-9 font-semibold px-5 shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED APPOINTMENT AVAILABILITY CONTROL BAR (Independent from Edit) */}
      {/* ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-[var(--radius)] border transition-all ${
        isAccepting
          ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20"
          : "bg-red-500/10 border-red-500/30 dark:bg-red-950/20"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              isAccepting ? "bg-emerald-500 text-white shadow-sm" : "bg-red-500 text-white shadow-sm"
            }`}>
              {isAccepting ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--foreground))]">
                  Appointment Availability
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAccepting ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                }`}>
                  {isAccepting ? "🟢 Accepting Appointments" : "🔴 Not Accepting Appointments"}
                </span>
              </div>

              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                {isAccepting
                  ? "Patients can currently book new appointments with you on the website."
                  : "New patients cannot book appointments with you right now. Existing bookings & notifications remain active."}
              </p>
            </div>
          </div>

          {/* Direct Action Button */}
          <div className="shrink-0 flex items-center gap-2">
            {isAccepting ? (
              <Button
                size="sm"
                variant="outline"
                disabled={togglingAvailability}
                onClick={() => setShowAvailabilityConfirm(true)}
                className="border-red-300 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold h-9 px-4 cursor-pointer gap-1.5 shadow-2xs"
              >
                {togglingAvailability ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Power className="h-3.5 w-3.5 text-red-500" />
                )}
                Turn Off Availability
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={togglingAvailability}
                onClick={() => handleToggleAvailability(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 px-4 cursor-pointer gap-1.5 shadow-xs"
              >
                {togglingAvailability ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Turn On Availability
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal when turning off availability */}
      {showAvailabilityConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-[var(--radius)] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[rgb(var(--foreground))]">Pause New Appointments?</h3>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Turn off online appointment availability</p>
              </div>
            </div>

            <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
              Patients visiting your profile or booking treatments will not be able to schedule new appointments with you. You can turn availability back on at any time with a single click.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgb(var(--border))]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvailabilityConfirm(false)}
                disabled={togglingAvailability}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleToggleAvailability(false)}
                disabled={togglingAvailability}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold h-9 px-4 gap-1.5"
              >
                {togglingAvailability ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Turn Off Availability
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SAME PUBLIC PROFILE CANVAS (With Inline Edit Controls when Editing)     */}
      {/* ========================================================================= */}
      <div className="space-y-8">
        {/* HERO PROFILE CARD */}
        <div className="bg-[rgb(var(--card))] rounded-[calc(var(--radius)+4px)] border border-[rgb(var(--border))] p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Portrait & Contact Info */}
            <div className="lg:col-span-4 space-y-4">
              <div className="aspect-[4/5] rounded-[var(--radius)] overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--muted))] relative shadow-sm group">
                {doctorPhoto ? (
                  <img
                    src={doctorPhoto}
                    alt={staff.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--muted-foreground))] bg-gradient-to-br from-[rgb(var(--muted)/0.4)] to-[rgb(var(--muted))] p-6 text-center">
                    <User className="h-20 w-20 mb-2 opacity-30 text-[rgb(var(--primary))]" />
                    <span className="text-xs font-medium">{staff.name}</span>
                  </div>
                )}

                {/* Verified Specialist Badge */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                    Verified Specialist
                  </span>
                </div>

                {/* Edit Photo Overlay */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2 opacity-90 hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadPhoto(e.target.files[0])
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5 text-xs font-semibold pointer-events-none bg-white text-slate-900 hover:bg-white/90 shadow-md"
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Change Photo
                          </>
                        )}
                      </Button>
                    </label>
                    <p className="text-[10px] text-white/80">JPG or PNG (max 10MB)</p>
                  </div>
                )}
              </div>

              {/* Quick Contact Box */}
              <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.2)] text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[rgb(var(--border))]">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                    Professional Contact
                  </span>
                  {isEditing && (
                    <span className="text-[10px] text-amber-600 font-medium">Doctor Editable</span>
                  )}
                </div>

                {/* Professional Notification / Contact Email */}
                {isEditing ? (
                  <div className="space-y-1">
                    <Label htmlFor="doctor-email" className="text-[11px] font-medium text-[rgb(var(--foreground))] flex items-center justify-between">
                      <span>Professional Email</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Receives Notifications</span>
                    </Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      placeholder="doctor@veridian.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="h-8 text-xs bg-[rgb(var(--background))]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[rgb(var(--muted-foreground))]">Notification Email</span>
                      {staff.emailVerified !== false ? (
                        <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> Verified
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-[rgb(var(--foreground))] font-medium">
                      <Mail className="h-3.5 w-3.5 text-[rgb(var(--primary))] shrink-0" />
                      <span className="truncate">{staff.email || "No professional email set"}</span>
                    </div>
                  </div>
                )}

                {/* Login Account Reference (Read-only security badge) */}
                <div className="pt-1.5 border-t border-[rgb(var(--border)/0.6)] space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-[rgb(var(--muted-foreground))]">
                    <span>Portal Login Account</span>
                    <span className="font-mono text-[9px] bg-[rgb(var(--muted))] px-1.5 rounded">Private</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[rgb(var(--muted-foreground))] truncate">
                    <Key className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{user?.email || "doctor@veridian.com"}</span>
                  </div>
                </div>

                {/* Phone */}
                {isEditing ? (
                  <div className="space-y-1 pt-1 border-t border-[rgb(var(--border)/0.6)]">
                    <Label htmlFor="doctor-phone" className="text-[11px] font-medium text-[rgb(var(--foreground))]">
                      Direct Contact Phone
                    </Label>
                    <Input
                      id="doctor-phone"
                      placeholder="+63 912 345 6789"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="h-8 text-xs bg-[rgb(var(--background))]"
                    />
                  </div>
                ) : (
                  staff.phone && (
                    <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))] pt-1 border-t border-[rgb(var(--border)/0.6)]">
                      <Phone className="h-3.5 w-3.5 text-[rgb(var(--primary))] shrink-0" />
                      <span>{staff.phone}</span>
                    </div>
                  )
                )}
              </div>

              {/* Gallery Manager (In Edit Mode) */}
              {isEditing && (
                <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[rgb(var(--foreground))] flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      Gallery Photography ({form.images.length})
                    </span>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadGallery(e.target.files[0])
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] gap-1 pointer-events-none"
                        disabled={uploadingGallery}
                      >
                        {uploadingGallery ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        + Add Image
                      </Button>
                    </label>
                  </div>

                  {form.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                      {form.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-[rgb(var(--border))] group/img">
                          <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[rgb(var(--muted-foreground))] italic">No additional gallery photos added.</p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Full Header Details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                    {roleTitle}
                  </Badge>
                  <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium">
                    {business.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-[rgb(var(--muted-foreground))] border-[rgb(var(--border))]">
                    <Lock className="h-2.5 w-2.5 mr-1 text-[rgb(var(--primary))]" />
                    Managed by clinic administrator
                  </Badge>
                </div>

                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[rgb(var(--foreground))] tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {staff.name}
                </h2>

                <p className="text-base sm:text-lg font-semibold text-[rgb(var(--primary))] flex items-center gap-2">
                  {primarySpecialty}
                  <span className="text-[10px] font-normal text-[rgb(var(--muted-foreground))] border border-[rgb(var(--border))] px-2 py-0.5 rounded-full">
                    Admin Verified
                  </span>
                </p>
              </div>

              {/* Quick Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Experience</span>
                  <div className="text-sm font-bold text-[rgb(var(--foreground))]">{staff.experience || "10+ Years"}</div>
                  <span className="text-[9px] text-[rgb(var(--muted-foreground))] block">Verified</span>
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Primary Field</span>
                  <div className="text-sm font-bold text-[rgb(var(--foreground))] truncate">{primarySpecialty}</div>
                  <span className="text-[9px] text-[rgb(var(--muted-foreground))] block">Verified</span>
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Languages</span>
                  <div className="text-sm font-bold text-[rgb(var(--foreground))] truncate">
                    {languagesList.slice(0, 2).join(", ")}
                  </div>
                  {isEditing && (
                    <span className="text-[9px] text-amber-600 font-medium block">Editable below</span>
                  )}
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[rgb(var(--muted)/0.3)] border border-[rgb(var(--border))] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[rgb(var(--muted-foreground))] tracking-wider">Availability</span>
                  {isAccepting ? (
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Accepting
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Not Accepting
                    </div>
                  )}
                  <span className="text-[9px] text-[rgb(var(--muted-foreground))] block">Doctor Controlled</span>
                </div>
              </div>

              {/* Spoken Languages Input (In Edit Mode) */}
              {isEditing && (
                <div className="p-4 rounded-[var(--radius)] border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="doctor-languages" className="text-xs font-bold text-[rgb(var(--foreground))] flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      Spoken Languages (Comma-separated)
                    </Label>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">Doctor Editable</span>
                  </div>
                  <Input
                    id="doctor-languages"
                    placeholder="English, Filipino, Spanish, Mandarin"
                    value={form.languages}
                    onChange={e => setForm(f => ({ ...f, languages: e.target.value }))}
                    className="h-9 text-xs bg-[rgb(var(--background))]"
                  />
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {!isEditing ? (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="secondary"
                      className={`w-full sm:w-auto gap-2 px-8 font-bold text-sm h-12 pointer-events-none opacity-90 ${
                        isAccepting
                          ? "bg-[rgb(var(--primary)/0.15)] text-[rgb(var(--primary))]"
                          : "bg-red-500/10 text-red-700 dark:text-red-400"
                      }`}
                    >
                      <CalendarDays className="h-4 w-4" />
                      {isAccepting
                        ? "Public Patient Booking Button (Preview)"
                        : "Currently Not Accepting Appointments (Preview)"}
                    </Button>

                    <a
                      href="#schedule"
                      className="text-xs font-semibold text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                    >
                      View Weekly Hours ↓
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      size="lg"
                      onClick={() => handleSave()}
                      disabled={saving}
                      className="w-full sm:w-auto gap-2 px-8 font-bold text-sm h-12 shadow-lg shadow-[rgb(var(--primary)/0.25)]"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Profile Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DOCTOR NOTIFICATION PREFERENCES SECTION                                */}
        {/* ========================================================================= */}
        <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgb(var(--border))] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">
                  Doctor Notification Preferences
                </h3>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Manage how you receive alerts for new bookings, cancellations, and clinical updates.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleSavePreferences()}
              disabled={savingPrefs}
              className="text-xs font-semibold h-9 px-4 gap-1.5 shrink-0"
            >
              {savingPrefs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Notification Preferences
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Notifications Settings */}
            <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.15)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[rgb(var(--border))]">
                <span className="font-bold text-xs uppercase tracking-wider text-[rgb(var(--foreground))] flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-[rgb(var(--primary))]" />
                  Email Notifications
                </span>
                <Badge variant={prefForm.emailNotifications ? "default" : "secondary"} className="text-[10px]">
                  {prefForm.emailNotifications ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              {/* Master Email Switch */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefForm.emailNotifications}
                  onChange={e => setPrefForm(p => ({ ...p, emailNotifications: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded text-[rgb(var(--primary))] border-[rgb(var(--border))] focus:ring-[rgb(var(--primary)/0.3)] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[rgb(var(--foreground))] block">
                    Receive Email Notifications
                  </span>
                  <span className="text-[11px] text-[rgb(var(--muted-foreground))]">
                    Dispatched to your verified professional address ({prefForm.professionalEmail || staff.email || "no email set"}).
                  </span>
                </div>
              </label>

              {/* Sub-options */}
              <div className={`space-y-3 pl-6 pt-2 border-t border-[rgb(var(--border)/0.6)] ${!prefForm.emailNotifications ? "opacity-40 pointer-events-none" : ""}`}>
                <label className="flex items-center gap-2.5 text-xs text-[rgb(var(--foreground))] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prefForm.notifyNewAppointment}
                    onChange={e => setPrefForm(p => ({ ...p, notifyNewAppointment: e.target.checked }))}
                    className="h-3.5 w-3.5 rounded text-[rgb(var(--primary))] border-[rgb(var(--border))] cursor-pointer"
                  />
                  <span>New patient bookings</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[rgb(var(--foreground))] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prefForm.notifyCancellation}
                    onChange={e => setPrefForm(p => ({ ...p, notifyCancellation: e.target.checked }))}
                    className="h-3.5 w-3.5 rounded text-[rgb(var(--primary))] border-[rgb(var(--border))] cursor-pointer"
                  />
                  <span>Appointment cancellations</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[rgb(var(--foreground))] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prefForm.notifyReschedule}
                    onChange={e => setPrefForm(p => ({ ...p, notifyReschedule: e.target.checked }))}
                    className="h-3.5 w-3.5 rounded text-[rgb(var(--primary))] border-[rgb(var(--border))] cursor-pointer"
                  />
                  <span>Appointment rescheduling & time slot shifts</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[rgb(var(--foreground))] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prefForm.notifyClinicAnnouncements}
                    onChange={e => setPrefForm(p => ({ ...p, notifyClinicAnnouncements: e.target.checked }))}
                    className="h-3.5 w-3.5 rounded text-[rgb(var(--primary))] border-[rgb(var(--border))] cursor-pointer"
                  />
                  <span>Important clinic & administrative announcements</span>
                </label>
              </div>
            </div>

            {/* In-App Notifications Settings */}
            <div className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.15)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[rgb(var(--border))]">
                <span className="font-bold text-xs uppercase tracking-wider text-[rgb(var(--foreground))] flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-[rgb(var(--primary))]" />
                  In-App Notification Center
                </span>
                <Badge variant={prefForm.inAppNotifications ? "default" : "secondary"} className="text-[10px]">
                  {prefForm.inAppNotifications ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              {/* Master In-App Switch */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefForm.inAppNotifications}
                  onChange={e => setPrefForm(p => ({ ...p, inAppNotifications: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded text-[rgb(var(--primary))] border-[rgb(var(--border))] focus:ring-[rgb(var(--primary)/0.3)] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[rgb(var(--foreground))] block">
                    Enable Portal Bell & Badge Alerts
                  </span>
                  <span className="text-[11px] text-[rgb(var(--muted-foreground))]">
                    Real-time unread counter and interactive drawer in the doctor navigation bar.
                  </span>
                </div>
              </label>

              <div className="p-3 rounded-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[11px] text-[rgb(var(--muted-foreground))] space-y-1.5">
                <div className="font-semibold text-[rgb(var(--foreground))] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Security & Critical Activity Guarantee
                </div>
                <p className="leading-relaxed">
                  Security-critical notifications (such as login password resets and governance audits) are always delivered for account protection regardless of notification toggles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2-COLUMN MAIN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Biography, Specialties, Education, Credentials */}
          <div className="lg:col-span-8 space-y-8">
            {/* ABOUT THE SPECIALIST */}
            <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-[rgb(var(--primary))]" />
                  <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                    About {staff.name}
                  </h3>
                </div>
                {isEditing ? (
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                    Doctor Editable
                  </span>
                ) : (
                  <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
                    Public Introduction
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 pt-1">
                  {/* Short Bio */}
                  <div className="space-y-1.5">
                    <Label htmlFor="doctor-short-bio" className="text-xs font-semibold text-[rgb(var(--foreground))]">
                      Short Summary / Directory Card Bio
                    </Label>
                    <textarea
                      id="doctor-short-bio"
                      rows={2}
                      placeholder="Brief one-sentence highlight for directory cards..."
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.3)]"
                    />
                  </div>

                  {/* Full Biography */}
                  <div className="space-y-1.5">
                    <Label htmlFor="doctor-biography" className="text-xs font-semibold text-[rgb(var(--foreground))]">
                      Full Clinical Biography
                    </Label>
                    <textarea
                      id="doctor-biography"
                      rows={6}
                      placeholder="Detailed clinical background, treatment philosophy, patient care approach..."
                      value={form.biography}
                      onChange={e => setForm(f => ({ ...f, biography: e.target.value }))}
                      className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2.5 text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.3)]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {shortBioText && shortBioText !== bioText && (
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] italic border-l-2 border-[rgb(var(--primary))] pl-3 py-0.5">
                      "{shortBioText}"
                    </p>
                  )}
                  <p className="text-sm sm:text-base text-[rgb(var(--muted-foreground))] leading-relaxed whitespace-pre-line">
                    {bioText}
                  </p>
                </div>
              )}
            </section>

            {/* CLINICAL SPECIALTIES & AREAS OF CARE */}
            <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[rgb(var(--primary))]" />
                  <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                    Areas of Clinical Expertise
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] text-[rgb(var(--muted-foreground))] border-[rgb(var(--border))]">
                  <Lock className="h-2.5 w-2.5 mr-1 text-[rgb(var(--primary))]" />
                  Managed by clinic administrator
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {specialtiesList.map((spec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.2)] flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[rgb(var(--foreground))]">{spec}</h4>
                      <p className="text-[11px] text-[rgb(var(--muted-foreground))] mt-0.5">
                        Comprehensive clinical evaluation & personalized treatment protocols.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* EDUCATION & CREDENTIALS */}
            {(credentialsList.length > 0 || educationList.length > 0) && (
              <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[rgb(var(--primary))]" />
                    <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                      Education & Credentials
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-[rgb(var(--muted-foreground))] border-[rgb(var(--border))]">
                    <Lock className="h-2.5 w-2.5 mr-1 text-[rgb(var(--primary))]" />
                    Managed by clinic administrator
                  </Badge>
                </div>

                {educationList.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block">
                      Academic Training & Degrees
                    </span>
                    <ul className="space-y-2">
                      {educationList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
                          <GraduationCap className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {credentialsList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[rgb(var(--border))]">
                    <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase tracking-wider block">
                      Board Certifications & Memberships
                    </span>
                    <ul className="space-y-2">
                      {credentialsList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[rgb(var(--muted-foreground))]">
                          <Award className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* TREATMENTS & SERVICES PROVIDED */}
            {servicesList.length > 0 && (
              <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[rgb(var(--primary))]" />
                    <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                      Treatments Provided by {staff.name}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-[rgb(var(--muted-foreground))] border-[rgb(var(--border))]">
                    <Lock className="h-2.5 w-2.5 mr-1 text-[rgb(var(--primary))]" />
                    Managed by clinic administrator ({servicesList.length})
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {servicesList.map((svc: any) => (
                    <div
                      key={svc.id}
                      className="p-4 rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.15)] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-[rgb(var(--foreground))]">
                          {svc.name}
                        </h4>
                        {svc.shortDescription && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))] line-clamp-2">
                            {svc.shortDescription}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[rgb(var(--border))] flex items-center justify-between">
                        <div className="text-xs font-bold text-[rgb(var(--primary))]">
                          {formatCurrency(Number(svc.price), currencySymbol)}
                        </div>

                        {isAccepting ? (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Bookable Live
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            Not Accepting
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCOUNT SECURITY & PASSWORD (In Edit Mode) */}
            {isEditing && (
              <section className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-[rgb(var(--primary))]" />
                    <h3 className="text-lg sm:text-xl font-bold text-[rgb(var(--foreground))]">
                      Account Login & Security
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                    Optional
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="doctor-new-password" className="text-xs font-semibold">
                      New Password
                    </Label>
                    <Input
                      id="doctor-new-password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="doctor-confirm-password" className="text-xs font-semibold">
                      Confirm New Password
                    </Label>
                    <Input
                      id="doctor-confirm-password"
                      type="password"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                  Leave blank if you do not wish to change your login password.
                </p>
              </section>
            )}
          </div>

          {/* Right Column: Weekly Schedule & Clinic Policy */}
          <div className="lg:col-span-4 space-y-6">
            {/* WEEKLY SCHEDULE */}
            <div id="schedule" className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm scroll-mt-20">
              <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[rgb(var(--primary))]" />
                  <h3 className="font-bold text-base text-[rgb(var(--foreground))]">
                    Weekly Operating Schedule
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] text-[rgb(var(--muted-foreground))] border-[rgb(var(--border))]">
                  <Lock className="h-2.5 w-2.5 mr-1 text-[rgb(var(--primary))]" />
                  Managed by clinic administrator
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                {daysOfWeek.map((dayName, idx) => {
                  const schedule = schedulesList.find((s: any) => s.dayOfWeek === idx)
                  const isWorking = schedule ? schedule.isWorking : idx >= 1 && idx <= 5
                  const shifts = schedule?.shifts || []

                  return (
                    <div
                      key={dayName}
                      className={`flex items-center justify-between py-1.5 px-2.5 rounded ${
                        isWorking ? "bg-[rgb(var(--muted)/0.3)]" : "opacity-50"
                      }`}
                    >
                      <span className="font-semibold text-[rgb(var(--foreground))]">{dayName}</span>
                      {isWorking ? (
                        <span className="font-medium text-[rgb(var(--primary))]">
                          {shifts.length > 0
                            ? shifts.map((sh: any) => `${sh.startTime} - ${sh.endTime}`).join(", ")
                            : "09:00 AM – 05:00 PM"}
                        </span>
                      ) : (
                        <span className="text-[rgb(var(--muted-foreground))]">Off Clinic</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="pt-3 border-t border-[rgb(var(--border))]">
                <Link
                  to="/doctor/schedule"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 font-semibold text-xs h-9"
                  >
                    <CalendarCheck className="h-4 w-4 text-[rgb(var(--primary))]" />
                    View Clinic Shift Schedule
                  </Button>
                </Link>
              </div>
            </div>

            {/* PATIENT CARE GUARANTEE */}
            <div className="bg-[rgb(var(--muted)/0.3)] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 space-y-2 text-xs text-[rgb(var(--muted-foreground))]">
              <div className="font-bold text-[rgb(var(--foreground))] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--primary))]" />
                Patient Care Guarantee
              </div>
              <p className="leading-relaxed">
                Consultations include full digital diagnostics and personalized treatment roadmaps. Appointments can be rescheduled online up to 24 hours prior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfilePage
