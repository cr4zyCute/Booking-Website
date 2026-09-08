import React, { useEffect } from "react"
import { BrowserRouter, useLocation } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { BusinessProvider } from "@/context/BusinessContext"
import { AppRoutes } from "@/routes"
import { Toaster } from "@/components/ui/sonner"

// Handles smooth section anchor scrolling and page transitions
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const sectionId = hash.replace("#", "")
      const scrollToHash = () => {
        const targetEl = document.getElementById(sectionId)
        if (targetEl) {
          const header = document.querySelector("header")
          const headerHeight = header ? header.getBoundingClientRect().height : 64
          const elementTop = targetEl.getBoundingClientRect().top + window.scrollY
          const targetPosition = Math.max(0, elementTop - headerHeight - 16)
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          })
        }
      }

      // Initial check and slight delay for component mounting
      scrollToHash()
      const t1 = setTimeout(scrollToHash, 50)
      const t2 = setTimeout(scrollToHash, 250)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
  }, [pathname, hash])

  return null
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <ScrollManager />
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
