import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { CalendarDays, Clock, CheckCircle2, Star, MessageSquare, AlertCircle, Loader2, ShieldCheck, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { format } from "date-fns"

export function CustomerPortalPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"appointments" | "reviews">("appointments")

  // Review modal state
  const [reviewModalAppt, setReviewModalAppt] = useState<any | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchData = async () => {
    try {
      const [apptRes, revRes] = await Promise.all([
        fetch("/api/customer/appointments", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
        fetch("/api/customer/reviews", {
          headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
        }),
      ])

      if (apptRes.ok) {
        const data = await apptRes.json()
        setAppointments(data.appointments || [])
      }
      if (revRes.ok) {
        const data = await revRes.json()
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error("Customer portal fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewModalAppt) return

    setSubmittingReview(true)
    try {
      const res = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({
          appointmentId: reviewModalAppt.id,
          rating,
          comment,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Review submitted! It will appear publicly once approved by our team.")
        setReviewModalAppt(null)
        setComment("")
        setRating(5)
        fetchData()
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch (err) {
      toast.error("Network error while submitting review")
    } finally {
      setSubmittingReview(false)
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Patient Header */}
      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || "P"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">{user?.name || "Patient Profile"}</h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[rgb(var(--muted)/0.5)] px-4 py-2 rounded-[var(--radius)] text-center border border-[rgb(var(--border))]">
            <span className="text-xs text-[rgb(var(--muted-foreground))] block">Appointments</span>
            <span className="text-lg font-bold text-[rgb(var(--foreground))]">{appointments.length}</span>
          </div>
          <div className="bg-[rgb(var(--muted)/0.5)] px-4 py-2 rounded-[var(--radius)] text-center border border-[rgb(var(--border))]">
            <span className="text-xs text-[rgb(var(--muted-foreground))] block">My Reviews</span>
            <span className="text-lg font-bold text-[rgb(var(--foreground))]">{reviews.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[rgb(var(--border))] pb-3">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 text-sm font-semibold rounded-[var(--radius)] transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "appointments"
              ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
              : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          My Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 text-sm font-semibold rounded-[var(--radius)] transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "reviews"
              ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
              : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
          }`}
        >
          <Star className="h-4 w-4" />
          My Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab 1: Appointments */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-12 text-center space-y-3">
              <CalendarDays className="h-10 w-10 text-[rgb(var(--muted-foreground))] mx-auto" />
              <h3 className="text-base font-semibold text-[rgb(var(--foreground))]">No appointments yet</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
                Ready for your visit? Book your treatment with our dental specialists.
              </p>
            </div>
          ) : (
            appointments.map(appt => {
              const startDate = new Date(appt.startAt)
              const isCompleted = appt.status === "COMPLETED"

              return (
                <div
                  key={appt.id}
                  className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm hover:border-[rgb(var(--primary)/0.3)] transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.1)] px-2 py-0.5 rounded">
                        {appt.confirmationCode || "VRD-BOOK"}
                      </span>
                      <h3 className="font-bold text-base text-[rgb(var(--foreground))]">
                        {appt.service?.name || appt.serviceName}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={
                          isCompleted
                            ? "bg-green-500/10 text-green-700 border-green-200"
                            : appt.status === "CONFIRMED"
                            ? "bg-blue-500/10 text-blue-700 border-blue-200"
                            : "bg-amber-500/10 text-amber-700 border-amber-200"
                        }
                      >
                        {appt.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                        <span>{format(startDate, "EEEE, MMMM d, yyyy • h:mm a")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                        <span>Doctor: {appt.staff?.name || appt.staffName || "Clinic Specialist"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Review Eligibility */}
                  <div className="flex items-center gap-3 shrink-0">
                    {appt.canReview ? (
                      <Button
                        size="sm"
                        onClick={() => setReviewModalAppt(appt)}
                        className="gap-1.5 text-xs bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Leave Verified Review
                      </Button>
                    ) : appt.review ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Review Submitted
                      </span>
                    ) : !isCompleted ? (
                      <span className="text-xs text-[rgb(var(--muted-foreground))] italic">
                        Review unlocked after appointment completion
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab 2: My Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-12 text-center space-y-3">
              <Star className="h-10 w-10 text-[rgb(var(--muted-foreground))] mx-auto" />
              <h3 className="text-base font-semibold text-[rgb(var(--foreground))]">No reviews submitted yet</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-sm mx-auto">
                After completing an appointment, you can leave a verified review to help other patients.
              </p>
            </div>
          ) : (
            reviews.map(rev => (
              <div
                key={rev.id}
                className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      rev.status === "APPROVED"
                        ? "bg-green-500/10 text-green-700"
                        : rev.status === "REJECTED"
                        ? "bg-red-500/10 text-red-700"
                        : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {rev.status === "APPROVED" ? "Approved • Live on Website" : "Pending Moderation"}
                  </span>
                </div>

                <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed">"{rev.comment}"</p>

                <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center justify-between pt-2 border-t border-[rgb(var(--border))]">
                  <span>
                    Treatment: {rev.service?.name || "Dental Service"} • Doctor: {rev.staff?.name || "Specialist"}
                  </span>
                  <span>{format(new Date(rev.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Modal Dialog */}
      {reviewModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[rgb(var(--border))]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[rgb(var(--primary))]" />
                <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">Leave a Verified Review</h3>
              </div>
              <button
                onClick={() => setReviewModalAppt(null)}
                className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-[rgb(var(--muted)/0.4)] p-3 rounded-[calc(var(--radius)-2px)] text-xs text-[rgb(var(--muted-foreground))] space-y-1">
              <div><span className="font-semibold text-[rgb(var(--foreground))]">Treatment:</span> {reviewModalAppt.service?.name || reviewModalAppt.serviceName}</div>
              <div><span className="font-semibold text-[rgb(var(--foreground))]">Doctor:</span> {reviewModalAppt.staff?.name || reviewModalAppt.staffName}</div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star rating selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Your Rating</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-[rgb(var(--muted-foreground))] ml-2">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-comment" className="text-xs">Your Feedback & Experience</Label>
                <textarea
                  id="review-comment"
                  rows={4}
                  required
                  minLength={5}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share details of your experience with the clinic and dentist..."
                  className="w-full rounded-[var(--radius)] border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[rgb(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalAppt(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-2" disabled={submittingReview}>
                  {submittingReview ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Submit Verified Review
                    </>
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
