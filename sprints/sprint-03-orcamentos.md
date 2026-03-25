# Sprint 03 — Módulo de Orçamentos

> **Modelo:** claude-opus-4-6
> **Pré-requisito:** Sprint 02 concluído e validado
> **Referências:** `./project-specs/02-funcionalidades.md` · `./project-specs/03-mapa-de-telas.md` · `./project-specs/06-tabela-de-precos.md`
> **Exemplo real:** `./examples/orcamento_1.jpeg`

---

## Objetivo do sprint

O coração do sistema. A Débora consegue criar um orçamento completo com múltiplas categorias, replicar modelagem para graduação e piloto com cálculo automático, ajustar preços individualmente ou em lote, gerenciar o status, gerar PDF com a identidade visual do estúdio e enviar por WhatsApp.

O teste de validação final é reproduzir exatamente o orçamento do arquivo `./examples/orcamento_1.jpeg` — **CEI Menino Jesus, 5 moldes, graduação 25%, total R$ 1.450,00.**

---

## Contexto de negócio crítico

Ler obrigatoriamente antes de implementar qualquer cálculo:

**Lógica de graduação (molde desenvolvido pela Débora):**
```
valor_grad_por_tamanho = valor_modelagem × pct_graduacao
```
Exemplo: Molde Jaqueta R$ 130 × 0,25 = R$ 32,50/tamanho × 6 tamanhos = R$ 195,00

**Lógica de peça piloto:**
```
valor_piloto = valor_modelagem × pct_piloto  (padrão: 50%)
```
Exemplo: Molde Jaqueta R$ 130 × 0,50 = R$ 65,00

**Desconto — hierarquia:**
1. Desconto por item → `preço_item × (1 - pct_desconto_item)`
2. Desconto por categoria → aplicado sobre soma dos itens já descontados
3. Desconto global → aplicado sobre total geral

---

## Tarefas

### TASK-01 · Types e utilitários de orçamento

Criar `src/types/quote.ts`:

```typescript
import { ServiceCategory, QuoteStatus } from '@prisma/client'

export interface QuoteItemDraft {
  id:           string  // uuid temporário no frontend
  category:     ServiceCategory
  description:  string
  quantity:     number
  unitPrice:    number
  discountPct:  number  // 0 a 1
  finalPrice:   number  // calculado
  sourceItemId: string | null
}

export interface QuoteDraft {
  clientId:     string
  clientName:   string
  validUntil:   Date | null
  notes:        string
  items:        QuoteItemDraft[]
  discountPct:  number  // desconto global, 0 a 1
  totalGross:   number
  totalNet:     number
}
```

Criar `src/lib/quote-calc.ts`:

```typescript
// Calcular preço final de um item
export function calcItemFinalPrice(item: QuoteItemDraft): number {
  return item.unitPrice * item.quantity * (1 - item.discountPct)
}

// Calcular total bruto (sem desconto global)
export function calcTotalGross(items: QuoteItemDraft[]): number {
  return items.reduce((sum, item) => sum + calcItemFinalPrice(item), 0)
}

// Calcular total líquido (com desconto global)
export function calcTotalNet(gross: number, discountPct: number): number {
  return gross * (1 - discountPct)
}

// Calcular valor de graduação com base no valor de modelagem
export function calcGraduationPrice(
  modelingPrice: number,
  pct: number  // vem do PricingConfig.graduationPctBasic
): number {
  return modelingPrice * pct
}

// Calcular valor de piloto com base no valor de modelagem
export function calcPilotPrice(
  modelingPrice: number,
  pct: number  // vem do PricingConfig.pilotPct
): number {
  return modelingPrice * pct
}

// Replicar itens de uma categoria para outra, com lógica de preço
export function replicateItems(
  sourceItems:  QuoteItemDraft[],
  targetCategory: ServiceCategory,
  config: { graduationPctBasic: number; graduationPctComplex: number; pilotPct: number }
): QuoteItemDraft[] {
  return sourceItems.map(item => {
    let unitPrice = item.unitPrice

    if (targetCategory === 'GRADUACAO') {
      // Graduação sobre modelagem desenvolvida pela Débora
      unitPrice = calcGraduationPrice(item.unitPrice, config.graduationPctBasic)
    } else if (targetCategory === 'PILOTO') {
      unitPrice = calcPilotPrice(item.unitPrice, config.pilotPct)
    }

    return {
      id:           crypto.randomUUID(),
      category:     targetCategory,
      description:  item.description,
      quantity:     item.quantity,
      unitPrice,
      discountPct:  0,
      finalPrice:   unitPrice * item.quantity,
      sourceItemId: item.id,
    }
  })
}
```

