"use server"

import { backendFetch } from "@/lib/backend"
import { requireUser } from "@/lib/auth-server"
import {
  fetchEquipmentAvailability,
  type AvailabilityResult,
} from "@/services/equipment.service"
import type {
  BookingInput,
  FavoriteEquipment,
  FavoriteItem,
  RentalBooking,
} from "@/types/customer"

/**
 * Expected API failures are returned as values so the real message reaches the
 * UI (Server Action errors are hidden in production builds).
 */
export type BookingActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

// The session is verified here too; the Express API independently verifies
// the JWT and derives the customer identity from it.
async function getCurrentCustomer() {
  const session = await requireUser()

  // Owners and admins must never be able to book. Check explicitly instead of
  // calling forbidden(): the Server Action then returns a readable message
  // rather than Next's internal `NEXT_HTTP_ERROR_FALLBACK;403` digest.
  if (session.user.role !== "customer") {
    throw new Error(
      `You are not a customer. You are an ${session.user.role}. Only customers can book equipment.`
    )
  }

  if (!session.user.email) {
    throw new Error("Your account is missing an email address")
  }

  return session.user
}

async function getCurrentUser() {
  const session = await requireUser()

  if (!session.user.email) {
    throw new Error("Your account is missing an email address")
  }

  return session.user
}

export async function getMyRentals(): Promise<RentalBooking[]> {
  await getCurrentUser()

  const data = await backendFetch<{ rentals?: RentalBooking[] } | RentalBooking[]>(
    "/customer/rentals"
  )

  return Array.isArray(data)
    ? data
    : Array.isArray(data.rentals)
      ? data.rentals
      : []
}

export async function getMyFavorites(): Promise<FavoriteItem[]> {
  await getCurrentCustomer()

  const data = await backendFetch<{ favorites?: FavoriteItem[] } | FavoriteItem[]>(
    "/favorites"
  )

  return Array.isArray(data)
    ? data
    : Array.isArray(data.favorites)
      ? data.favorites
      : []
}

export async function addFavorite(equipment: FavoriteEquipment) {
  await getCurrentCustomer()
  const equipmentId = String(equipment?._id || "").trim()

  if (!equipmentId || !String(equipment?.name || "").trim()) {
    throw new Error("Invalid equipment")
  }

  const payload = {
    equipmentId,
    equipment: {
      _id: equipmentId,
      name: String(equipment.name),
      image: typeof equipment.image === "string" ? equipment.image : "",
      category: typeof equipment.category === "string" ? equipment.category : "",
      rentalPrice:
        typeof equipment.rentalPrice === "number" ? equipment.rentalPrice : 0,
      rentalType: typeof equipment.rentalType === "string" ? equipment.rentalType : "",
      location: typeof equipment.location === "string" ? equipment.location : "",
      quantity: typeof equipment.quantity === "number" ? equipment.quantity : 0,
    },
  }

  return backendFetch<{ message?: string; favorite?: FavoriteItem }>(
    "/favorites",
    { method: "POST", body: payload }
  )
}

export async function removeFavorite(equipmentId: string) {
  await getCurrentCustomer()
  const id = String(equipmentId || "").trim()

  if (!id) throw new Error("Invalid equipment")

  return backendFetch<{ message?: string; deletedCount?: number }>("/favorites", {
    method: "DELETE",
    searchParams: { equipmentId: id },
  })
}

export async function checkBookingAvailability(
  equipmentId: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityResult> {
  if (!equipmentId || !startDate || !endDate) {
    throw new Error("Select rental dates to check availability")
  }

  await requireUser()

  return fetchEquipmentAvailability(equipmentId, startDate, endDate)
}

/**
 * Creates a Stripe Checkout Session from a booking that already exists. The
 * backend re-reads the booking and its server-calculated amount; the browser
 * only sends the booking id and the verified customer identity comes from JWT.
 */
export async function createCheckoutSession(
  bookingId: string
): Promise<BookingActionResult<{ checkoutUrl: string; sessionId: string }>> {
  try {
    await getCurrentCustomer()

    if (!bookingId) return { ok: false, message: "Invalid booking" }

    const data = await backendFetch<{
      checkoutUrl?: string
      sessionId?: string
    }>("/create-checkout-session", {
      method: "POST",
      body: { bookingId },
    })

    if (typeof data.checkoutUrl !== "string" || !data.checkoutUrl) {
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
      message: error instanceof Error ? error.message : "Failed to start secure checkout",
    }
  }
}

/**
 * Verifies a Stripe Checkout Session with the backend before trusting the
 * success redirect. Stripe remains the only source of payment status.
 */
export async function verifyPayment(
  bookingId: string,
  sessionId?: string
): Promise<{ paymentStatus?: string; bookingStatus?: string } | null> {
  await getCurrentCustomer()

  if (!bookingId || !sessionId) return null

  try {
    return await backendFetch<{
      paymentStatus?: string
      bookingStatus?: string
    }>("/verify-payment", {
      method: "POST",
      body: { bookingId, sessionId },
    })
  } catch (error) {
    console.warn("Payment verification pending:", error)
    return null
  }
}

export async function getMyBookingById(
  id: string
): Promise<RentalBooking | null> {
  if (!id) return null

  const bookings = await getMyRentals()

  return bookings.find((booking) => booking._id === id) ?? null
}

export async function createBooking(
  input: BookingInput
): Promise<BookingActionResult<RentalBooking>> {
  try {
    await getCurrentCustomer()

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

    if (startDay < today) return fail("Rental start date cannot be in the past")
    if (end <= start) return fail("Rental end date must be after the start date")

    if (!Number.isInteger(requiredQuantity) || requiredQuantity < 1) {
      return fail("Required quantity must be a positive whole number")
    }

    if (!/^\d{7,15}$/.test(contactNumber.replace(/[\s-]/g, ""))) {
      return fail("Enter a valid contact number")
    }

    if (deliveryAddress.length < 5) return fail("Enter a valid delivery address")

    // No amount and no identity is sent from the browser. The API re-reads the
    // equipment, recalculates the total and uses the JWT identity.
    const data = await backendFetch<{ booking?: RentalBooking }>("/bookings", {
      method: "POST",
      body: {
        equipmentId,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        requiredQuantity,
        contactNumber,
        deliveryAddress,
        notes: String(input?.notes || "").trim(),
      },
    })

    return { ok: true, data: data.booking as RentalBooking }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create booking",
    }
  }
}
