import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold tracking-[0.3em] text-emerald-600 uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          The page you are looking for does not exist or may have been moved.
          Let us get you back to the equipment.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/all-equipment"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition-colors duration-200 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Browse equipment
          </Link>
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
