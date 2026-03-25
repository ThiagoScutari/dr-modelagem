"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatBRL } from "@/lib/format";

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg bg-white border border-ceu/20 shadow-card px-3 py-2 text-xs">
      <p className="font-medium text-noite mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === "revenue" ? "Receita" : "Despesas"}:{" "}
          {formatBRL(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function MonthlyChart({ data }: { data: ChartData[] }) {
  if (data.every((d) => d.revenue === 0 && d.expenses === 0)) {
    return (
      <p className="text-sm text-noite/40 text-center py-8">
        Sem dados no período
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200} className="lg:!h-[280px]">
      <BarChart data={data} barGap={2}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "#7BB8CC" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#7BB8CC" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) =>
            value === "revenue" ? "Receita" : "Despesas"
          }
          wrapperStyle={{ fontSize: 10 }}
        />
        <Bar
          dataKey="revenue"
          fill="#1A6E8C"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="expenses"
          fill="#B81C1C"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
