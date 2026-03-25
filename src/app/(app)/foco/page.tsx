export const dynamic = "force-dynamic";

import { listTasks } from "@/app/actions/tasks";
import { getPomodoroStats } from "@/app/actions/pomodoro";
import { FocoClient } from "./foco-client";

export default async function FocoPage() {
  const [tasksData, statsToday, statsWeek] = await Promise.all([
    listTasks("all", true),
    getPomodoroStats("today"),
    getPomodoroStats("week"),
  ]);

  const tasks = [
    ...tasksData.pending.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() ?? null,
      completedAt: null,
      clientName: t.client?.name ?? null,
      clientId: t.clientId,
      quoteId: t.quoteId,
    })),
    ...tasksData.completed.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() ?? null,
      completedAt: t.completedAt?.toISOString() ?? null,
      clientName: t.client?.name ?? null,
      clientId: t.clientId,
      quoteId: t.quoteId,
    })),
  ];

  return (
    <FocoClient
      initialTasks={tasks}
      statsToday={statsToday}
      statsWeek={statsWeek}
    />
  );
}
