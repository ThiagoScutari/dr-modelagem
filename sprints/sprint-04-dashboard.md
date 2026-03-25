# Sprint 04 — Dashboard & Despesas

> **Modelo:** claude-opus-4-6
> **Pré-requisito:** Sprint 03 concluído e validado
> **Referências:** `./project-specs/02-funcionalidades.md` · `./project-specs/01-identidade-visual.md`

---

## Objetivo do sprint

Dar à Débora visão gerencial completa do negócio e controle de despesas. O Dashboard se torna a primeira coisa que ela vê — mostrando receita, orçamentos em aberto e histórico visual. O módulo de Despesas permite registrar custos (Uber, material, plotagem externa) vinculados a clientes ou projetos, com relatório exportável.

---

## Tarefas

### TASK-01 · Server Actions — Dashboard

Criar `src/app/actions/dashboard.ts`:

```typescript
'use server'

// Resumo do período atual
export async function getDashboardSummary(period: 'week' | 'month' | 'quarter' | 'custom', dateRange?: { from: Date, to: Date }) {
  // Retorna:
  return {
    revenueMonth:        number,  // soma totalNet dos orçamentos FINALIZADOS no período
    quotesAwaiting:      number,  // orçamentos com status AGUARDANDO
    quotesApproved:      number,  // orçamentos com status APROVADO ou EM_ANDAMENTO
    quotesFinished:      number,  // orçamentos FINALIZADOS no período
    totalExpenses:       number,  // soma das despesas no período
    netRevenue:          number,  // revenueMonth - totalExpenses
  }
}

// Dados para o gráfico — últimos 6 meses
export async function getMonthlyRevenue(): Promise<Array<{
  month: string        // "Jan", "Fev", etc.
  revenue: number      // soma totalNet dos FINALIZADOS
  expenses: number     // soma das despesas
}>>

// Orçamentos recentes (últimos 5 por data de criação)
export async function getRecentQuotes()

// Top clientes por receita (útil para o dashboard expandido)
export async function getTopClients(limit = 5)
```

### TASK-02 · Dashboard — Cards de métricas

**Rota:** `src/app/(app)/dashboard/page.tsx`

**Saudação dinâmica:**
```typescript
function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia, Débora!'
  if (hour < 18) return 'Boa tarde, Débora!'
  return 'Boa noite, Débora!'
}
```

**Cards de métricas (grid 2×2):**

| Card | Ícone | Valor | Cor |
|---|---|---|---|
| Receita do mês | TrendingUp | R$ X.XXX,XX | floresta |
| Aguardando | Clock | N orçamentos | poente |
| Em andamento | Layers | N aprovados | mar |
| Finalizados | CheckCircle | N este mês | floresta |

Cada card:
- Background: variante clara da cor semântica
- Número grande (24px, DM Mono)
- Label pequena (12px, cinza)
- Ícone Lucide no canto superior direito

**Filtro de período** (pills no topo):
- Esta semana / Este mês / Este trimestre
- Seleção altera todos os cards

### TASK-03 · Dashboard — Gráfico de receita

Instalar se necessário: `npm install recharts` (já deve estar do Sprint 1)

Componente `MonthlyRevenueChart` usando `BarChart` do Recharts:

```typescript
// Configuração do gráfico
// Barras: receita (mar) e despesas (coral) agrupadas por mês
// Tooltip customizado com formatação BRL
// Eixo Y formatado como R$
// Sem grid excessivo — visual limpo

const chartConfig = {
  receita: {
    color: '#1A6E8C',  // mar
    label: 'Receita',
  },
  despesas: {
    color: '#B81C1C',  // coral
    label: 'Despesas',
  },
}
```

O gráfico deve:
- Mostrar os últimos 6 meses
- Ser responsivo (`ResponsiveContainer` com height 200)
- Ter tooltip ao hover com valores em BRL
- Mostrar legenda simples abaixo

### TASK-04 · Dashboard — Orçamentos recentes e atalhos

**Seção "Recentes":**
- Título "Orçamentos recentes"
- Link "Ver todos →" que navega para `/orcamentos`
- Lista de 5 cards compactos: cliente + status badge + valor + data relativa ("há 2 dias")
- Cada card é clicável → `/orcamentos/[id]`

**Atalhos rápidos:**
```
[+ Novo Orçamento]   [+ Nova Despesa]   [▷ Pomodoro]
```
- Botões com ícones, fundo creme, border mar/20
- Ocupam linha completa com 3 colunas

### TASK-05 · Server Actions — Despesas

Criar `src/app/actions/expenses.ts`:

```typescript
'use server'

// Schema de validação
const expenseSchema = z.object({
  description: z.string().min(2),
  category:    z.string().min(2),
  amount:      z.number().positive(),
  date:        z.date(),
  clientId:    z.string().optional(),
  quoteId:     z.string().optional(),
})

// CRUD completo
export async function createExpense(data)
export async function updateExpense(id: string, data)
export async function deleteExpense(id: string)

// Listagem com filtros
export async function listExpenses(filters: {
  clientId?:  string
  dateFrom?:  Date
  dateTo?:    Date
  category?:  string
})

// Resumo por período (para dashboard)
export async function getExpensesSummary(dateFrom: Date, dateTo: Date)
```

