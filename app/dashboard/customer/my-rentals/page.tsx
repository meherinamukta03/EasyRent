import type { Metadata } from "next"
import { CalendarCheck2 } from "lucide-react"

import MyRentalsTable from "@/components/customer/MyRentalsTable"
import { requireRole } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "My Rentals | EasyRent",
  description: "View all equipment rentals you have booked.",
}

export default async function MyRentalsPage() {
  await requireRole("customer")

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/3 -z-10 size-[30rem] rounded-full bg-emerald-100/50 blur-3xl"
      />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-linear-to-r from-white via-emerald-50/60 to-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[0.68rem] font-bold tracking-[0.16em] text-emerald-700 uppercase">
                <CalendarCheck2 className="size-3.5" aria-hidden="true" />
                Customer dashboard
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Rentals
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Follow every booking in one place — rental dates, payments and
                the latest status of your equipment.
              </p>
            </div>

            <div className="hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 sm:flex">
              <CalendarCheck2 className="size-8" aria-hidden="true" />
            </div>
          </div>
        </header>

        <MyRentalsTable />
      </div>
    </main>
  )
}
