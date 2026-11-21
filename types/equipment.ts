export interface EquipmentOwnerInfo {
  name?: string;
  email?: string;
}

export interface Equipment {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  rentalPrice?: number;
  rentalType?: string;
  quantity?: number;
  condition?: string;
  brand?: string;
  model?: string;
  terms?: string;
  ownerInfo?: EquipmentOwnerInfo;
  status?: string;
  image?: string;
  [key: string]: unknown;
}

export type EquipmentStatusTone = "approved" | "pending" | "rejected";

export type EquipmentAvailability = "available" | "unavailable";

export type PublicEquipmentSort = "recent" | "price_asc" | "price_desc";

export interface PublicEquipmentFilters {
  id?: string;
  search?: string;
  category?: string;
  rentalType?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  availability?: EquipmentAvailability | "";
  sort?: PublicEquipmentSort;
}

export function getEquipmentStatusTone(status?: string): EquipmentStatusTone {
  const normalized = (status || "pending").toLowerCase();

  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

export function getEquipmentStatusLabel(status?: string) {
  if (!status) return "Pending";

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function isEquipmentAvailable(quantity?: number) {
  return typeof quantity === "number" && Number.isFinite(quantity) && quantity > 0;
}
