import type { Metadata } from "next"
import { BarChart3, Package, Users } from "lucide-react"

import DashboardHome from "@/components/dashboard/DashboardHome"
import { requireRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Admin Dashboard | EasyRent",
  description: "Oversee users, equipment, rentals, and analytics.",
}

export default async function AdminDashboardPage() {
  await requireRole("admin")

  return (
    <DashboardHome
      eyebrow="Admin dashboard"
      title="Platform overview"
      description="Oversee users, equipment listings, rentals, and platform analytics."
      links={[
        {
          label: "Users",
          description: "Manage registered EasyRent accounts.",
          href: "/dashboard/admin/users",
          icon: Users,
        },
        {
          label: "Equipment",
          description: "Review and manage equipment listings.",
          href: "/dashboard/admin/equipment",
          icon: Package,
        },
        {
          label: "Rentals",
          description: "Monitor bookings across the platform.",
          href: "/dashboard/admin/rentals",
          icon: BarChart3,
        },
      ]}
    />
  )
}
