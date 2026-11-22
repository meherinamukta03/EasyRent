import type { Metadata } from "next"

import {
  AdminPageHeading,
  formatCurrency,
  MonthlyBars,
} from "@/components/admin/AdminUI"
import { getOwnerAnalytics } from "@/lib/actions/owner"
import { requireRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Analytics | EasyRent Owner",
  description: "Your equipment and rental statistics.",
}

export default async function OwnerAnalyticsPage() {
  await requireRole("owner")
  const stats = await getOwnerAnalytics()

  const cards = [
    { label: "Listed equipment", value: String(stats.totalEquipment) },
    { label: "Total bookings", value: String(stats.totalBookings) },
    { label: "Completed rentals", value: String(stats.completedRentals) },
    { label: "Pending requests", value: String(stats.pendingRequests) },
    { label: "Total earnings", value: formatCurrency(stats.totalEarnings) },
  ]

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <AdminPageHeading
          eyebrow="Owner insights"
          title="Analytics"
          description="Live statistics for your own equipment and rentals."
        />
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                {card.label}
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </section>
        <MonthlyBars
          data={stats.monthlyEarnings}
          title="Monthly earnings"
          valueKey="amount"
        />
      </div>
    </main>
  )
}
