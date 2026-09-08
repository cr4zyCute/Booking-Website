import React, { useState, useEffect } from "react"
import { Star, CheckCircle2, XCircle, Trash2, ShieldCheck, Clock, Loader2, MessageSquare, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"

export function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`, {
        headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (e) {
      console.error("Admin reviews fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        toast.success(`Review ${status.toLowerCase()} successfully!`)
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        setReviews(prev =>
          prev.map(r => (r.id === id ? { ...r, status } : r))
        )
      } else {
        toast.error("Failed to update review status")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this review?")) return

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
      })

      if (res.ok) {
        toast.success("Review deleted")
        try {
          const channel = new BroadcastChannel("website_customization_sync")
          channel.postMessage({ type: "CUSTOMIZATION_UPDATED", timestamp: Date.now() })
          channel.close()
        } catch {}
        setReviews(prev => prev.filter(r => r.id !== id))
      }
    } catch (e) {
      toast.error("Failed to delete review")
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  const pendingCount = reviews.filter(r => r.status === "PENDING").length
  const approvedCount = reviews.filter(r => r.status === "APPROVED").length

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2.5">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            Customer Reviews Moderation
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Review and moderate verified patient reviews submitted after completed appointments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-200 py-1">
            {pendingCount} Pending Review
          </Badge>
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-200 py-1">
            {approvedCount} Live / Approved
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-[var(--radius)] transition-colors cursor-pointer ${
              filter === tab
                ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
                : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
            }`}
          >
            {tab === "ALL" ? "All Reviews" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-12 text-center text-sm text-[rgb(var(--muted-foreground))]">
            No reviews found under "{filter.toLowerCase()}".
          </div>
        ) : (
          reviews.map(rev => {
            const isUpdating = updatingId === rev.id
            const isApproved = rev.status === "APPROVED"
            const isPending = rev.status === "PENDING"
            const isRejected = rev.status === "REJECTED"

            return (
              <div
                key={rev.id}
                className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] p-6 space-y-4 shadow-sm hover:border-[rgb(var(--primary)/0.3)] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
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
                      <span className="font-bold text-sm text-[rgb(var(--foreground))]">{rev.customerName}</span>
                      {rev.isVerified && (
                        <span className="text-[11px] bg-green-500/10 text-green-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified Booking
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">
                      Treatment: <span className="font-medium text-[rgb(var(--foreground))]">{rev.service?.name || "Dental Service"}</span> • Doctor: <span className="font-medium text-[rgb(var(--foreground))]">{rev.staff?.name || "Specialist"}</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto ${
                      isApproved
                        ? "bg-green-500/10 text-green-700 border border-green-200"
                        : isRejected
                        ? "bg-red-500/10 text-red-700 border border-red-200"
                        : "bg-amber-500/10 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {isApproved ? "Approved / Live" : isRejected ? "Rejected" : "Pending Review"}
                  </span>
                </div>

                <div className="bg-[rgb(var(--muted)/0.3)] p-3.5 rounded-[calc(var(--radius)-2px)] text-sm text-[rgb(var(--foreground))] leading-relaxed italic">
                  "{rev.comment}"
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[rgb(var(--border))] text-xs text-[rgb(var(--muted-foreground))]">
                  <span>Submitted {format(new Date(rev.createdAt), "MMMM d, yyyy • h:mm a")}</span>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <Button
                          size="xs"
                          onClick={() => handleUpdateStatus(rev.id, "APPROVED")}
                          disabled={isUpdating}
                          className="gap-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleUpdateStatus(rev.id, "REJECTED")}
                          disabled={isUpdating}
                          className="gap-1 text-red-600 hover:bg-red-50 border-red-200 text-xs"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}

                    {isApproved && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleUpdateStatus(rev.id, "REJECTED")}
                        disabled={isUpdating}
                        className="text-xs text-[rgb(var(--muted-foreground))]"
                      >
                        Hide / Reject
                      </Button>
                    )}

                    {isRejected && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleUpdateStatus(rev.id, "APPROVED")}
                        disabled={isUpdating}
                        className="text-xs text-green-600"
                      >
                        Re-Approve
                      </Button>
                    )}

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDelete(rev.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5"
                      title="Delete review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
