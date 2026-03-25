"use client";

import { useState } from "react";
import {
  Plus,
  Receipt,
  MapPin,
  Car,
  Package,
  UtensilsCrossed,
  MoreHorizontal,
  Trash2,
  FileDown,
} from "lucide-react";
import { formatBRL, formatDate } from "@/lib/format";
import { deleteExpense } from "@/app/actions/expenses";
import { useToast } from "@/components/ui/toast";
import { ExpenseFormSheet } from "./expense-form-sheet";

export interface ExpenseData {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  clientName: string | null;
  clientId: string | null;
  quoteId: string | null;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  DESLOCAMENTO: MapPin,
  TRANSPORTE: Car,
  MATERIAL: Package,
  ALIMENTACAO: UtensilsCrossed,
  OUTROS: MoreHorizontal,
};

const categoryLabels: Record<string, string> = {
  DESLOCAMENTO: "Deslocamento",
  TRANSPORTE: "Transporte",
  MATERIAL: "Material",
  ALIMENTACAO: "Alimentação",
  OUTROS: "Outros",
};

interface Props {
  initialExpenses: ExpenseData[];
  kmPrice: number;
}

export function ExpensesClient({ initialExpenses, kmPrice }: Props) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Group by month
  const grouped = expenses.reduce<Record<string, ExpenseData[]>>(
    (acc, exp) => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      (acc[key] ??= []).push(exp);
      return acc;
    },
    {}
  );

  const monthLabels = (key: string) => {
    const [y, m] = key.split("-");
    const names = [
      "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    return `${names[parseInt(m)]} ${y}`;
  };

  function handleCreated(exp: ExpenseData) {
    setExpenses((prev) => [exp, ...prev]);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta despesa?")) return;
    const result = await deleteExpense(id);
    if (result.success) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast("Despesa excluída", "success");
    }
  }

  return (
    <div className="space-y-4">
      {/* Total card */}
      <div className="card bg-coral/5 border-coral/20">
        <p className="text-xs text-coral/60">Total de despesas</p>
        <p className="text-2xl font-mono font-bold text-coral">
          {formatBRL(total)}
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => window.open("/api/pdf/expenses", "_blank")}
          className="flex items-center gap-1.5 rounded-lg border border-ceu/30 px-3 py-1.5 text-xs font-medium text-noite/60 hover:bg-espuma/20"
        >
          <FileDown className="h-3.5 w-3.5" />
          Exportar PDF
        </button>
      </div>

      {/* Grouped list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-noite/30">
          <Receipt className="h-12 w-12" />
          <p className="text-sm">Nenhuma despesa registrada</p>
        </div>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([key, items]) => {
            const monthTotal = items.reduce((s, e) => s + e.amount, 0);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-noite/50 uppercase tracking-wide">
                    {monthLabels(key)}
                  </p>
                  <p className="text-xs font-mono text-noite/50">
                    {formatBRL(monthTotal)}
                  </p>
                </div>
                <div className="space-y-2">
                  {items.map((exp) => {
                    const Icon = categoryIcons[exp.category] ?? Receipt;
                    return (
                      <div
                        key={exp.id}
                        className="card flex items-center gap-3 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coral/10 text-coral">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-noite truncate">
                            {exp.description}
                          </p>
                          <p className="text-[10px] text-noite/40">
                            {formatDate(exp.date)}
                            {exp.clientName && ` · ${exp.clientName}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-mono font-medium text-coral">
                            {formatBRL(exp.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id)}
                            className="text-noite/20 hover:text-coral p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-white shadow-float hover:bg-coral-dark active:scale-95 transition-all"
        aria-label="Nova despesa"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Form sheet */}
      {showForm && (
        <ExpenseFormSheet
          kmPrice={kmPrice}
          onClose={() => setShowForm(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
