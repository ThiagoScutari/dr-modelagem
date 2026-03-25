# Sprint 02 — Configurações & Clientes

> **Modelo:** claude-opus-4-6
> **Pré-requisito:** Sprint 01 concluído e validado
> **Referências:** `./project-specs/02-funcionalidades.md` · `./project-specs/06-tabela-de-precos.md`

---

## Objetivo do sprint

A Débora consegue gerenciar toda a tabela de preços, configurar os parâmetros de cálculo (percentuais de graduação e piloto), fazer CRUD completo de clientes e manter os dados da prestadora atualizados. Este sprint entrega a "espinha dorsal" de dados que alimenta os orçamentos.

---

## Contexto de negócio importante

Antes de começar, ler `./project-specs/06-tabela-de-precos.md` completamente.

**Regras críticas:**
- Graduação sobre modelagem desenvolvida pela Débora = **25% do valor da modelagem por tamanho** (básico) ou **30%** (complexo)
- Peça Piloto = **50% do valor da modelagem** (corte e costura apenas — material é do cliente)
- Ambos os percentuais são **configuráveis** nas configurações
- A tabela de preços do seed é ponto de partida — a Débora pode alterar qualquer valor

---

## Tarefas

### TASK-01 · Server Actions — Clientes

Criar `src/app/actions/clients.ts`:

```typescript
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'

const clientSchema = z.object({
  name:      z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:     z.string().email().optional().or(z.literal('')),
  phone:     z.string().optional(),
  instagram: z.string().optional(),
  document:  z.string().optional(),
  notes:     z.string().optional(),
})

export async function createClient(data: z.infer<typeof clientSchema>) {
  const session = await auth()
  if (!session) throw new Error('Não autorizado')

  const parsed = clientSchema.parse(data)
  const client = await prisma.client.create({ data: parsed })
  revalidatePath('/configuracoes/clientes')
  revalidatePath('/orcamentos')
  return { success: true, client }
}

export async function updateClient(id: string, data: z.infer<typeof clientSchema>) {
  // idem createClient mas com update
}

export async function deleteClient(id: string) {
  // verificar se há orçamentos vinculados antes de deletar
  const quotesCount = await prisma.quote.count({ where: { clientId: id } })
  if (quotesCount > 0) {
    return {
      success: false,
      error: `Este cliente possui ${quotesCount} orçamento(s) vinculado(s). Remova-os primeiro.`
    }
  }
  await prisma.client.delete({ where: { id } })
  revalidatePath('/configuracoes/clientes')
  return { success: true }
}

export async function getClients() {
  return prisma.client.findMany({ orderBy: { name: 'asc' } })
}
```

### TASK-02 · Server Actions — Tabela de Preços

Criar `src/app/actions/pricing.ts`:

```typescript
'use server'
// CRUD para PricingItem e PricingConfig
// - listPricingItems(category?: ServiceCategory)
// - createPricingItem(data)
// - updatePricingItem(id, data)
// - deletePricingItem(id)
// - getPricingConfig()
// - updatePricingConfig(data)
```

Schema de validação para PricingItem:
```typescript
const pricingItemSchema = z.object({
  category:    z.nativeEnum(ServiceCategory),
  name:        z.string().min(3),
  description: z.string().optional(),
  priceMin:    z.number().min(0),
  priceMax:    z.number().min(0).optional(),
  unit:        z.nativeEnum(PricingUnit),
  active:      z.boolean().default(true),
  sortOrder:   z.number().default(0),
})
```

Schema de validação para PricingConfig:
```typescript
const pricingConfigSchema = z.object({
  graduationPctBasic:    z.number().min(0.01).max(1),  // 0.25 = 25%
  graduationPctComplex:  z.number().min(0.01).max(1),  // 0.30 = 30%
  pilotPct:              z.number().min(0.01).max(1),  // 0.50 = 50%
  plottingPricePerMeter: z.number().min(0),
  kmPrice:               z.number().min(0),
})
```

### TASK-03 · Tela de Configurações — Tabela de Preços

**Rota:** `src/app/(app)/configuracoes/precos/page.tsx`

Layout:
- Header: "Tabela de Preços"
- Lista de seções colapsáveis por categoria (Radix Accordion ou implementação manual)
- Cada seção: nome da categoria + badge com total de itens + total acumulado

Por categoria, listar itens com:
- Nome do serviço
- Faixa de valor (ex: "R$ 100 – R$ 250" ou "R$ 130")
- Botão de editar (inline, expande o campo)
- Botão de excluir (com confirmação Dialog)

Botão "Adicionar serviço" no footer de cada seção:
- Abre mini-form inline
- Campos: nome, valor mínimo, valor máximo (opcional), unidade
- Validação imediata
- Toast de sucesso ao salvar

**Edição inline de valor:**
- Clique no valor → transforma em `<input>` com formatação BRL
- Enter ou blur → salva via Server Action
- Escape → cancela
- Feedback visual: verde floresta ao salvar, coral ao falhar

**Nomes das categorias para exibição:**
```typescript
const categoryLabels: Record<ServiceCategory, string> = {
  DIGITALIZACAO: 'Digitalização de Moldes',
  MODELAGEM:     'Modelagem',
  GRADUACAO:     'Graduação',
  ENCAIXE:       'Encaixe',
  PLOTAGEM:      'Plotagem',
  PILOTO:        'Peças Piloto',
  CONVERSAO:     'Conversão de Arquivos',
  CONSULTORIA:   'Consultoria',
  OUTROS:        'Outros',
}
```

### TASK-04 · Tela de Configurações — Parâmetros Globais

**Rota:** `src/app/(app)/configuracoes/parametros/page.tsx`

