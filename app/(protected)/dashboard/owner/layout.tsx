import { requireRole } from "@/lib/auth-server"

export default async function OwnerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireRole("owner")

  return <>{children}</>
}
