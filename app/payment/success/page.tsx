import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, Clock3, Package } from "lucide-react"

import { getMyBookingById, verifyPayment } from "@/lib/actions/customer"
import { requireRole } from "@/lib/auth-server"
import { formatCurrency } from "@/lib/rental"

export const metadata: Metadata = {
  title: "Payment Confirmation | EasyRent",
  description: "Stripe checkout completion status.",
}

interface SuccessPageProps {
  searchParams: Promise<{ bookingId?: string; session_id?: string }>
}

export default async function PaymentSuccessPage({
  searchParams,
}: SuccessPageProps) {
  await requireRole("customer")

  const { bookingId, session_id: sessionId } = await searchParams

  if (!bookingId) {
    notFound()
  }

  // Never trust the redirect alone. Verify with Stripe through the backend
  // first, then read the freshly stored status.
  await verifyPayment(bookingId, sessionId)

  const booking = await getMyBookingById(bookingId)

  if (!booking) {
    notFound()
  }

  const isPaid = booking.paymentStatus === "Paid"

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div
          className={`rounded-2xl border bg-white px-6 py-12 text-center shadow-sm ${
            isPaid ? "border-emerald-200" : "border-amber-200"
          }`}
        >
          <span
            className={`mx-auto flex size-14 items-center justify-center rounded-full ${
              isPaid
                ? "bg-emerald-600 text-white"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="size-7" aria-hidden="true" />
            ) : (
              <Clock3 className="size-7" aria-hidden="true" />
            )}
          </span>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            {isPaid ? "Payment complete" : "Payment is being confirmed"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isPaid
              ? "Your payment has been received. Your booking stays Pending until the equipment owner accepts it."
              : "Stripe has redirected you back. We are confirming your payment — this page updates automatically once Stripe confirms it."}
          </p>

          <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-5 text-left text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Equipment</span>
              <span className="font-semibold text-slate-900">
                {booking.equipmentName || "Equipment"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Booking ID</span>
              <span className="max-w-[60%] truncate font-mono text-xs font-semibold text-slate-900">
                {booking._id}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(booking.totalAmount ?? 0)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Payment status</span>
              <span className="font-semibold text-slate-900">
                {booking.paymentStatus || "Pending"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/payment/${booking._id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Package className="size-4" aria-hidden="true" />
              View payment details
            </Link>
            <Link
              href="/dashboard/customer/my-rentals"
              className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              My rentals
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
