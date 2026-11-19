export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] w-full items-center justify-center px-4 py-16"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="size-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-600"
        />
        <p className="text-sm font-medium text-slate-500">
          Loading EasyRent...
        </p>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  )
}
