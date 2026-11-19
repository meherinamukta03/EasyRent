import { requireRole } from "@/lib/auth-server"

export default async function CustomerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireRole("customer")

  return <>{children}</>
}
