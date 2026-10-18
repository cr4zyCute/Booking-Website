import React from "react"

interface HeroBackgroundProps {
  className?: string
  variant?: "split" | "center"
}

export function HeroBackground({ className = "", variant = "split" }: HeroBackgroundProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 ${className}`}>
      {/* 1. Base Soothing Tinted Canvas (Eliminates stark sterile white void) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgb(var(--primary)/0.12)] via-[rgb(var(--primary)/0.04)] to-[rgb(var(--background))] transition-colors duration-500" />

      {/* 2. Top Horizon Luminous Edge */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[rgb(var(--primary)/0.4)] to-transparent" />

      {/* 3. Fluid Organic Luminous Glow Blooms */}
      {/* Upper-Left Calming Primary Glow */}
      <div
        className="absolute -top-32 -left-28 w-[600px] sm:w-[750px] h-[550px] rounded-full bg-[rgb(var(--primary)/0.18)] blur-[130px] dark:bg-[rgb(var(--primary)/0.25)]"
        aria-hidden="true"
      />
      {/* Upper-Right Cyan/Teal Accent Glow */}
      <div
        className="absolute top-10 -right-24 w-[500px] sm:w-[650px] h-[500px] rounded-full bg-cyan-400/15 blur-[140px] dark:bg-teal-400/20"
        aria-hidden="true"
      />
      {/* Subtle Warm Amber Sunlight Glow (Reduces cold clinical anxiety) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[350px] rounded-full bg-amber-400/10 blur-[150px] dark:bg-amber-400/05"
        aria-hidden="true"
      />

      {/* 4. Dribbble-Signature Concentric Contour Circles (Framing the Right/Center Area) */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-60 dark:opacity-30">
        <div className="relative flex items-center justify-center">
          {/* Innermost Ring */}
          <div className="w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full border border-[rgb(var(--primary)/0.14)]" />
          {/* Middle Dashed Ring */}
          <div className="absolute w-[520px] h-[520px] sm:w-[640px] sm:h-[640px] rounded-full border border-[rgb(var(--primary)/0.10)] border-dashed animate-spin-slower" />
          {/* Outermost Ring */}
          <div className="absolute w-[680px] h-[680px] sm:w-[840px] sm:h-[840px] rounded-full border border-[rgb(var(--primary)/0.06)]" />
        </div>
      </div>

      {/* 5. Precision Medical Micro-Dot Matrix & Crosshair Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 dark:opacity-25 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_35%,#000_40%,transparent_100%)]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="jabel-clinical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            {/* Fine Dot */}
            <circle cx="20" cy="20" r="1.25" fill="rgb(var(--primary))" opacity="0.35" />
            {/* Periodic Micro Crosshair (+) at 40x40 corners */}
            <path
              d="M 0 3 L 0 -3 M -3 0 L 3 0"
              stroke="rgb(var(--primary))"
              strokeWidth="0.75"
              opacity="0.25"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jabel-clinical-grid)" />
      </svg>

      {/* 6. Soft Bottom Feather Vignette */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgb(var(--background))] via-[rgb(var(--background)/0.7)] to-transparent" />
    </div>
  )
}
