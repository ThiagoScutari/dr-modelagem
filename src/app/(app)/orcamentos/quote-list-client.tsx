"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { QuoteStatus } from "@prisma/client";

interface QuoteListItem {
  id: string;
  clientName: string;
  status: QuoteStatus;
  totalNet: number;
  createdAt: string;
  validUntil: string | null;
  itemsCount: number;
}

const statusFilters: { value: QuoteStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
];

export function QuoteListClient({
  initialQuotes,
}: {
  initialQuotes: QuoteListItem[];
}) {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = initialQuotes.filter((q) => {
    if (statusFilter !== "ALL" && q.status !== statusFilter) return false;
    if (search && !q.clientName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Status pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-mar text-white"
                : "bg-ceu/15 text-noite/60 hover:bg-ceu/25"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-noite/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente..."
          className="input-base pl-9"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-noite/30">
          <FileText className="h-12 w-12" />
          <p className="text-sm">Nenhum orçamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {filtered.map((q) => (
            <Link
              key={q.id}
              href={`/orcamentos/${q.id}`}
              className="card flex items-center justify-between transition-shadow hover:shadow-glass active:scale-[0.98]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-noite truncate">
                  {q.clientName}
                </p>
                <p className="text-xs text-noite/50">
                  {formatDate(q.createdAt)} · {q.itemsCount} itens
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                <span className="text-sm font-mono font-semibold text-noite">
                  {formatBRL(q.totalNet)}
                </span>
                <Badge status={q.status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/orcamentos/novo"
        className="fixed bottom-24 right-5 lg:bottom-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-mar text-white shadow-float hover:bg-mar-dark active:scale-95 transition-all"
        aria-label="Novo orçamento"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
