import { Skeleton } from "@/components/ui/loading";

export default function DespesasLoading() {
  return (
    <div className="space-y-4">
      <div className="card">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-8 w-28 rounded-lg" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 py-3">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
