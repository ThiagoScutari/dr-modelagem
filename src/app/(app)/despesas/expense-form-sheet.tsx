"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createExpense } from "@/app/actions/expenses";
import { getClients } from "@/app/actions/clients";
import { ComboCreate, type CreateField } from "@/components/ui/combo-create";
import { createClient } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatBRL, parseBRL } from "@/lib/format";
import type { ExpenseData } from "./expenses-client";

const categories = [
  { value: "DESLOCAMENTO", label: "Deslocamento (Km)" },
  { value: "TRANSPORTE", label: "Transporte (Uber)" },
  { value: "MATERIAL", label: "Material" },
  { value: "ALIMENTACAO", label: "Alimentação" },
  { value: "OUTROS", label: "Outros" },
];

const clientCreateFields: CreateField[] = [
  { name: "name", label: "Nome", required: true },
  { name: "phone", label: "Telefone", type: "tel" },
];

interface ClientOption {
  id: string;
  name: string;
}

interface Props {
  kmPrice: number;
  onClose: () => void;
  onCreated: (expense: ExpenseData) => void;
}

export function ExpenseFormSheet({ kmPrice, onClose, onCreated }: Props) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OUTROS");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [km, setKm] = useState("");
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    getClients().then((data) =>
      setClients(data.map((c) => ({ id: c.id, name: c.name })))
    );
  }, []);

  // Auto-calc for deslocamento
  const isDeslocamento = category === "DESLOCAMENTO";
  const kmNum = parseFloat(km) || 0;
  const calcAmount = kmNum * kmPrice;

  useEffect(() => {
    if (isDeslocamento && kmNum > 0) {
      setAmountStr(calcAmount.toFixed(2).replace(".", ","));
    }
  }, [km, isDeslocamento, calcAmount, kmNum]);

  async function handleCreateClient(
    data: Record<string, string>
  ): Promise<ClientOption> {
    const result = await createClient({ name: data.name, phone: data.phone ?? "" });
    if (!result.success) throw new Error("Erro ao criar cliente");
    const option = { id: result.client.id, name: result.client.name };
    setClients((prev) => [...prev, option]);
    return option;
  }

  async function handleSubmit() {
    const amount = parseBRL(amountStr);
    if (!description.trim() || amount <= 0) {
      toast("Preencha descrição e valor", "warning");
      return;
    }

    setSaving(true);
    const result = await createExpense({
      description: description.trim(),
      category,
      amount,
      date,
      clientId: clientId ?? undefined,
    });

    if (result.success) {
      const clientName =
        clients.find((c) => c.id === clientId)?.name ?? null;
      onCreated({
        id: result.expense.id,
        description: result.expense.description,
        category: result.expense.category,
        amount: Number(result.expense.amount),
        date: result.expense.date.toISOString(),
        clientName,
        clientId: result.expense.clientId,
        quoteId: result.expense.quoteId,
      });
      toast("Despesa registrada", "success");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-float sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-medium text-noite">
            Nova despesa
          </h3>
          <button type="button" onClick={onClose} className="text-noite/40 tap-target flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <Input
            id="description"
            label="Descrição *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Uber para cliente, Papel plotagem"
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-noite/70">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-base text-sm"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Km field for deslocamento */}
          {isDeslocamento && (
            <div className="rounded-xl bg-poente/5 border border-poente/20 p-3 space-y-2">
              <Input
                id="km"
                label="Km rodados"
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="Ex: 12"
              />
              {kmNum > 0 && (
                <p className="text-xs font-mono text-poente">
                  {kmNum} km × {formatBRL(kmPrice)} = {formatBRL(calcAmount)}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-noite/70">
              Valor (R$) *
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0,00"
              className="input-base font-mono"
            />
          </div>

          <Input
            id="date"
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-noite/70">
              Vincular a cliente
            </label>
            <ComboCreate<ClientOption>
              items={clients}
              value={clientId}
              onChange={(id) => setClientId(id || null)}
              getLabel={(c) => c.name}
              getValue={(c) => c.id}
              placeholder="Buscar cliente..."
              createLabel="Cadastrar cliente"
              onCreateSubmit={handleCreateClient}
              createFields={clientCreateFields}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={saving} className="flex-1">
              Registrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
