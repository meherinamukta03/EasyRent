"use client"

import Link from "next/link"

export default function Error({
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span
          aria-hidden="true"
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-emerald-600"
        >
          !
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          An unexpected error occurred while loading EasyRent. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors duration-200 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
