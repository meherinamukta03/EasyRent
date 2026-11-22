"use client"

import { ShieldCheck } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

export default function AdminHeader() {
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const displayName = user?.name || user?.email || "Admin"

  return (
    <header className="sticky top-16 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:top-[4.5rem] lg:px-8">
      <SidebarTrigger className="shrink-0 border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.65rem] font-bold tracking-[0.16em] text-emerald-700 uppercase">
          Admin dashboard
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="truncate text-sm font-bold text-slate-900 sm:text-base">
            {isPending ? "Loading account…" : displayName}
          </span>
          {!isPending && user?.role ? (
            <span className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700 capitalize sm:inline-flex">
              <ShieldCheck className="size-3" aria-hidden="true" />
              {user.role}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
