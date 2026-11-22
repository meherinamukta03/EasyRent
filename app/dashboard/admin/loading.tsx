import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading admin dashboard…</span>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="mt-5 h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-3 h-3 w-72" />
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
