"use client"

import Link from "next/link"
import { Home, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath } from "@/lib/roles"

export default function DashboardForbidden() {
  const { data: session } = authClient.useSession()
  const role = session?.user?.role
  const dashboardHref = getDashboardPath(role) ?? "/"

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-sm font-semibold tracking-[0.3em] text-red-600 uppercase">
          403
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Access denied
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          You&apos;re signed in{role ? ` as a ${role}` : ""}, so you don&apos;t
          have permission to view this page. Use your own dashboard instead.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            render={<Link href={dashboardHref} />}
            className="h-11 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
          >
            Go to my dashboard
          </Button>
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="h-11 rounded-full border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Home className="size-4" aria-hidden="true" />
            Back to home
          </Button>
        </div>
      </div>
    </main>
  )
}