### TASK-02 · Server Actions — Orçamentos

Criar `src/app/actions/quotes.ts`:

```typescript
'use server'
// Funções a implementar:

// createQuote(draft: QuoteDraft) → Quote com items
// updateQuote(id: string, draft: QuoteDraft) → Quote atualizado
// updateQuoteStatus(id: string, status: QuoteStatus) → Quote
// deleteQuote(id: string) → void
// duplicateQuote(id: string) → Quote (nova cópia com status AGUARDANDO)
// getQuote(id: string) → Quote completo com items e client
// listQuotes(filters: QuoteFilters) → Quote[] com paginação
// getQuoteSummary() → { total, byStatus, monthlyRevenue }
```

Filtros disponíveis:
```typescript
interface QuoteFilters {
  status?:   QuoteStatus
  clientId?: string
  dateFrom?: Date
  dateTo?:   Date
  search?:   string  // busca no nome do cliente
}
```

Lógica de criação — persistir corretamente:
- Calcular `finalPrice` de cada item no servidor (nunca confiar no valor do cliente)
- Calcular `totalGross` e `totalNet` no servidor
- Criar Quote + QuoteItems em uma transaction do Prisma

### TASK-03 · Zustand Store para o rascunho do orçamento

Instalar: `npm install zustand`

Criar `src/store/quote-draft.ts`:

```typescript
import { create } from 'zustand'
import { QuoteDraft, QuoteItemDraft, ServiceCategory } from '@/types/quote'

interface QuoteDraftStore {
  draft: QuoteDraft
  step: 1 | 2 | 3

  // Ações do cabeçalho
  setClient: (clientId: string, clientName: string) => void
  setValidUntil: (date: Date | null) => void
  setNotes: (notes: string) => void

  // Ações dos itens
  addItem: (category: ServiceCategory, item: Omit<QuoteItemDraft, 'id' | 'finalPrice'>) => void
  updateItem: (id: string, changes: Partial<QuoteItemDraft>) => void
  removeItem: (id: string) => void
  replicateCategory: (
    fromCategory: ServiceCategory,
    toCategory: ServiceCategory,
    config: PricingConfigValues
  ) => void
  applyBatchAdjustment: (
    target: ServiceCategory | 'ALL',
    type: 'PCT' | 'FIXED',
    value: number,
    applyAs: 'DISCOUNT' | 'INCREASE'
  ) => void

  // Totais
  setGlobalDiscount: (pct: number) => void

  // Navegação
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}
```

### TASK-04 · Tela: Nova Orçamento — Passo 1 (Cabeçalho)

**Rota:** `src/app/(app)/orcamentos/novo/page.tsx`

Layout de wizard com indicador de passo (3 pontos no topo).

Campos:
- **Cliente** — componente ComboCreate (do Sprint 1)
  - Busca na lista de clientes
  - Criação inline: campos nome + telefone
  - Ao criar: persiste via Server Action `createClient`, seleciona automaticamente
- **Válido até** — date picker (padrão: hoje + 15 dias)
- **Observações** — textarea (opcional)

Botão "Próximo →" habilitado apenas com cliente selecionado.

### TASK-05 · Tela: Nova Orçamento — Passo 2 (Itens)

Esta é a tela mais complexa do sistema. Implementar com cuidado.

**Layout geral:**
- Total flutuante no topo (atualiza em tempo real)
- Seções por categoria (expansíveis — colapsadas por padrão se vazias)
- Seções ativas (com itens) abertas por padrão
- Botão "+ Nova categoria" para adicionar seção não listada
- Botão "← Anterior" e "Próximo →" no footer

**Cada seção de categoria:**

```
┌─ Modelagem ─────────────────────── R$ 580,00 ─┐
│                                                 │
│  • Molde Jaqueta        R$ 130  ×1  R$ 130,00  │
│  • Molde Camiseta Polo  R$ 120  ×1  R$ 120,00  │
│  ...                                            │
│                                                 │
│  [+ Adicionar item]                             │
│  [Replicar para →]  [Ajuste em lote]           │
└─────────────────────────────────────────────────┘
```

**Adição de item:**
- Componente ComboCreate com itens da categoria (busca em PricingItems)
- Criação inline: campos nome + valor padrão (persiste em PricingItems)
- Ao selecionar: preenche valor unitário automaticamente com priceMin do item
- Campo de quantidade (numérico, mínimo 1)
- Campo de valor unitário (editável — pode divergir da tabela)
- Campo de desconto % (opcional, oculto por padrão — "Adicionar desconto")
- Total do item calculado em tempo real

