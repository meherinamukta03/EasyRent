import type { Metadata } from "next"
import { CalendarCheck, Package, PackagePlus } from "lucide-react"

import DashboardHome from "@/components/dashboard/DashboardHome"
import { requireRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Owner Dashboard | EasyRent",
  description: "Manage your equipment listings and rental requests.",
}

export default async function OwnerDashboardPage() {
  await requireRole("owner")

  return (
    <DashboardHome
      eyebrow="Owner dashboard"
      title="Manage your equipment"
      description="Add listings, review rental requests, and keep track of your equipment."
      links={[
        {
          label: "My Equipment",
          description: "View and update the equipment you have listed.",
          href: "/dashboard/owner/my-equipment",
          icon: Package,
        },
        {
          label: "Add Equipment",
          description: "List new equipment and make it available for rent.",
          href: "/dashboard/owner/add-equipment",
          icon: PackagePlus,
        },
        {
          label: "My Rentals",
          description: "Review bookings and accept paid rental requests.",
          href: "/dashboard/owner/my-rentals",
          icon: CalendarCheck,
        },
      ]}
    />
  )
}
