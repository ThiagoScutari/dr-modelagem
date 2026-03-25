import { formatBRL, formatDate } from "@/lib/format";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendTelegramNotification(
  text: string
): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) return;
  await sendTelegramMessage(chatId, text);
}

// ─── Templates de mensagem ───

interface TaskForTelegram {
  title: string;
  dueDate: Date | null;
  client?: { name: string } | null;
}

interface QuoteForTelegram {
  client: { name: string };
  totalNet: number | { toString(): string };
  createdAt: Date;
}

interface DailySummaryData {
  tasksCompleted: number;
  tasksPending: number;
  quotesAwaiting: number;
  pomodoroMinutes: number;
}

export const telegramTemplates = {
  taskDueSoon: (task: TaskForTelegram) =>
    `⏰ *Prazo se aproximando!*\n\n` +
    `Tarefa: ${task.title}\n` +
    (task.dueDate ? `Prazo: ${formatDate(task.dueDate)}\n` : "") +
    (task.client ? `Cliente: ${task.client.name}` : ""),

  quoteApproved: (
    clientName: string,
    categories: string,
    totalNet: number,
    validUntil: string | null
  ) =>
    `📋 *Novo trabalho aprovado!*\n\n` +
    `Cliente: ${clientName}\n` +
    `Serviços: ${categories}\n` +
    `Valor: ${formatBRL(totalNet)}\n` +
    (validUntil ? `Válido até: ${formatDate(validUntil)}` : ""),

  quoteAwaiting: (quote: QuoteForTelegram) =>
    `📬 *Orçamento sem resposta*\n\n` +
    `Cliente: ${quote.client.name}\n` +
    `Valor: ${formatBRL(Number(quote.totalNet))}\n` +
    `Criado: ${formatDate(quote.createdAt)}`,

  dailySummary: (data: DailySummaryData) =>
    `📊 *Resumo do dia — DR Modelagem*\n\n` +
    `✅ Tarefas concluídas: ${data.tasksCompleted}\n` +
    `📋 Pendências: ${data.tasksPending}\n` +
    `⏳ Aguardando resposta: ${data.quotesAwaiting}\n` +
    (data.pomodoroMinutes > 0
      ? `🍅 Foco hoje: ${data.pomodoroMinutes} min`
      : ""),

  pomodoroComplete: (taskTitle?: string) =>
    `🍅 *Sessão de foco concluída!*\n\n` +
    (taskTitle ? `Tarefa: ${taskTitle}\n` : "") +
    `Hora de descansar 5 minutos ☕`,
};
