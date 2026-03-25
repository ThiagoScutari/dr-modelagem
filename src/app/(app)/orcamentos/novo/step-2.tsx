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
import type { QuoteItemDraft } from "@/types/quote";
import type { PricingUnit } from "@prisma/client";
import {
  ChevronDown,
  Trash2,
  Copy,
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
  const { draft, addItem, updateItem, removeItem, updateItemGraduationPct, prevStep, nextStep } = store;
  const { toast } = useToast();
  const [pricingItems, setPricingItems] = useState<PricingOption[]>([]);
  const [config, setConfig] = useState<PricingConfigValues | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<ServiceCategory>>(
    new Set(["MODELAGEM"])
  );
  const [replicateFrom, setReplicateFrom] = useState<ServiceCategory | null>(
    null
  );

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
          <div key={cat} className="card p-0" style={{ overflow: "visible" }}>
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
                    onGradPctChange={
                      item.category === "GRADUACAO"
                        ? (pct) => updateItemGraduationPct(item.id, pct)
                        : undefined
                    }
                  />
                ))}

                {/* Add item via ComboCreate */}
                <div className="relative p-3 border-t border-ceu/10" style={{ overflow: "visible" }}>
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

const inlineInputClass =
  "rounded-lg border-[1.5px] border-mar/30 bg-espuma/30 px-2.5 py-1.5 font-mono text-[13px] font-medium text-mar text-center focus:border-mar focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-mar/12 transition-colors";

function ItemRow({
  item,
  onUpdate,
  onRemove,
  onGradPctChange,
}: {
  item: QuoteItemDraft;
  onUpdate: (changes: Partial<QuoteItemDraft>) => void;
  onRemove: () => void;
  onGradPctChange?: (pct: number) => void;
}) {
  const isGrad = item.category === "GRADUACAO" && item.basePrice != null;

  const [priceStr, setPriceStr] = useState(
    item.unitPrice.toFixed(2).replace(".", ",")
  );
  const [qtyStr, setQtyStr] = useState(String(item.quantity));
  const [pctStr, setPctStr] = useState(
    isGrad ? String(Math.round((item.graduationPct ?? 0.25) * 100)) : ""
  );

  // Sync local state when store changes externally
  useEffect(() => {
    setPriceStr(item.unitPrice.toFixed(2).replace(".", ","));
  }, [item.unitPrice]);
  useEffect(() => {
    setQtyStr(String(item.quantity));
  }, [item.quantity]);
  useEffect(() => {
    if (isGrad) setPctStr(String(Math.round((item.graduationPct ?? 0.25) * 100)));
  }, [item.graduationPct, isGrad]);

  function commitPrice() {
    const v = parseBRL(priceStr);
    if (v > 0) {
      onUpdate({ unitPrice: v });
    } else {
      setPriceStr(item.unitPrice.toFixed(2).replace(".", ","));
    }
  }

  function commitQty() {
    const v = parseInt(qtyStr);
    if (v >= 1) {
      onUpdate({ quantity: v });
    } else {
      setQtyStr(String(item.quantity));
    }
  }

  function commitPct() {
    const v = parseInt(pctStr);
    if (v >= 1 && v <= 100 && onGradPctChange) {
      onGradPctChange(v / 100);
    } else {
      setPctStr(String(Math.round((item.graduationPct ?? 0.25) * 100)));
    }
  }

  return (
    <div className="px-4 py-3 border-b border-ceu/5">
      {/* Row 1: description + delete */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm text-noite flex-1 truncate">
          {item.description}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-noite/30 hover:text-coral p-1.5 rounded-lg hover:bg-coral/5 tap-target flex items-center justify-center"
          aria-label="Remover item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Row 2: price (× pct for GRAD) × qty = total */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Unit price — always-visible input */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-noite/40">R$</span>
          <input
            type="text"
            inputMode="decimal"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={commitPrice}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setPriceStr(item.unitPrice.toFixed(2).replace(".", ","));
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={cn(
              inlineInputClass,
              "w-[88px]",
              isGrad && "bg-noite/5 border-noite/15 text-noite/50"
            )}
            readOnly={isGrad}
            tabIndex={isGrad ? -1 : 0}
          />
        </div>

        {/* Graduation % field */}
        {isGrad && (
          <>
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={pctStr}
                onChange={(e) => setPctStr(e.target.value.replace(/\D/g, ""))}
                onFocus={(e) => e.target.select()}
                onBlur={commitPct}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    setPctStr(String(Math.round((item.graduationPct ?? 0.25) * 100)));
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className={cn(inlineInputClass, "w-[52px]")}
              />
              <span className="text-[10px] text-noite/40">%</span>
            </div>
          </>
        )}

        <span className="text-[10px] text-noite/40">×</span>

        {/* Quantity — always-visible input */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            value={qtyStr}
            onChange={(e) => setQtyStr(e.target.value.replace(/\D/g, ""))}
            onFocus={(e) => e.target.select()}
            onBlur={commitQty}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setQtyStr(String(item.quantity));
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={cn(inlineInputClass, "w-[52px]")}
          />
          {/* TASK-04: label "tamanhos" para GRADUACAO */}
          <span className="text-[10px] text-noite/40">
            {item.category === "GRADUACAO" ? "tam." : "un."}
          </span>
        </div>

        {/* Total */}
        <span className="text-xs font-mono font-semibold text-floresta ml-auto">
          = {formatBRL(item.finalPrice)}
        </span>
      </div>

      {/* TASK-03: Linha de contexto — apenas para GRADUACAO */}
      {isGrad && item.basePrice != null && (
        <p className="text-xs text-noite/50 mt-1.5">
          Baseado em {formatBRL(item.basePrice)} · {item.description}
        </p>
      )}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-float sm:rounded-2xl">
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
