"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";

const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  document: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export async function createClient(data: ClientFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = clientSchema.parse(data);
  const cleanData = {
    name: parsed.name,
    email: parsed.email || null,
    phone: parsed.phone || null,
    instagram: parsed.instagram || null,
    document: parsed.document || null,
    notes: parsed.notes || null,
  };

  const client = await prisma.client.create({ data: cleanData });
  revalidatePath("/configuracoes/clientes");
  revalidatePath("/orcamentos");
  return { success: true as const, client };
}

export async function updateClient(id: string, data: ClientFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = clientSchema.parse(data);
  const cleanData = {
    name: parsed.name,
    email: parsed.email || null,
    phone: parsed.phone || null,
    instagram: parsed.instagram || null,
    document: parsed.document || null,
    notes: parsed.notes || null,
  };

  const client = await prisma.client.update({
    where: { id },
    data: cleanData,
  });
  revalidatePath("/configuracoes/clientes");
  revalidatePath("/orcamentos");
  return { success: true as const, client };
}

export async function deleteClient(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const quotesCount = await prisma.quote.count({ where: { clientId: id } });
  if (quotesCount > 0) {
    return {
      success: false as const,
      error: `Este cliente possui ${quotesCount} orçamento(s) vinculado(s). Remova-os primeiro.`,
    };
  }

  await prisma.client.delete({ where: { id } });
  revalidatePath("/configuracoes/clientes");
  return { success: true as const };
}

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { quotes: true } },
    },
  });
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      quotes: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { quotes: true } },
    },
  });
}

export async function getClientStats(id: string) {
  const [revenue, expenses, recentQuotes] = await Promise.all([
    prisma.quote.findMany({
      where: { clientId: id, status: "FINALIZADO" },
      select: { totalNet: true },
    }),
    prisma.expense.findMany({
      where: { clientId: id },
      select: { amount: true },
    }),
    prisma.quote.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        totalNet: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalRevenue: revenue.reduce((s, q) => s + Number(q.totalNet), 0),
    totalExpenses: expenses.reduce((s, e) => s + Number(e.amount), 0),
    recentQuotes: recentQuotes.map((q) => ({
      id: q.id,
      status: q.status,
      totalNet: Number(q.totalNet),
      createdAt: q.createdAt.toISOString(),
    })),
  };
}
