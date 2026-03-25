"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function startPomodoroSession(
  taskId?: string,
  durationMin = 25
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const pomodoroSession = await prisma.pomodoroSession.create({
    data: {
      taskId: taskId || null,
      durationMin,
    },
  });

  revalidatePath("/foco");
  return { success: true as const, session: pomodoroSession };
}

export async function completePomodoroSession(sessionId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.pomodoroSession.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date(),
      completed: true,
    },
  });

  revalidatePath("/foco");
  return { success: true as const };
}

export async function cancelPomodoroSession(sessionId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  await prisma.pomodoroSession.delete({ where: { id: sessionId } });
  revalidatePath("/foco");
  return { success: true as const };
}

export async function getPomodoroStats(
  period: "today" | "week" | "month" = "today"
) {
  const now = new Date();
  let from: Date;

  switch (period) {
    case "today":
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      completed: true,
      completedAt: { gte: from },
    },
    select: { durationMin: true, completedAt: true },
  });

  const totalMinutes = sessions.reduce((s, sess) => s + sess.durationMin, 0);
  const days = Math.max(
    1,
    Math.ceil((now.getTime() - from.getTime()) / 86400000)
  );

  return {
    sessionsCompleted: sessions.length,
    totalMinutes,
    averagePerDay: Math.round(totalMinutes / days),
  };
}
