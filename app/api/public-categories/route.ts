import { NextResponse } from "next/server";

import { fetchPublicCategoryCounts } from "@/services/equipment.service";

export async function GET() {
  try {
    const categories = await fetchPublicCategoryCounts();

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to load categories. Please try again.",
      },
      { status: 502 }
    );
  }
}
