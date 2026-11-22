import { requireRole } from "@/lib/auth-server"

export default async function OwnerAnalyticsPage() {
  await requireRole("owner")

  return null
}
