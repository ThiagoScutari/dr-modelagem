# Sprint 05 — Foco, To-Do & Telegram

> **Modelo:** claude-opus-4-6
> **Pré-requisito:** Sprint 04 concluído e validado
> **Referências:** `./project-specs/02-funcionalidades.md`

---

## Objetivo do sprint

Transformar o app no hub de produtividade da Débora. O timer Pomodoro ajuda na concentração durante os trabalhos de modelagem. A To-Do list é alimentada automaticamente pelos orçamentos aprovados. O Telegram Bot envia notificações inteligentes para que ela nunca perca um prazo ou uma resposta pendente.

---

## Tarefas

### TASK-01 · Server Actions — Tarefas

Criar `src/app/actions/tasks.ts`:

```typescript
'use server'

const taskSchema = z.object({
  title:    z.string().min(3),
  priority: z.enum(['ALTA', 'NORMAL', 'BAIXA']).default('NORMAL'),
  dueDate:  z.date().optional(),
  clientId: z.string().optional(),
  quoteId:  z.string().optional(),
})

export async function createTask(data: z.infer<typeof taskSchema>)
export async function updateTask(id: string, data: Partial<z.infer<typeof taskSchema>>)
export async function completeTask(id: string)  // seta completedAt = now()
export async function reopenTask(id: string)    // seta completedAt = null
export async function deleteTask(id: string)

export async function listTasks(filter: 'today' | 'week' | 'all', showCompleted?: boolean)

// Geração automática ao aprovar orçamento — chamada internamente
export async function generateTasksFromQuote(quoteId: string)
```

**Lógica de `generateTasksFromQuote`:**

```typescript
async function generateTasksFromQuote(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true, items: true }
  })
  if (!quote) return

  // Agrupar categorias presentes no orçamento
  const categories = [...new Set(quote.items.map(i => i.category))]
  const categoryLabels = categories.map(c => categoryLabels[c]).join(', ')

  // Criar uma tarefa principal
  await prisma.task.create({
    data: {
      title:    `Iniciar ${categoryLabels} — ${quote.client.name}`,
      priority: 'ALTA',
      dueDate:  quote.validUntil,
      clientId: quote.clientId,
      quoteId:  quote.id,
    }
  })

  // Notificar via Telegram
  await sendTelegramNotification(
    `📋 *Novo trabalho aprovado!*\n\n` +
    `Cliente: ${quote.client.name}\n` +
    `Serviços: ${categoryLabels}\n` +
    `Valor: ${formatCurrency(quote.totalNet)}\n` +
    `Válido até: ${format(quote.validUntil, 'dd/MM/yyyy')}`
  )
}
```

Integrar `generateTasksFromQuote` no Server Action `updateQuoteStatus` do Sprint 3 — chamar quando status muda para `APROVADO`.

### TASK-02 · Server Actions — Sessões Pomodoro

Criar `src/app/actions/pomodoro.ts`:

```typescript
'use server'

export async function startPomodoroSession(taskId?: string, durationMin = 25)
export async function completePomodoroSession(sessionId: string)
export async function cancelPomodoroSession(sessionId: string)

// Estatísticas
export async function getPomodoroStats(period: 'today' | 'week' | 'month'): Promise<{
  sessionsCompleted: number
  totalMinutes:      number
  averagePerDay:     number
}>
```

### TASK-03 · Telegram Bot — Setup e utilitários

Criar `src/lib/telegram.ts`:

```typescript
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

// Wrapper que busca o chatId configurado no banco
export async function sendTelegramNotification(text: string): Promise<void> {
  const config = await prisma.pricingConfig.findFirst()
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) return
  await sendTelegramMessage(chatId, text)
}
```

**Templates de mensagem Telegram:**

```typescript
export const telegramTemplates = {
  taskDueSoon: (task: Task) =>
    `⏰ *Prazo se aproximando!*\n\n` +
    `Tarefa: ${task.title}\n` +
    `Prazo: ${format(task.dueDate!, 'dd/MM/yyyy')}\n` +
    (task.client ? `Cliente: ${task.client.name}` : ''),

  quoteAwaiting: (quote: Quote) =>
    `📬 *Orçamento sem resposta*\n\n` +
    `Cliente: ${quote.client.name}\n` +
    `Valor: ${formatCurrency(quote.totalNet)}\n` +
    `Criado: ${format(quote.createdAt, 'dd/MM/yyyy')}`,

  dailySummary: (data: DailySummaryData) =>
    `📊 *Resumo do dia — DR Modelagem*\n\n` +
    `✅ Tarefas concluídas: ${data.tasksCompleted}\n` +
    `📋 Pendências: ${data.tasksPending}\n` +
    `⏳ Aguardando resposta: ${data.quotesAwaiting}\n` +
    (data.pomodoroMinutes > 0
      ? `🍅 Foco hoje: ${data.pomodoroMinutes} min`
      : ''),

  pomodoroComplete: (task?: Task) =>
    `🍅 *Sessão de foco concluída!*\n\n` +
    (task ? `Tarefa: ${task.title}\n` : '') +
    `Hora de descansar 5 minutos ☕`,
}
```

