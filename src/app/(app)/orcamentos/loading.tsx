import { Skeleton } from "@/components/ui/loading";

export default function OrcamentosLoading() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
        ))}
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card flex items-center justify-between">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-1.5 flex flex-col items-end">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
