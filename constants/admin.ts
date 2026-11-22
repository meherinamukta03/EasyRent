import type { AdminEquipmentStatus } from "@/types/admin"

export const ADMIN_EQUIPMENT_STATUSES: readonly AdminEquipmentStatus[] = [
  "Pending",
  "Approved",
  "Rejected",
]

export const ADMIN_BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Active",
  "Completed",
  "Cancelled",
  "Rejected",
] as const

export const ADMIN_PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
] as const

/**
 * Mirrors the backend workflow. Payment status is verified by Stripe and is
 * never editable from the admin dashboard, so admins may only move bookings
 * through these transitions.
 */
export const ADMIN_BOOKING_TRANSITIONS: Record<string, string[]> = {
  Pending: ["Cancelled", "Rejected"],
  Confirmed: ["Cancelled"],
  Active: ["Completed"],
}

export function getAllowedBookingTransitions(status?: string): string[] {
  return ADMIN_BOOKING_TRANSITIONS[status || "Pending"] || []
}
