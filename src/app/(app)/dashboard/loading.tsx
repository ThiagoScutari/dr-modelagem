import { Skeleton } from "@/components/ui/loading";

export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-32 mt-1" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="card">
        <Skeleton className="h-3 w-40 mb-3" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    </div>
  );
}
