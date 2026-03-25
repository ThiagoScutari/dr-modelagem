"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { QuoteStatus, ServiceCategory } from "@prisma/client";
import { redirect } from "next/navigation";

// ─── Schemas ───

const quoteItemSchema = z.object({
  category: z.nativeEnum(ServiceCategory),
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  discountPct: z.number().min(0).max(1).default(0),
  sortOrder: z.number().default(0),
  sourceItemId: z.string().nullable().default(null),
});

const createQuoteSchema = z.object({
  clientId: z.string().min(1),
  validUntil: z.string().nullable(),
  notes: z.string().default(""),
  items: z.array(quoteItemSchema).min(1, "Adicione ao menos um item"),
  discountPct: z.number().min(0).max(1).default(0),
});

// ─── Helpers ───

function calcFinalPrice(
  unitPrice: number,
  quantity: number,
  discountPct: number
): number {
  return unitPrice * quantity * (1 - discountPct);
}

// ─── Actions ───

export async function createQuote(
  data: z.infer<typeof createQuoteSchema>
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = createQuoteSchema.parse(data);

  // Recalcular no servidor — nunca confiar no cliente
  const itemsWithPrice = parsed.items.map((item, i) => ({
    category: item.category,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPct: item.discountPct,
    discountFixed: null,
    finalPrice: calcFinalPrice(item.unitPrice, item.quantity, item.discountPct),
    sortOrder: i,
    sourceItemId: item.sourceItemId,
  }));

  const totalGross = itemsWithPrice.reduce((s, i) => s + i.finalPrice, 0);
  const totalNet = totalGross * (1 - parsed.discountPct);

  const quote = await prisma.quote.create({
    data: {
      clientId: parsed.clientId,
      validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
      notes: parsed.notes || null,
      discountPct: parsed.discountPct || null,
      discountFixed: null,
      totalGross,
      totalNet,
      items: { create: itemsWithPrice },
    },
  });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${quote.id}`);
}

export async function updateQuote(
  id: string,
  data: z.infer<typeof createQuoteSchema>
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = createQuoteSchema.parse(data);

  const itemsWithPrice = parsed.items.map((item, i) => ({
    category: item.category,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPct: item.discountPct,
    discountFixed: null,
    finalPrice: calcFinalPrice(item.unitPrice, item.quantity, item.discountPct),
    sortOrder: i,
    sourceItemId: item.sourceItemId,
  }));

  const totalGross = itemsWithPrice.reduce((s, i) => s + i.finalPrice, 0);
  const totalNet = totalGross * (1 - parsed.discountPct);

  // Delete old items and recreate (simpler than diffing)
  await prisma.quoteItem.deleteMany({ where: { quoteId: id } });

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      clientId: parsed.clientId,
      validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
      notes: parsed.notes || null,
      discountPct: parsed.discountPct || null,
      discountFixed: null,
      totalGross,
      totalNet,
      items: { create: itemsWithPrice },
    },
  });

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
  return { success: true as const, quote };
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const quote = await prisma.quote.update({
    where: { id },
    data: { status },
    include: { client: true, items: true },
  });

  // Ao aprovar, criar tarefa automaticamente
  if (status === "APROVADO") {
    const categories = [
      ...new Set(quote.items.map((i) => i.category)),
    ].join(", ");

    await prisma.task.create({
      data: {
        clientId: quote.clientId,
        quoteId: quote.id,
        title: `Iniciar ${categories} — ${quote.client.name}`,
        priority: "ALTA",
      },
    });
  }

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
  return { success: true as const, quote };
}

export async function deleteQuote(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.quote.delete({ where: { id } });
  revalidatePath("/orcamentos");
  return { success: true as const };
}

export async function duplicateQuote(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const original = await prisma.quote.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 15);

  const newQuote = await prisma.quote.create({
    data: {
      clientId: original.clientId,
      status: "AGUARDANDO",
      discountPct: original.discountPct,
      discountFixed: original.discountFixed,
      totalGross: original.totalGross,
      totalNet: original.totalNet,
      notes: original.notes,
      validUntil,
      items: {
        create: original.items.map((item) => ({
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPct: item.discountPct,
          discountFixed: item.discountFixed,
          finalPrice: item.finalPrice,
          sortOrder: item.sortOrder,
          sourceItemId: item.sourceItemId,
        })),
      },
    },
  });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${newQuote.id}`);
}

export async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      items: { orderBy: [{ category: "asc" }, { sortOrder: "asc" }] },
    },
  });
}

export async function listQuotes(filters?: {
  status?: QuoteStatus;
  clientId?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.search) {
    where.client = { name: { contains: filters.search, mode: "insensitive" } };
  }

  return prisma.quote.findMany({
    where,
    include: {
      client: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
