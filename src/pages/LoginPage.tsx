import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useBusiness } from "@/context/BusinessContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CalendarDays,
  Loader2,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Star,
  ArrowLeft,
  Sparkles,
  HeartHandshake
} from "lucide-react"

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { business } = useBusiness()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Invalid email or password. Please check your credentials.")
      setLoading(false)
    } else {
      // Automatic role-based routing
      if (result.user?.role === "ADMIN") {
        navigate("/admin")
      } else if (result.user?.role === "STAFF") {
        navigate("/doctor")
      } else {
        navigate("/portal")
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[rgb(var(--background))] text-[rgb(var(--foreground))] selection:bg-[rgb(var(--primary)/0.2)]">
      {/* LEFT COLUMN: Visual Brand Showcase (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-12 text-white">
        {/* Background Image with Deep Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('/hero-dental.jpg')`,
            filter: "brightness(0.35)",
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[rgb(var(--primary)/0.35)] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[rgb(var(--primary))] to-cyan-400 flex items-center justify-center shadow-lg shadow-[rgb(var(--primary)/0.4)] group-hover:scale-105 transition-all">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">
                {business.name || "Veridian Dental Studio"}
              </span>
              <span className="text-xs text-white/60 font-medium tracking-wide uppercase">
                Modern Healthcare Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center Showcase Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-cyan-300 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Clinical Excellence & Patient Care
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Precision dentistry, personalized for every smile.
          </h2>

          <p className="text-sm text-white/70 leading-relaxed">
            Access your secure health records, track upcoming treatments, or manage clinic consultations in our unified dental care ecosystem.
          </p>

          {/* Floating Glassmorphic Social Proof Card */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-2xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[rgb(var(--primary)/0.25)] border border-[rgb(var(--primary)/0.4)] flex items-center justify-center shrink-0">
                <HeartHandshake className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-white ml-1.5">4.9 / 5.0</span>
                </div>
                <p className="text-xs text-white/70">
                  Trusted by over 3,200+ satisfied patients across Metro Manila.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>256-Bit SSL Encrypted Healthcare Portal</span>
          </div>
          <span>© {new Date().getFullYear()} {business.name}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Login Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to website
          </Link>

          <Link
            to="/register"
            className="text-xs text-[rgb(var(--primary))] font-semibold hover:underline"
          >
            New Patient? Register
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="space-y-2 mb-8">
            <div className="lg:hidden inline-flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-[rgb(var(--primary))] flex items-center justify-center text-white shadow-sm">
                <CalendarDays className="h-5 w-5" />
              </div>
              <span className="font-bold text-base">{business.name}</span>
            </div>
            <h1
              className="text-3xl font-bold tracking-tight text-[rgb(var(--foreground))]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Sign In to Your Account
            </h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Welcome back. Enter your credentials to access your portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-[var(--radius)] bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="h-4 w-4 rounded-full bg-red-500/20 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  !
                </div>
                <div className="flex-1 font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-[rgb(var(--foreground))]">
                Email address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[rgb(var(--muted-foreground))]">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10 h-11 text-sm bg-[rgb(var(--card))] border-[rgb(var(--border))] rounded-[var(--radius)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] transition-all"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-[rgb(var(--foreground))]">
                  Password
                </Label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[rgb(var(--muted-foreground))]">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 text-sm bg-[rgb(var(--card))] border-[rgb(var(--border))] rounded-[var(--radius)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-[rgb(var(--border))] h-4 w-4 accent-[rgb(var(--primary))] cursor-pointer"
                />
                <span>Remember on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-11 gap-2 text-sm font-semibold shadow-md shadow-[rgb(var(--primary)/0.25)] hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 pt-6 border-t border-[rgb(var(--border))] text-center">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Don't have a patient account yet?{" "}
              <Link to="/register" className="font-semibold text-[rgb(var(--primary))] hover:underline ml-1">
                Register as a Patient
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile Bottom Security Notice */}
        <div className="text-center text-[11px] text-[rgb(var(--muted-foreground))] flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          <span>Encrypted healthcare authentication portal</span>
        </div>
      </div>
    </div>
  )
}
