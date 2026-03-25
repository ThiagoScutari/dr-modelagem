import type {
  QuoteItemDraft,
  PricingConfigValues,
  ServiceCategory,
} from "@/types/quote";

/** Calcula preço final de um item (unitário × quantidade × desconto) */
export function calcItemFinalPrice(item: QuoteItemDraft): number {
  return item.unitPrice * item.quantity * (1 - item.discountPct);
}

/** Calcula total bruto (soma de todos os itens sem desconto global) */
export function calcTotalGross(items: QuoteItemDraft[]): number {
  return items.reduce((sum, item) => sum + calcItemFinalPrice(item), 0);
}

/** Calcula total líquido (bruto menos desconto global) */
export function calcTotalNet(gross: number, discountPct: number): number {
  return gross * (1 - discountPct);
}

/** Calcula valor de graduação por tamanho */
export function calcGraduationPrice(
  modelingPrice: number,
  pct: number
): number {
  return modelingPrice * pct;
}

/** Calcula valor de peça piloto */
export function calcPilotPrice(modelingPrice: number, pct: number): number {
  return modelingPrice * pct;
}

/** Replica itens de uma categoria para outra, aplicando lógica de preço */
export function replicateItems(
  sourceItems: QuoteItemDraft[],
  targetCategory: ServiceCategory,
  config: PricingConfigValues
): QuoteItemDraft[] {
  return sourceItems.map((item) => {
    let unitPrice = item.unitPrice;
    let graduationPct: number | undefined;
    let basePrice: number | undefined;

    if (targetCategory === "GRADUACAO") {
      graduationPct = config.graduationPctBasic;
      basePrice = item.unitPrice;
      unitPrice = calcGraduationPrice(item.unitPrice, graduationPct);
    } else if (targetCategory === "PILOTO") {
      unitPrice = calcPilotPrice(item.unitPrice, config.pilotPct);
    }

    return {
      id: crypto.randomUUID(),
      category: targetCategory,
      description: item.description,
      quantity: item.quantity,
      unitPrice,
      discountPct: 0,
      finalPrice: unitPrice * item.quantity,
      sourceItemId: item.id,
      graduationPct,
      basePrice,
    };
  });
}

/** Recalcula unitPrice e finalPrice de um item de graduação ao alterar % */
export function recalcGraduationItem(
  item: QuoteItemDraft,
  newPct: number
): Partial<QuoteItemDraft> {
  const base = item.basePrice ?? 0;
  const unitPrice = base * newPct;
  return {
    graduationPct: newPct,
    unitPrice,
    finalPrice: unitPrice * item.quantity * (1 - item.discountPct),
  };
}

/** Recalcula finalPrice + totais do draft inteiro */
export function recalcDraft(
  items: QuoteItemDraft[],
  discountPct: number
): { items: QuoteItemDraft[]; totalGross: number; totalNet: number } {
  const updated = items.map((item) => ({
    ...item,
    finalPrice: calcItemFinalPrice(item),
  }));
  const totalGross = calcTotalGross(updated);
  const totalNet = calcTotalNet(totalGross, discountPct);
  return { items: updated, totalGross, totalNet };
}

/** Subtotal por categoria */
export function calcCategorySubtotal(
  items: QuoteItemDraft[],
  category: ServiceCategory
): number {
  return items
    .filter((i) => i.category === category)
    .reduce((sum, i) => sum + calcItemFinalPrice(i), 0);
}
