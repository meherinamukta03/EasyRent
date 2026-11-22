import { headers } from "next/headers"
import { SignJWT } from "jose"

import { auth } from "@/lib/auth"
import type { UserRole } from "@/lib/roles"

/**
 * Issues the short-lived access token used by the Express API.
 *
 * The identity is read from the verified Better Auth session on every call —
 * no role or user id is ever accepted from the browser. There is exactly one
 * token issuer in the project; the backend only verifies these tokens.
 */
export async function getAccessToken(): Promise<string> {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("Authentication is not configured")
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Your session has expired. Please sign in again.")
  }

  const role = (session.user as { role?: UserRole }).role || "customer"

  return new SignJWT({
    id: session.user.id,
    email: session.user.email,
    role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.user.id)
    .setIssuer("easyrent")
    .setAudience("easyrent-server")
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(secret))
}
