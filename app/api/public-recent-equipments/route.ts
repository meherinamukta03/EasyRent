import { NextResponse } from "next/server"

import { fetchRecentEquipment } from "@/services/equipment.service"

// Thin proxy for the backend's MongoDB-sorted recent-equipments endpoint.
// The status filter, createdAt sort and limit(4) all happen on the backend.
export async function GET() {
  try {
    const equipment = await fetchRecentEquipment()

    return NextResponse.json(equipment)
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load recently added equipment. Please try again.",
      },
      { status: 502 }
    )
  }
}
