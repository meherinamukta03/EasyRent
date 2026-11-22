"use server"

import { revalidatePath } from "next/cache"

import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_RENTAL_TYPES,
} from "@/constants/equipment"
import { requireRole } from "@/lib/auth-server"
import { backendFetch } from "@/lib/backend"
import { uploadImageToImgBB } from "@/lib/image-upload"
import {
  fetchPublicEquipment,
  fetchPublicEquipmentById,
} from "@/services/equipment.service"
import type { Equipment, PublicEquipmentFilters } from "@/types/equipment"

const EQUIPMENT_PAGE_PATH = "/dashboard/owner/my-equipment"

async function requireOwner() {
  const session = await requireRole("owner")

  if (!session.user.email) {
    throw new Error("Your account is missing an email address")
  }
}

async function fetchOwnerEquipment(): Promise<Equipment[]> {
  const data = await backendFetch<{ equipments?: Equipment[] } | Equipment[]>(
    "/equipments"
  )

  return Array.isArray(data) ? data : Array.isArray(data.equipments) ? data.equipments : []
}

function getRequiredString(formData: FormData, field: string, label: string) {
  const value = formData.get(field)

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required`)
  }

  return value.trim()
}

function getOptionalImage(formData: FormData) {
  const image = formData.get("image")

  return image instanceof File && image.size > 0 ? image : null
}

export const getMyEquipment = async (): Promise<Equipment[]> => {
  await requireOwner()

  return fetchOwnerEquipment()
}

export const getMyEquipmentById = async (
  id: string
): Promise<Equipment | null> => {
  await requireOwner()
  const equipment = await fetchOwnerEquipment()

  return equipment.find((item) => item._id === id) ?? null
}

export const updateMyEquipment = async (formData: FormData) => {
  await requireOwner()

  const idValue = formData.get("id")

  if (typeof idValue !== "string" || !idValue) {
    throw new Error("Equipment ID is missing")
  }

  const id = idValue
  const ownerEquipment = await fetchOwnerEquipment()
  const existingEquipment = ownerEquipment.find((item) => item._id === id)

  if (!existingEquipment) {
    throw new Error("Equipment not found or you do not have permission to edit it")
  }

  const name = getRequiredString(formData, "name", "Equipment name")
  const description = getRequiredString(formData, "description", "Description")
  const category = getRequiredString(formData, "category", "Category")
  const location = getRequiredString(formData, "location", "Location")
  const rentalType = getRequiredString(formData, "rentalType", "Rental type")
  const condition = getRequiredString(formData, "condition", "Equipment condition")
  const brand = getRequiredString(formData, "brand", "Brand")
  const model = getRequiredString(formData, "model", "Model")
  const terms = getRequiredString(formData, "terms", "Rental terms")

  const rentalPrice = Number(formData.get("rentalPrice"))
  const quantity = Number(formData.get("quantity"))

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

  const newImage = getOptionalImage(formData)
  const imageUrl = newImage ? await uploadImageToImgBB(newImage) : undefined

  // ownerInfo and status are intentionally excluded: the API derives the owner
  // from the JWT and preserves the admin-controlled approval status.
  const payload = {
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
    ...(imageUrl ? { image: imageUrl } : {}),
  }

  const result = await backendFetch(`/equipments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  })

  revalidatePath(EQUIPMENT_PAGE_PATH)
  revalidatePath(`${EQUIPMENT_PAGE_PATH}/${id}/edit`)

  return result
}

export const getPublicEquipment = async (
  filters: PublicEquipmentFilters = {}
): Promise<Equipment[]> => fetchPublicEquipment(filters)

export const getPublicEquipmentById = async (
  id: string
): Promise<Equipment | null> => fetchPublicEquipmentById(id)

export const deleteMyEquipment = async (id: string) => {
  await requireOwner()

  const ownerEquipment = await fetchOwnerEquipment()
  const existingEquipment = ownerEquipment.find((item) => item._id === id)

  if (!existingEquipment) {
    throw new Error("Equipment not found or you do not have permission to delete it")
  }

  const result = await backendFetch(
    `/equipments/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  )

  revalidatePath(EQUIPMENT_PAGE_PATH)

  return result
}
