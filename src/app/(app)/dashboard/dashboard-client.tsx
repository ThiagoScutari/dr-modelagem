"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Layers,
  CheckCircle,
  FileText,
  Receipt,
  Timer,
  ChevronRight,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { getDashboardSummary } from "@/app/actions/dashboard";
import type { QuoteStatus } from "@prisma/client";

interface Summary {
  revenueMonth: number;
  quotesAwaiting: number;
  quotesApproved: number;
  quotesFinished: number;
  totalExpenses: number;
  netRevenue: number;
}

interface RecentQuote {
  id: string;
  clientName: string;
  status: QuoteStatus;
  totalNet: number;
  createdAt: string;
}

interface Props {
  summary: Summary;
  monthly: { month: string; revenue: number; expenses: number }[];
  recentQuotes: RecentQuote[];
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia, Débora!";
  if (hour < 18) return "Boa tarde, Débora!";
  return "Boa noite, Débora!";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  if (days < 30) return `há ${Math.floor(days / 7)} sem.`;
  return `há ${Math.floor(days / 30)} mês(es)`;
}

const periods = [
  { value: "week" as const, label: "Semana" },
  { value: "month" as const, label: "Mês" },
  { value: "quarter" as const, label: "Trimestre" },
];

export function DashboardClient({ summary: initialSummary, monthly, recentQuotes }: Props) {
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");
  const [summary, setSummary] = useState(initialSummary);

  async function handlePeriodChange(p: "week" | "month" | "quarter") {
    setPeriod(p);
    const data = await getDashboardSummary(p);
    setSummary(data);
  }

  return (
    <div className="space-y-5">
      {/* Saudação */}
      <div>
        <h2 className="font-display text-xl font-medium text-noite">
          {greeting()}
        </h2>
        <p className="text-xs text-noite/50">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Period pills */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => handlePeriodChange(p.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              period === p.value
                ? "bg-mar text-white"
                : "bg-ceu/15 text-noite/60 hover:bg-ceu/25"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Metric cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={TrendingUp}
          label="Receita"
          value={formatBRL(summary.revenueMonth)}
          color="floresta"
        />
        <MetricCard
          icon={Clock}
          label="Aguardando"
          value={String(summary.quotesAwaiting)}
          color="poente"
        />
        <MetricCard
          icon={Layers}
          label="Em andamento"
          value={String(summary.quotesApproved)}
          color="mar"
        />
        <MetricCard
          icon={CheckCircle}
          label="Finalizados"
          value={String(summary.quotesFinished)}
          color="floresta"
        />
      </div>

      {/* Chart */}
      <div className="card">
        <p className="text-xs font-semibold text-noite/50 uppercase tracking-wide mb-3">
          Receita × Despesas (6 meses)
        </p>
        <MonthlyChart data={monthly} />
      </div>

      {/* Recent quotes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-noite">Orçamentos recentes</p>
          <Link
            href="/orcamentos"
            className="text-xs text-mar font-medium flex items-center gap-0.5"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {recentQuotes.length === 0 ? (
          <p className="text-sm text-noite/40 py-4 text-center">
            Nenhum orçamento ainda
          </p>
        ) : (
          <div className="space-y-2">
            {recentQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/orcamentos/${q.id}`}
                className="card flex items-center justify-between py-3 px-4 hover:shadow-glass transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-noite truncate">
                    {q.clientName}
                  </p>
                  <p className="text-[10px] text-noite/40">
                    {timeAgo(q.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs font-mono text-noite">
                    {formatBRL(q.totalNet)}
                  </span>
                  <Badge status={q.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          href="/orcamentos/novo"
          className="flex flex-col items-center gap-1.5 rounded-xl bg-creme border border-mar/20 py-3 text-noite hover:bg-espuma/30 transition-colors tap-target"
        >
          <FileText className="h-5 w-5 text-mar" />
          <span className="text-[10px] font-medium">+ Orçamento</span>
        </Link>
        <Link
          href="/despesas"
          className="flex flex-col items-center gap-1.5 rounded-xl bg-creme border border-mar/20 py-3 text-noite hover:bg-espuma/30 transition-colors tap-target"
        >
          <Receipt className="h-5 w-5 text-mar" />
          <span className="text-[10px] font-medium">+ Despesa</span>
        </Link>
        <Link
          href="/foco"
          className="flex flex-col items-center gap-1.5 rounded-xl bg-creme border border-mar/20 py-3 text-noite hover:bg-espuma/30 transition-colors tap-target"
        >
          <Timer className="h-5 w-5 text-mar" />
          <span className="text-[10px] font-medium">Pomodoro</span>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: "floresta" | "poente" | "mar";
}) {
  const colorMap = {
    floresta: "bg-floresta/10 text-floresta",
    poente: "bg-poente/10 text-poente",
    mar: "bg-mar/10 text-mar",
  };

  return (
    <div className={`card relative overflow-hidden`}>
      <Icon className={`absolute top-3 right-3 h-5 w-5 ${colorMap[color].split(" ")[1]} opacity-40`} />
      <p className="text-lg font-mono font-semibold text-noite">{value}</p>
      <p className="text-[10px] text-noite/50 mt-0.5">{label}</p>
    </div>
  );
}
