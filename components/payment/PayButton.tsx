"use client"

import { useState } from "react"
import { CreditCard, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { showError, showSuccess } from "@/components/ui/toast"
import { createCheckoutSession } from "@/lib/actions/customer"
import { formatCurrency } from "@/lib/rental"

interface PayButtonProps {
  amount: number
  bookingId: string
}

export default function PayButton({ amount, bookingId }: PayButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  async function handlePay() {
    if (isRedirecting) return

    setIsRedirecting(true)

    try {
      const checkout = await createCheckoutSession(bookingId)

      if (!checkout.ok) {
        showError(checkout.message)
        setIsRedirecting(false)
        return
      }

      showSuccess("Opening secure Stripe checkout...")
      window.location.href = checkout.data.checkoutUrl
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : ""

      showError(
        /minified react error|digest/i.test(rawMessage)
          ? "Could not start checkout. Please try again."
          : rawMessage || "Could not start checkout"
      )
      setIsRedirecting(false)
    }
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Ready to pay?
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Pay securely through Stripe to confirm your rental. Your booking stays
        Pending until payment is completed.
      </p>

      <Button
        type="button"
        size="lg"
        onClick={() => void handlePay()}
        disabled={isRedirecting}
        className="mt-4 h-12 w-full text-sm font-semibold"
      >
        {isRedirecting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard className="size-4" aria-hidden="true" />
        )}
        {isRedirecting
          ? "Opening checkout..."
          : `Pay ${formatCurrency(amount)}`}
      </Button>

      <p className="mt-3 text-center text-xs text-slate-500">
        You will be redirected to Stripe. No charge is made until you complete
        checkout.
      </p>
    </div>
  )
}
