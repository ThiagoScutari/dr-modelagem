"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { ServiceCategory, PricingUnit } from "@prisma/client";

// ─── Schemas ───

const pricingItemSchema = z.object({
  category: z.nativeEnum(ServiceCategory),
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  description: z.string().optional(),
  priceMin: z.number().min(0, "Valor mínimo deve ser >= 0"),
  priceMax: z.number().min(0).optional(),
  unit: z.nativeEnum(PricingUnit),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const pricingConfigSchema = z.object({
  graduationPctBasic: z.number().min(0.01).max(1),
  graduationPctComplex: z.number().min(0.01).max(1),
  pilotPct: z.number().min(0.01).max(1),
  plottingPricePerMeter: z.number().min(0),
  kmPrice: z.number().min(0),
});

export type PricingItemFormData = z.infer<typeof pricingItemSchema>;
export type PricingConfigFormData = z.infer<typeof pricingConfigSchema>;

// ─── PricingItem CRUD ───

export async function listPricingItems(category?: ServiceCategory) {
  const where = category ? { category } : {};
  return prisma.pricingItem.findMany({
    where,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

export async function createPricingItem(data: PricingItemFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = pricingItemSchema.parse(data);
  const item = await prisma.pricingItem.create({
    data: {
      ...parsed,
      priceMax: parsed.priceMax ?? null,
      description: parsed.description ?? null,
    },
  });
  revalidatePath("/configuracoes/precos");
  return { success: true as const, item };
}

export async function updatePricingItem(
  id: string,
  data: Partial<PricingItemFormData>
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const item = await prisma.pricingItem.update({
    where: { id },
    data: {
      ...data,
      priceMax: data.priceMax ?? undefined,
    },
  });
  revalidatePath("/configuracoes/precos");
  return { success: true as const, item };
}

export async function deletePricingItem(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.pricingItem.delete({ where: { id } });
  revalidatePath("/configuracoes/precos");
  return { success: true as const };
}

// ─── PricingConfig (singleton) ───

export async function getPricingConfig() {
  const config = await prisma.pricingConfig.findFirst();
  return config;
}

export async function updatePricingConfig(data: PricingConfigFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = pricingConfigSchema.parse(data);
  const existing = await prisma.pricingConfig.findFirst();

  if (!existing) throw new Error("PricingConfig não encontrado");

  const config = await prisma.pricingConfig.update({
    where: { id: existing.id },
    data: parsed,
  });
  revalidatePath("/configuracoes/parametros");
  return { success: true as const, config };
}
