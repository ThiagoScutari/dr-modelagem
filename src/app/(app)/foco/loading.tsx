import { Skeleton } from "@/components/ui/loading";

export default function FocoLoading() {
  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="card flex flex-col items-center gap-4 py-6">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-2 w-2 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      {/* Tasks */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card flex items-center gap-3 py-3">
            <Skeleton className="h-5 w-5 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
