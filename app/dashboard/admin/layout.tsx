import AdminHeader from "@/components/admin/AdminHeader"
import { requireRole } from "@/lib/auth-server"

/**
 * Nested under the shared dashboard layout. The session and role are verified
 * again here (server-side) in addition to the proxy redirect, so this area is
 * never rendered for a customer or an owner.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("admin")

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <AdminHeader />
      <main className="relative isolate min-h-[calc(100svh-8rem)] flex-1 bg-slate-50/70 px-4 py-8 sm:px-6 lg:min-h-[calc(100svh-9rem)] lg:px-8 lg:py-10">
        <div
          aria-hidden="true"
          className="absolute -top-32 right-0 -z-10 size-[28rem] rounded-full bg-emerald-100/50 blur-3xl"
        />
        <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
      </main>
    </div>
  )
}