Campos editáveis com descrição e exemplo de cálculo ao lado:

| Campo | Label | Tipo | Exemplo exibido |
|---|---|---|---|
| graduationPctBasic | Graduação básica | % | "Ex: molde R$ 130 → grad. R$ 32,50/tam." |
| graduationPctComplex | Graduação complexa | % | "Para moldes com muitos recortes" |
| pilotPct | Peça piloto | % | "Ex: molde R$ 130 → piloto R$ 65,00" |
| plottingPricePerMeter | Plotagem por metro | R$/m | — |
| kmPrice | Km rodado | R$/km | — |

O exemplo de cálculo deve ser **dinâmico** — atualiza conforme o usuário digita o percentual.

Botão "Salvar parâmetros" com confirmação e toast de sucesso.

### TASK-05 · Tela de Clientes — Lista

**Rota:** `src/app/(app)/configuracoes/clientes/page.tsx`

Layout:
- Barra de busca no topo (filtra por nome em tempo real)
- Lista de cards por cliente
- FAB (+) para adicionar

Card de cliente:
- Avatar circular com iniciais (2 letras) — fundo gerado deterministicamente pela letra inicial (cada letra → cor da paleta)
- Nome em destaque
- Telefone ou e-mail (o que tiver)
- Badge sutil com número de orçamentos (se > 0)

Interações:
- Toque no card → abre sheet de detalhe
- Swipe left → opções: editar / excluir
- FAB → abre formulário de cadastro

### TASK-06 · Formulário de Cadastro/Edição de Cliente

Usar React Hook Form + Zod. Campos:
- Nome * (obrigatório)
- Telefone (com máscara BR)
- E-mail
- Instagram (aceita com ou sem @)
- CPF / CNPJ (opcional)
- Observações (textarea)

Funcionar tanto para criação quanto edição (recebe `client?` como prop).

Ao criar com sucesso: toast verde + fecha o formulário + atualiza a lista.

### TASK-07 · Detalhe do Cliente (Sheet/Modal)

Sheet deslizante de baixo para cima com:
- Avatar grande + nome + dados de contato
- Botão WhatsApp (abre `https://wa.me/55[telefone]`)
- Histórico de orçamentos (lista básica por enquanto — será preenchida no Sprint 3)
- Botões: Editar / Excluir

### TASK-08 · Tela Dados da Prestadora

**Rota:** `src/app/(app)/configuracoes/prestadora/page.tsx`

Campos:
- Nome (Débora da Rosa) — pré-preenchido do banco
- Razão social
- CNPJ (readonly — exibir formatado: 49.647.364/0001-57)
- Observações padrão do orçamento (textarea — 5 observações pré-carregadas do seed)
- Token do Bot Telegram (input tipo password)
- Chat ID do Telegram

Salvar via Server Action que atualiza o model `User` com campos extras (ou criar um model `PresenterConfig` se preferir).

Upload de logo:
- Input file (aceita PNG/SVG)
- Preview da logo atual
- A logo existente está em `./images/Logomarca.png` → copiar para `public/logo.png` no setup

### TASK-09 · Menu de Configurações — Tela principal

**Rota:** `src/app/(app)/configuracoes/page.tsx`

Lista de atalhos para as sub-rotas de configuração:

```
⊞ Tabela de Preços         → /configuracoes/precos
⊙ Parâmetros de Cálculo    → /configuracoes/parametros
◉ Clientes                 → /configuracoes/clientes
◈ Dados da Prestadora      → /configuracoes/prestadora
```

Cada item como card com ícone, título, subtítulo descritivo e chevron.

### TASK-10 · Utilidades de formatação

Criar `src/lib/format.ts`:

```typescript
// Formatar valor monetário BRL
export function formatCurrency(value: number | Decimal): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

// Formatar percentual
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

// Formatar telefone BR
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  }
  return phone
}

// Formatar CNPJ
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '')
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Gerar cor de avatar por nome
export function avatarColor(name: string): string {
  const colors = ['mar', 'poente', 'floresta', 'noite', 'areia']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}
```

---

## Critério de aceite

- [ ] Navegar para Configurações → Tabela de Preços exibe todas as categorias com itens do seed
- [ ] Editar o valor de um item de modelagem: o novo valor persiste após refresh
- [ ] Adicionar novo item em qualquer categoria: aparece na lista imediatamente
- [ ] Excluir item com confirmação: item removido e toast exibido
- [ ] Configurar % de graduação básica para 28%: valor salvo corretamente
- [ ] Exemplo de cálculo ao lado do campo atualiza dinamicamente ao digitar
- [ ] Cadastrar novo cliente com nome e telefone: aparece na lista com iniciais corretas
- [ ] Buscar cliente por nome: filtra em tempo real
- [ ] Clicar em cliente → sheet abre com dados e botão WhatsApp funcional
- [ ] Excluir cliente com orçamentos vinculados: exibe mensagem de impedimento (no Sprint 3 haverá orçamentos; para teste manual criar via seed)
- [ ] Tela Dados da Prestadora exibe CNPJ formatado 49.647.364/0001-57
- [ ] `npm run build` sem erros de TypeScript

---

## Notas para o Claude Code

- Os valores do banco são `Decimal` do Prisma — usar `Number()` ao passar para funções JS
- Inputs de moeda devem aceitar `,` como separador decimal (padrão BR)
- A edição inline de valores deve funcionar com teclado numérico no mobile
- Ao excluir item de preço que esteja em orçamentos existentes: NÃO bloquear (o valor já foi fixado no QuoteItem)
- Server Actions com `revalidatePath` garantem atualização sem reload manual
- Manter o estado otimista (Optimistic UI) nas edições inline para melhor UX
