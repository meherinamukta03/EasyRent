/**
 * Shared, client-safe role helpers. Both server code (session checks) and
 * client code (Navbar dashboard link) use this single mapping, so there is no
 * duplicated role logic and no implicit default role.
 */
export const USER_ROLES = ["customer", "owner", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
}

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    (USER_ROLES as readonly string[]).includes(value)
  )
}

/** Returns null for a missing or invalid role — callers decide the safe fallback. */
export function getDashboardPath(role: unknown): string | null {
  return isUserRole(role) ? ROLE_DASHBOARD_PATHS[role] : null
}
