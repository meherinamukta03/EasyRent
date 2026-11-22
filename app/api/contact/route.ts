import { NextResponse } from "next/server"

import {
  ContactApiError,
  submitContactMessage,
} from "@/services/contact.service"
import type { ContactFormValues } from "@/types/contact"

// Thin proxy for the backend's validated contact-message endpoint.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      )
    }

    const result = await submitContactMessage(body as ContactFormValues)

    return NextResponse.json(result)
  } catch (error) {
    const status = error instanceof ContactApiError ? error.status : 502

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to send your message. Please try again.",
      },
      { status }
    )
  }
}
