import { redirect } from "next/navigation"

import { getDashboardPath, requireUser } from "@/lib/auth-server"

export default async function DashboardPage() {
  const session = await requireUser()

  redirect(getDashboardPath(session.user.role))
}
