"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  startPomodoroSession,
  completePomodoroSession,
} from "@/app/actions/pomodoro";

type TimerState = "idle" | "working" | "paused" | "break";

interface PomodoroConfig {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

const LS_CONFIG_KEY = "pomodoro_config";
const LS_SESSION_KEY = "pomodoro_session_start";
const LS_STATE_KEY = "pomodoro_state";

function getConfig(): PomodoroConfig {
  if (typeof window === "undefined")
    return { workMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 };
  try {
    const saved = localStorage.getItem(LS_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { workMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 };
}

function playBeep(type: "start" | "end") {
  try {
    const ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === "start" ? 440 : 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + (type === "end" ? 1.0 : 0.5));
    if (type === "end") {
      // Triple beep
      setTimeout(() => playBeep("start"), 600);
      setTimeout(() => playBeep("start"), 1200);
    }
  } catch { /* audio not available */ }
}

interface Props {
  tasks: { id: string; title: string }[];
}

export function PomodoroTimer({ tasks }: Props) {
  const [config, setConfig] = useState<PomodoroConfig>(getConfig);
  const [state, setState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(config.workMinutes * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds =
    state === "break"
      ? (sessionCount % config.sessionsBeforeLongBreak === 0
          ? config.longBreakMinutes
          : config.breakMinutes) * 60
      : config.workMinutes * 60;

  // Restore from localStorage on mount
  useEffect(() => {
    const savedStart = localStorage.getItem(LS_SESSION_KEY);
    const savedState = localStorage.getItem(LS_STATE_KEY);
    if (savedStart && savedState === "working") {
      const elapsed = Math.floor((Date.now() - parseInt(savedStart)) / 1000);
      const remaining = config.workMinutes * 60 - elapsed;
      if (remaining > 0) {
        setState("working");
        setSecondsLeft(remaining);
      } else {
        localStorage.removeItem(LS_SESSION_KEY);
        localStorage.removeItem(LS_STATE_KEY);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Visibility change — recalculate from timestamp
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && state === "working") {
        const savedStart = localStorage.getItem(LS_SESSION_KEY);
        if (savedStart) {
          const elapsed = Math.floor(
            (Date.now() - parseInt(savedStart)) / 1000
          );
          const remaining = config.workMinutes * 60 - elapsed;
          setSecondsLeft(Math.max(0, remaining));
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [state, config.workMinutes]);

  // Timer tick
  useEffect(() => {
    if (state === "working" || state === "break") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimerComplete = useCallback(async () => {
    playBeep("end");

    if (state === "working") {
      // Complete the DB session
      if (dbSessionId) {
        await completePomodoroSession(dbSessionId);
      }
      localStorage.removeItem(LS_SESSION_KEY);
      localStorage.removeItem(LS_STATE_KEY);

      setSessionCount((c) => c + 1);
      const isLongBreak =
        (sessionCount + 1) % config.sessionsBeforeLongBreak === 0;
      const breakTime = isLongBreak
        ? config.longBreakMinutes
        : config.breakMinutes;

      setState("break");
      setSecondsLeft(breakTime * 60);
      setDbSessionId(null);
    } else {
      // Break complete
      setState("idle");
      setSecondsLeft(config.workMinutes * 60);
    }
  }, [state, dbSessionId, sessionCount, config]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    playBeep("start");
    const result = await startPomodoroSession(
      selectedTaskId ?? undefined,
      config.workMinutes
    );
    setDbSessionId(result.session.id);
    localStorage.setItem(LS_SESSION_KEY, String(Date.now()));
    localStorage.setItem(LS_STATE_KEY, "working");
    setSecondsLeft(config.workMinutes * 60);
    setState("working");
  }

  function handlePause() {
    setState("paused");
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function handleResume() {
    setState("working");
  }

  function handleStop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState("idle");
    setSecondsLeft(config.workMinutes * 60);
    setDbSessionId(null);
    localStorage.removeItem(LS_SESSION_KEY);
    localStorage.removeItem(LS_STATE_KEY);
  }

  function saveConfig(newConfig: PomodoroConfig) {
    setConfig(newConfig);
    localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(newConfig));
    if (state === "idle") setSecondsLeft(newConfig.workMinutes * 60);
    setShowConfig(false);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference * (1 - progress);

  const isWorking = state === "working";
  const isBreak = state === "break";

  const bgClass = isWorking
    ? "bg-mar/5"
    : isBreak
      ? "bg-floresta/5"
      : state === "paused"
        ? "bg-areia/10"
        : "bg-creme";

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className={cn("card transition-colors", bgClass)}>
      {/* Session dots */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {Array.from({ length: config.sessionsBeforeLongBreak }).map(
            (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i < sessionCount % config.sessionsBeforeLongBreak
                    ? "bg-mar"
                    : "bg-ceu/30"
                )}
              />
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="text-noite/40 hover:text-noite/60"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Timer circle */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-ceu/15"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000",
                isBreak ? "text-floresta" : "text-mar"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold text-noite tabular-nums">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
            {isBreak && (
              <span className="text-xs text-floresta font-medium mt-1">
                Descanse!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Task selector (idle only) */}
      {state === "idle" && (
        <div className="mb-4">
          <select
            value={selectedTaskId ?? ""}
            onChange={(e) => setSelectedTaskId(e.target.value || null)}
            className="input-base text-sm"
          >
            <option value="">Sessão geral (sem tarefa)</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current task display */}
      {selectedTask && state !== "idle" && (
        <p className="text-center text-xs text-noite/60 mb-4">
          Trabalhando em: <strong>{selectedTask.title}</strong>
        </p>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {state === "idle" && (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 rounded-xl bg-mar px-6 py-3 text-sm font-medium text-white hover:bg-mar-dark tap-target"
          >
            <Play className="h-4 w-4" />
            Iniciar
          </button>
        )}
        {state === "working" && (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-2 rounded-xl bg-areia px-5 py-3 text-sm font-medium text-noite hover:bg-areia-dark tap-target"
            >
              <Pause className="h-4 w-4" />
              Pausar
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-2 rounded-xl border border-coral/30 px-5 py-3 text-sm font-medium text-coral hover:bg-coral/5 tap-target"
            >
              <Square className="h-4 w-4" />
              Encerrar
            </button>
          </>
        )}
        {state === "paused" && (
          <>
            <button
              type="button"
              onClick={handleResume}
              className="flex items-center gap-2 rounded-xl bg-mar px-5 py-3 text-sm font-medium text-white hover:bg-mar-dark tap-target"
            >
              <Play className="h-4 w-4" />
              Continuar
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-2 rounded-xl border border-coral/30 px-5 py-3 text-sm font-medium text-coral hover:bg-coral/5 tap-target"
            >
              <Square className="h-4 w-4" />
              Encerrar
            </button>
          </>
        )}
        {state === "break" && (
          <p className="text-sm text-floresta font-medium">
            Pausa automática em andamento...
          </p>
        )}
      </div>

      {/* Config sheet */}
      {showConfig && (
        <ConfigSheet config={config} onSave={saveConfig} onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
}

function ConfigSheet({
  config,
  onSave,
  onClose,
}: {
  config: PomodoroConfig;
  onSave: (c: PomodoroConfig) => void;
  onClose: () => void;
}) {
  const [work, setWork] = useState(config.workMinutes);
  const [brk, setBrk] = useState(config.breakMinutes);
  const [longBrk, setLongBrk] = useState(config.longBreakMinutes);

  return (
    <div className="mt-4 border-t border-ceu/10 pt-4 space-y-3">
      <p className="text-xs font-semibold text-noite/50 uppercase tracking-wide">
        Configurar timer
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-noite/70">Trabalho</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={15}
            max={60}
            step={5}
            value={work}
            onChange={(e) => setWork(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-mono w-10 text-right">{work}min</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-noite/70">Pausa</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={brk}
            onChange={(e) => setBrk(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-mono w-10 text-right">{brk}min</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-noite/70">Pausa longa</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={15}
            max={60}
            step={5}
            value={longBrk}
            onChange={(e) => setLongBrk(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-mono w-10 text-right">{longBrk}min</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-ceu/30 py-2 text-xs font-medium text-noite/60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              workMinutes: work,
              breakMinutes: brk,
              longBreakMinutes: longBrk,
              sessionsBeforeLongBreak: config.sessionsBeforeLongBreak,
            })
          }
          className="flex-1 rounded-lg bg-mar py-2 text-xs font-medium text-white"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
