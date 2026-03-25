"use client";

import { PomodoroTimer } from "./pomodoro-timer";
import { TodoList } from "./todo-list";
import { PomodoroStatsCards } from "./pomodoro-stats";

interface TaskData {
  id: string;
  title: string;
  priority: "ALTA" | "NORMAL" | "BAIXA";
  dueDate: string | null;
  completedAt: string | null;
  clientName: string | null;
  clientId: string | null;
  quoteId: string | null;
}

interface Stats {
  sessionsCompleted: number;
  totalMinutes: number;
  averagePerDay: number;
}

interface Props {
  initialTasks: TaskData[];
  statsToday: Stats;
  statsWeek: Stats;
}

export function FocoClient({ initialTasks, statsToday, statsWeek }: Props) {
  const pendingTasks = initialTasks.filter((t) => !t.completedAt);

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
      {/* Left: Timer + Stats */}
      <div className="space-y-6">
        <PomodoroTimer
          tasks={pendingTasks.map((t) => ({ id: t.id, title: t.title }))}
        />
        <PomodoroStatsCards today={statsToday} week={statsWeek} />
      </div>
      {/* Right: Todo */}
      <div>
        <TodoList initialTasks={initialTasks} />
      </div>
    </div>
  );
}
