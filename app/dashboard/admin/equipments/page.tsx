import type { Metadata } from "next"

import { AdminPageHeading } from "@/components/admin/AdminUI"
import EquipmentsTable from "@/components/admin/EquipmentsTable"

export const metadata: Metadata = {
  title: "All Equipment | EasyRent Admin",
  description: "Approve, reject and manage every equipment listing.",
}

export default function AdminEquipmentsPage() {
  return (
    <>
      <AdminPageHeading
        eyebrow="Listing review"
        title="All equipment"
        description="Approve pending listings, reject unsuitable items and keep catalogue details up to date. Only approved equipment appears in public listings."
      />
      <EquipmentsTable />
    </>
  )
}
