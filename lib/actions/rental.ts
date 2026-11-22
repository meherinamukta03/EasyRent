"use server"

import { backendFetch } from "@/lib/backend"
import { requireRole } from "@/lib/auth-server"
import type { OwnerRental } from "@/types/customer"

/** Owner-scoped rentals. The owner identity comes from the verified JWT. */
export const getOwnerRentals = async (): Promise<OwnerRental[]> => {
  await requireRole("owner")

  const data = await backendFetch<{ rentals?: OwnerRental[] } | OwnerRental[]>(
    "/owner/rentals"
  )

  return Array.isArray(data) ? data : Array.isArray(data.rentals) ? data.rentals : []
}
