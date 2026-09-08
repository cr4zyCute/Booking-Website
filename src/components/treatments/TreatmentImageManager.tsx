import React, { useState, useRef } from "react"
import {
  Upload,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Loader2,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface TreatmentImageManagerProps {
  images: string[]
  onChange: (images: string[]) => void
  disabled?: boolean
}

export function TreatmentImageManager({
  images,
  onChange,
  disabled = false,
}: TreatmentImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validate files
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file (PNG, JPG, WebP, AVIF accepted)`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      validFiles.forEach(file => {
        formData.append("images", file)
      })

      const res = await fetch("/api/admin/services/upload-multiple", {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.imageUrls && data.imageUrls.length > 0) {
        const newImages = [...images, ...data.imageUrls]
        onChange(newImages)
        toast.success(`Uploaded ${data.imageUrls.length} photo(s) successfully`)
      } else {
        toast.error(data.error || "Failed to upload images")
      }
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Network error while uploading photos")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSetPrimary = (index: number) => {
    if (index === 0 || index >= images.length) return
    const item = images[index]
    const updated = [item, ...images.slice(0, index), ...images.slice(index + 1)]
    onChange(updated)
    toast.info("Primary card photo updated")
  }

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return
    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index)
    onChange(updated)
    toast.info("Photo removed")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground))] block">
            Treatment Photos ({images.length})
          </label>
          <span className="text-[10px] text-[rgb(var(--muted-foreground))]">
            ★ The first photo is the primary card cover. All photos appear in the slideshow modal.
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
          className="gap-1.5 text-xs h-8 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
              Add Photos
            </>
          )}
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFilesSelected}
          accept="image/png, image/jpeg, image/webp, image/avif"
          multiple
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.6)] rounded-[var(--radius)] p-6 text-center cursor-pointer transition-colors bg-[rgb(var(--muted)/0.15)] flex flex-col items-center justify-center gap-2"
        >
          <div className="h-10 w-10 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))]">
            <ImageIcon className="h-5 w-5 opacity-60" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[rgb(var(--foreground))]">No photos attached yet</p>
            <p className="text-[11px] text-[rgb(var(--muted-foreground))] mt-0.5">
              Click to browse and upload one or multiple clinical photos
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((imgUrl, index) => {
            const isPrimary = index === 0
            return (
              <div
                key={`${imgUrl}-${index}`}
                className={`group relative rounded-[var(--radius)] overflow-hidden border aspect-[4/3] bg-[rgb(var(--muted))] shadow-sm transition-all ${
                  isPrimary
                    ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)/0.3)]"
                    : "border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.4)]"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Treatment photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary Tag */}
                {isPrimary ? (
                  <div className="absolute top-1.5 left-1.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow">
                    <Star className="h-3 w-3 fill-current" />
                    Primary
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    title="Set as Primary Card Photo"
                    className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-[rgb(var(--primary))] text-white p-1 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow text-[10px] font-medium flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" />
                    <span className="hidden sm:inline">Set Primary</span>
                  </button>
                )}

                {/* Order Index Badge */}
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white px-1.5 py-0.5 rounded text-[9px] font-mono pointer-events-none">
                  #{index + 1}
                </div>

                {/* Reorder and Delete Controls */}
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-0.5 rounded backdrop-blur-sm">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, "left")}
                      title="Move Left"
                      className="h-5 w-5 text-white hover:text-cyan-300 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, "right")}
                      title="Move Right"
                      className="h-5 w-5 text-white hover:text-cyan-300 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    title="Remove Photo"
                    className="h-5 w-5 text-red-400 hover:text-red-300 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
