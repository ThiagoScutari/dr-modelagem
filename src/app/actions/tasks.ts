"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";

const taskSchema = z.object({
  title: z.string().min(3, "Título deve ter ao menos 3 caracteres"),
  priority: z.enum(["ALTA", "NORMAL", "BAIXA"]).default("NORMAL"),
  dueDate: z.string().optional(),
  clientId: z.string().optional(),
  quoteId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export async function createTask(data: TaskFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = taskSchema.parse(data);
  const task = await prisma.task.create({
    data: {
      title: parsed.title,
      priority: parsed.priority,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      clientId: parsed.clientId || null,
      quoteId: parsed.quoteId || null,
    },
  });

  revalidatePath("/foco");
  return { success: true as const, task };
}

export async function updateTask(id: string, data: Partial<TaskFormData>) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.clientId !== undefined && { clientId: data.clientId || null }),
      ...(data.quoteId !== undefined && { quoteId: data.quoteId || null }),
    },
  });

  revalidatePath("/foco");
  return { success: true as const, task };
}

export async function completeTask(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.task.update({
    where: { id },
    data: { completedAt: new Date() },
  });

  revalidatePath("/foco");
  return { success: true as const };
}

export async function reopenTask(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.task.update({
    where: { id },
    data: { completedAt: null },
  });

  revalidatePath("/foco");
  return { success: true as const };
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.task.delete({ where: { id } });
  revalidatePath("/foco");
  return { success: true as const };
}

export async function listTasks(
  filter: "today" | "week" | "all" = "all",
  showCompleted = false
) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfDay);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const where: Record<string, unknown> = {};

  if (!showCompleted) {
    where.completedAt = null;
  }

  if (filter === "today") {
    where.OR = [
      { dueDate: { lte: new Date(startOfDay.getTime() + 86400000) } },
      { dueDate: null },
    ];
  } else if (filter === "week") {
    where.OR = [
      { dueDate: { lte: endOfWeek } },
      { dueDate: null },
    ];
  }

  const [pending, completed] = await Promise.all([
    prisma.task.findMany({
      where: { ...where, completedAt: null },
      include: { client: { select: { name: true } } },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    }),
    showCompleted
      ? prisma.task.findMany({
          where: { completedAt: { not: null } },
          include: { client: { select: { name: true } } },
          orderBy: { completedAt: "desc" },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  return { pending, completed };
}
