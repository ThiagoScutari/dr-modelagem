# 04 — Stack Tecnológica

## Visão geral

| Camada | Tecnologia | Versão alvo |
|---|---|---|
| Framework | Next.js | 15.x |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS | 3.x |
| Componentes | Radix UI | latest |
| Banco de dados | PostgreSQL | 16.x |
| ORM | Prisma | 5.x |
| Autenticação | NextAuth.js | 5.x |
| PDF | @react-pdf/renderer | latest |
| Notificações | Telegram Bot API | — |
| Hosting frontend | Vercel | — |
| Hosting banco | Supabase | — |

---

## Frontend

### Next.js 15 + TypeScript
- App Router (estrutura `app/`)
- Server Components por padrão — Client Components apenas onde necessário (interatividade, formulários)
- API Routes dentro do próprio projeto (`app/api/`)
- Sem backend separado — arquitetura monorepo

### Tailwind CSS
- Configuração da paleta de cores da DR Modelagem como tokens customizados
- Variantes `mobile-first` por padrão
- Plugin `@tailwindcss/forms` para inputs

```js
// tailwind.config.js — extensão de cores
colors: {
  mar: '#1A6E8C',
  areia: '#E8C97A',
  poente: '#E07848',
  espuma: '#C8E8DC',
  noite: '#1C3D4F',
  ceu: '#7BB8CC',
  creme: '#FAF6EE',
  coral: '#B81C1C',
  floresta: '#2E6B30',
}
```

### Radix UI
- Componentes acessíveis (Dialog, Select, Toast, Popover)
- Sem estilos opinativos — totalmente estilizável com Tailwind
- Especialmente para: Select com busca, Dialogs de confirmação, Toasts de feedback

### Glass morphism (CSS)
```css
.glass-card {
  background: rgba(250, 246, 238, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(123, 184, 204, 0.25);
  border-radius: 16px;
}
```

---

## Banco de dados

### PostgreSQL via Supabase
- Supabase free tier: 500MB, 2 conexões diretas — suficiente para uso pessoal
- Row Level Security (RLS) ativado
- Backups automáticos diários

### Prisma ORM
- Schema declarativo com migrations automáticas (`prisma migrate dev`)
- Type-safety completo — queries tipadas em TypeScript
- Prisma Client gerado automaticamente

---

## Autenticação

### NextAuth.js v5
- Estratégia: Credentials (e-mail + senha, acesso único da Débora)
- Sessão via JWT (edge-compatible)
- Middleware de proteção de rotas

---

## Geração de PDF

### @react-pdf/renderer
- PDF gerado no servidor (API Route) com React components
- Layout: logo da DR Modelagem, dados da prestadora, tabela de itens, total, observações
- Saída: Blob para download ou envio

---

## Notificações Telegram

### Telegram Bot API
- Bot criado via @BotFather
- Webhooks via API Route do Next.js
- Casos de uso:
  - Lembrete de tarefa com prazo próximo
  - Aviso de fim de sessão Pomodoro
  - Orçamento aguardando resposta há X dias
  - Resumo diário de pendências

---

## Infraestrutura

### Vercel (frontend + API)
- Deploy automático via GitHub
- Edge Middleware para autenticação
- Free tier suficiente para uso pessoal

### Supabase (banco)
- PostgreSQL gerenciado
- Dashboard visual para consulta de dados
- Postgres Connection Pooling via PgBouncer

### Variáveis de ambiente (.env.local)

```env
# Banco
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://dr-modelagem.vercel.app"

# Telegram
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
```

---

## Estrutura de pastas do projeto

```
dr-modelagem/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── orcamentos/
│   │   │   ├── [id]/
│   │   │   └── novo/
│   │   ├── despesas/
│   │   ├── foco/
│   │   └── configuracoes/
│   │       ├── precos/
│   │       ├── clientes/
│   │       └── prestadora/
│   └── api/
│       ├── auth/
│       ├── orcamentos/
│       ├── clientes/
│       ├── despesas/
│       ├── tarefas/
│       ├── pdf/
│       └── telegram/
├── components/
│   ├── ui/           # Componentes base (Button, Input, Badge...)
│   ├── forms/        # Formulários reutilizáveis
│   ├── orcamento/    # Componentes específicos de orçamento
│   ├── dashboard/    # Componentes do dashboard
│   └── shared/       # ComboCreate, StatusBadge, etc.
├── lib/
│   ├── prisma.ts     # Singleton do Prisma Client
│   ├── auth.ts       # Configuração NextAuth
│   ├── pdf.ts        # Gerador de PDF
│   ├── telegram.ts   # Cliente do Telegram Bot
│   └── utils.ts      # Funções utilitárias
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/             # Tabelas de preço e referências
├── examples/         # Exemplos de orçamento
├── images/           # Logo e assets
├── project-specs/    # Esta documentação
└── public/
    └── logo/
```

---

## Princípios de código

### SOLID aplicado
- **S** — Cada Server Action / API Route tem uma responsabilidade única
- **O** — Componentes extensíveis via props, sem modificação interna
- **L** — Componentes de formulário substituíveis sem quebrar o pai
- **I** — Interfaces pequenas e focadas (não um tipo genérico para tudo)
- **D** — Dependências injetadas via props / contexto, não instanciadas internamente

### Convenções
- Nomes em português nos domínios de negócio (`Orcamento`, `Cliente`, `ItemOrcamento`)
- Nomes em inglês em infraestrutura e utilitários
- Validação com Zod em todas as entradas de formulário e API
- Erros tratados com Result pattern (nunca throw naked)
- Datas sempre em UTC no banco, exibidas no fuso do usuário

### Segurança
- Senhas com bcrypt (salt rounds: 12)
- CSRF protection via NextAuth
- SQL injection impossível via Prisma (queries parametrizadas)
- Variáveis sensíveis apenas em `.env.local` — nunca no cliente
