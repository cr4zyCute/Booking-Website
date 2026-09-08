import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, Save, Loader2, RefreshCw, CheckCircle2 } from "lucide-react"
import { BusinessMap } from "@/components/common/BusinessMap"
import { toast } from "sonner"

export function LocationAdminPage() {
  const { business, refresh } = useBusiness()
  const [address, setAddress] = useState(business.address || "")
  const [latitude, setLatitude] = useState<number>((business as any).latitude ?? 14.5547)
  const [longitude, setLongitude] = useState<number>((business as any).longitude ?? 121.0244)
  const [mapZoom, setMapZoom] = useState<number>((business as any).mapZoom ?? 15)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/location", {
      headers: {
        Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.address) setAddress(data.address)
        if (data.latitude) setLatitude(data.latitude)
        if (data.longitude) setLongitude(data.longitude)
        if (data.mapZoom) setMapZoom(data.mapZoom)
      })
      .catch(err => console.error("Error fetching location:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/admin/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({
          address,
          latitude: Number(latitude),
          longitude: Number(longitude),
          mapZoom: Number(mapZoom),
        }),
      })

      if (res.ok) {
        toast.success("Location settings saved! All public maps have been updated.")
        refresh()
      } else {
        toast.error("Failed to save location settings")
      }
    } catch (err) {
      toast.error("Network error while updating location")
    } finally {
      setSaving(false)
    }
  }

  // Quick preset locations for easy testing
  const presets = [
    { label: "Makati (Ayala Ave)", address: "2F Veridian Building, 123 Ayala Avenue, Makati City", lat: 14.5547, lng: 121.0244 },
    { label: "BGC (High Street)", address: "5th Avenue cor 28th St, Bonifacio Global City, Taguig", lat: 14.5508, lng: 121.0494 },
    { label: "Ortigas Center", address: "Emerald Avenue, San Antonio, Pasig City", lat: 14.5869, lng: 121.0614 },
    { label: "Quezon City (Tomas Morato)", address: "Tomas Morato Ave, Diliman, Quezon City", lat: 14.6333, lng: 121.0333 },
  ]

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2.5">
          <MapPin className="h-6 w-6 text-[rgb(var(--primary))]" />
          Map & Location Management
        </h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Configure the official clinic address, map coordinates, and marker pin. Changes automatically update across the Footer, About page, and Contact page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSave} className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-5 shadow-sm">
            <h2 className="text-base font-semibold text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] pb-3">
              Location Coordinates
            </h2>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter full physical address"
                required
              />
              <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                The address shown to patients in cards, headers, and footer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="zoom">Map Zoom Level</Label>
                <span className="text-xs font-mono font-medium text-[rgb(var(--muted-foreground))]">{mapZoom}x</span>
              </div>
              <input
                id="zoom"
                type="range"
                min="10"
                max="18"
                step="1"
                value={mapZoom}
                onChange={e => setMapZoom(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer accent-[rgb(var(--primary))]"
              />
            </div>

            <Button type="submit" className="w-full gap-2 mt-2" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Location...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save & Update All Maps
                </>
              )}
            </Button>
          </form>

          {/* Quick presets */}
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
              Quick Location Presets
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setAddress(p.address)
                    setLatitude(p.lat)
                    setLongitude(p.lng)
                  }}
                  className="text-left p-2.5 rounded-[calc(var(--radius)-2px)] border border-[rgb(var(--border))] hover:border-[rgb(var(--primary)/0.5)] hover:bg-[rgb(var(--muted)/0.5)] transition-all flex items-center justify-between text-xs group cursor-pointer"
                >
                  <div>
                    <span className="font-medium text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--primary))] block">
                      {p.label}
                    </span>
                    <span className="text-[11px] text-[rgb(var(--muted-foreground))] truncate block max-w-[220px]">
                      {p.address}
                    </span>
                  </div>
                  <Navigation className="h-3.5 w-3.5 text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--primary))] shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Map Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[rgb(var(--foreground))]">Live Map Preview</h2>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Marker Pin will appear exactly at coordinates ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </p>
              </div>
              <span className="text-xs bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Synchronized
              </span>
            </div>

            <BusinessMap
              address={address}
              latitude={latitude}
              longitude={longitude}
              mapZoom={mapZoom}
              height="420px"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