**Swipe para remover item:**
- Swipe left no card do item → revela botão vermelho "Remover"
- Confirma remoção com leve haptic feedback (se disponível)

**Botão "Replicar para →":**
- Abre bottom sheet com lista de categorias destino
- Para GRADUACAO: mostra aviso "Aplicará 25% do valor de cada molde"
- Para PILOTO: mostra aviso "Aplicará 50% do valor de cada molde"
- Confirmar → chama `replicateCategory()` na store
- Se categoria destino já tem itens: pergunta "Adicionar aos existentes ou substituir?"

**Botão "Ajuste em lote":**
- Abre bottom sheet com:
  - Tipo: Desconto / Acréscimo
  - Forma: Percentual (%) / Valor fixo (R$)
  - Valor: campo numérico
  - Aplicar em: Esta categoria / Todas as categorias
- Preview do impacto antes de confirmar
- Confirmar → chama `applyBatchAdjustment()` na store

### TASK-06 · Tela: Novo Orçamento — Passo 3 (Revisão)

Layout de resumo final:

```
Cliente: CEI Menino Jesus
Válido até: 10/04/2025

─ Modelagem ─────────────── R$ 580,00
  5 itens

─ Graduação ──────────────── R$ 870,00
  5 itens × 6 tamanhos

  Subtotal bruto ─────────── R$ 1.450,00

  Desconto global  [____%]   R$ 0,00

  ════════════════════════
  TOTAL              R$ 1.450,00

[Criar Orçamento]
```

- Desconto global: input de %, valor deduzido calculado em tempo real
- Botão "Criar Orçamento" → chama Server Action, redireciona para o detalhe

### TASK-07 · Lista de Orçamentos

**Rota:** `src/app/(app)/orcamentos/page.tsx`

Layout:
- Pills de filtro por status no topo (scroll horizontal)
- Campo de busca por nome de cliente
- Lista de cards (grupo por mês)
- FAB (+) para novo orçamento

Card de orçamento:
- Nome do cliente (destaque)
- Data de criação + validade
- Badge de status (cores da paleta — ver `./project-specs/01-identidade-visual.md`)
- Valor total formatado em BRL
- Ícone sutil indicando número de categorias

Filtros:
- Status: Todos / Aguardando / Aprovado / Em Andamento / Finalizado / Cancelado
- Período: date range picker
- Cliente: ComboCreate (selecionar da lista)

### TASK-08 · Detalhe do Orçamento

**Rota:** `src/app/(app)/orcamentos/[id]/page.tsx`

Seções:
1. Header: nome do cliente, badge de status, datas
2. Dados da prestadora: Débora da Rosa, CNPJ
3. Tabela de itens agrupada por categoria
4. Totais: subtotais por categoria, desconto, total final
5. Observações padrão

**Barra de ações (bottom):**
- Botão status: muda para o próximo status lógico
  - AGUARDANDO → "Marcar como Aprovado"
  - APROVADO → "Iniciar Trabalho"
  - EM_ANDAMENTO → "Finalizar"
  - FINALIZADO → (sem ação de status)
- `...` menu secundário: Editar / Duplicar / Gerar PDF / Enviar WhatsApp

**Fluxo de mudança de status:**
- Dialog de confirmação para cada transição
- Ao mudar para APROVADO: criar tarefa automaticamente (antecipa Sprint 5)
  ```
  Tarefa: "Iniciar [categorias] — [cliente]"
  Prioridade: ALTA
  ```

### TASK-09 · Geração de PDF

Criar `src/lib/pdf/quote-pdf.tsx` usando `@react-pdf/renderer`:

Layout do PDF (fiel ao orçamento_1.jpeg):
```
┌────────────────────────────────────────────┐
│  [LOGO DR]    ORÇAMENTO                    │
├────────────────────────────────────────────┤
│  Prestador: Débora da Rosa                 │
│  CNPJ: 49.647.364/0001-57                 │
│  Cliente: [nome]                           │
│  CNPJ/CPF: [se houver]                    │
├──────────────────┬───────────┬────────────┤
│  Serviço         │ Valor Unit.│ Qtd │ Total│
├──────────────────┼───────────┼─────┼──────┤
│  [itens...]      │           │     │      │
├──────────────────┴───────────┴─────┴──────┤
│  Graduação                           25%   │
│  [itens de graduação...]                   │
├────────────────────────────────────────────┤
│                         TOTAL  R$ X.XXX,00 │
└────────────────────────────────────────────┘

Observações:
* Valores podem sofrer alteração...
* A contagem do prazo só inicia...
[demais observações do prestadora]
```

