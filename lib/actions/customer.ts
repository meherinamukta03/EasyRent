"use server"

import { requireRole, requireUser } from "@/lib/auth-server"
import {
  fetchEquipmentAvailability,
  getApiBaseUrl,
  type AvailabilityResult,
} from "@/services/equipment.service"
import type {
  BookingInput,
  FavoriteEquipment,
  FavoriteItem,
  RentalBooking,
} from "@/types/customer"

/**
 * Server Action errors are hidden in production builds (the client only sees
 * React's minified error). Expected API/validation failures are therefore
 * returned as values so the real message reaches the UI.
 */
export type BookingActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string }

/**
 * All customer actions derive the email from the verified server session.
 * No email or user id supplied by the browser is ever trusted.
 */
async function getCurrentUser() {
  const session = await requireUser()

  if (!session.user.email) {
    throw new Error("Your account is missing an email address")
  }

  return session.user
}

async function getCurrentCustomer() {
  const session = await requireRole("customer")

  if (!session.user.email) {
    throw new Error("Your account is missing an email address")
  }

  return session.user
}

export async function getMyRentals(): Promise<RentalBooking[]> {
  const user = await getCurrentUser()

  const response = await fetch(
    `${getApiBaseUrl()}/customer/rentals?email=${encodeURIComponent(user.email)}`,
    { cache: "no-store" }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to load your rentals"
    )
  }

  return Array.isArray(data) ? (data as RentalBooking[]) : []
}

export async function getMyFavorites(): Promise<FavoriteItem[]> {
  const user = await getCurrentCustomer()

  const response = await fetch(
    `${getApiBaseUrl()}/favorites?email=${encodeURIComponent(user.email)}`,
    { cache: "no-store" }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to load your favorites"
    )
  }

  return Array.isArray(data) ? (data as FavoriteItem[]) : []
}

export async function addFavorite(equipment: FavoriteEquipment) {
  const user = await getCurrentCustomer()
  const equipmentId = String(equipment?._id || "").trim()

  if (!equipmentId || !String(equipment?.name || "").trim()) {
    throw new Error("Invalid equipment")
  }

  // Only known fields are stored with the favorite snapshot.
  const payload = {
    customerEmail: user.email,
    customerId: user.id,
    equipmentId,
    equipment: {
      _id: equipmentId,
      name: String(equipment.name),
      image: typeof equipment.image === "string" ? equipment.image : "",
      category:
        typeof equipment.category === "string" ? equipment.category : "",
      rentalPrice:
        typeof equipment.rentalPrice === "number" ? equipment.rentalPrice : 0,
      rentalType:
        typeof equipment.rentalType === "string" ? equipment.rentalType : "",
      location:
        typeof equipment.location === "string" ? equipment.location : "",
      quantity: typeof equipment.quantity === "number" ? equipment.quantity : 0,
    },
  }

  const response = await fetch(`${getApiBaseUrl()}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to add favorite"
    )
  }

  return data as { message?: string; favorite?: FavoriteItem }
}

export async function removeFavorite(equipmentId: string) {
  const user = await getCurrentCustomer()
  const id = String(equipmentId || "").trim()

  if (!id) {
    throw new Error("Invalid equipment")
  }

  const response = await fetch(
    `${getApiBaseUrl()}/favorites?email=${encodeURIComponent(
      user.email
    )}&equipmentId=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to remove favorite"
    )
  }

  return data as { message?: string; deletedCount?: number }
}