### TASK-04 · API Routes — Notificações agendadas

Criar `src/app/api/cron/route.ts` (chamado pela Vercel Cron):

```typescript
// vercel.json deve ter:
// {
//   "crons": [
//     { "path": "/api/cron", "schedule": "0 8 * * *" }
//   ]
// }

export async function GET(req: Request) {
  // Verificar header de autorização da Vercel
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 1. Tarefas com prazo em 24h
  const tomorrow = addDays(new Date(), 1)
  const tasksDueSoon = await prisma.task.findMany({
    where: {
      completedAt: null,
      dueDate: { lte: tomorrow, gte: new Date() },
      telegramNotified: false,
    },
    include: { client: true },
  })
  for (const task of tasksDueSoon) {
    await sendTelegramNotification(telegramTemplates.taskDueSoon(task))
    await prisma.task.update({
      where: { id: task.id },
      data: { telegramNotified: true },
    })
  }

  // 2. Orçamentos aguardando há mais de 5 dias
  const fiveDaysAgo = subDays(new Date(), 5)
  const quotesAwaiting = await prisma.quote.findMany({
    where: {
      status: 'AGUARDANDO',
      createdAt: { lte: fiveDaysAgo },
    },
    include: { client: true },
  })
  for (const quote of quotesAwaiting) {
    await sendTelegramNotification(telegramTemplates.quoteAwaiting(quote))
  }

  // 3. Resumo diário
  const today = startOfDay(new Date())
  const [tasksCompleted, tasksPending, quotesAwaiting2, pomodoroSessions] = await Promise.all([
    prisma.task.count({ where: { completedAt: { gte: today } } }),
    prisma.task.count({ where: { completedAt: null, dueDate: { lte: endOfDay(today) } } }),
    prisma.quote.count({ where: { status: 'AGUARDANDO' } }),
    prisma.pomodoroSession.aggregate({
      where: { completed: true, completedAt: { gte: today } },
      _sum: { durationMin: true },
    }),
  ])

  await sendTelegramNotification(telegramTemplates.dailySummary({
    tasksCompleted,
    tasksPending,
    quotesAwaiting: quotesAwaiting2,
    pomodoroMinutes: pomodoroSessions._sum.durationMin ?? 0,
  }))

  return Response.json({ ok: true, processed: tasksDueSoon.length })
}
```

### TASK-05 · Tela de Foco — Timer Pomodoro

**Rota:** `src/app/(app)/foco/page.tsx`
Este componente é `'use client'` — estado do timer vive no browser.

**Layout (scroll vertical — duas seções):**

```
┌─────────────────────────────────┐
│  Sessão 2 de 4    ● ● ○ ○       │
│                                  │
│         24:37                    │
│      (timer grande)              │
│                                  │
│  [Trabalhando em:]               │
│  Modelagem — CEI Menino Jesus    │
│                                  │
│  [ Pausar ]    [ Encerrar ]      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Pendências de hoje             │
│                                  │
│  ☐ Iniciar Modelagem — CEI...   │
│  ☐ Graduação — Moda Praia Rosa  │
│  ✓ Enviar orçamento — Studio M  │
└─────────────────────────────────┘
```

**Lógica do timer:**

```typescript
type TimerState = 'idle' | 'working' | 'paused' | 'break' | 'long_break'

interface PomodoroConfig {
  workMinutes:      number  // padrão 25
  breakMinutes:     number  // padrão 5
  longBreakMinutes: number  // padrão 15
  sessionsBeforeLongBreak: number  // padrão 4
}

// Estados visuais:
// idle:        fundo creme, botão "Iniciar"
// working:     fundo mar/10, timer contando, botão "Pausar"
// paused:      fundo areia/20, timer congelado, botão "Continuar"
// break:       fundo floresta/10, timer de pausa, texto "Descanse!"
// long_break:  fundo floresta/15, timer longo, texto "Pausa longa - você merece!"
```

**Visual do timer:**

```typescript
// SVG circular com stroke-dasharray animado
// Arco progride de 0% → 100% conforme o tempo passa
// Cor: mar (#1A6E8C) durante trabalho, floresta (#2E6B30) durante pausa
// Display: "MM:SS" centralizado em DM Mono, fonte grande (48px)
```

**Seleção de tarefa:**
- Select pré-populado com tarefas pendentes (busca do banco)
- Pode ficar em branco (sessão geral)
- Ao selecionar, exibe o nome da tarefa abaixo do timer

**Sons:**
- Som de início de sessão (beep suave)
- Som de fim de sessão (beep triplo)
- Sons gerados via Web Audio API (sem assets externos):

```typescript
function playBeep(type: 'start' | 'end') {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = type === 'start' ? 440 : 880
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc.start()
  osc.stop(ctx.currentTime + 0.5)
}
```

