"use server";

import { revalidatePath } from "next/cache";

import { getServerSession } from "@/lib/auth-server";
import { uploadImageToImgBB } from "@/lib/image-upload";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_RENTAL_TYPES,
} from "@/constants/equipment";
import {
  fetchPublicEquipment,
  fetchPublicEquipmentById,
  getApiBaseUrl,
} from "@/services/equipment.service";
import type {
  Equipment,
  PublicEquipmentFilters,
} from "@/types/equipment";

const EQUIPMENT_PAGE_PATH = "/dashboard/owner/my-equipment";

async function requireOwner() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("You must be signed in to manage equipment");
  }

  if (session.user.role !== "owner") {
    throw new Error("Only equipment owners can manage equipment");
  }

  return {
    session,
    email: session.user.email,
  };
}

async function fetchOwnerEquipment(email: string): Promise<Equipment[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/equipments?email=${encodeURIComponent(email)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch equipment");
  }

  const data = await response.json();

  return Array.isArray(data) ? (data as Equipment[]) : [];
}

function getRequiredString(formData: FormData, field: string, label: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required`);
  }

  return value.trim();
}

function getOptionalImage(formData: FormData) {
  const image = formData.get("image");

  if (image instanceof File && image.size > 0) {
    return image;
  }

  return null;
}

// Get the currently authenticated owner's equipment.
export const getMyEquipment = async (): Promise<Equipment[]> => {
  const { email } = await requireOwner();

  return fetchOwnerEquipment(email);
};

// Get a single equipment item only when it belongs to the authenticated owner.
export const getMyEquipmentById = async (
  id: string
): Promise<Equipment | null> => {
  const { email } = await requireOwner();
  const equipment = await fetchOwnerEquipment(email);

  return equipment.find((item) => item._id === id) ?? null;
};

// Update an equipment item owned by the authenticated owner.
export const updateMyEquipment = async (formData: FormData) => {
  const { email } = await requireOwner();

  const idValue = formData.get("id");

  if (typeof idValue !== "string" || !idValue) {
    throw new Error("Equipment ID is missing");
  }

  const id = idValue;

  // Verify ownership on the server before updating anything.
  const ownerEquipment = await fetchOwnerEquipment(email);
  const existingEquipment = ownerEquipment.find((item) => item._id === id);

  if (!existingEquipment) {
    throw new Error("Equipment not found or you do not have permission to edit it");
  }

  const name = getRequiredString(formData, "name", "Equipment name");
  const description = getRequiredString(formData, "description", "Description");
  const category = getRequiredString(formData, "category", "Category");
  const location = getRequiredString(formData, "location", "Location");
  const rentalType = getRequiredString(formData, "rentalType", "Rental type");
  const condition = getRequiredString(formData, "condition", "Equipment condition");
  const brand = getRequiredString(formData, "brand", "Brand");
  const model = getRequiredString(formData, "model", "Model");
  const terms = getRequiredString(formData, "terms", "Rental terms");

  const rentalPrice = Number(formData.get("rentalPrice"));
  const quantity = Number(formData.get("quantity"));

  if (!Number.isFinite(rentalPrice) || rentalPrice < 1) {
    throw new Error("Rental price must be a positive number");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Available quantity must be a positive whole number");
  }

  if (!(EQUIPMENT_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error("Please select a valid category");
  }

  if (!(EQUIPMENT_RENTAL_TYPES as readonly string[]).includes(rentalType)) {
    throw new Error("Please select a valid rental type");
  }

  if (!(EQUIPMENT_CONDITIONS as readonly string[]).includes(condition)) {
    throw new Error("Please select a valid equipment condition");
  }

  const newImage = getOptionalImage(formData);
  const imageUrl = newImage ? await uploadImageToImgBB(newImage) : undefined;

  // Only editable fields are sent. ownerInfo and status are intentionally
  // excluded so the owner's email and approval status are preserved.
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
    ownerEmail: email,
    ...(imageUrl ? { image: imageUrl } : {}),
  };

  const response = await fetch(
    `${getApiBaseUrl()}/equipments/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to update equipment");
  }

  revalidatePath(EQUIPMENT_PAGE_PATH);
  revalidatePath(`${EQUIPMENT_PAGE_PATH}/${id}/edit`);

  return result;
};

// Public catalogue fetch. The backend only returns approved equipment.
export const getPublicEquipment = async (
  filters: PublicEquipmentFilters = {}
): Promise<Equipment[]> => fetchPublicEquipment(filters);

// Public details fetch. Returns only approved equipment.
export const getPublicEquipmentById = async (
  id: string
): Promise<Equipment | null> => fetchPublicEquipmentById(id);

export const deleteMyEquipment = async (id: string) => {
  const { email } = await requireOwner();

  // Verify ownership on the server before deleting anything.
  const ownerEquipment = await fetchOwnerEquipment(email);
  const existingEquipment = ownerEquipment.find((item) => item._id === id);

  if (!existingEquipment) {
    throw new Error("Equipment not found or you do not have permission to delete it");
  }

  const response = await fetch(
    `${getApiBaseUrl()}/equipments/${encodeURIComponent(
      id
    )}?email=${encodeURIComponent(email)}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to delete equipment");
  }

  revalidatePath(EQUIPMENT_PAGE_PATH);

  return result;
};
