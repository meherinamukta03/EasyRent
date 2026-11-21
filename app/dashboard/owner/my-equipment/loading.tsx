import { Skeleton } from "@/components/ui/skeleton";

export default function MyEquipmentLoading() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 items-center gap-4 p-5"
            >
              <Skeleton className="col-span-2 h-5 w-3/4" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="ml-auto h-7 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
