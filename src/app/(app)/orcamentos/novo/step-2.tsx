"use client";

import { useEffect, useState } from "react";
import { useQuoteDraft } from "@/store/quote-draft";
import { listPricingItems } from "@/app/actions/pricing";
import { getPricingConfig } from "@/app/actions/pricing";
import { createPricingItem } from "@/app/actions/pricing";
import { formatBRL, parseBRL } from "@/lib/format";
import { calcCategorySubtotal } from "@/lib/quote-calc";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ComboCreate, type CreateField } from "@/components/ui/combo-create";
import type { PricingConfigValues, ServiceCategory } from "@/types/quote";
import type { PricingUnit } from "@prisma/client";
import {
  ChevronDown,
  Trash2,
  Copy,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingOption {
  id: string;
  name: string;
  priceMin: number;
  category: string;
}

const categoryLabels: Record<ServiceCategory, string> = {
  DIGITALIZACAO: "Digitalização",
  MODELAGEM: "Modelagem",
  GRADUACAO: "Graduação",
  ENCAIXE: "Encaixe",
  PLOTAGEM: "Plotagem",
  PILOTO: "Peças Piloto",
  CONVERSAO: "Conversão",
  CONSULTORIA: "Consultoria",
  OUTROS: "Outros",
};

const defaultCategories: ServiceCategory[] = [
  "MODELAGEM",
  "GRADUACAO",
  "ENCAIXE",
  "PLOTAGEM",
  "PILOTO",
  "DIGITALIZACAO",
];

const serviceCreateFields: CreateField[] = [
  { name: "name", label: "Nome do serviço", required: true },
  { name: "priceMin", label: "Valor padrão", type: "number", required: true },
];

export function QuoteStep2() {
  const store = useQuoteDraft();
  const { draft, addItem, updateItem, removeItem, prevStep, nextStep } = store;
  const { toast } = useToast();
  const [pricingItems, setPricingItems] = useState<PricingOption[]>([]);
  const [config, setConfig] = useState<PricingConfigValues | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<ServiceCategory>>(
    new Set(["MODELAGEM"])
  );
  const [replicateFrom, setReplicateFrom] = useState<ServiceCategory | null>(null);

  useEffect(() => {
    listPricingItems().then((items) =>
      setPricingItems(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          priceMin: Number(i.priceMin),
          category: i.category,
        }))
      )
    );
    getPricingConfig().then((c) => {
      if (c) {
        setConfig({
          graduationPctBasic: Number(c.graduationPctBasic),
          graduationPctComplex: Number(c.graduationPctComplex),
          pilotPct: Number(c.pilotPct),
          plottingPricePerMeter: Number(c.plottingPricePerMeter),
          kmPrice: Number(c.kmPrice),
        });
      }
    });
  }, []);

  // Categorias visíveis: defaults + qualquer que tenha itens
  const activeCats = new Set<ServiceCategory>(defaultCategories);
  draft.items.forEach((i) => activeCats.add(i.category));

  function toggleCat(cat: ServiceCategory) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function handleAddItem(cat: ServiceCategory, optionId: string) {
    const option = pricingItems.find((p) => p.id === optionId);
    if (!option) return;
    addItem({
      category: cat,
      description: option.name,
      quantity: 1,
      unitPrice: option.priceMin,
      discountPct: 0,
      sourceItemId: null,
    });
  }

  async function handleCreateService(
    cat: ServiceCategory,
    data: Record<string, string>
  ): Promise<PricingOption> {
    const result = await createPricingItem({
      category: cat,
      name: data.name,
      priceMin: parseFloat(data.priceMin) || 0,
      unit: "PER_UNIT" as PricingUnit,
      active: true,
      sortOrder: 0,
    });
    if (!result.success) throw new Error("Erro ao criar serviço");
    const option: PricingOption = {
      id: result.item.id,
      name: result.item.name,
      priceMin: Number(result.item.priceMin),
      category: result.item.category,
    };
    setPricingItems((prev) => [...prev, option]);
    return option;
  }

  function handleReplicate(to: ServiceCategory) {
    if (!config || !replicateFrom) return;
    const sourceItems = draft.items.filter(
      (i) => i.category === replicateFrom
    );
    if (sourceItems.length === 0) {
      toast("Nenhum item na categoria origem", "warning");
      return;
    }
    const existingInTarget = draft.items.some((i) => i.category === to);
    store.replicateCategory(replicateFrom, to, config, false);
    toast(
      `${sourceItems.length} item(ns) replicado(s) para ${categoryLabels[to]}`,
      "success"
    );
    setReplicateFrom(null);
    setExpandedCats((prev) => new Set([...prev, to]));
  }

  return (
    <div className="space-y-3">
      {/* Total flutuante */}
      <div className="sticky top-14 z-30 glass rounded-xl px-4 py-3 flex items-center justify-between border border-ceu/20">
        <span className="text-sm text-noite/60">Total</span>
        <span className="text-lg font-mono font-semibold text-noite">
          {formatBRL(draft.totalGross)}
        </span>
      </div>

      {/* Seções por categoria */}
      {[...activeCats].map((cat) => {
        const catItems = draft.items.filter((i) => i.category === cat);
        const subtotal = calcCategorySubtotal(draft.items, cat);
        const isExpanded = expandedCats.has(cat);
        const catPricing = pricingItems.filter((p) => p.category === cat);

        return (
          <div key={cat} className="card p-0 overflow-hidden">
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleCat(cat)}
              className="flex w-full items-center justify-between p-4 tap-target"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-noite">
                  {categoryLabels[cat]}
                </span>
                {catItems.length > 0 && (
                  <span className="text-xs text-noite/50">
                    ({catItems.length})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {subtotal > 0 && (
                  <span className="text-sm font-mono text-mar">
                    {formatBRL(subtotal)}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-noite/40 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-ceu/10">
                {/* Items list */}
                {catItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(changes) => updateItem(item.id, changes)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}

                {/* Add item via ComboCreate */}
                <div className="p-3 border-t border-ceu/10">
                  <ComboCreate<PricingOption>
                    items={catPricing}
                    value={null}
                    onChange={(id) => handleAddItem(cat, id)}
                    getLabel={(p) => `${p.name} — ${formatBRL(p.priceMin)}`}
                    getValue={(p) => p.id}
                    placeholder="Buscar serviço..."
                    createLabel="Criar serviço"
                    onCreateSubmit={(data) => handleCreateService(cat, data)}
                    createFields={serviceCreateFields}
                  />
                </div>

                {/* Action buttons */}
                {catItems.length > 0 && (
                  <div className="flex gap-2 p-3 border-t border-ceu/10">
                    <button
                      type="button"
                      onClick={() => setReplicateFrom(cat)}
                      className="flex items-center gap-1 rounded-lg border border-ceu/30 px-3 py-1.5 text-xs font-medium text-noite/60 hover:bg-espuma/20"
                    >
                      <Copy className="h-3 w-3" />
                      Replicar para →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Replicate sheet */}
      {replicateFrom && config && (
        <ReplicateSheet
          fromLabel={categoryLabels[replicateFrom]}
          config={config}
          onSelect={handleReplicate}
          onClose={() => setReplicateFrom(null)}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={prevStep} className="flex-1">
          ← Anterior
        </Button>
        <Button
          onClick={nextStep}
          disabled={draft.items.length === 0}
          className="flex-1"
        >
          Próximo →
        </Button>
      </div>
    </div>
  );
}

// ─── Item Row ───

function ItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: import("@/types/quote").QuoteItemDraft;
  onUpdate: (changes: Partial<import("@/types/quote").QuoteItemDraft>) => void;
  onRemove: () => void;
}) {
  const [swiped, setSwiped] = useState(false);

  return (
    <div className="relative overflow-hidden">
      {/* Delete bg */}
      <div className="absolute inset-y-0 right-0 flex items-center bg-coral px-4">
        <button
          type="button"
          onClick={onRemove}
          className="text-white text-xs font-medium"
        >
          Remover
        </button>
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative bg-white px-4 py-3 transition-transform duration-200",
          swiped && "-translate-x-24"
        )}
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX;
          const handleMove = (ev: TouchEvent) => {
            const diff = startX - ev.touches[0].clientX;
            setSwiped(diff > 60);
          };
          const handleEnd = () => {
            document.removeEventListener("touchmove", handleMove);
            document.removeEventListener("touchend", handleEnd);
          };
          document.addEventListener("touchmove", handleMove);
          document.addEventListener("touchend", handleEnd);
        }}
        onClick={() => swiped && setSwiped(false)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-noite flex-1 truncate">
            {item.description}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="text-noite/20 hover:text-coral p-1 sm:block hidden"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-noite/40">R$</label>
            <input
              type="text"
              inputMode="decimal"
              value={item.unitPrice.toFixed(2).replace(".", ",")}
              onChange={(e) => {
                const v = parseBRL(e.target.value);
                if (v >= 0) onUpdate({ unitPrice: v });
              }}
              className="w-20 rounded border border-ceu/30 bg-transparent px-1.5 py-0.5 text-xs font-mono text-noite text-right focus:outline-none focus:ring-1 focus:ring-mar/30"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-noite/40">×</label>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                onUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })
              }
              className="w-12 rounded border border-ceu/30 bg-transparent px-1.5 py-0.5 text-xs font-mono text-noite text-center focus:outline-none focus:ring-1 focus:ring-mar/30"
            />
          </div>
          <span className="text-xs font-mono font-medium text-floresta ml-auto">
            {formatBRL(item.finalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Replicate Sheet ───

function ReplicateSheet({
  fromLabel,
  config,
  onSelect,
  onClose,
}: {
  fromLabel: string;
  config: PricingConfigValues;
  onSelect: (cat: ServiceCategory) => void;
  onClose: () => void;
}) {
  const targets: { cat: ServiceCategory; hint: string }[] = [
    {
      cat: "GRADUACAO",
      hint: `Aplicará ${(config.graduationPctBasic * 100).toFixed(0)}% do valor`,
    },
    {
      cat: "PILOTO",
      hint: `Aplicará ${(config.pilotPct * 100).toFixed(0)}% do valor`,
    },
    { cat: "ENCAIXE", hint: "Mesmo valor (editável)" },
    { cat: "PLOTAGEM", hint: "Mesmo valor (editável)" },
    { cat: "DIGITALIZACAO", hint: "Mesmo valor (editável)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-float">
        <h3 className="font-display text-lg font-medium text-noite mb-1">
          Replicar {fromLabel}
        </h3>
        <p className="text-xs text-noite/50 mb-4">
          Escolha a categoria destino
        </p>
        <div className="space-y-2">
          {targets.map(({ cat, hint }) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(cat)}
              className="flex w-full items-center justify-between rounded-xl border border-ceu/20 px-4 py-3 hover:bg-espuma/20 transition-colors tap-target"
            >
              <span className="text-sm font-medium text-noite">
                {categoryLabels[cat]}
              </span>
              <span className="text-xs text-noite/50">{hint}</span>
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={onClose} className="w-full mt-3">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
