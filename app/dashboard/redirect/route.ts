import { NextResponse } from "next/server"

import { getDashboardPath, getServerSession } from "@/lib/auth-server"

/**
 * Post-login landing route. It reads the Better Auth session on the server and
 * sends each role to its own dashboard. Used as the OAuth callbackURL so the
 * redirect is based on the verified session, not on client-side role data.
 */
export async function GET(request: Request) {
  const session = await getServerSession()

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const dashboardPath = getDashboardPath(session.user.role)

  if (!dashboardPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const target = new URL(dashboardPath, request.url)
  const authNotice = new URL(request.url).searchParams.get("auth")

  if (authNotice === "success") {
    target.searchParams.set("auth", "success")
  }

  return NextResponse.redirect(target)
}
