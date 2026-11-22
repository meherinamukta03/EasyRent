import { getApiBaseUrl } from "@/services/equipment.service"
import type { ContactFormValues, ContactMessageResult } from "@/types/contact"

export class ContactApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Sends the contact form to the backend, which validates the input and
// stores the message in MongoDB.
export async function submitContactMessage(
  values: ContactFormValues
): Promise<ContactMessageResult> {
  const response = await fetch(`${getApiBaseUrl()}/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ContactApiError(
      response.status,
      typeof data?.message === "string"
        ? data.message
        : "Failed to send your message. Please try again."
    )
  }

  return data as ContactMessageResult
}
