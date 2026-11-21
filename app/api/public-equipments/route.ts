import { NextResponse } from "next/server";

import { fetchPublicEquipment } from "@/services/equipment.service";
import type {
  EquipmentAvailability,
  PublicEquipmentFilters,
  PublicEquipmentSort,
} from "@/types/equipment";

const SORT_VALUES: PublicEquipmentSort[] = ["recent", "price_asc", "price_desc"];
const AVAILABILITY_VALUES: EquipmentAvailability[] = [
  "available",
  "unavailable",
];

function parsePrice(value: string | null) {
  if (!value) return undefined;

  const price = Number(value);

  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");
  const availability = searchParams.get("availability")?.toLowerCase();

  const filters: PublicEquipmentFilters = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    rentalType: searchParams.get("rentalType") || undefined,
    minPrice: parsePrice(searchParams.get("minPrice")),
    maxPrice: parsePrice(searchParams.get("maxPrice")),
    // Only forward known values so arbitrary input never reaches the backend.
    availability: AVAILABILITY_VALUES.includes(
      availability as EquipmentAvailability
    )
      ? (availability as EquipmentAvailability)
      : undefined,
    sort: SORT_VALUES.includes(sort as PublicEquipmentSort)
      ? (sort as PublicEquipmentSort)
      : undefined,
  };

  try {
    const equipment = await fetchPublicEquipment(filters);

    return NextResponse.json(equipment);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load equipment. Please try again.",
      },
      { status: 502 }
    );
  }
}
