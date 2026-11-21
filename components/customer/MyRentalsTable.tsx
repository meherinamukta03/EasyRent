"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AlertCircle, CalendarDays, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyRentals } from "@/lib/actions/customer";
import type { RentalBooking } from "@/types/customer";

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return format(date, "dd MMM yyyy");
}

function formatAmount(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";

  return `৳${value.toLocaleString("en-US")}`;
}

function statusClasses(status?: string) {
  const value = (status || "").toLowerCase();

  if (["paid", "succeeded", "completed", "approved", "confirmed"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["pending", "processing", "active", "reserved"].includes(value)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    ["cancelled", "canceled", "rejected", "failed", "unpaid", "refunded"].includes(
      value
    )
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function StatusBadge({ value }: { value?: string }) {
  return (
    <Badge variant="outline" className={statusClasses(value)}>
      {value || "—"}
    </Badge>
  );
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
  );
}

export default function MyRentalsTable() {
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const loadRentals = useCallback(async () => {
    const currentRequest = ++requestRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyRentals();

      if (requestRef.current !== currentRequest) return;
      setRentals(data);
    } catch (fetchError) {
      if (requestRef.current !== currentRequest) return;
      setRentals([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load your rentals"
      );
    } finally {
      if (requestRef.current === currentRequest) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Data fetching on mount; state updates happen after the async request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRentals();
  }, [loadRentals]);

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
            onClick={loadRentals}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-red-50"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
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

          {isLoading ? (
            <TableSkeleton />
          ) : rentals.length > 0 ? (
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental._id}>
                  <TableCell className="font-semibold text-slate-900">
                    <Link
                      href={`/dashboard/customer/my-rentals/${rental._id}`}
                      className="transition hover:text-emerald-700 hover:underline"
                    >
                      {rental.equipmentName || "Equipment"}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(rental.rentalStartDate)}</TableCell>
                  <TableCell>{formatDate(rental.rentalEndDate)}</TableCell>
                  <TableCell>{formatDate(rental.createdAt)}</TableCell>
                  <TableCell className="font-semibold text-emerald-700">
                    {formatAmount(rental.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={rental.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={rental.bookingStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : null}
        </Table>

        {!isLoading && !error && rentals.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CalendarDays className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">
              No rentals yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              When you book equipment, your rentals will appear here.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
