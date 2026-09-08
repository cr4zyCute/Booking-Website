import React, { useState, useEffect } from "react"
import { useBusiness } from "@/context/BusinessContext"
import { format } from "date-fns"
import { Loader2, Mail, Phone, Calendar } from "lucide-react"

export function CustomersPage() {
  const { terminology } = useBusiness()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/customers", {
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.customers) setCustomers(data.customers)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">{terminology.customerLabel}</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Total {customers.length} registered {terminology.customerLabel.toLowerCase()}.
        </p>
      </div>

      <div className="bg-[rgb(var(--card))] rounded-[var(--radius)] border border-[rgb(var(--border))] overflow-hidden shadow-sm">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-[rgb(var(--muted-foreground))]">
            <p className="font-medium text-[rgb(var(--foreground))]">No {terminology.customerLabel.toLowerCase()} yet</p>
            <p className="text-sm mt-1">Customers will appear here when they book appointments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.4)]">
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Appointments</th>
                  <th className="text-left py-3 px-4 font-medium text-[rgb(var(--muted-foreground))] text-xs uppercase tracking-wider">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {customers.map(cust => (
                  <tr key={cust.id} className="hover:bg-[rgb(var(--muted)/0.3)] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[rgb(var(--foreground))]">
                      {cust.name}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--foreground))]">
                        <Mail className="h-3 w-3 text-[rgb(var(--muted-foreground))]" />
                        {cust.email}
                      </div>
                      {cust.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))]">
                          <Phone className="h-3 w-3" />
                          {cust.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[rgb(var(--foreground))]">
                      {cust._count?.appointments ?? 0} bookings
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[rgb(var(--muted-foreground))]">
                      {cust.appointments?.[0] ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(cust.appointments[0].startAt), "MMM d, yyyy")}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
