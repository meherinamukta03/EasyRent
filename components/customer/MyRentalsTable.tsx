"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  RotateCcw,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMyRentals } from "@/lib/actions/customer"
import type { RentalBooking } from "@/types/customer"

function formatDate(value?: string) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return format(date, "dd MMM yyyy")
}

function formatAmount(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—"

  return `৳${value.toLocaleString("en-US")}`
}

function paymentClasses(status?: string) {
  const value = (status || "").toLowerCase()

  if (["paid", "succeeded"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (["pending", "processing"].includes(value)) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  if (["failed", "unpaid"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700"
  }

  if (value === "refunded") {
    return "border-sky-200 bg-sky-50 text-sky-700"
  }

  return "border-slate-200 bg-slate-50 text-slate-600"
}

function bookingClasses(status?: string) {
  const value = (status || "").toLowerCase()

  if (value === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (value === "active") {
    return "border-sky-200 bg-sky-50 text-sky-700"
  }

  if (value === "completed") {
    return "border-slate-200 bg-slate-100 text-slate-600"
  }

  if (["pending"].includes(value)) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  if (["rejected", "cancelled", "canceled"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700"
  }

  return "border-slate-200 bg-slate-50 text-slate-600"
}

function StatusBadge({
  value,
  tone,
}: {
  value?: string
  tone: "payment" | "booking"
}) {
  const className =
    tone === "payment" ? paymentClasses(value) : bookingClasses(value)

  return (
    <Badge variant="outline" className={className}>
      {value || "Pending"}
    </Badge>
  )
}

function TableSkeleton() {
  return (
    <TableBody aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: 7 }).map((__, cell) => (
            <TableCell key={cell}>
              <div className="h-4 w-20 animate-pulse rounded-full bg-slate-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

function MobileSkeleton() {
  return (
    <div aria-hidden="true" className="divide-y divide-slate-100 md:hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3 p-4">
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MyRentalsTable() {
  const [rentals, setRentals] = useState<RentalBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestRef = useRef(0)

  const loadRentals = useCallback(async (silent = false) => {
    const currentRequest = ++requestRef.current

    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const data = await getMyRentals()

      if (requestRef.current !== currentRequest) return
      setRentals(data)
    } catch (fetchError) {
      if (requestRef.current !== currentRequest) return
      setRentals([])
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load your rentals"
      )
    } finally {
      if (requestRef.current === currentRequest) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Data fetching on mount; state updates happen after the async request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRentals()
  }, [loadRentals])

  useEffect(() => {
    // Keep statuses fresh without a manual reload (payments/webhooks and
    // owner decisions happen outside this page).
    const interval = window.setInterval(() => {
      void loadRentals(true)
    }, 10000)

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadRentals(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [loadRentals])

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => void loadRentals()}
            className="inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold transition hover:bg-red-50 sm:self-auto"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.04]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Rental history
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Payments and booking progress update automatically.
            </p>
          </div>
          {!isLoading && !error ? (
            <Badge
              variant="outline"
              className="self-start border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 sm:self-auto"
            >
              {rentals.length} {rentals.length === 1 ? "booking" : "bookings"}
            </Badge>
          ) : null}
        </div>

        {isLoading ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow>
                    <TableHead>Equipment Name</TableHead>
                    <TableHead>Rental Start</TableHead>
                    <TableHead>Rental End</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Booking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableSkeleton />
              </Table>
            </div>
            <MobileSkeleton />
          </>
        ) : rentals.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow>
                    <TableHead>Equipment Name</TableHead>
                    <TableHead>Rental Start</TableHead>
                    <TableHead>Rental End</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Booking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.map((rental) => (
                    <TableRow
                      key={rental._id}
                      className="group transition-colors hover:bg-emerald-50/40"
                    >
                      <TableCell className="font-semibold text-slate-900">
                        <Link
                          href={`/dashboard/customer/my-rentals/${rental._id}`}
                          className="inline-flex items-center gap-1 transition hover:text-emerald-700 hover:underline"
                        >
                          <span className="truncate">
                            {rental.equipmentName || "Equipment"}
                          </span>
                          <ArrowUpRight
                            className="size-3.5 shrink-0 text-slate-300 transition group-hover:text-emerald-600"
                            aria-hidden="true"
                          />
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatDate(rental.rentalStartDate)}
                      </TableCell>
                      <TableCell>{formatDate(rental.rentalEndDate)}</TableCell>
                      <TableCell>{formatDate(rental.createdAt)}</TableCell>
                      <TableCell className="font-semibold text-emerald-700">
                        {formatAmount(rental.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={rental.paymentStatus}
                          tone="payment"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={rental.bookingStatus}
                          tone="booking"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {rentals.map((rental) => (
                <article key={rental._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-bold tracking-[0.14em] text-slate-400 uppercase">
                        Equipment
                      </p>
                      <Link
                        href={`/dashboard/customer/my-rentals/${rental._id}`}
                        className="mt-1 block truncate text-sm font-bold text-slate-900 transition hover:text-emerald-700"
                      >
                        {rental.equipmentName || "Equipment"}
                      </Link>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-emerald-700">
                      {formatAmount(rental.totalAmount)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                    <div>
                      <p className="text-slate-400">Rental start</p>
                      <p className="mt-0.5 font-semibold text-slate-700">
                        {formatDate(rental.rentalStartDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Rental end</p>
                      <p className="mt-0.5 font-semibold text-slate-700">
                        {formatDate(rental.rentalEndDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Booked on</p>
                      <p className="mt-0.5 font-semibold text-slate-700">
                        {formatDate(rental.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Duration</p>
                      <p className="mt-0.5 font-semibold text-slate-700">
                        {rental.rentalDuration ?? "—"}{" "}
                        {rental.rentalType || "Daily"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <StatusBadge value={rental.paymentStatus} tone="payment" />
                    <StatusBadge value={rental.bookingStatus} tone="booking" />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {!isLoading && !error && rentals.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CalendarDays className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              No rentals yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              When you book equipment, your rentals will appear here with their
              payment and booking status.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
