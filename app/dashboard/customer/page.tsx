import type { Metadata } from "next"
import { CalendarCheck, Heart, UserRound } from "lucide-react"

import DashboardHome from "@/components/dashboard/DashboardHome"
import { requireRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Customer Dashboard | EasyRent",
  description: "Manage your rentals and saved equipment.",
}

export default async function CustomerDashboardPage() {
  await requireRole("customer")

  return (
    <DashboardHome
      eyebrow="Customer dashboard"
      title="Your rentals, all in one place"
      description="Track your bookings, revisit saved equipment, and keep your profile up to date."
      links={[
        {
          label: "My Rentals",
          description:
            "See booking and payment status for everything you have rented.",
          href: "/dashboard/customer/my-rentals",
          icon: CalendarCheck,
        },
        {
          label: "Favorites",
          description: "Equipment you saved for later, ready to book again.",
          href: "/dashboard/customer/favorites",
          icon: Heart,
        },
        {
          label: "Profile",
          description: "Update your personal details and contact information.",
          href: "/dashboard/profile",
          icon: UserRound,
        },
      ]}
    />
  )
}
