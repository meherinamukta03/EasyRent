import type { Metadata } from "next"

import {
  AdminPageHeading,
  formatCurrency,
  MonthlyBars,
} from "@/components/admin/AdminUI"
import { getAdminAnalytics } from "@/lib/actions/admin"
import { requireRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Analytics | EasyRent Admin",
  description: "Platform-wide EasyRent statistics.",
}

export default async function AdminAnalyticsPage() {
  await requireRole("admin")
  const stats = await getAdminAnalytics()

  const cards = [
    { label: "Total users", value: String(stats.totalUsers) },
    { label: "Total equipment", value: String(stats.totalEquipment) },
    { label: "Total bookings", value: String(stats.totalBookings) },
    { label: "Pending approvals", value: String(stats.pendingApprovals) },
    { label: "Completed rentals", value: String(stats.completedRentals) },
    { label: "Total revenue", value: formatCurrency(stats.totalRevenue) },
  ]

  return (
    <>
      <AdminPageHeading
        eyebrow="Platform insights"
        title="Analytics"
        description="Live counts from the EasyRent database."
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        data={stats.monthlyBookings}
        title="Monthly bookings"
        valueKey="bookings"
      />
    </>
  )
}
