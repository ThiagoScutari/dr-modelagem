"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { ServiceCategory, PricingUnit } from "@prisma/client";
import {
  createPricingItem,
  updatePricingItem,
  deletePricingItem,
} from "@/app/actions/pricing";
import { formatBRL, parseBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface PricingItemData {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string | null;
  priceMin: number;
  priceMax: number | null;
  unit: PricingUnit;
  active: boolean;
  sortOrder: number;
}

interface Props {
  category: ServiceCategory;
  label: string;
  items: PricingItemData[];
}

export function PricingCategorySection({ category, label, items: initialItems }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { toast } = useToast();

  // ─── Novo Item Form State ───
  const [newName, setNewName] = useState("");
  const [newPriceMin, setNewPriceMin] = useState("");
  const [newPriceMax, setNewPriceMax] = useState("");
  const [newUnit, setNewUnit] = useState<PricingUnit>("PER_UNIT");
  const [saving, setSaving] = useState(false);

  function formatPrice(item: PricingItemData) {
    if (item.priceMax && item.priceMax !== item.priceMin) {
      return `${formatBRL(item.priceMin)} – ${formatBRL(item.priceMax)}`;
    }
    return formatBRL(item.priceMin);
  }

  async function handleInlineEdit(id: string) {
    const value = parseBRL(editValue);
    if (value <= 0) {
      setEditingId(null);
      return;
    }

    const result = await updatePricingItem(id, { priceMin: value });
    if (result.success) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, priceMin: value } : i))
      );
      toast("Valor atualizado", "success");
    }
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este serviço?")) return;
    const result = await deletePricingItem(id);
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast("Serviço excluído", "success");
    }
  }

  async function handleAdd() {
    const min = parseBRL(newPriceMin);
    if (!newName.trim() || min <= 0) return;

    setSaving(true);
    const max = parseBRL(newPriceMax);
    const result = await createPricingItem({
      category,
      name: newName.trim(),
      priceMin: min,
      priceMax: max > 0 ? max : undefined,
      unit: newUnit,
      active: true,
      sortOrder: items.length,
    });

    if (result.success) {
      setItems((prev) => [
        ...prev,
        {
          ...result.item,
          priceMin: Number(result.item.priceMin),
          priceMax: result.item.priceMax ? Number(result.item.priceMax) : null,
        },
      ]);
      setNewName("");
      setNewPriceMin("");
      setNewPriceMax("");
      setShowAddForm(false);
      toast("Serviço adicionado", "success");
    }
    setSaving(false);
  }

  const total = items.reduce((sum, i) => sum + i.priceMin, 0);

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header colapsável */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 tap-target"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-noite">{label}</span>
          <span className="rounded-full bg-mar/10 px-2 py-0.5 text-xs font-medium text-mar">
            {items.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-noite/40 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Conteúdo */}
      {expanded && (
        <div className="border-t border-ceu/10">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-noite/40">
              Nenhum serviço cadastrado
            </p>
          ) : (
            <ul className="divide-y divide-ceu/10">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="flex-1 text-sm text-noite pr-3">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleInlineEdit(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleInlineEdit(item.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-28 rounded-lg border border-mar/40 bg-espuma/20 px-2 py-1 text-right text-sm font-mono text-noite focus:outline-none focus:ring-2 focus:ring-mar/30"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditValue(
                            item.priceMin.toFixed(2).replace(".", ",")
                          );
                        }}
                        className="text-sm font-mono text-mar hover:text-mar-dark"
                      >
                        {formatPrice(item)}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-noite/30 hover:text-coral p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Formulário de adição */}
          {showAddForm ? (
            <div className="border-t border-ceu/10 p-4 space-y-3">
              <input
                type="text"
                placeholder="Nome do serviço"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input-base text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor mín."
                  value={newPriceMin}
                  onChange={(e) => setNewPriceMin(e.target.value)}
                  className="input-base text-sm flex-1"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor máx. (opc.)"
                  value={newPriceMax}
                  onChange={(e) => setNewPriceMax(e.target.value)}
                  className="input-base text-sm flex-1"
                />
              </div>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as PricingUnit)}
                className="input-base text-sm"
              >
                <option value="PER_UNIT">Por unidade</option>
                <option value="PER_METER">Por metro</option>
                <option value="PER_FILE">Por arquivo</option>
                <option value="PER_SIZE">Por tamanho</option>
                <option value="PER_HOUR">Por hora</option>
                <option value="PER_KM">Por km</option>
                <option value="PERCENTAGE">Percentual</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-lg border border-ceu/30 py-2 text-xs font-medium text-noite/60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-mar py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-1.5 border-t border-ceu/10 py-3 text-xs font-medium text-mar hover:bg-espuma/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar serviço
            </button>
          )}
        </div>
      )}
    </div>
  );
}
