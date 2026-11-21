import type {
  Equipment,
  EquipmentCategoryCount,
  PublicEquipmentFilters,
} from "@/types/equipment";

export function getApiBaseUrl() {
  const api = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!api) {
    throw new Error("Equipment API is not configured");
  }

  return api.replace(/\/$/, "");
}

function buildPublicEquipmentQuery(filters: PublicEquipmentFilters) {
  const params = new URLSearchParams();

  const addParam = (key: string, value?: string | number) => {
    if (value === undefined || value === null) return;

    const normalized = String(value).trim();

    if (normalized) {
      params.set(key, normalized);
    }
  };

  addParam("search", filters.search);
  addParam("category", filters.category);
  addParam("rentalType", filters.rentalType);
  addParam("minPrice", filters.minPrice);
  addParam("maxPrice", filters.maxPrice);

  // The backend expects capitalized availability values.
  if (filters.availability) {
    addParam(
      "availability",
      filters.availability.charAt(0).toUpperCase() +
        filters.availability.slice(1).toLowerCase()
    );
  }

  addParam("sort", filters.sort);
  // Forwarded to the backend, which applies it as MongoDB cursor.limit(n).
  addParam("limit", filters.limit);

  return params.toString();
}

// Public catalogue fetch. The backend only returns approved equipment.
export async function fetchPublicEquipment(
  filters: PublicEquipmentFilters = {}
): Promise<Equipment[]> {
  const query = buildPublicEquipmentQuery(filters);
  const response = await fetch(
    `${getApiBaseUrl()}/public/equipments${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load equipment");
  }

  return Array.isArray(data) ? (data as Equipment[]) : [];
}

// Approved equipment counts per category, aggregated in MongoDB by the backend.
export async function fetchPublicCategoryCounts(): Promise<
  EquipmentCategoryCount[]
> {
  const response = await fetch(`${getApiBaseUrl()}/public/categories`, {
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load equipment categories");
  }

  return Array.isArray(data) ? (data as EquipmentCategoryCount[]) : [];
}

// Public details fetch by id. Only approved equipment is returned.
export async function fetchPublicEquipmentById(
  id: string
): Promise<Equipment | null> {
  if (!id) return null;

  const response = await fetch(
    `${getApiBaseUrl()}/public/equipments/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (response.status === 404) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load equipment details");
  }

  return data as Equipment;
}

export interface AvailabilityResult {
  stock: number;
  reserved: number;
  availableQuantity: number;
  available: boolean;
}

/**
 * Live availability for a rental period. The backend accounts for overlapping
 * active bookings, so this is the authoritative quantity for the given dates.
 */
export async function fetchEquipmentAvailability(
  id: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityResult> {
  const params = new URLSearchParams({ start: startDate, end: endDate });
  const response = await fetch(
    `${getApiBaseUrl()}/public/equipments/${encodeURIComponent(
      id
    )}/availability?${params.toString()}`,
    { cache: "no-store" }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to check availability");
  }

  return data as AvailabilityResult;
}
