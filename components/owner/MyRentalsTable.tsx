"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { showError, showSuccess } from "@/components/ui/toast"
import {
  acceptOwnerBooking,
  getOwnerRentals,
  rejectOwnerBooking,
  returnOwnerBooking,
} from "@/lib/actions/owner"
import type { OwnerRental } from "@/types/customer"

const PLACEHOLDER_IMAGE = "/images/equipment-placeholder.svg"

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
  if (value === "returned") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (value === "completed") {
    return "border-slate-200 bg-slate-100 text-slate-600"
  }
  if (value === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }
  if (["rejected", "cancelled", "canceled"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700"
  }

  return "border-slate-200 bg-slate-50 text-slate-600"
}

function TableSkeleton() {
  return (
    <TableBody aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: 9 }).map((__, cell) => (
            <TableCell key={cell}>
              <div className="h-4 w-20 animate-pulse rounded-full bg-slate-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default function MyRentalsTable() {
  const [rentals, setRentals] = useState<OwnerRental[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<OwnerRental | null>(null)

  const loadRentals = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const data = await getOwnerRentals()
      setRentals(data)
    } catch (fetchError) {
      setRentals([])
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load your rentals"
      )
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRentals()
  }, [loadRentals])

  useEffect(() => {
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

  async function handleAccept(rental: OwnerRental) {
    if (busyId) return

    setBusyId(rental._id)

    try {
      const result = await acceptOwnerBooking(rental._id)
      showSuccess(result.message || "Booking accepted successfully")
      await loadRentals(true)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to accept booking"
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleReturn(rental: OwnerRental) {
    if (busyId) return

    setBusyId(rental._id)

    try {
      const result = await returnOwnerBooking(rental._id)
      showSuccess(result)
      await loadRentals(true)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to mark equipment as returned"
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject() {
    if (!rejectTarget || busyId) return

    const target = rejectTarget
    setBusyId(target._id)

    try {
      const result = await rejectOwnerBooking(target._id)
      showSuccess(result.message || "Booking rejected successfully")

      if (
        result.refundStatus === "failed" ||
        result.refundStatus === "unavailable"
      ) {
        showError(
          "Refund could not be processed automatically. Please contact support."
        )
      } else if (result.refundStatus === "pending") {
        showError("Refund was requested but has not completed yet.")
      }

      setRejectTarget(null)
      await loadRentals(true)
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to reject booking"
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="size-4" aria-hidden="true" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => void loadRentals()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-red-50"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Customer Information</TableHead>
                <TableHead>Equipment Information</TableHead>
                <TableHead>Rental Start</TableHead>
                <TableHead>Rental End</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Booking Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            {isLoading ? (
              <TableSkeleton />
            ) : rentals.length > 0 ? (
              <TableBody>
                {rentals.map((rental) => {
                  const isPending =
                    (rental.bookingStatus || "Pending") === "Pending"
                  const isPaid =
                    (rental.paymentStatus || "").toLowerCase() === "paid"

                  return (
                    <TableRow key={rental._id} className="hover:bg-slate-50">
                      <TableCell>
                        <p className="font-semibold text-slate-900">
                          {rental.customerName || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {rental.customerEmail || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {rental.contactNumber || "N/A"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={rental.equipmentImage || PLACEHOLDER_IMAGE}
                            alt={rental.equipmentName || "Equipment"}
                            className="size-12 rounded-lg border border-slate-200 bg-slate-100 object-cover"
                          />
                          <span className="font-medium text-slate-700">
                            {rental.equipmentName || "N/A"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {formatDate(rental.rentalStartDate)}
                      </TableCell>
                      <TableCell>{formatDate(rental.rentalEndDate)}</TableCell>
                      <TableCell>{rental.requiredQuantity ?? "—"}</TableCell>
                      <TableCell className="font-semibold text-emerald-700">
                        {formatAmount(rental.totalAmount)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={paymentClasses(rental.paymentStatus)}
                        >
                          {rental.paymentStatus || "Pending"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={bookingClasses(rental.bookingStatus)}
                        >
                          {rental.bookingStatus || "Pending"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              !isPending || !isPaid || busyId === rental._id
                            }
                            title={
                              !isPaid
                                ? "Payment must be completed before accepting"
                                : !isPending
                                  ? "Only pending bookings can be accepted"
                                  : undefined
                            }
                            onClick={() => void handleAccept(rental)}
                            className="h-8 bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            {busyId === rental._id ? (
                              <Loader2
                                className="size-3.5 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <CheckCircle2
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            )}
                            Accept
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!isPending || busyId === rental._id}
                            onClick={() => setRejectTarget(rental)}
                            className="h-8 border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="size-3.5" aria-hidden="true" />
                            Reject
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              !["Confirmed", "Active"].includes(
                                rental.bookingStatus || ""
                              ) || busyId === rental._id
                            }
                            title="Confirm the equipment is back to restore its quantity"
                            onClick={() => void handleReturn(rental)}
                            className="h-8 border-emerald-200 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            <RotateCcw className="size-3.5" aria-hidden="true" />
                            Return
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            ) : null}
          </Table>
        </div>

        {!isLoading && !error && rentals.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <RotateCcw className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              No rentals found
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Rental bookings for your equipment will appear here.
            </p>
          </div>
        ) : null}
      </div>

      <AlertDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject the booking for{" "}
              <strong>{rejectTarget?.equipmentName || "this equipment"}</strong>
              .
              {rejectTarget?.paymentStatus === "Paid"
                ? " A Stripe refund will be attempted automatically. The payment status will only change to Refunded once Stripe confirms the refund."
                : " No payment has been made for this booking."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleReject()}
              disabled={busyId !== null}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {busyId ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {busyId ? "Rejecting..." : "Reject booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
