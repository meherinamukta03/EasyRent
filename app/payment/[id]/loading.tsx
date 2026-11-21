export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
        >
          <span
            aria-hidden="true"
            className="size-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-600"
          />
          <p className="text-sm font-medium text-slate-500">
            Loading payment details...
          </p>
          <span className="sr-only">Loading</span>
        </div>
      </div>
    </main>
  );
}
