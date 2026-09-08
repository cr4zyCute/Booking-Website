import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Loader2,
  Stethoscope,
  Key,
  Trash2,
  Edit2,
  X,
  ShieldCheck,
  Mail,
  Upload,
  Image as ImageIcon,
  GraduationCap,
  Award,
  Globe,
  CheckCircle2,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"

export function StaffAdminPage() {
  const { terminology } = useBusiness()
  const [staff, setStaff] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Create doctor modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    specialties: "",
    role: "Associate Dentist",
    bio: "",
    biography: "",
    photo: "",
    credentials: "",
    education: "",
    experience: "",
    languages: "English, Filipino",
    phone: "",
    serviceIds: [] as string[],
  })
  const [creating, setCreating] = useState(false)
  const [uploadingCreate, setUploadingCreate] = useState(false)

  // Edit / Manage modal state
  const [editMember, setEditMember] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    specialty: "",
    specialties: "",
    role: "",
    bio: "",
    biography: "",
    photo: "",
    credentials: "",
    education: "",
    experience: "",
    languages: "",
    phone: "",
    isActive: true,
    newPassword: "",
    serviceIds: [] as string[],
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [uploadingEdit, setUploadingEdit] = useState(false)

  const fetchStaffAndServices = async () => {
    try {
      const [staffRes, servicesRes] = await Promise.all([
        fetch("/api/admin/staff", {
          headers: {
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
        }),
        fetch("/api/admin/services", {
          headers: {
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
        }),
      ])

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        if (staffData.staff) setStaff(staffData.staff)
      }

      if (servicesRes.ok) {
        const sData = await servicesRes.json()
        if (sData.services) setServices(sData.services)
      }
    } catch (err) {
      console.error("Fetch admin staff error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffAndServices()
  }, [])

  const handleUploadPhoto = async (file: File, isEdit: boolean) => {
    const formData = new FormData()
    formData.append("image", file)

    if (isEdit) setUploadingEdit(true)
    else setUploadingCreate(true)

    try {
      const res = await fetch("/api/admin/staff/upload", {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.imageUrl) {
        toast.success("Portrait photo uploaded!")
        if (isEdit) {
          setEditForm(f => ({ ...f, photo: data.imageUrl }))
        } else {
          setCreateForm(f => ({ ...f, photo: data.imageUrl }))
        }
      } else {
        toast.error(data.error || "Failed to upload image")
      }
    } catch (err) {
      toast.error("Upload error")
    } finally {
      if (isEdit) setUploadingEdit(false)
      else setUploadingCreate(false)
    }
  }

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const payload = {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        specialty: createForm.specialty,
        specialties: createForm.specialties.split(",").map(s => s.trim()).filter(Boolean),
        role: createForm.role,
        bio: createForm.bio,
        biography: createForm.biography || createForm.bio,
        photo: createForm.photo || null,
        images: createForm.photo ? [createForm.photo] : [],
        credentials: createForm.credentials.split(",").map(s => s.trim()).filter(Boolean),
        education: createForm.education.split("\n").map(s => s.trim()).filter(Boolean),
        experience: createForm.experience || null,
        languages: createForm.languages.split(",").map(s => s.trim()).filter(Boolean),
        phone: createForm.phone || null,
        serviceIds: createForm.serviceIds,
      }

      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Doctor account created successfully!")
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        setShowCreateModal(false)
        setCreateForm({
          name: "",
          email: "",
          password: "",
          specialty: "",
          specialties: "",
          role: "Associate Dentist",
          bio: "",
          biography: "",
          photo: "",
          credentials: "",
          education: "",
          experience: "",
          languages: "English, Filipino",
          phone: "",
          serviceIds: [],
        })
        fetchStaffAndServices()
      } else {
        toast.error(data.error || "Failed to create doctor account")
      }
    } catch (err) {
      toast.error("Network error while creating doctor account")
    } finally {
      setCreating(false)
    }
  }

  const handleOpenEdit = (member: any) => {
    setEditMember(member)
    const existingSpecialties = Array.isArray(member.specialties) ? member.specialties.join(", ") : (member.specialty || "")
    const existingCredentials = Array.isArray(member.credentials) ? member.credentials.join(", ") : ""
    const existingEducation = Array.isArray(member.education) ? member.education.join("\n") : ""
    const existingLanguages = Array.isArray(member.languages) ? member.languages.join(", ") : "English, Filipino"
    const existingServiceIds = member.services ? member.services.map((s: any) => s.serviceId || s.service?.id).filter(Boolean) : []

    setEditForm({
      name: member.name || "",
      email: member.email || "",
      specialty: member.specialty || "",
      specialties: existingSpecialties,
      role: member.role || "",
      bio: member.bio || "",
      biography: member.biography || member.bio || "",
      photo: member.photo || (member.images && member.images.length > 0 ? member.images[0] : ""),
      credentials: existingCredentials,
      education: existingEducation,
      experience: member.experience || "",
      languages: existingLanguages,
      phone: member.phone || "",
      isActive: member.isActive ?? true,
      newPassword: "",
      serviceIds: existingServiceIds,
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editMember) return
    setSavingEdit(true)

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        specialty: editForm.specialty,
        specialties: editForm.specialties.split(",").map(s => s.trim()).filter(Boolean),
        role: editForm.role,
        bio: editForm.bio,
        biography: editForm.biography || editForm.bio,
        photo: editForm.photo || null,
        images: editForm.photo ? [editForm.photo] : [],
        credentials: editForm.credentials.split(",").map(s => s.trim()).filter(Boolean),
        education: editForm.education.split("\n").map(s => s.trim()).filter(Boolean),
        experience: editForm.experience || null,
        languages: editForm.languages.split(",").map(s => s.trim()).filter(Boolean),
        phone: editForm.phone || null,
        isActive: editForm.isActive,
        serviceIds: editForm.serviceIds,
        ...(editForm.newPassword ? { password: editForm.newPassword } : {}),
      }

      const res = await fetch(`/api/admin/staff/${editMember.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Doctor profile updated!")
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        setEditMember(null)
        fetchStaffAndServices()
      } else {
        toast.error("Failed to update doctor profile")
      }
    } catch (err) {
      toast.error("Network error")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove ${name}?`)) return

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })

      if (res.ok) {
        toast.success(`Doctor ${name} removed`)
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        fetchStaffAndServices()
      } else {
        toast.error("Failed to remove doctor")
      }
    } catch (err) {
      toast.error("Network error")
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-[rgb(var(--primary))]" />
            Dentists & Clinical Team Management
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Manage dentist profiles, clinical credentials, specialties, portraits, and booking assignments.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 shrink-0" size="sm">
          <Plus className="h-4 w-4" />
          Add Dentist Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map(member => {
          const photoUrl = member.photo || (member.images && member.images.length > 0 ? member.images[0] : null)
          const specialty = member.specialty || "General Dentistry"
          const role = member.role || "Associate Dentist"
          const experience = member.experience || "Clinical Specialist"

          return (
            <div
              key={member.id}
              className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 space-y-4 shadow-sm hover:border-[rgb(var(--primary)/0.3)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--muted))] shrink-0 relative shadow-2xs">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-bold text-xs">
                          {member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[rgb(var(--foreground))] truncate">{member.name}</h3>
                      <p className="text-xs text-[rgb(var(--primary))] font-medium">{specialty}</p>
                      <p className="text-[11px] text-[rgb(var(--muted-foreground))]">{role}</p>
                    </div>
                  </div>

                  <Badge
                    variant={member.isActive ? "default" : "outline"}
                    className={`text-[10px] ${member.isActive ? "bg-emerald-500/10 text-emerald-700 border-emerald-200" : "text-gray-500"}`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="bg-[rgb(var(--muted)/0.3)] p-3 rounded-[calc(var(--radius)-2px)] text-xs text-[rgb(var(--muted-foreground))] space-y-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-[rgb(var(--primary))] shrink-0" />
                    <span className="font-mono text-[11px] truncate">{member.email || "No login email"}</span>
                  </div>
                  {member.experience && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Award className="h-3.5 w-3.5 text-[rgb(var(--primary))] shrink-0" />
                      <span className="truncate">{member.experience}</span>
                    </div>
                  )}
                  {member.services && member.services.length > 0 && (
                    <div className="text-[11px] text-[rgb(var(--foreground))] pt-1 border-t border-[rgb(var(--border))]">
                      <span className="font-medium">{member.services.length} Treatment{member.services.length > 1 ? "s" : ""} Linked</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[rgb(var(--border))] flex items-center justify-between gap-2">
                <Link
                  to={`/dentists/${member.slug || member.id}`}
                  target="_blank"
                  className="text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] inline-flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="h-3 w-3" />
                  Live Profile
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(member)}
                    className="h-8 text-xs gap-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDoctor(member.id, member.name)}
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal 1: Create Doctor */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[rgb(var(--border))]">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-[rgb(var(--primary))]" />
                <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">Add Dentist Profile</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="doc-name" className="text-xs">Dentist Full Name</Label>
                  <Input
                    id="doc-name"
                    placeholder="e.g. Dr. Maria Santos"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doc-email" className="text-xs">Login Email</Label>
                  <Input
                    id="doc-email"
                    type="email"
                    placeholder="maria@veridian.com"
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="doc-password" className="text-xs">Initial Password</Label>
                  <Input
                    id="doc-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doc-specialty" className="text-xs">Primary Specialty</Label>
                  <Input
                    id="doc-specialty"
                    placeholder="e.g. General Dentistry"
                    value={createForm.specialty}
                    onChange={e => setCreateForm(f => ({ ...f, specialty: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="doc-role" className="text-xs">Position / Title</Label>
                  <Input
                    id="doc-role"
                    placeholder="e.g. Lead Dentist"
                    value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doc-exp" className="text-xs">Experience</Label>
                  <Input
                    id="doc-exp"
                    placeholder="e.g. 12+ Years Clinical Practice"
                    value={createForm.experience}
                    onChange={e => setCreateForm(f => ({ ...f, experience: e.target.value }))}
                  />
                </div>
              </div>

              {/* Photo upload */}
              <div className="space-y-1.5">
                <Label className="text-xs">Portrait Photo</Label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="/uploads/dentists/dr-maria.jpg or upload"
                    value={createForm.photo}
                    onChange={e => setCreateForm(f => ({ ...f, photo: e.target.value }))}
                    className="flex-1 text-xs"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadPhoto(e.target.files[0], false)
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs pointer-events-none">
                      {uploadingCreate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      Upload
                    </Button>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-specialties" className="text-xs">Clinical Focus & Specialties (comma separated)</Label>
                <Input
                  id="doc-specialties"
                  placeholder="General Dentistry, Preventive Care, Dental Implants"
                  value={createForm.specialties}
                  onChange={e => setCreateForm(f => ({ ...f, specialties: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-bio" className="text-xs">Short Bio (Card snippet)</Label>
                <textarea
                  id="doc-bio"
                  rows={2}
                  placeholder="Short summary displayed on cards..."
                  value={createForm.bio}
                  onChange={e => setCreateForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-biography" className="text-xs">Full In-depth Clinical Biography</Label>
                <textarea
                  id="doc-biography"
                  rows={4}
                  placeholder="Comprehensive clinical background and patient care philosophy..."
                  value={createForm.biography}
                  onChange={e => setCreateForm(f => ({ ...f, biography: e.target.value }))}
                  className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-xs resize-none"
                />
              </div>

              {/* Linked Treatments */}
              {services.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[rgb(var(--border))]">
                  <Label className="text-xs font-semibold">Treatments Provided by this Dentist</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-[rgb(var(--muted)/0.2)] rounded border border-[rgb(var(--border))]">
                    {services.map(svc => {
                      const isChecked = createForm.serviceIds.includes(svc.id)
                      return (
                        <label key={svc.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setCreateForm(f => ({ ...f, serviceIds: [...f.serviceIds, svc.id] }))
                              } else {
                                setCreateForm(f => ({ ...f, serviceIds: f.serviceIds.filter(id => id !== svc.id) }))
                              }
                            }}
                            className="rounded accent-[rgb(var(--primary))]"
                          />
                          <span className="truncate">{svc.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[rgb(var(--border))]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-2" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving Dentist...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Add Dentist Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Doctor Profile & Services */}
      {editMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[rgb(var(--border))]">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-[rgb(var(--primary))]" />
                <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">Manage {editMember.name}</h3>
              </div>
              <button
                onClick={() => setEditMember(null)}
                className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Doctor Portal delegation notice */}
              <div className="p-3 bg-[rgb(var(--primary)/0.06)] border border-[rgb(var(--primary)/0.2)] rounded-[var(--radius)] text-xs text-[rgb(var(--muted-foreground))] flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--primary))] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[rgb(var(--foreground))] block">
                    Administrative Governance
                  </span>
                  Use this modal to manage verified credentials, assigned treatments, and login credentials. Doctors can independently customize their portraits, clinical statements, and spoken languages in their Doctor Portal.
                </div>
              </div>

              {/* 1. Clinical Credentials */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))] pb-1 border-b border-[rgb(var(--border))]">
                  1. Clinical Credentials & Title
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name" className="text-xs">Full Name & Honorific</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-role" className="text-xs">Clinical Title / Role</Label>
                    <Input
                      id="edit-role"
                      value={editForm.role}
                      onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                      placeholder="e.g. Lead Cosmetic Dentist"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-specialty" className="text-xs">Primary Specialty</Label>
                    <Input
                      id="edit-specialty"
                      value={editForm.specialty}
                      onChange={e => setEditForm(f => ({ ...f, specialty: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-exp" className="text-xs">Experience</Label>
                    <Input
                      id="edit-exp"
                      value={editForm.experience}
                      onChange={e => setEditForm(f => ({ ...f, experience: e.target.value }))}
                      placeholder="e.g. 10+ Years Experience"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-specialties" className="text-xs">Clinical Focus Specialties (comma-separated)</Label>
                  <Input
                    id="edit-specialties"
                    value={editForm.specialties}
                    onChange={e => setEditForm(f => ({ ...f, specialties: e.target.value }))}
                    placeholder="e.g. Veneers, Smile Design, Orthodontics"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-credentials" className="text-xs">Degrees & Board Certifications (comma-separated)</Label>
                  <Input
                    id="edit-credentials"
                    value={editForm.credentials}
                    onChange={e => setEditForm(f => ({ ...f, credentials: e.target.value }))}
                    placeholder="e.g. DMD, FICOI, Certified Invisalign Provider"
                  />
                </div>
              </div>

              {/* 2. Authorized Treatments */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))] pb-1 border-b border-[rgb(var(--border))]">
                  2. Treatments Provided by this Dentist
                </h4>

                {services.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2.5 bg-[rgb(var(--muted)/0.2)] rounded border border-[rgb(var(--border))]">
                    {services.map(svc => {
                      const isChecked = editForm.serviceIds.includes(svc.id)
                      return (
                        <label key={svc.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setEditForm(f => ({ ...f, serviceIds: [...f.serviceIds, svc.id] }))
                              } else {
                                setEditForm(f => ({ ...f, serviceIds: f.serviceIds.filter(id => id !== svc.id) }))
                              }
                            }}
                            className="rounded accent-[rgb(var(--primary))]"
                          />
                          <span className="truncate">{svc.name}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] italic">No services created yet.</p>
                )}
              </div>

              {/* 3. Account Credentials & Status */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))] pb-1 border-b border-[rgb(var(--border))]">
                  3. Account Credentials & Public Visibility
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email" className="text-xs">Login Email</Label>
                    <Input
                      id="edit-email"
                      value={editForm.email}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-password" className="text-xs flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                      Reset Login Password
                    </Label>
                    <Input
                      id="edit-password"
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={editForm.newPassword}
                      onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Active Visibility Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editForm.isActive}
                    onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-[rgb(var(--border))] h-4 w-4 accent-[rgb(var(--primary))]"
                  />
                  <Label htmlFor="edit-active" className="text-xs cursor-pointer font-medium">
                    Dentist profile is Active and bookable on public website
                  </Label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[rgb(var(--border))]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMember(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-2 px-5 font-semibold" disabled={savingEdit}>
                  {savingEdit ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Administrative Changes"
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

export default StaffAdminPage
