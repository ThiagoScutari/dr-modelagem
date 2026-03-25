"use client";

import { useState } from "react";
import { useQuoteDraft } from "@/store/quote-draft";
import { createQuote } from "@/app/actions/quotes";
import { formatBRL } from "@/lib/format";
import { calcCategorySubtotal } from "@/lib/quote-calc";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ServiceCategory } from "@/types/quote";

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

export function QuoteStep3() {
  const { draft, setGlobalDiscount, prevStep } = useQuoteDraft();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Categorias com itens
  const categories = [
    ...new Set(draft.items.map((i) => i.category)),
  ] as ServiceCategory[];

  async function handleCreate() {
    setSaving(true);
    try {
      await createQuote({
        clientId: draft.clientId,
        validUntil: draft.validUntil,
        notes: draft.notes,
        discountPct: draft.discountPct,
        items: draft.items.map((item, i) => ({
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPct: item.discountPct,
          sortOrder: i,
          sourceItemId: item.sourceItemId,
          graduationPct: item.graduationPct ?? null,
          basePrice: item.basePrice ?? null,
        })),
      });
      // redirect happens inside createQuote
    } catch {
      toast("Erro ao criar orçamento", "error");
      setSaving(false);
    }
  }

  const discountValue = draft.totalGross * draft.discountPct;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-noite">
        Revisão do orçamento
      </h2>

      {/* Cabeçalho */}
      <div className="card space-y-1">
        <p className="text-sm text-noite">
          <span className="text-noite/50">Cliente: </span>
          <strong>{draft.clientName}</strong>
        </p>
        {draft.validUntil && (
          <p className="text-sm text-noite">
            <span className="text-noite/50">Válido até: </span>
            {new Date(draft.validUntil + "T12:00:00").toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {/* Subtotais por categoria */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const catItems = draft.items.filter((i) => i.category === cat);
          const subtotal = calcCategorySubtotal(draft.items, cat);
          return (
            <div key={cat} className="rounded-xl bg-creme overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-noite">
                    {categoryLabels[cat]}
                  </p>
                  <p className="text-xs text-noite/50">
                    {catItems.length} item(ns)
                  </p>
                </div>
                <span className="text-sm font-mono font-medium text-noite">
                  {formatBRL(subtotal)}
                </span>
              </div>
              {/* Detalhes dos itens */}
              <div className="border-t border-ceu/10">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-1.5 text-xs border-b border-ceu/5 last:border-b-0"
                  >
                    <span className="text-noite/70 truncate flex-1 mr-2">
                      {item.description}
                    </span>
                    <span className="font-mono text-noite/50 whitespace-nowrap">
                      {item.category === "GRADUACAO" && item.graduationPct != null
                        ? `${Math.round(item.graduationPct * 100)}% × ${item.quantity} tam.`
                        : `×${item.quantity}`}
                    </span>
                    <span className="font-mono font-medium text-noite ml-3 w-20 text-right">
                      {formatBRL(item.finalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totais */}
      <div className="card space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-noite/60">Subtotal bruto</span>
          <span className="font-mono text-noite">
            {formatBRL(draft.totalGross)}
          </span>
        </div>

        {/* Desconto global */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-noite/60">Desconto global</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={
                draft.discountPct > 0
                  ? (draft.discountPct * 100).toFixed(0)
                  : ""
              }
              onChange={(e) => {
                const v = parseFloat(e.target.value.replace(",", "."));
                setGlobalDiscount(isNaN(v) ? 0 : Math.min(100, v) / 100);
              }}
              placeholder="0"
              className="w-16 rounded border border-ceu/30 bg-transparent px-2 py-1 text-right text-sm font-mono text-noite focus:outline-none focus:ring-1 focus:ring-mar/30"
            />
            <span className="text-xs text-noite/40">%</span>
          </div>
        </div>

        {discountValue > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-coral/70">Desconto</span>
            <span className="font-mono text-coral">
              -{formatBRL(discountValue)}
            </span>
          </div>
        )}

        <div className="border-t border-ceu/20 pt-3 flex justify-between">
          <span className="text-base font-semibold text-noite">TOTAL</span>
          <span className="text-xl font-mono font-bold text-noite">
            {formatBRL(draft.totalNet)}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={prevStep} className="flex-1">
          ← Anterior
        </Button>
        <Button onClick={handleCreate} loading={saving} className="flex-1">
          Criar Orçamento
        </Button>
      </div>
    </div>
  );
}