export async function checkBookingAvailability(
  equipmentId: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityResult> {
  if (!equipmentId || !startDate || !endDate) {
    throw new Error("Select rental dates to check availability")
  }

  // Availability is public data; the session check keeps this action private.
  await requireUser()

  return fetchEquipmentAvailability(equipmentId, startDate, endDate)
}

/**
 * Creates a Stripe Checkout Session for a booking that already exists. The
 * backend re-reads the booking and its server-calculated amount; the browser
 * only sends the booking id plus the session-derived email.
 */
export async function createCheckoutSession(
  bookingId: string
): Promise<BookingActionResult<{ checkoutUrl: string; sessionId: string }>> {
  try {
    const user = await getCurrentCustomer()

    if (!bookingId) {
      return { ok: false, message: "Invalid booking" }
    }

    const response = await fetch(`${getApiBaseUrl()}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, customerEmail: user.email }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        ok: false,
        message:
          typeof data?.message === "string"
            ? data.message
            : "Failed to start secure checkout",
      }
    }

    if (typeof data?.checkoutUrl !== "string" || !data.checkoutUrl) {
      return { ok: false, message: "Stripe did not return a checkout URL" }
    }

    return {
      ok: true,
      data: {
        checkoutUrl: data.checkoutUrl,
        sessionId: typeof data.sessionId === "string" ? data.sessionId : "",
      },
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start secure checkout",
    }
  }
}

/**
 * Verifies a Stripe Checkout Session with the backend before trusting the
 * success redirect. The backend re-checks the session with Stripe and only
 * then updates the rental's payment status.
 */
export async function verifyPayment(
  bookingId: string,
  sessionId?: string
): Promise<{ paymentStatus?: string; bookingStatus?: string } | null> {
  const user = await getCurrentCustomer()

  if (!bookingId || !sessionId) return null

  const response = await fetch(`${getApiBaseUrl()}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId,
      sessionId,
      customerEmail: user.email,
    }),
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // Stripe may still be settling the payment. The page will show the
    // current status and polling will pick up the webhook update later.
    console.warn("Payment verification pending:", data?.message)
    return null
  }

  return data as { paymentStatus?: string; bookingStatus?: string }
}

export async function getMyBookingById(
  id: string
): Promise<RentalBooking | null> {
  if (!id) return null

  // Reuse the customer-scoped fetch so another user's booking can never be
  // returned even if its id is known.
  const bookings = await getMyRentals()

  return bookings.find((booking) => booking._id === id) ?? null
}

export async function createBooking(
  input: BookingInput
): Promise<BookingActionResult<RentalBooking>> {
  try {
    const user = await getCurrentCustomer()

    const equipmentId = String(input?.equipmentId || "").trim()
    const startDate = String(input?.rentalStartDate || "").trim()
    const endDate = String(input?.rentalEndDate || "").trim()
    const requiredQuantity = Number(input?.requiredQuantity)
    const contactNumber = String(input?.contactNumber || "").trim()
    const deliveryAddress = String(input?.deliveryAddress || "").trim()

    const fail = (message: string) => ({ ok: false as const, message })

    if (!equipmentId) return fail("Invalid equipment")

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return fail("Select valid rental dates")
    }

    const startDay = new Date(start)
    startDay.setHours(0, 0, 0, 0)

    if (startDay < today) {
      return fail("Rental start date cannot be in the past")
    }

    if (end <= start) {
      return fail("Rental end date must be after the start date")
    }

    if (!Number.isInteger(requiredQuantity) || requiredQuantity < 1) {
      return fail("Required quantity must be a positive whole number")
    }

    if (!/^\d{7,15}$/.test(contactNumber.replace(/[\s-]/g, ""))) {
      return fail("Enter a valid contact number")
    }

    if (deliveryAddress.length < 5) {
      return fail("Enter a valid delivery address")
    }

    // No amount is sent from the browser. The API re-reads the equipment,
    // recalculates the total, and re-checks overlapping availability.
    const payload = {
      equipmentId,
      customerEmail: user.email,
      customerId: user.id,
      customerName: user.name || "",
      rentalStartDate: startDate,
      rentalEndDate: endDate,
      requiredQuantity,
      contactNumber,
      deliveryAddress,
      notes: String(input?.notes || "").trim(),
    }

    const response = await fetch(`${getApiBaseUrl()}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return fail(
        typeof data?.message === "string"
          ? data.message
          : "Failed to create booking"
      )
    }

    return { ok: true, data: data?.booking as RentalBooking }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to create booking",
    }
  }
}
