import type { Metadata } from "next"

import { AdminPageHeading } from "@/components/admin/AdminUI"
import RentalsTable from "@/components/admin/RentalsTable"

export const metadata: Metadata = {
  title: "All Rentals | EasyRent Admin",
  description: "Monitor every booking, payment and rental status.",
}

export default function AdminRentalsPage() {
  return (
    <>
      <AdminPageHeading
        eyebrow="Rental monitoring"
        title="All rentals"
        description="Track bookings across the platform. Search by customer, owner or equipment and filter by booking and payment status."
      />
      <RentalsTable />
    </>
  )
}
