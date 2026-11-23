"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { CalendarDays, Loader2, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { showError, showSuccess } from "@/components/ui/toast"
import {
  checkBookingAvailability,
  createBooking,
  createCheckoutSession,
} from "@/lib/actions/customer"
import { calculateRentalQuote, formatCurrency } from "@/lib/rental"
import type { AvailabilityResult } from "@/services/equipment.service"

const PLACEHOLDER_IMAGE = "/images/equipment-placeholder.svg"

interface BookingModalProps {
  equipment: {
    id: string
    name: string
    image?: string
    rentalPrice?: number
    rentalType?: string
    quantity?: number
    availableQuantity?: number
  }
}

type FieldErrors = Record<string, string>

function todayInputValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000

  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export default function BookingModal({ equipment }: BookingModalProps) {
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [contactNumber, setContactNumber] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null
  )
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rentalPrice = Number(equipment.rentalPrice ?? 0)
  const rentalType = equipment.rentalType || "Daily"
  const quantityValue = Number(quantity)

  const quote = useMemo(
    () =>
      calculateRentalQuote(
        rentalPrice,
        rentalType,
        startDate,
        endDate,
        quantityValue
      ),
    [rentalPrice, rentalType, startDate, endDate, quantityValue]
  )

  const availableQuantity = availability
    ? availability.availableQuantity
    : Number(equipment.availableQuantity ?? equipment.quantity ?? 0)

  function handleStartChange(value: string) {
    setStartDate(value)
    setAvailability(null)
  }

  function handleEndChange(value: string) {
    setEndDate(value)
    setAvailability(null)
  }

  useEffect(() => {
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return
    }

    let active = true

    const timer = setTimeout(() => {
      setAvailabilityLoading(true)

      checkBookingAvailability(equipment.id, startDate, endDate)
        .then((result) => {
          if (active) setAvailability(result)
        })
        .catch(() => {
          if (active) setAvailability(null)
        })
        .finally(() => {
          if (active) setAvailabilityLoading(false)
        })
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [equipment.id, startDate, endDate])

  function validate() {
    const nextErrors: FieldErrors = {}
    const today = todayInputValue()

    if (!startDate) {
      nextErrors.startDate = "Rental start date is required"
    } else if (startDate < today) {
      nextErrors.startDate = "Rental start date cannot be in the past"
    }

    if (!endDate) {
      nextErrors.endDate = "Rental end date is required"
    } else if (startDate && endDate <= startDate) {
      nextErrors.endDate = "Rental end date must be after the start date"
    }

    if (availableQuantity < 1) {
      nextErrors.quantity = "Currently unavailable — no units left for this period"
    } else if (!Number.isInteger(quantityValue) || quantityValue < 1) {
      nextErrors.quantity = "Enter a positive whole number"
    } else if (quantityValue > availableQuantity) {
      nextErrors.quantity = `Only ${availableQuantity} unit(s) available for this period`
    }

    if (!/^\d{7,15}$/.test(contactNumber.replace(/[\s-]/g, ""))) {
      nextErrors.contactNumber = "Enter a valid contact number"
    }

    if (deliveryAddress.trim().length < 5) {
      nextErrors.deliveryAddress = "Enter a valid delivery address"
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting || !validate()) return

    setIsSubmitting(true)

    try {
      // Re-check at confirmation time so a competing booking cannot slip in.
      const latest = await checkBookingAvailability(
        equipment.id,
        startDate,
        endDate
      )

      setAvailability(latest)

      if (latest.availableQuantity < quantityValue) {
        setErrors({
          quantity: `Only ${latest.availableQuantity} unit(s) available for this period`,
        })
        return
      }

      const bookingResult = await createBooking({
        equipmentId: equipment.id,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        requiredQuantity: quantityValue,
        contactNumber: contactNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
      })

      if (!bookingResult.ok) {
        showError(bookingResult.message)
        setErrors({ submit: bookingResult.message })
        return
      }

      // Only leave for Stripe once a real Checkout URL has been returned.
      const checkout = await createCheckoutSession(bookingResult.data._id)

      if (!checkout.ok) {
        showError(checkout.message)
        setErrors({ submit: checkout.message })
        return
      }

      showSuccess("Booking created. Redirecting to secure checkout...")
      setOpen(false)
      window.location.href = checkout.data.checkoutUrl
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : ""

      // Production hides Server Action error details. Never show that raw
      // minified message to the customer.
      const message = /minified react error|digest/i.test(rawMessage)
        ? "We couldn't confirm this booking. Please check availability and try again."
        : rawMessage || "Failed to create booking"

      showError(message)
      setErrors({ submit: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSoldOut =
    Number(equipment.availableQuantity ?? equipment.quantity ?? 0) < 1

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        disabled={isSoldOut}
        onClick={() => setOpen(true)}
        className="h-11 px-5 disabled:cursor-not-allowed"
      >
        <CalendarDays aria-hidden="true" />
        {isSoldOut ? "Currently Unavailable" : "Book Now"}
      </Button>

      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book this equipment</DialogTitle>
          <DialogDescription>
            Choose your rental period and provide delivery information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={equipment.image || PLACEHOLDER_IMAGE}
            alt={equipment.name}
            className="size-16 rounded-lg border border-slate-200 bg-white object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {equipment.name}
            </p>
            <p className="text-sm text-slate-600">
              {formatCurrency(rentalPrice)} / {rentalType.toLowerCase()}
            </p>
            <p className="text-xs text-slate-500">
              {availableQuantity} available
            </p>
          </div>
        </div>

        {availability && !availability.available ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            Currently unavailable for these dates — all units are reserved.
            Please choose another period.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="booking-start">Rental Start Date</Label>
              <Input
                id="booking-start"
                type="date"
                min={todayInputValue()}
                value={startDate}
                onChange={(event) => handleStartChange(event.target.value)}
                className="mt-2 h-10"
              />
              {errors.startDate ? (
                <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="booking-end">Rental End Date</Label>
              <Input
                id="booking-end"
                type="date"
                min={startDate || todayInputValue()}
                value={endDate}
                onChange={(event) => handleEndChange(event.target.value)}
                className="mt-2 h-10"
              />
              {errors.endDate ? (
                <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="booking-quantity">Required Quantity</Label>
              <Input
                id="booking-quantity"
                type="number"
                min="1"
                max={availableQuantity}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-2 h-10"
              />
              {errors.quantity ? (
                <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Maximum {availableQuantity} for the selected period
                  {availabilityLoading ? " (checking...)" : ""}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="booking-contact">Contact Number</Label>
              <Input
                id="booking-contact"
                type="tel"
                inputMode="tel"
                placeholder="01XXXXXXXXX"
                value={contactNumber}
                onChange={(event) => setContactNumber(event.target.value)}
                className="mt-2 h-10"
              />
              {errors.contactNumber ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.contactNumber}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="booking-address">Delivery Address</Label>
            <Input
              id="booking-address"
              placeholder="Where should it be delivered?"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              className="mt-2 h-10"
            />
            {errors.deliveryAddress ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.deliveryAddress}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="booking-notes">Additional Notes (optional)</Label>
            <Textarea
              id="booking-notes"
              placeholder="Anything else we should know?"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-2"
            />
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between text-sm text-emerald-800">
              <span>Duration</span>
              <span className="font-semibold">
                {quote ? `${quote.rentalDuration} ${rentalType}` : "—"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-emerald-800">
              <span>Estimated total</span>
              <span className="text-xl font-bold">
                {quote ? formatCurrency(quote.totalAmount) : "—"}
              </span>
            </div>
            <p className="mt-2 text-xs text-emerald-700">
              Final amount is recalculated by the server when the booking is
              confirmed.
            </p>
          </div>

          {errors.submit ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {errors.submit}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Package aria-hidden="true" />
              )}
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
