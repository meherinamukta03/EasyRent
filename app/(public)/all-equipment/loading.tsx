export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50/70">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="h-3 w-40 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-4 h-10 w-full max-w-2xl animate-pulse rounded-xl bg-slate-100" />
          <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-full bg-slate-100" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[40vh] items-center justify-center"
        >
          <div className="flex flex-col items-center gap-4">
            <span
              aria-hidden="true"
              className="size-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-600"
            />
            <p className="text-sm font-medium text-slate-500">
              Loading equipment...
            </p>
            <span className="sr-only">Loading</span>
          </div>
        </div>
      </section>
    </main>
  );
}
