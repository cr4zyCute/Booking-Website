import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, Loader2, UserPlus } from "lucide-react"

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await register(form)
    if (!result.success) {
      setError(result.error || "Registration failed")
      setLoading(false)
    } else {
      navigate("/portal")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-[var(--radius)] bg-[rgb(var(--primary))] flex items-center justify-center shadow-sm">
              <CalendarDays className="h-5 w-5 text-[rgb(var(--primary-foreground))]" />
            </div>
            <span className="text-xl font-bold text-[rgb(var(--foreground))]">Veridian Dental Studio</span>
          </Link>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Create Patient Account</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Track your appointments and leave verified reviews
          </p>
        </div>

        <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 shadow-sm space-y-4">
          <div className="bg-[rgb(var(--muted)/0.4)] p-3 rounded-[calc(var(--radius)-2px)] border border-[rgb(var(--border))] text-[11px] text-[rgb(var(--muted-foreground))]">
            <span className="font-semibold text-[rgb(var(--foreground))]">Note:</span> This registration is for patient accounts. Doctor and staff accounts are provisioned exclusively by clinic administration.
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Maria Santos"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="maria@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                placeholder="+63 917 123 4567"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-[rgb(var(--destructive))] bg-[rgb(var(--destructive)/0.1)] px-3 py-2 rounded-[var(--radius)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Register as Patient
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[rgb(var(--border))] text-center text-xs text-[rgb(var(--muted-foreground))]">
            Already have an account?{" "}
            <Link to="/login" className="text-[rgb(var(--primary))] font-medium hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
