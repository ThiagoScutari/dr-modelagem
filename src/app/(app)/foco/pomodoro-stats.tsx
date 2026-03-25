"use client";

interface Stats {
  sessionsCompleted: number;
  totalMinutes: number;
  averagePerDay: number;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function PomodoroStatsCards({
  today,
  week,
}: {
  today: Stats;
  week: Stats;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-noite/50 uppercase tracking-wide">
        Produtividade
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="card space-y-2">
          <p className="text-[10px] text-noite/50 uppercase tracking-wide">
            Hoje
          </p>
          <div className="space-y-1">
            <p className="text-sm text-noite">
              🍅 {today.sessionsCompleted} sessões
            </p>
            <p className="text-sm text-noite">
              ⏱ {formatMinutes(today.totalMinutes)}
            </p>
          </div>
        </div>
        <div className="card space-y-2">
          <p className="text-[10px] text-noite/50 uppercase tracking-wide">
            Esta semana
          </p>
          <div className="space-y-1">
            <p className="text-sm text-noite">
              🍅 {week.sessionsCompleted} sessões
            </p>
            <p className="text-sm text-noite">
              ⏱ {formatMinutes(week.totalMinutes)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
