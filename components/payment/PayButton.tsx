"use client";

import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { showInfo } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/rental";

interface PayButtonProps {
  amount: number;
  bookingId: string;
}

/**
 * Placeholder for the future Stripe checkout entry point. No payment request
 * is made yet — the booking stays with a Pending payment status.
 */
export default function PayButton({ amount, bookingId }: PayButtonProps) {
  function handlePay() {
    showInfo(
      `Stripe checkout for booking ${bookingId} will be available soon. Your payment is still Pending.`
    );
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Ready to pay?
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Pay securely to confirm your rental. You will be taken to the payment
        checkout when it is enabled.
      </p>

      <Button
        type="button"
        size="lg"
        onClick={handlePay}
        className="mt-4 h-12 w-full text-sm font-semibold"
      >
        <CreditCard className="size-4" aria-hidden="true" />
        Pay {formatCurrency(amount)}
      </Button>

      <p className="mt-3 text-center text-xs text-slate-500">
        Stripe checkout connection coming soon — no charge is made today.
      </p>
    </div>
  );
}
