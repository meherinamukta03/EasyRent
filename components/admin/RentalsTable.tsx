"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
  adminSelectClass,
  bookingStatusTone,
  EmptyState,
  ErrorNotice,
  formatCurrency,
  formatDate,
  formatDateTime,
  paymentStatusTone,
  shortId,
  StatusBadge,
} from "@/components/admin/AdminUI"
import {
  ADMIN_BOOKING_STATUSES,
  ADMIN_PAYMENT_STATUSES,
  getAllowedBookingTransitions,
} from "@/constants/admin"
import {
  getAdminRentals,
  updateAdminBookingStatus,
} from "@/lib/actions/admin"
import type { AdminRental } from "@/types/admin"

const PAGE_SIZE = 10

export default function RentalsTable() {
  const [rentals, setRentals] = useState<AdminRental[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [bookingStatus, setBookingStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")

  const [statusTarget, setStatusTarget] = useState<AdminRental | null>(null)
  const [nextStatus, setNextStatus] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const requestRef = useRef(0)

  // Debounce the search box so typing does not fire one request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const loadRentals = useCallback(async () => {
    const currentRequest = ++requestRef.current

    setIsLoading(true)
    setError(null)

    try {
      const data = await getAdminRentals({
        search,
        bookingStatus,
        paymentStatus,
        page,
        limit: PAGE_SIZE,
      })

      if (requestRef.current !== currentRequest) return
      setRentals(data.rentals)
      setTotal(data.total)
      setPages(data.pages)
    } catch (fetchError) {
      if (requestRef.current !== currentRequest) return
      setRentals([])
      setTotal(0)
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load rentals"
      )
    } finally {
      if (requestRef.current === currentRequest) setIsLoading(false)
    }
  }, [search, bookingStatus, paymentStatus, page])

  useEffect(() => {
    // Filters are state-driven; fetch on every filter/page change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRentals()
  }, [loadRentals])

  function handleFilterChange(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  function openStatusDialog(rental: AdminRental) {
    const options = getAllowedBookingTransitions(rental.bookingStatus)
    setStatusTarget(rental)
    setNextStatus(options[0] || "")
  }

  async function handleStatusUpdate() {
    if (!statusTarget || !nextStatus || isUpdating) return

    setIsUpdating(true)

    try {
      const message = await updateAdminBookingStatus(
        statusTarget._id,
        nextStatus
      )

      setStatusTarget(null)
      setNextStatus("")
      showSuccess(message)
      void loadRentals()
    } catch (actionError) {
      showError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to update booking status"
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const allowedStatuses = statusTarget
    ? getAllowedBookingTransitions(statusTarget.bookingStatus)
    : []
  const paidBookingBlocked =
    statusTarget?.paymentStatus === "Paid" &&
    ["Cancelled", "Rejected"].includes(nextStatus)

  return (
    <div className="space-y-4">
      {error ? <ErrorNotice message={error} onRetry={() => void loadRentals()} /> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.04]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              All rental bookings
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Monitor bookings, payments and fulfilment across the platform.
            </p>
          </div>
          {!isLoading && !error ? (
            <Badge
              variant="outline"
              className="self-start border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 sm:self-auto"
            >
              {total} {total === 1 ? "booking" : "bookings"}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-3 border-b border-slate-100 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value)
                setPage(1)
              }}
              placeholder="Search customer, owner or equipment"
              aria-label="Search rentals"
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>
          <select
            value={bookingStatus}
            onChange={(event) =>
              handleFilterChange(setBookingStatus, event.target.value)
            }
            aria-label="Filter by booking status"
            className={adminSelectClass}
          >
            <option value="">All booking statuses</option>
            {ADMIN_BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(event) =>
              handleFilterChange(setPaymentStatus, event.target.value)
            }
            aria-label="Filter by payment status"
            className={adminSelectClass}
          >
            <option value="">All payment statuses</option>
            {ADMIN_PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2
              className="size-4 animate-spin text-emerald-600"
              aria-hidden="true"
            />
            Loading rentals…
          </div>
        ) : rentals.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[1180px]">
              <TableHeader className="bg-white">
                <TableRow className="border-slate-200 bg-slate-50/70 text-xs font-bold tracking-wide text-slate-500 uppercase">
                  <TableHead className="px-5 sm:px-6">Customer</TableHead>
                  <TableHead className="px-5 sm:px-6">Owner</TableHead>
                  <TableHead className="px-5 sm:px-6">Equipment</TableHead>
                  <TableHead className="px-5 sm:px-6">Rental period</TableHead>
                  <TableHead className="px-5 sm:px-6">Quantity</TableHead>
                  <TableHead className="px-5 sm:px-6">Amount</TableHead>
                  <TableHead className="px-5 sm:px-6">Payment</TableHead>
                  <TableHead className="px-5 sm:px-6">Booking</TableHead>
                  <TableHead className="px-5 text-right sm:px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow
                    key={rental._id}
                    className="border-slate-100 transition hover:bg-emerald-50/40"
                  >
                    <TableCell className="px-5 py-4 sm:px-6">
                      <p className="font-semibold text-slate-900">
                        {rental.customerName || "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {rental.customerEmail || "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {rental.contactNumber || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <p className="text-slate-700">{rental.ownerName || "—"}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {rental.ownerEmail || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {rental.equipmentImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rental.equipmentImage}
                              alt={rental.equipmentName || "Equipment"}
                              className="size-full object-cover"
                            />
                          ) : (
                            <CalendarDays
                              className="size-4 text-slate-400"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className="max-w-40 truncate font-semibold text-slate-800">
                          {rental.equipmentName || "Equipment"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <p className="text-slate-700">
                        {formatDate(rental.rentalStartDate)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        to {formatDate(rental.rentalEndDate)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {rental.rentalDuration ?? "—"} {rental.rentalType || "Daily"}
                        {rental.rentalDays ? ` · ${rental.rentalDays} day(s)` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-slate-700 sm:px-6">
                      {rental.requiredQuantity ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-semibold text-emerald-700 sm:px-6">
                      {formatCurrency(rental.totalAmount)}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <StatusBadge
                        value={rental.paymentStatus || "Pending"}
                        tone={paymentStatusTone(rental.paymentStatus)}
                      />
                      {rental.stripePaymentIntentId || rental.stripeSessionId ? (
                        <p
                          className="mt-1 font-mono text-[0.65rem] text-slate-500"
                          title={rental.stripePaymentIntentId || rental.stripeSessionId}
                        >
                          {shortId(
                            rental.stripePaymentIntentId || rental.stripeSessionId
                          )}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <StatusBadge
                        value={rental.bookingStatus || "Pending"}
                        tone={bookingStatusTone(rental.bookingStatus)}
                      />
                      <p className="mt-1 text-[0.65rem] text-slate-500">
                        {formatDateTime(rental.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right sm:px-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={getAllowedBookingTransitions(
                          rental.bookingStatus
                        ).length === 0}
                        title={
                          getAllowedBookingTransitions(rental.bookingStatus).length === 0
                            ? "No further status changes are available"
                            : "Update booking status"
                        }
                        onClick={() => openStatusDialog(rental)}
                        className="text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                        Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays className="size-7" aria-hidden="true" />}
            title={
              search || bookingStatus || paymentStatus
                ? "No matching rentals"
                : "No rentals yet"
            }
            description={
              search || bookingStatus || paymentStatus
                ? "Try adjusting your search or filters."
                : "Bookings made by customers will appear here."
            }
          />
        )}

        {!isLoading && total > 0 ? (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="h-9 gap-1 rounded-full px-3 text-xs"
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {pages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
                className="h-9 gap-1 rounded-full px-3 text-xs"
              >
                Next
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setStatusTarget(null)
            setNextStatus("")
          }
        }}
      >
        {statusTarget ? (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Update booking status
              </DialogTitle>
              <DialogDescription>
                Booking #{shortId(statusTarget._id, 8)} for{" "}
                {statusTarget.equipmentName || "equipment"}. Payment status is
                never changed here.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label
                htmlFor="admin-booking-status"
                className="text-sm font-semibold text-slate-700"
              >
                New status
              </label>
              <select
                id="admin-booking-status"
                value={nextStatus}
                disabled={isUpdating}
                onChange={(event) => setNextStatus(event.target.value)}
                className={adminSelectClass}
              >
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-slate-500">
                Allowed from the current{" "}
                <span className="font-semibold">
                  {statusTarget.bookingStatus || "Pending"}
                </span>{" "}
                status. Payment records and transaction history are preserved.
              </p>
              {paidBookingBlocked ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  Paid bookings must be handled through the refund workflow and
                  cannot be cancelled here.
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" disabled={isUpdating} />}
              >
                Cancel
              </DialogClose>
              <Button
                type="button"
                disabled={!nextStatus || isUpdating || paidBookingBlocked}
                onClick={() => void handleStatusUpdate()}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isUpdating ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Confirm update
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  )
}
