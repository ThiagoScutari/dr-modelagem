import { prisma } from "@/lib/prisma";
import {
  sendTelegramNotification,
  telegramTemplates,
} from "@/lib/telegram";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 86400000);

  let processed = 0;

  // 1. Tarefas com prazo em 24h
  const tasksDueSoon = await prisma.task.findMany({
    where: {
      completedAt: null,
      dueDate: { lte: tomorrow, gte: now },
      telegramNotified: false,
    },
    include: { client: true },
  });

  for (const task of tasksDueSoon) {
    await sendTelegramNotification(telegramTemplates.taskDueSoon(task));
    await prisma.task.update({
      where: { id: task.id },
      data: { telegramNotified: true },
    });
    processed++;
  }

  // 2. Orçamentos aguardando há mais de 5 dias
  const quotesAwaiting = await prisma.quote.findMany({
    where: {
      status: "AGUARDANDO",
      createdAt: { lte: fiveDaysAgo },
    },
    include: { client: true },
  });

  for (const quote of quotesAwaiting) {
    await sendTelegramNotification(telegramTemplates.quoteAwaiting(quote));
    processed++;
  }

  // 3. Resumo diário
  const [tasksCompleted, tasksPending, quotesAwaitingCount, pomodoroAgg] =
    await Promise.all([
      prisma.task.count({
        where: { completedAt: { gte: startOfToday } },
      }),
      prisma.task.count({
        where: { completedAt: null },
      }),
      prisma.quote.count({ where: { status: "AGUARDANDO" } }),
      prisma.pomodoroSession.aggregate({
        where: {
          completed: true,
          completedAt: { gte: startOfToday },
        },
        _sum: { durationMin: true },
      }),
    ]);

  await sendTelegramNotification(
    telegramTemplates.dailySummary({
      tasksCompleted,
      tasksPending,
      quotesAwaiting: quotesAwaitingCount,
      pomodoroMinutes: pomodoroAgg._sum.durationMin ?? 0,
    })
  );

  return Response.json({ ok: true, processed });
}
