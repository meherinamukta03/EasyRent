import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Package,
} from "lucide-react";

import { getMyBookingById } from "@/lib/actions/customer";
import { requireRole } from "@/lib/auth-server";
import { formatCurrency } from "@/lib/rental";

const PLACEHOLDER_IMAGE = "/images/equipment-placeholder.svg";

interface BookingConfirmationProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Booking Confirmation | EasyRent",
  description: "Details of your equipment booking request.",
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <CheckCircle2 className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationProps) {
  await requireRole("customer");

  const { id } = await params;
  const booking = await getMyBookingById(id);

  if (!booking) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link
          href="/dashboard/customer/my-rentals"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to my rentals
        </Link>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Booking request confirmed
          </h1>
          <p className="mt-1 text-sm text-emerald-800">
            Your booking has been saved. The owner will review it shortly.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                  {(booking.rentalType || "Daily").toLowerCase()}
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Package className="size-4 text-emerald-600" aria-hidden="true" />
                  Booking ID
                </dt>
                <dd className="max-w-[60%] truncate font-mono text-xs font-semibold text-slate-900">
                  {booking._id}
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
                  <CalendarClock
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Rental duration
                </dt>
                <dd className="font-semibold text-slate-900">
                  {booking.rentalDuration ?? 0} {booking.rentalType || "Daily"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="size-4 text-emerald-600" aria-hidden="true" />
                  Rental period
                </dt>
                <dd className="text-right font-semibold text-slate-900">
                  {formatDate(booking.rentalStartDate)} –{" "}
                  {formatDate(booking.rentalEndDate)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Payment summary</h2>
            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Total rental amount
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-700">
                {formatCurrency(booking.totalAmount ?? 0)}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge label={`Booking: ${booking.bookingStatus || "Pending"}`} />
              <StatusBadge label={`Payment: ${booking.paymentStatus || "Pending"}`} />
            </div>

            <p className="mt-5 text-xs leading-6 text-slate-500">
              No payment has been taken yet. Payment will be handled separately
              after the booking is approved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
