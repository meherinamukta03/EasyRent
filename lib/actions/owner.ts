"use server"

import { requireRole } from "@/lib/auth-server"
import { getApiBaseUrl } from "@/services/equipment.service"
import type { OwnerRental } from "@/types/customer"

/**
 * All actions derive the owner email from the verified server session.
 * The browser never supplies an email, so it cannot act as another owner.
 */
async function getCurrentOwner() {
  const session = await requireRole("owner")

  if (!session.user.email) {
    throw new Error("Your account is missing an email address")
  }

  return session.user
}

export async function getOwnerRentals(): Promise<OwnerRental[]> {
  const owner = await getCurrentOwner()

  const response = await fetch(
    `${getApiBaseUrl()}/owner/rentals?email=${encodeURIComponent(owner.email)}`,
    { cache: "no-store" }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Failed to load owner rentals"
    )
  }

  return Array.isArray(data) ? (data as OwnerRental[]) : []
}

/** Confirms that the booking belongs to one of the signed-in owner's items. */
async function assertOwnership(bookingId: string): Promise<string> {
  const owner = await getCurrentOwner()
  const id = String(bookingId || "").trim()

  if (!id) {
    throw new Error("Invalid booking")
  }

  const rentals = await getOwnerRentals()
  const match = rentals.find((rental) => rental._id === id)

  if (!match) {
    throw new Error("Booking not found for your equipment")
  }

  return owner.email
}

function parseResult(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const result = data as { message?: string; refundStatus?: string }
    return {
      message: result.message || fallback,
      refundStatus: result.refundStatus,
    }
  }

  return { message: fallback, refundStatus: undefined }
}

export async function acceptOwnerBooking(bookingId: string) {
  const ownerEmail = await assertOwnership(bookingId)

  const response = await fetch(
    `${getApiBaseUrl()}/bookings/${encodeURIComponent(bookingId)}/accept`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerEmail }),
      cache: "no-store",
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(parseResult(data, "Failed to accept booking").message)
  }

  return parseResult(data, "Booking accepted successfully")
}

export async function rejectOwnerBooking(bookingId: string) {
  const ownerEmail = await assertOwnership(bookingId)

  const response = await fetch(
    `${getApiBaseUrl()}/bookings/${encodeURIComponent(bookingId)}/reject`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerEmail }),
      cache: "no-store",
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(parseResult(data, "Failed to reject booking").message)
  }

  return parseResult(data, "Booking rejected successfully")
}
