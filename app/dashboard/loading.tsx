import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 py-16"
    >
      <span className="size-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-600" />
      <p className="text-sm font-medium text-slate-500">Loading dashboard…</p>
      <span className="sr-only">Loading</span>
      <div className="mt-4 w-full max-w-md space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
