"use server"

import { backendFetch } from "@/lib/backend"
import { requireRole } from "@/lib/auth-server"
import type { OwnerAnalytics } from "@/types/admin"
import type { OwnerRental } from "@/types/customer"

/**
 * Ownership is derived from the verified JWT on the server. No email or id is
 * accepted from the browser, so an owner can never act on another owner's data.
 */
async function requireOwnerSession() {
  return requireRole("owner")
}

export async function getOwnerRentals(): Promise<OwnerRental[]> {
  await requireOwnerSession()

  const data = await backendFetch<{ rentals?: OwnerRental[] } | OwnerRental[]>(
    "/owner/rentals"
  )

  return Array.isArray(data) ? data : Array.isArray(data.rentals) ? data.rentals : []
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

export async function getOwnerAnalytics(): Promise<OwnerAnalytics> {
  await requireOwnerSession()

  return backendFetch<OwnerAnalytics>("/owner/analytics")
}

export async function acceptOwnerBooking(bookingId: string) {
  await requireOwnerSession()
  const id = String(bookingId || "").trim()

  if (!id) throw new Error("Invalid booking")

  const data = await backendFetch<{ message?: string; refundStatus?: string }>(
    `/bookings/${encodeURIComponent(id)}/accept`,
    { method: "POST" }
  )

  return parseResult(data, "Booking accepted successfully")
}

export async function rejectOwnerBooking(bookingId: string) {
  await requireOwnerSession()
  const id = String(bookingId || "").trim()

  if (!id) throw new Error("Invalid booking")

  const data = await backendFetch<{ message?: string; refundStatus?: string }>(
    `/bookings/${encodeURIComponent(id)}/reject`,
    { method: "POST" }
  )

  return parseResult(data, "Booking rejected successfully")
}
