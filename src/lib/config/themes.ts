import type { ThemeName } from "@prisma/client"

export interface ThemeTokens {
  name: ThemeName
  displayName: string
  description: string
  cssVars: Record<string, string>
  darkMode: boolean
  fonts: {
    heading: string
    body: string
  }
  radius: string
}

export const THEMES: Record<ThemeName, ThemeTokens> = {
  CLINICAL_SWISS: {
    name: "CLINICAL_SWISS",
    displayName: "Clinical Swiss",
    description: "Professional, precise, and minimal. Ideal for medical and dental practices.",
    darkMode: false,
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    radius: "0.375rem",
    cssVars: {
      "--background": "245 247 244",
      "--foreground": "23 26 24",
      "--card": "255 255 255",
      "--card-foreground": "23 26 24",
      "--popover": "255 255 255",
      "--popover-foreground": "23 26 24",
      "--primary": "28 115 150",
      "--primary-foreground": "255 255 255",
      "--secondary": "234 238 235",
      "--secondary-foreground": "23 26 24",
      "--muted": "234 238 235",
      "--muted-foreground": "105 113 109",
      "--accent": "28 115 150",
      "--accent-foreground": "255 255 255",
      "--destructive": "220 38 38",
      "--destructive-foreground": "255 255 255",
      "--border": "218 224 220",
      "--input": "218 224 220",
      "--ring": "28 115 150",
      "--radius": "0.375rem",
    },
  },
  PREMIUM_SOFT: {
    name: "PREMIUM_SOFT",
    displayName: "Premium Soft",
    description: "Warm, elegant, and luxurious. Perfect for beauty, spa, and wellness businesses.",
    darkMode: false,
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
    },
    radius: "0.75rem",
    cssVars: {
      "--background": "248 246 241",
      "--foreground": "31 36 33",
      "--card": "255 255 255",
      "--card-foreground": "31 36 33",
      "--popover": "255 255 255",
      "--popover-foreground": "31 36 33",
      "--primary": "182 155 107",
      "--primary-foreground": "255 255 255",
      "--secondary": "232 236 230",
      "--secondary-foreground": "31 36 33",
      "--muted": "240 238 233",
      "--muted-foreground": "119 115 106",
      "--accent": "182 155 107",
      "--accent-foreground": "255 255 255",
      "--destructive": "220 38 38",
      "--destructive-foreground": "255 255 255",
      "--border": "225 220 210",
      "--input": "225 220 210",
      "--ring": "182 155 107",
      "--radius": "0.75rem",
    },
  },
  DARK_CLINICAL: {
    name: "DARK_CLINICAL",
    displayName: "Dark Clinical",
    description: "Sophisticated, modern, and technology-forward. Great for premium professional services.",
    darkMode: true,
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    radius: "0.5rem",
    cssVars: {
      "--background": "13 17 16",
      "--foreground": "242 245 243",
      "--card": "27 33 31",
      "--card-foreground": "242 245 243",
      "--popover": "21 26 24",
      "--popover-foreground": "242 245 243",
      "--primary": "114 214 193",
      "--primary-foreground": "13 17 16",
      "--secondary": "30 38 36",
      "--secondary-foreground": "242 245 243",
      "--muted": "30 38 36",
      "--muted-foreground": "154 163 159",
      "--accent": "114 214 193",
      "--accent-foreground": "13 17 16",
      "--destructive": "239 68 68",
      "--destructive-foreground": "255 255 255",
      "--border": "42 52 49",
      "--input": "42 52 49",
      "--ring": "114 214 193",
      "--radius": "0.5rem",
    },
  },
}

export function getTheme(name: ThemeName): ThemeTokens {
  return THEMES[name] ?? THEMES.CLINICAL_SWISS
}

export function generateThemeCss(tokens: ThemeTokens): string {
  const vars = Object.entries(tokens.cssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n")
  return `:root {\n${vars}\n}`
}
