"use server"

import { revalidatePath } from "next/cache"

import { ADMIN_EQUIPMENT_STATUSES } from "@/constants/admin"
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_RENTAL_TYPES,
} from "@/constants/equipment"
import { requireRole } from "@/lib/auth-server"
import { isUserRole, type UserRole } from "@/lib/roles"
import { getApiBaseUrl } from "@/services/equipment.service"
import type {
  AdminEquipment,
  AdminEquipmentUpdateInput,
  AdminRentalsFilters,
  AdminRentalsResponse,
  AdminUser,
} from "@/types/admin"

/**
 * Every admin action verifies the Better Auth session AND the admin role on
 * the server before touching the backend. The backend independently checks a
 * shared secret that is never exposed to the browser.
 */
async function requireAdminActor() {
  const session = await requireRole("admin")

  if (!session.user.id) {
    throw new Error("Your account is missing an identifier")
  }

  return session.user
}

async function adminRequest<T>(
  path: string,
  actorId: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const secret = process.env.ADMIN_API_SECRET

  if (!secret) {
    throw new Error("Admin API is not configured")
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "x-admin-api-secret": secret,
      "x-admin-user-id": actorId,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "The admin request could not be completed"
    )
  }

  return data as T
}

function cleanId(value: string) {
  return String(value || "").trim()
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getAdminUsers(
  filters: { search?: string; role?: UserRole } = {}
): Promise<AdminUser[]> {
  const actor = await requireAdminActor()
  const params = new URLSearchParams()

  if (filters.search?.trim()) params.set("search", filters.search.trim())
  if (filters.role && isUserRole(filters.role)) params.set("role", filters.role)

  const query = params.size ? `?${params.toString()}` : ""
  const data = await adminRequest<{ users: AdminUser[] }>(
    `/admin/users${query}`,
    actor.id
  )

  return Array.isArray(data.users) ? data.users : []
}

export async function updateAdminUserRole(
  targetId: string,
  role: UserRole
): Promise<string> {
  const actor = await requireAdminActor()
  const id = cleanId(targetId)

  if (!id) throw new Error("Invalid user")
  if (!isUserRole(role)) throw new Error("Please choose a valid role")
  if (id === actor.id && role !== "admin") {
    throw new Error("You cannot remove your own admin access")
  }

  const data = await adminRequest<{ message?: string }>(
    `/admin/users/${encodeURIComponent(id)}/role`,
    actor.id,
    { method: "PATCH", body: { role } }
  )

  revalidatePath("/dashboard/admin/users")

  return data.message || "User role updated successfully"
}

export async function deleteAdminUser(targetId: string): Promise<string> {
  const actor = await requireAdminActor()
  const id = cleanId(targetId)

  if (!id) throw new Error("Invalid user")
  if (id === actor.id) throw new Error("You cannot delete your own account")

  const data = await adminRequest<{ message?: string }>(
    `/admin/users/${encodeURIComponent(id)}`,
    actor.id,
    { method: "DELETE" }
  )

  revalidatePath("/dashboard/admin/users")

  return data.message || "User deleted successfully"
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export async function getAdminEquipments(
  filters: { search?: string; status?: string } = {}
): Promise<AdminEquipment[]> {
  const actor = await requireAdminActor()
  const params = new URLSearchParams()

  if (filters.search?.trim()) params.set("search", filters.search.trim())
  if (filters.status && ADMIN_EQUIPMENT_STATUSES.includes(filters.status as never)) {
    params.set("status", filters.status)
  }

  const query = params.size ? `?${params.toString()}` : ""
  const data = await adminRequest<{ equipments: AdminEquipment[] }>(
    `/admin/equipments${query}`,
    actor.id
  )

  return Array.isArray(data.equipments) ? data.equipments : []
}

export async function setAdminEquipmentStatus(
  id: string,
  status: string
): Promise<string> {
  const actor = await requireAdminActor()
  const equipmentId = cleanId(id)

  if (!equipmentId) throw new Error("Invalid equipment")
  if (!ADMIN_EQUIPMENT_STATUSES.includes(status as never)) {
    throw new Error("Please choose a valid equipment status")
  }

  const data = await adminRequest<{ message?: string }>(
    `/admin/equipments/${encodeURIComponent(equipmentId)}/status`,
    actor.id,
    { method: "PATCH", body: { status } }
  )

  revalidatePath("/dashboard/admin/equipments")
  revalidatePath("/dashboard/admin/equipment")
  revalidatePath("/all-equipment")

  return data.message || "Equipment status updated successfully"
}

export async function updateAdminEquipment(
  input: AdminEquipmentUpdateInput
): Promise<string> {
  const actor = await requireAdminActor()
  const id = cleanId(input?.id)

  if (!id) throw new Error("Invalid equipment")

  const name = String(input.name || "").trim()
  const description = String(input.description || "").trim()
  const category = String(input.category || "").trim()
  const location = String(input.location || "").trim()
  const rentalType = String(input.rentalType || "").trim()
  const condition = String(input.condition || "").trim()
  const brand = String(input.brand || "").trim()
  const model = String(input.model || "").trim()
  const terms = String(input.terms || "").trim()
  const rentalPrice = Number(input.rentalPrice)
  const quantity = Number(input.quantity)

  if (!name) throw new Error("Equipment name is required")
  if (!description) throw new Error("Description is required")
  if (!location) throw new Error("Location is required")
  if (!Number.isFinite(rentalPrice) || rentalPrice < 1) {
    throw new Error("Rental price must be a positive number")
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Available quantity must be a positive whole number")
  }
  if (!(EQUIPMENT_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error("Please select a valid category")
  }
  if (!(EQUIPMENT_RENTAL_TYPES as readonly string[]).includes(rentalType)) {
    throw new Error("Please select a valid rental type")
  }
  if (!(EQUIPMENT_CONDITIONS as readonly string[]).includes(condition)) {
    throw new Error("Please select a valid equipment condition")
  }

  const data = await adminRequest<{ message?: string }>(
    `/admin/equipments/${encodeURIComponent(id)}`,
    actor.id,
    {
      method: "PATCH",
      body: {
        name,
        description,
        category,
        location,
        rentalPrice,
        rentalType,
        quantity,
        condition,
        brand,
        model,
        terms,
      },
    }
  )

  revalidatePath("/dashboard/admin/equipments")
  revalidatePath("/all-equipment")

  return data.message || "Equipment updated successfully"
}

export async function deleteAdminEquipment(id: string): Promise<string> {
  const actor = await requireAdminActor()
  const equipmentId = cleanId(id)

  if (!equipmentId) throw new Error("Invalid equipment")

  const data = await adminRequest<{ message?: string }>(
    `/admin/equipments/${encodeURIComponent(equipmentId)}`,
    actor.id,
    { method: "DELETE" }
  )

  revalidatePath("/dashboard/admin/equipments")
  revalidatePath("/all-equipment")

  return data.message || "Equipment deleted successfully"
}

// ---------------------------------------------------------------------------
// Rentals
// ---------------------------------------------------------------------------

export async function getAdminRentals(
  filters: AdminRentalsFilters = {}
): Promise<AdminRentalsResponse> {
  const actor = await requireAdminActor()
  const params = new URLSearchParams()

  if (filters.search?.trim()) params.set("search", filters.search.trim())
  if (filters.bookingStatus) params.set("bookingStatus", filters.bookingStatus)
  if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus)
  if (filters.page && filters.page > 0) params.set("page", String(filters.page))
  if (filters.limit && filters.limit > 0) params.set("limit", String(filters.limit))

  const query = params.size ? `?${params.toString()}` : ""
  const data = await adminRequest<AdminRentalsResponse>(
    `/admin/rentals${query}`,
    actor.id
  )

  return {
    rentals: Array.isArray(data.rentals) ? data.rentals : [],
    total: Number(data.total) || 0,
    page: Number(data.page) || 1,
    limit: Number(data.limit) || 10,
    pages: Number(data.pages) || 1,
  }
}

/**
 * Only the booking status is changed. Payment status and Stripe records are
 * never touched here; the backend re-checks the allowed workflow transitions.
 */
export async function updateAdminBookingStatus(
  id: string,
  bookingStatus: string
): Promise<string> {
  const actor = await requireAdminActor()
  const bookingId = cleanId(id)

  if (!bookingId) throw new Error("Invalid booking")
  if (!["Cancelled", "Rejected", "Completed"].includes(bookingStatus)) {
    throw new Error("Please choose a valid booking status")
  }

  const data = await adminRequest<{ message?: string }>(
    `/admin/rentals/${encodeURIComponent(bookingId)}/booking-status`,
    actor.id,
    { method: "PATCH", body: { bookingStatus } }
  )

  revalidatePath("/dashboard/admin/rentals")

  return data.message || "Booking status updated successfully"
}
