import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
} from "lucide-react"

import PayButton from "@/components/payment/PayButton"
import { getMyBookingById } from "@/lib/actions/customer"
import { requireRole } from "@/lib/auth-server"
import { formatCurrency } from "@/lib/rental"

const PLACEHOLDER_IMAGE = "/images/equipment-placeholder.svg"

interface PaymentPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Payment | EasyRent",
  description: "Review your booking and payment status.",
}

function formatDate(value?: string) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  await requireRole("customer")

  const { id } = await params

  let booking: Awaited<ReturnType<typeof getMyBookingById>> = null
  let loadFailed = false

  try {
    booking = await getMyBookingById(id)
  } catch {
    loadFailed = true
  }

  if (loadFailed) {
    return (
      <main className="min-h-screen bg-slate-50/70 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Could not load payment details
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please try again or view your rentals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/payment/${id}`}
              className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Try again
            </Link>
            <Link
              href="/dashboard/customer/my-rentals"
              className="inline-flex rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              My rentals
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!booking) {
    notFound()
  }

  const rentalType = booking.rentalType || "Daily"
  const paymentStatus = booking.paymentStatus || "Pending"

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/dashboard/customer/my-rentals"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
        >
          <Package className="size-4" aria-hidden="true" />
          Back to my rentals
        </Link>

        <header className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase">
              Secure checkout
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Payment details
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <Clock3 className="size-3.5" aria-hidden="true" />
            Payment: {paymentStatus}
          </span>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={booking.equipmentImage || PLACEHOLDER_IMAGE}
                alt={booking.equipmentName || "Equipment"}
                className="size-20 rounded-xl border border-slate-200 bg-slate-100 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-slate-900">
                  {booking.equipmentName || "Equipment"}
                </p>
                <p className="text-sm text-slate-500">
                  {formatCurrency(booking.rentalPrice ?? 0)} /{" "}
                  {rentalType.toLowerCase()}
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Booking ID</dt>
                <dd className="max-w-[60%] truncate font-mono text-xs font-semibold text-slate-900">
                  {booking._id}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <CalendarClock
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Rental duration
                </dt>
                <dd className="font-semibold text-slate-900">
                  {booking.rentalDuration ?? 0} {rentalType}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Required quantity</dt>
                <dd className="font-semibold text-slate-900">
                  {booking.requiredQuantity ?? 0}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <MapPin
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Rental period
                </dt>
                <dd className="text-right font-semibold text-slate-900">
                  {formatDate(booking.rentalStartDate)} –{" "}
                  {formatDate(booking.rentalEndDate)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">
              Payment summary
            </h2>
            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Total rental amount
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-700">
                {formatCurrency(booking.totalAmount ?? 0)}
              </p>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Booking status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  {booking.bookingStatus || "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Payment status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {paymentStatus}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              Your booking is saved with a <strong>Pending</strong> payment
              status. After Stripe confirms your payment, the payment status
              becomes Paid while the booking stays Pending until the equipment
              owner accepts it.
            </div>

            <PayButton
              amount={Number(booking.totalAmount ?? 0)}
              bookingId={booking._id}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
