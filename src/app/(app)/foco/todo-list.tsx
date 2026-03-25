"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  X,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { completeTask, reopenTask, deleteTask, createTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { TaskPriority } from "@prisma/client";

interface TaskData {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  clientName: string | null;
  clientId: string | null;
  quoteId: string | null;
}

type Filter = "today" | "week" | "all";

const priorityConfig: Record<TaskPriority, { color: string; label: string }> = {
  ALTA: { color: "bg-coral/15 text-coral", label: "Alta" },
  NORMAL: { color: "bg-mar/15 text-mar", label: "Normal" },
  BAIXA: { color: "bg-ceu/15 text-ceu-dark", label: "Baixa" },
};

function dueDateColor(dateStr: string | null): string {
  if (!dateStr) return "text-ceu";
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = diff / 86400000;
  if (days < 0) return "text-coral";
  if (days < 1) return "text-poente";
  if (days <= 2) return "text-areia-dark";
  return "text-ceu";
}

function dueDateLabel(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return `Vencida há ${Math.abs(days)} dia(s)`;
  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence amanhã";
  return `Vence em ${days} dias`;
}

export function TodoList({ initialTasks }: { initialTasks: TaskData[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);

  const filtered = tasks.filter((t) => {
    if (filter === "today") {
      if (t.completedAt) return false;
      if (!t.dueDate) return true;
      return new Date(t.dueDate) <= new Date(startOfToday.getTime() + 86400000);
    }
    if (filter === "week") {
      if (t.completedAt) return false;
      if (!t.dueDate) return true;
      return new Date(t.dueDate) <= endOfWeek;
    }
    return true;
  });

  const pending = filtered.filter((t) => !t.completedAt);
  const completed = filtered.filter((t) => t.completedAt);

  async function handleComplete(id: string) {
    await completeTask(id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completedAt: new Date().toISOString() } : t
      )
    );
    toast("Tarefa concluída", "success");
  }

  async function handleReopen(id: string) {
    await reopenTask(id);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completedAt: null } : t))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta tarefa?")) return;
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast("Tarefa excluída", "success");
  }

  function handleCreated(task: TaskData) {
    setTasks((prev) => [task, ...prev]);
    setShowForm(false);
    toast("Tarefa criada", "success");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-noite">Pendências</h3>
        <div className="flex gap-1">
          {(["today", "week", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors",
                filter === f
                  ? "bg-mar text-white"
                  : "bg-ceu/15 text-noite/50"
              )}
            >
              {f === "today" ? "Hoje" : f === "week" ? "Semana" : "Todas"}
            </button>
          ))}
        </div>
      </div>

      {/* Pending tasks */}
      {pending.length === 0 && (
        <p className="text-sm text-noite/40 text-center py-6">
          Nenhuma pendência{filter === "today" ? " para hoje" : ""}
        </p>
      )}
      <div className="space-y-2">
        {pending.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={() => handleComplete(task.id)}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-noite/40 uppercase tracking-wide pt-2">
            Concluídas
          </p>
          {completed.map((task) => (
            <div
              key={task.id}
              className="card flex items-center gap-3 py-2.5 opacity-50"
            >
              <button
                type="button"
                onClick={() => handleReopen(task.id)}
                className="text-floresta shrink-0"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
              <span className="text-sm text-noite line-through flex-1 truncate">
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-mar text-white shadow-float hover:bg-mar-dark active:scale-95 transition-all"
        aria-label="Nova tarefa"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showForm && (
        <NewTaskSheet onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}

function TaskCard({
  task,
  onComplete,
  onDelete,
}: {
  task: TaskData;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const pConfig = priorityConfig[task.priority];
  const dueLabel = dueDateLabel(task.dueDate);
  const dueColor = dueDateColor(task.dueDate);

  return (
    <div className="card flex items-start gap-3 py-3">
      <button
        type="button"
        onClick={onComplete}
        className="text-ceu/40 hover:text-mar shrink-0 mt-0.5 tap-target flex items-center justify-center"
      >
        <Circle className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-noite">{task.title}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              pConfig.color
            )}
          >
            {pConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {dueLabel && (
            <span className={cn("flex items-center gap-1 text-[10px]", dueColor)}>
              <Calendar className="h-3 w-3" />
              {dueLabel}
            </span>
          )}
          {task.clientName && (
            <span className="flex items-center gap-1 text-[10px] text-noite/40">
              <User className="h-3 w-3" />
              {task.clientName}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="text-noite/20 hover:text-coral shrink-0 p-1"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function NewTaskSheet({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (task: TaskData) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (title.trim().length < 3) return;
    setSaving(true);
    const result = await createTask({
      title: title.trim(),
      priority,
      dueDate: dueDate || undefined,
    });
    if (result.success) {
      onCreated({
        id: result.task.id,
        title: result.task.title,
        priority: result.task.priority,
        dueDate: result.task.dueDate?.toISOString() ?? null,
        completedAt: null,
        clientName: null,
        clientId: result.task.clientId,
        quoteId: result.task.quoteId,
      });
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-float sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-medium text-noite">
            Nova tarefa
          </h3>
          <button type="button" onClick={onClose} className="text-noite/40 tap-target flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <Input
            id="title"
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Descreva a tarefa..."
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-noite/70">
              Prioridade
            </label>
            <div className="flex gap-2">
              {(["ALTA", "NORMAL", "BAIXA"] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                    priority === p
                      ? priorityConfig[p].color
                      : "bg-ceu/10 text-noite/40"
                  )}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          <Input
            id="dueDate"
            label="Prazo"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={saving} className="flex-1">
              Criar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
