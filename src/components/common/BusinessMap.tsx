import React from "react"
import { useBusiness } from "@/context/BusinessContext"
import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BusinessMapProps {
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  mapZoom?: number | null
  businessName?: string
  height?: string
  className?: string
  showDirectionsButton?: boolean
  showAddressCard?: boolean
}

export function BusinessMap({
  address: customAddress,
  latitude: customLat,
  longitude: customLng,
  mapZoom: customZoom,
  businessName: customName,
  height = "320px",
  className = "",
  showDirectionsButton = true,
  showAddressCard = true,
}: BusinessMapProps) {
  const { business } = useBusiness()

  const address = customAddress ?? business.address ?? "2F Veridian Building, 123 Ayala Avenue, Makati City, Metro Manila"
  const lat = customLat ?? (business as any).latitude ?? 14.5547
  const lng = customLng ?? (business as any).longitude ?? 121.0244
  const name = customName ?? business.name ?? "Clinic Location"
  const zoom = customZoom ?? (business as any).mapZoom ?? 15

  // Calculate bounding box based on zoom
  const delta = 0.006 * Math.pow(2, 15 - Math.min(18, Math.max(10, zoom)))
  const bbox = `${lng - delta * 1.4}%2C${lat - delta}%2C${lng + delta * 1.4}%2C${lat + delta}`

  // OpenStreetMap embed URL with exact pin marker
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.3)] shadow-sm group ${className}`}
      style={{ height }}
    >
      {/* Map iframe */}
      <iframe
        title={`Map location for ${name}`}
        src={embedUrl}
        className="w-full h-full border-0 transition-opacity duration-300"
        loading="lazy"
      />

      {/* Floating Info / Directions Card */}
      {showAddressCard && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-[rgb(var(--card)/0.95)] backdrop-blur-md p-3.5 rounded-[calc(var(--radius)-2px)] border border-[rgb(var(--border))] shadow-md space-y-2 pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[rgb(var(--primary)/0.1)] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-[rgb(var(--primary))]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs text-[rgb(var(--foreground))] truncate">{name}</h4>
              <p className="text-[11px] text-[rgb(var(--muted-foreground))] leading-snug line-clamp-2 mt-0.5">
                {address}
              </p>
            </div>
          </div>

          {showDirectionsButton && (
            <div className="pt-1 flex items-center gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button size="xs" variant="outline" className="w-full text-[11px] gap-1.5 h-7">
                  <Navigation className="h-3 w-3 text-[rgb(var(--primary))]" />
                  Get Directions
                  <ExternalLink className="h-2.5 w-2.5 ml-auto opacity-60" />
                </Button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
