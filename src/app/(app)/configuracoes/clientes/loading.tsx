import { Skeleton } from "@/components/ui/loading";

export default function ClientesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      {/* Barra de busca */}
      <Skeleton className="h-11 w-full rounded-xl" />
      {/* Cards de cliente */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
