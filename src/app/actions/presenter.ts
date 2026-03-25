"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";

const presenterSchema = z.object({
  name: z.string().min(2),
  razaoSocial: z.string().min(2),
  cnpj: z.string().min(14),
  observations: z.string(),
  telegramToken: z.string().optional(),
  telegramChatId: z.string().optional(),
});

export type PresenterFormData = z.infer<typeof presenterSchema>;

export async function getPresenterConfig() {
  return prisma.presenterConfig.findFirst();
}

export async function updatePresenterConfig(data: PresenterFormData) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = presenterSchema.parse(data);
  const existing = await prisma.presenterConfig.findFirst();

  if (!existing) throw new Error("PresenterConfig não encontrado");

  const config = await prisma.presenterConfig.update({
    where: { id: existing.id },
    data: {
      name: parsed.name,
      razaoSocial: parsed.razaoSocial,
      cnpj: parsed.cnpj,
      observations: parsed.observations,
      telegramToken: parsed.telegramToken || null,
      telegramChatId: parsed.telegramChatId || null,
    },
  });
  revalidatePath("/configuracoes/prestadora");
  return { success: true as const, config };
}