**Ao completar sessão:**
1. Reproduzir som
2. Chamar `completePomodoroSession()` via Server Action
3. Se tarefa vinculada: perguntar "Tarefa concluída?" (sim/não)
4. Enviar notificação Telegram (se configurado)
5. Iniciar timer de pausa automaticamente

**Configurações do Pomodoro:**
- Botão de engrenagem → bottom sheet com sliders:
  - Duração do trabalho: 15–60 min (step: 5)
  - Duração da pausa: 5–30 min (step: 5)
  - Duração pausa longa: 15–60 min (step: 5)
- Configurações salvas em localStorage

### TASK-06 · Tela de Foco — To-Do List

Seção abaixo do timer na mesma tela (`/foco`).

**Filtros (pills):**
- Hoje / Esta semana / Todas

**Card de tarefa:**

```
☐  Iniciar Modelagem — CEI Menino Jesus          [ALTA]
   📅 Vence em 2 dias  ·  🏢 CEI Menino Jesus
```

Elementos:
- Checkbox (circular) — ao marcar: animação de risco + move para o final
- Título da tarefa
- Badge de prioridade: ALTA (coral), NORMAL (mar), BAIXA (ceu)
- Data de prazo com cor dinâmica:
  - Vencida: coral
  - Vence hoje: poente
  - Vence em breve (≤2 dias): areia
  - Normal: ceu
- Nome do cliente vinculado (se houver)

**Interações:**
- Toque no checkbox → `completeTask()` com animação
- Toque no card → sheet de detalhe com opção de editar
- Swipe left → excluir com confirmação
- FAB (+) → sheet para criar tarefa manual

**Formulário de nova tarefa (sheet):**
- Título * (obrigatório)
- Prioridade (segmented control: Alta / Normal / Baixa)
- Prazo (date picker, opcional)
- Vincular a cliente (ComboCreate, opcional)
- Vincular a orçamento (select, opcional, filtrado por cliente)

### TASK-07 · Contadores de produtividade no Foco

Seção de estatísticas rápidas (abaixo da To-Do):

```
Hoje              Esta semana
🍅 3 sessões      🍅 12 sessões
⏱ 75 minutos     ⏱ 5h 20min
✅ 4 tarefas      ✅ 18 tarefas
```

Dados via Server Action `getPomodoroStats`.

### TASK-08 · Notificações push (PWA — opcional mas recomendado)

Adicionar suporte a Web Push Notifications como fallback ao Telegram:

```typescript
// src/app/api/push/subscribe/route.ts
// Salvar subscription do browser no banco

// src/lib/push.ts
// sendPushNotification(subscription, payload)
```

Solicitar permissão de notificação ao iniciar primeira sessão Pomodoro.

---

## Critério de aceite

- [ ] Timer Pomodoro inicia, conta regressivamente e exibe MM:SS correto
- [ ] Som toca ao início e ao fim da sessão
- [ ] Ao completar 25 min: timer muda para pausa de 5 min automaticamente
- [ ] Sessão é registrada no banco ao completar
- [ ] Ao aprovar um orçamento (Sprint 3): tarefa gerada automaticamente
- [ ] Tarefa gerada aparece na To-Do list com prioridade ALTA
- [ ] Marcar tarefa como concluída: checkbox animado + move para o final
- [ ] Filtros de hoje/semana/todas funcionam
- [ ] Criar tarefa manual via FAB persiste corretamente
- [ ] Configuração de duração do Pomodoro persiste entre sessões (localStorage)
- [ ] Token Telegram configurado na tela de prestadora: mensagem de aprovação de orçamento chega no Telegram
- [ ] `vercel.json` com cron job configurado
- [ ] `npm run build` sem erros

---

## Notas para o Claude Code

- O timer deve usar `setInterval` + `visibilitychange` para não perder tempo quando a tela apaga
- Salvar o timestamp de início no localStorage para sobreviver a reloads acidentais
- A notificação Telegram é disparada de forma assíncrona (fire-and-forget) — não bloquear o fluxo
- O `CRON_SECRET` é gerado com `openssl rand -hex 32` e adicionado nas variáveis da Vercel
- Para os sons: checar se o AudioContext está no estado `suspended` antes de tocar (requer interação do usuário no iOS)
- Prioridade das cores segue sempre: ALTA=coral, NORMAL=mar, BAIXA=ceu — consistente em todo o app

---

## Checklist final do projeto completo

Após o Sprint 5, validar o conjunto do sistema:

- [ ] Login e sessão persistem corretamente
- [ ] Criar cliente → criar orçamento → replicar para graduação → gerar PDF → enviar WhatsApp
- [ ] Aprovar orçamento → tarefa criada automaticamente → notificação Telegram recebida
- [ ] Iniciar Pomodoro vinculado à tarefa → completar → sessão registrada no banco
- [ ] Dashboard exibe dados reais dos orçamentos finalizados
- [ ] Relatório de despesas gera PDF correto
- [ ] Todas as telas funcionam em mobile (375px, iPhone SE)
- [ ] `npm run build` sem erros ou warnings de TypeScript
- [ ] Todas as rotas protegidas redirecionam para login sem sessão ativa
