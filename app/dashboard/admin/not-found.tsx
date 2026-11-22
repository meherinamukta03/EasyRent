import Link from "next/link"
import { PackageOpen } from "lucide-react"

export default function AdminNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <PackageOpen className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-sm font-semibold tracking-[0.3em] text-emerald-600 uppercase">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Admin page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          That admin page does not exist or the record may have been removed.
        </p>
        <Link
          href="/dashboard/admin"
          className="mt-7 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Back to admin overview
        </Link>
      </div>
    </main>
  )
}
