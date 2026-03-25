"use server";

import { prisma } from "@/lib/prisma";

function getDateRange(period: "week" | "month" | "quarter"): {
  from: Date;
  to: Date;
} {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let from: Date;

  switch (period) {
    case "week":
      from = new Date(to);
      from.setDate(from.getDate() - 7);
      break;
    case "quarter":
      from = new Date(to);
      from.setMonth(from.getMonth() - 3);
      break;
    case "month":
    default:
      from = new Date(to.getFullYear(), to.getMonth(), 1);
      break;
  }

  return { from, to };
}

export async function getDashboardSummary(
  period: "week" | "month" | "quarter" = "month"
) {
  const { from, to } = getDateRange(period);

  const [finalized, awaiting, inProgress, expenses] = await Promise.all([
    prisma.quote.findMany({
      where: {
        status: "FINALIZADO",
        updatedAt: { gte: from, lte: to },
      },
      select: { totalNet: true },
    }),
    prisma.quote.count({ where: { status: "AGUARDANDO" } }),
    prisma.quote.count({
      where: { status: { in: ["APROVADO", "EM_ANDAMENTO"] } },
    }),
    prisma.expense.findMany({
      where: { date: { gte: from, lte: to } },
      select: { amount: true },
    }),
  ]);

  const revenueMonth = finalized.reduce(
    (s, q) => s + Number(q.totalNet),
    0
  );
  const totalExpenses = expenses.reduce(
    (s, e) => s + Number(e.amount),
    0
  );

  return {
    revenueMonth,
    quotesAwaiting: awaiting,
    quotesApproved: inProgress,
    quotesFinished: finalized.length,
    totalExpenses,
    netRevenue: revenueMonth - totalExpenses,
  };
}

export async function getMonthlyRevenue() {
  const months: { month: string; revenue: number; expenses: number }[] = [];
  const monthNames = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];

  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const [quotes, expensesList] = await Promise.all([
      prisma.quote.findMany({
        where: {
          status: "FINALIZADO",
          updatedAt: { gte: from, lte: to },
        },
        select: { totalNet: true },
      }),
      prisma.expense.findMany({
        where: { date: { gte: from, lte: to } },
        select: { amount: true },
      }),
    ]);

    months.push({
      month: monthNames[d.getMonth()],
      revenue: quotes.reduce((s, q) => s + Number(q.totalNet), 0),
      expenses: expensesList.reduce((s, e) => s + Number(e.amount), 0),
    });
  }

  return months;
}

export async function getRecentQuotes() {
  return prisma.quote.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });
}
