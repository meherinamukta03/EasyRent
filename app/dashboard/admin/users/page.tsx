import type { Metadata } from "next"

import { AdminPageHeading } from "@/components/admin/AdminUI"
import UsersTable from "@/components/admin/UsersTable"

export const metadata: Metadata = {
  title: "All Users | EasyRent Admin",
  description: "Manage registered EasyRent accounts and roles.",
}

export default function AdminUsersPage() {
  return (
    <>
      <AdminPageHeading
        eyebrow="User management"
        title="All users"
        description="Review every registered account, change roles and remove accounts when needed. Your own admin access cannot be removed from here."
      />
      <UsersTable />
    </>
  )
}
