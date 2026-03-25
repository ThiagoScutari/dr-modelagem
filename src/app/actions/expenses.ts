"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";

const expenseSchema = z.object({
  description: z.string().min(2, "Descrição deve ter ao menos 2 caracteres"),
  category: z.string().min(2),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string(),
  clientId: z.string().optional(),
  quoteId: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export async function createExpense(data: ExpenseFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = expenseSchema.parse(data);
  const expense = await prisma.expense.create({
    data: {
      description: parsed.description,
      category: parsed.category,
      amount: parsed.amount,
      date: new Date(parsed.date),
      clientId: parsed.clientId || null,
      quoteId: parsed.quoteId || null,
    },
  });

  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  return { success: true as const, expense };
}

export async function updateExpense(id: string, data: ExpenseFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = expenseSchema.parse(data);
  const expense = await prisma.expense.update({
    where: { id },
    data: {
      description: parsed.description,
      category: parsed.category,
      amount: parsed.amount,
      date: new Date(parsed.date),
      clientId: parsed.clientId || null,
      quoteId: parsed.quoteId || null,
    },
  });

  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  return { success: true as const, expense };
}

export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.expense.delete({ where: { id } });
  revalidatePath("/despesas");
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function listExpenses(filters?: {
  clientId?: string;
  category?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.category) where.category = filters.category;

  return prisma.expense.findMany({
    where,
    include: { client: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
}
