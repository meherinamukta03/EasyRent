import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const USER_ROLES = ["customer", "owner", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]

/**
 * The landing page for each role. These are the primary dashboard pages that
 * already exist in the protected route group.
 */
export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  customer: "/dashboard/customer/my-rentals",
  owner: "/dashboard/owner/my-equipment",
  admin: "/dashboard/admin/users",
}

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  )
}

export function normalizeUserRole(value: unknown): UserRole {
  return isUserRole(value) ? value : "customer"
}

export function getDashboardPath(role: unknown) {
  return ROLE_DASHBOARD_PATHS[normalizeUserRole(role)]
}

const hasDatabase = Boolean(process.env.MONGODB_URI ?? process.env.DATABASE_URL)

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
  const role = normalizeUserRole(session.user.role)

  if (!allowedRoles.includes(role)) {
    redirect(getDashboardPath(role))
  }

  return session
}
