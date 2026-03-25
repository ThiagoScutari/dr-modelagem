import { create } from "zustand";
import type {
  QuoteDraft,
  QuoteItemDraft,
  PricingConfigValues,
  ServiceCategory,
} from "@/types/quote";
import {
  calcItemFinalPrice,
  replicateItems,
  recalcDraft,
  recalcGraduationItem,
} from "@/lib/quote-calc";

function emptyDraft(): QuoteDraft {
  return {
    clientId: "",
    clientName: "",
    validUntil: new Date(Date.now() + 15 * 86400000)
      .toISOString()
      .split("T")[0],
    notes: "",
    items: [],
    discountPct: 0,
    totalGross: 0,
    totalNet: 0,
  };
}

interface QuoteDraftStore {
  draft: QuoteDraft;
  step: 1 | 2 | 3;

  // Cabeçalho
  setClient: (clientId: string, clientName: string) => void;
  setValidUntil: (date: string | null) => void;
  setNotes: (notes: string) => void;

  // Itens
  addItem: (item: Omit<QuoteItemDraft, "id" | "finalPrice">) => void;
  updateItem: (id: string, changes: Partial<QuoteItemDraft>) => void;
  removeItem: (id: string) => void;
  replicateCategory: (
    from: ServiceCategory,
    to: ServiceCategory,
    config: PricingConfigValues,
    replace: boolean
  ) => void;
  updateItemGraduationPct: (id: string, pct: number) => void;
  applyBatchAdjustment: (
    target: ServiceCategory | "ALL",
    type: "PCT" | "FIXED",
    value: number,
    applyAs: "DISCOUNT" | "INCREASE"
  ) => void;

  // Totais
  setGlobalDiscount: (pct: number) => void;

  // Navegação
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;

  // Carregar orçamento existente (para edição)
  loadDraft: (draft: QuoteDraft) => void;
}

export const useQuoteDraft = create<QuoteDraftStore>((set) => ({
  draft: emptyDraft(),
  step: 1,

  setClient: (clientId, clientName) =>
    set((s) => ({ draft: { ...s.draft, clientId, clientName } })),

  setValidUntil: (date) =>
    set((s) => ({ draft: { ...s.draft, validUntil: date } })),

  setNotes: (notes) =>
    set((s) => ({ draft: { ...s.draft, notes } })),

  addItem: (itemData) =>
    set((s) => {
      const newItem: QuoteItemDraft = {
        ...itemData,
        id: crypto.randomUUID(),
        finalPrice: calcItemFinalPrice({
          ...itemData,
          id: "",
          finalPrice: 0,
        }),
      };
      const items = [...s.draft.items, newItem];
      const { totalGross, totalNet } = recalcDraft(items, s.draft.discountPct);
      return {
        draft: {
          ...s.draft,
          items: items.map((i) => ({
            ...i,
            finalPrice: calcItemFinalPrice(i),
          })),
          totalGross,
          totalNet,
        },
      };
    }),

  updateItem: (id, changes) =>
    set((s) => {
      const items = s.draft.items.map((i) =>
        i.id === id ? { ...i, ...changes } : i
      );
      const recalced = recalcDraft(items, s.draft.discountPct);
      return { draft: { ...s.draft, ...recalced } };
    }),

  removeItem: (id) =>
    set((s) => {
      const items = s.draft.items.filter((i) => i.id !== id);
      const recalced = recalcDraft(items, s.draft.discountPct);
      return { draft: { ...s.draft, ...recalced } };
    }),

  replicateCategory: (from, to, config, replace) =>
    set((s) => {
      const sourceItems = s.draft.items.filter((i) => i.category === from);
      const replicated = replicateItems(sourceItems, to, config);
      let items: QuoteItemDraft[];

      if (replace) {
        items = [
          ...s.draft.items.filter((i) => i.category !== to),
          ...replicated,
        ];
      } else {
        items = [...s.draft.items, ...replicated];
      }

      const recalced = recalcDraft(items, s.draft.discountPct);
      return { draft: { ...s.draft, ...recalced } };
    }),

  updateItemGraduationPct: (id, pct) =>
    set((s) => {
      const items = s.draft.items.map((i) =>
        i.id === id ? { ...i, ...recalcGraduationItem(i, pct) } : i
      );
      const recalced = recalcDraft(items, s.draft.discountPct);
      return { draft: { ...s.draft, ...recalced } };
    }),

  applyBatchAdjustment: (target, type, value, applyAs) =>
    set((s) => {
      const items = s.draft.items.map((item) => {
        if (target !== "ALL" && item.category !== target) return item;

        if (type === "PCT") {
          const pct = value / 100;
          const newDiscount =
            applyAs === "DISCOUNT" ? pct : -pct;
          return {
            ...item,
            discountPct: Math.max(0, Math.min(1, item.discountPct + newDiscount)),
          };
        } else {
          // FIXED: ajusta unitPrice
          const delta = applyAs === "DISCOUNT" ? -value : value;
          return {
            ...item,
            unitPrice: Math.max(0, item.unitPrice + delta),
          };
        }
      });

      const recalced = recalcDraft(items, s.draft.discountPct);
      return { draft: { ...s.draft, ...recalced } };
    }),

  setGlobalDiscount: (pct) =>
    set((s) => {
      const recalced = recalcDraft(s.draft.items, pct);
      return { draft: { ...s.draft, discountPct: pct, ...recalced } };
    }),

  nextStep: () =>
    set((s) => ({ step: Math.min(3, s.step + 1) as 1 | 2 | 3 })),

  prevStep: () =>
    set((s) => ({ step: Math.max(1, s.step - 1) as 1 | 2 | 3 })),

  reset: () => set({ draft: emptyDraft(), step: 1 }),

  loadDraft: (draft) => set({ draft, step: 1 }),
}));