Criar API Route `src/app/api/pdf/quote/[id]/route.ts`:
```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const quote = await getQuoteForPDF(params.id)
  const pdfBuffer = await generateQuotePDF(quote)

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orcamento-${quote.id.slice(0,8)}.pdf"`,
    },
  })
}
```

### TASK-10 · Compartilhamento via WhatsApp

Criar `src/lib/whatsapp.ts`:

```typescript
export function buildWhatsAppMessage(quote: QuoteWithDetails): string {
  const items = quote.items
    .map(i => `• ${i.description}: ${formatCurrency(i.finalPrice)}`)
    .join('\n')

  return encodeURIComponent(
    `*Orçamento DR Modelagem*\n\n` +
    `Cliente: ${quote.client.name}\n` +
    `Data: ${format(quote.createdAt, 'dd/MM/yyyy')}\n\n` +
    `*Serviços:*\n${items}\n\n` +
    `*Total: ${formatCurrency(quote.totalNet)}*\n\n` +
    `Válido até: ${format(quote.validUntil, 'dd/MM/yyyy')}\n\n` +
    `Para mais detalhes, solicite o PDF completo.`
  )
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${withCountry}?text=${message}`
}
```

Botão "Enviar WhatsApp" no detalhe do orçamento: abre URL em nova aba.

### TASK-11 · Duplicar Orçamento

Server Action `duplicateQuote`:
- Cria novo orçamento com mesmos dados (cliente, itens, valores)
- Status = AGUARDANDO
- Data de criação = agora
- Validade = hoje + 15 dias
- Redireciona para o novo orçamento em modo de edição

---

## Validação final obrigatória

Reproduzir o orçamento real `./examples/orcamento_1.jpeg`:

**Dados:**
- Cliente: CEI Menino Jesus
- 5 moldes (Jaqueta R$130, Camiseta Polo R$120, Camiseta sem Manga R$80, Jaqueta Canguru R$150, Blusão Careca R$100)
- Replicar para Graduação com 25%, 6 tamanhos
- Total esperado: **R$ 1.450,00**

Cálculo esperado:
```
Modelagem:
  Jaqueta         R$ 130 × 1 = R$ 130
  Camiseta Polo   R$ 120 × 1 = R$ 120
  Camiseta s/Mng  R$  80 × 1 = R$  80
  Jaqueta Canguru R$ 150 × 1 = R$ 150
  Blusão Careca   R$ 100 × 1 = R$ 100
  Subtotal modelagem = R$ 580

Graduação (25% × 6 tamanhos):
  Jaqueta         R$  32,50 × 6 = R$ 195
  Camiseta Polo   R$  30,00 × 6 = R$ 180
  Camiseta s/Mng  R$  20,00 × 6 = R$ 120
  Jaqueta Canguru R$  37,50 × 6 = R$ 225
  Blusão Careca   R$  25,00 × 6 = R$ 150
  Subtotal graduação = R$ 870

TOTAL = R$ 580 + R$ 870 = R$ 1.450,00 ✓
```

---

## Critério de aceite

- [ ] Criar orçamento para CEI Menino Jesus com 5 moldes
- [ ] Replicar Modelagem → Graduação com 25% / 6 tamanhos
- [ ] Total exibe R$ 1.450,00 (igual ao exemplo real)
- [ ] PDF gerado com logo, dados da Débora, tabela e observações
- [ ] Link WhatsApp gerado com mensagem pré-formatada
- [ ] Lista de orçamentos filtra por status corretamente
- [ ] Filtro por cliente funciona
- [ ] Mudar status de Aguardando para Aprovado persiste no banco
- [ ] Duplicar orçamento cria cópia com status AGUARDANDO
- [ ] Editar orçamento existente mantém os dados originais
- [ ] Ajuste em lote de 10% de desconto em todos os itens de modelagem aplica corretamente
- [ ] ComboCreate de serviço mostra preços da tabela configurada
- [ ] Criar serviço inline pelo ComboCreate persiste em PricingItems
- [ ] `npm run build` sem erros

---

## Notas para o Claude Code

- O Zustand store é apenas para o **rascunho em edição** — dados salvos vivem no banco
- Todos os cálculos financeiros devem ser validados também no servidor (Server Action)
- Valores monetários: sempre `Decimal` no banco, `number` no JS, formatados como BRL para exibição
- O PDF usa fontes incorporadas — importar Cormorant Garamond como base64 para o `@react-pdf/renderer`
- O `replicateCategory` deve preservar os itens existentes na categoria destino por padrão (não substituir), com opção de substituir
- Animações de swipe com `@use-gesture/react` ou implementação CSS pura
