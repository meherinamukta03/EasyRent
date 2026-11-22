import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  getDashboardPath,
  isUserRole,
  ROLE_DASHBOARD_PATHS,
  USER_ROLES,
  type UserRole,
} from "@/lib/roles"

export {
  getDashboardPath,
  isUserRole,
  ROLE_DASHBOARD_PATHS,
  USER_ROLES,
  type UserRole,
}

const hasDatabase = Boolean(
  process.env.BETTER_AUTH_DB_URI ??
  process.env.MONGODB_URI ??
  process.env.DATABASE_URL
)

/**
 * Reads the current Better Auth session on the server.
 *
 * The session is verified by Better Auth against the configured database, so
 * the returned user (including its role) is trusted server-side data. The
 * dynamic import keeps the login page renderable while the database is not
 * configured locally, and prevents a database outage from crashing the page.
 */
export const getServerSession = cache(async () => {
  // Reading request headers opts every auth-dependent route into dynamic
  // rendering. Keep this outside the try/catch so Next.js can handle its
  // internal dynamic-rendering signal correctly.
  const requestHeaders = await headers()

  if (!hasDatabase) {
    return null
  }

  try {
    const { auth } = await import("@/lib/auth")

    return await auth.api.getSession({
      headers: requestHeaders,
    })
  } catch (error) {
    console.error("Unable to read the EasyRent session.", error)
    return null
  }
})

export async function requireUser() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  return session
}

export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await requireUser()

  // A missing or unknown role is never treated as a default role.
  if (!isUserRole(session.user.role)) {
    redirect("/login")
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect(getDashboardPath(session.user.role) ?? "/login")
  }

  return session
}
