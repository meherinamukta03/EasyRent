import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, XCircle } from "lucide-react";

import { getMyBookingById } from "@/lib/actions/customer";
import { requireRole } from "@/lib/auth-server";
import { formatCurrency } from "@/lib/rental";

export const metadata: Metadata = {
  title: "Payment Cancelled | EasyRent",
  description: "Your Stripe checkout was cancelled.",
};

interface CancelPageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: CancelPageProps) {
  await requireRole("customer");

  const { bookingId } = await searchParams;

  if (!bookingId) {
    notFound();
  }

  const booking = await getMyBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <XCircle className="size-7" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No charge was made. Your booking is still saved with a Pending payment
          status — you can retry payment at any time.
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Equipment</span>
            <span className="font-semibold text-slate-900">
              {booking.equipmentName || "Equipment"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Amount due</span>
            <span className="font-semibold text-emerald-700">
              {formatCurrency(booking.totalAmount ?? 0)}
            </span>
          </div>
        </div>

        <Link
          href={`/payment/${booking._id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to payment
        </Link>
      </div>
    </main>
  );
}
