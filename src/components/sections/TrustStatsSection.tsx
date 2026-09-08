import { Users, Star, Clock, Shield } from "lucide-react"

interface TrustStatsSectionProps {
  content: Record<string, any> | null
}

export function TrustStatsSection({ content }: TrustStatsSectionProps) {
  const stats = content?.stats ?? [
    { icon: "users", value: "500+", label: "Happy Clients" },
    { icon: "star", value: "4.9", label: "Average Rating" },
    { icon: "clock", value: "5+", label: "Years Experience" },
    { icon: "shield", value: "100%", label: "Satisfaction Guarantee" },
  ]

  const iconMap: Record<string, React.ReactNode> = {
    users: <Users className="h-5 w-5" />,
    star: <Star className="h-5 w-5" />,
    clock: <Clock className="h-5 w-5" />,
    shield: <Shield className="h-5 w-5" />,
  }

  return (
    <section className="border-y border-[rgb(var(--border))] bg-[rgb(var(--card))] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat: any, i: number) => (
            <div key={i} className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-[var(--radius)] bg-[rgb(var(--primary)/0.1)] flex items-center justify-center text-[rgb(var(--primary))]">
                  {iconMap[stat.icon] ?? <Shield className="h-5 w-5" />}
                </div>
              </div>
              <div className="text-2xl font-bold text-[rgb(var(--foreground))]">{stat.value}</div>
              <div className="text-sm text-[rgb(var(--muted-foreground))]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}