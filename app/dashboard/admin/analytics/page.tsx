import type { Metadata } from "next"

import { AdminPageHeading, formatCurrency } from "@/components/admin/AdminUI"
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
    { label: "Registered users", value: String(stats.userCount) },
    { label: "Approved equipment", value: String(stats.equipment.approved) },
    { label: "Pending review", value: String(stats.equipment.pending) },
    { label: "Rejected equipment", value: String(stats.equipment.rejected) },
    { label: "Total rentals", value: String(stats.rentalCount) },
    { label: "Paid revenue", value: formatCurrency(stats.revenue) },
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
    </>
  )
}
