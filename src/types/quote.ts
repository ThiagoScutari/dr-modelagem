import type { ServiceCategory, QuoteStatus } from "@prisma/client";

export interface QuoteItemDraft {
  id: string;
  category: ServiceCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number; // 0 a 1
  finalPrice: number; // calculado
  sourceItemId: string | null;
}

export interface QuoteDraft {
  clientId: string;
  clientName: string;
  validUntil: string | null; // ISO string for serialization
  notes: string;
  items: QuoteItemDraft[];
  discountPct: number; // desconto global, 0 a 1
  totalGross: number;
  totalNet: number;
}

export interface PricingConfigValues {
  graduationPctBasic: number;
  graduationPctComplex: number;
  pilotPct: number;
  plottingPricePerMeter: number;
  kmPrice: number;
}

export interface QuoteFilters {
  status?: QuoteStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export { type ServiceCategory, type QuoteStatus };
