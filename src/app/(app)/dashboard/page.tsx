import {
  getDashboardSummary,
  getMonthlyRevenue,
  getRecentQuotes,
} from "@/app/actions/dashboard";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const [summary, monthly, recent] = await Promise.all([
    getDashboardSummary("month"),
    getMonthlyRevenue(),
    getRecentQuotes(),
  ]);

  return (
    <DashboardClient
      summary={summary}
      monthly={monthly}
      recentQuotes={recent.map((q) => ({
        id: q.id,
        clientName: q.client.name,
        status: q.status,
        totalNet: Number(q.totalNet),
        createdAt: q.createdAt.toISOString(),
      }))}
    />
  );
}
