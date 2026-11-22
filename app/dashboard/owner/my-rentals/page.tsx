import type { Metadata } from "next"

import MyRentalsTable from "@/components/owner/MyRentalsTable"
import { requireRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "My Equipment Rentals | EasyRent",
  description: "Manage rental bookings for your equipment.",
}

export default async function OwnerMyRentalsPage() {
  await requireRole("owner")

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header>
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase">
            Owner dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Equipment Rentals
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review rental requests, accept paid bookings, and manage your
            equipment.
          </p>
        </header>

        <MyRentalsTable />
      </div>
    </main>
  )
}
