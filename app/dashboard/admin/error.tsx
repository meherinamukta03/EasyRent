"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AdminError({
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
          The admin dashboard could not be loaded
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Something went wrong while loading this section. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Try again
          </button>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Back to admin overview
          </Link>
        </div>
      </div>
    </main>
  )
}