### TASK-06 · Tela de Despesas — Lista

**Rota:** `src/app/(app)/despesas/page.tsx`

Layout:
- Total do período no topo (card destaque com valor em coral)
- Filtros: período + cliente
- Lista agrupada por mês (`Março 2025 · R$ X.XXX,XX`)
- FAB (+) para nova despesa

Card de despesa:
- Ícone da categoria (mapeado: Uber → Car, Material → Package, etc.)
- Descrição
- Badge da categoria
- Valor em destaque
- Data formatada (dd/MM/yyyy)
- Cliente vinculado (se houver, em texto menor)
- Swipe left → editar / excluir

**Categorias pré-definidas com ícones:**
```typescript
const expenseCategories = [
  { value: 'DESLOCAMENTO',  label: 'Deslocamento (Km)',   icon: 'MapPin' },
  { value: 'TRANSPORTE',    label: 'Transporte (Uber)',    icon: 'Car' },
  { value: 'MATERIAL',      label: 'Material',             icon: 'Package' },
  { value: 'ALIMENTACAO',   label: 'Alimentação',          icon: 'UtensilsCrossed' },
  { value: 'OUTROS',        label: 'Outros',               icon: 'MoreHorizontal' },
]
```

### TASK-07 · Formulário de Nova Despesa

Sheet deslizante de baixo para cima com campos:

- **Descrição** * — input texto (ex: "Uber para cliente", "Papel plotagem")
- **Categoria** — select com ícone (lista acima)
- **Valor** — input moeda BRL
- **Data** — date picker (padrão: hoje)
- **Vincular a cliente** — ComboCreate (opcional)
- **Vincular a orçamento** — select filtrado pelo cliente selecionado (opcional)

Comportamento especial para "Deslocamento (Km)":
- Campo adicional "Km rodados"
- Valor calculado automaticamente: km × preço_km (vem do PricingConfig)
- Usuária pode sobrescrever o valor calculado

### TASK-08 · Relatório de Despesas em PDF

Criar `src/lib/pdf/expenses-pdf.tsx`:

Layout:
```
┌────────────────────────────────────────────┐
│  [LOGO DR]    RELATÓRIO DE DESPESAS        │
│               [período: MM/AAAA]           │
├────────────────────────────────────────────┤
│  Cliente: [nome] (se filtrado por cliente) │
├──────────────────┬────────────┬────────────┤
│  Data            │ Descrição  │    Valor   │
├──────────────────┼────────────┼────────────┤
│  [despesas...]   │            │            │
├──────────────────┴────────────┴────────────┤
│                         TOTAL  R$ X.XXX,XX │
└────────────────────────────────────────────┘
```

API Route: `src/app/api/pdf/expenses/route.ts`
- Aceita query params: `?clientId=xxx&dateFrom=xxx&dateTo=xxx`
- Retorna PDF para download

Botão "Exportar relatório" na tela de despesas:
- Abre bottom sheet para confirmar período e cliente (opcional)
- Opções: Download PDF / Enviar WhatsApp

### TASK-09 · Envio de relatório de despesas por WhatsApp

Criar utilitário similar ao do Sprint 3 para despesas:

```typescript
export function buildExpensesWhatsAppMessage(
  expenses: Expense[],
  period: string,
  clientName?: string
): string
```

Mensagem formatada com lista de despesas e total.

### TASK-10 · Melhorias no Detalhe do Cliente (retroativo)

Agora que há dados de orçamentos e despesas, atualizar a tela de detalhe do cliente criada no Sprint 2:

- Total de receita gerada pelo cliente (soma dos orçamentos FINALIZADOS)
- Total de despesas vinculadas
- Lista dos últimos 5 orçamentos
- Link "Ver todos os orçamentos →"

---

## Critério de aceite

- [ ] Dashboard exibe receita do mês atual (se houver orçamentos finalizados)
- [ ] Cards de métricas atualizam ao trocar o filtro de período
- [ ] Gráfico de barras exibe últimos 6 meses com receita e despesas
- [ ] Clicar em orçamento recente navega para o detalhe
- [ ] Atalhos rápidos navegam/acionam corretamente
- [ ] Registrar despesa de Uber R$ 12,50 vinculada a um cliente
- [ ] Despesa aparece na lista agrupada por mês
- [ ] Filtrar despesas por cliente filtra a lista corretamente
- [ ] PDF de relatório de despesas gerado com logo e dados corretos
- [ ] Total do dashboard não inclui orçamentos cancelados
- [ ] `npm run build` sem erros

---

## Notas para o Claude Code

- O gráfico Recharts precisa de `'use client'` — encapsular em componente client separado
- Datas no banco estão em UTC — converter para horário de Brasília (GMT-3) na exibição
- A receita do dashboard considera apenas orçamentos com status `FINALIZADO`
- "Receita líquida" = receita - despesas do mesmo período
- Para datas relativas ("há 2 dias"), usar a lib `date-fns` (já vem com Next.js) com locale `pt-BR`
- O cálculo de deslocamento km×preço deve ser transparente — mostrar o cálculo para a Débora confirmar
