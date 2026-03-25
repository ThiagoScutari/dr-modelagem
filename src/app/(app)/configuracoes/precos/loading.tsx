import { Skeleton } from "@/components/ui/loading";

export default function PrecosLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
