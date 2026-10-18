import React from "react"

interface HeroBackgroundProps {
  className?: string
  variant?: "split" | "center"
}

export function HeroBackground({ className = "", variant = "split" }: HeroBackgroundProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 ${className}`}>
      {/* 1. Calm Architectural Gradient: Soothing clinical tone transitioning smoothly */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgb(var(--primary)/0.06)] via-[rgb(var(--background)/0.5)] to-[rgb(var(--background))] transition-colors duration-500" />

      {/* 2. Architectural Hairline Top Boundary */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--border))] to-transparent" />

      {/* 3. Subtle Structural Grid (Clean, uncolored architectural lines, not neon dots or spinning rings) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border)/0.25)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_25%,#000_30%,transparent_100%)] opacity-60" />

      {/* 4. Natural Soft Depth Gradient for Right Column (Frames imagery without artificial blur glow) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[rgb(var(--primary)/0.03)] to-transparent hidden lg:block" />

      {/* 5. Clean Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgb(var(--background))] to-transparent" />
    </div>
  )
}

