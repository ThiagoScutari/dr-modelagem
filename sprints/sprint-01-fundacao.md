# Sprint 01 — Fundação & Identidade Visual

> **Modelo:** claude-opus-4-6
> **Projeto:** DR Modelagem — Hub de Gestão
> **Diretório raiz:** (este diretório onde o Claude Code está sendo executado)
> **Documentação de referência:** `./project-specs/`

---

## Objetivo do sprint

Criar a estrutura base completa do projeto: Next.js configurado, design system com a identidade visual da DR Modelagem, banco de dados rodando com schema e seed, autenticação funcional e layout mobile-first navegável.

Ao final deste sprint, o app deve abrir na Vercel, fazer login e exibir o shell de navegação com as 5 abas — sem dados ainda, mas com a identidade visual 100% fiel aos specs.

---

## Contexto do projeto

Leia `./project-specs/01-identidade-visual.md` e `./project-specs/04-stack.md` antes de começar qualquer tarefa.

**Paleta de cores (tokens principais):**
```
mar:       #1A6E8C  → primária, CTAs
areia:     #E8C97A  → accent, hover
poente:    #E07848  → alertas, avisos
espuma:    #C8E8DC  → backgrounds suaves
noite:     #1C3D4F  → textos, headers
ceu:       #7BB8CC  → UI, borders
creme:     #FAF6EE  → background base
coral:     #B81C1C  → erros, críticos
floresta:  #2E6B30  → sucesso, validado
```

**Tipografia:**
- Display/Logo: Cormorant Garamond (Google Fonts)
- Interface: DM Sans (Google Fonts)
- Números: DM Mono (Google Fonts)

---

## Tarefas

### TASK-01 · Setup do projeto Next.js

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Após criar, instalar dependências:

```bash
npm install @prisma/client prisma
npm install next-auth@beta
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-popover @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot
npm install bcryptjs
npm install @types/bcryptjs -D
npm install clsx tailwind-merge
npm install lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install @react-pdf/renderer
npm install recharts
```

### TASK-02 · Configurar Tailwind com paleta DR Modelagem

Substituir o conteúdo de `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mar:      { DEFAULT: '#1A6E8C', dark: '#0F4A60', light: '#7BB8CC' },
        areia:    { DEFAULT: '#E8C97A', dark: '#C4A040', light: '#F5EDD6' },
        poente:   { DEFAULT: '#E07848', dark: '#B85830', light: '#F0B898' },
        espuma:   { DEFAULT: '#C8E8DC', dark: '#8ECAB6', light: '#EAF6F2' },
        noite:    { DEFAULT: '#1C3D4F', dark: '#0E2030', light: '#3D6070' },
        ceu:      { DEFAULT: '#7BB8CC', dark: '#4A90A8', light: '#B8D8E8' },
        creme:    { DEFAULT: '#FAF6EE', dark: '#F0E8D0', light: '#FDFAF5' },
        coral:    { DEFAULT: '#B81C1C', dark: '#8A1010', light: '#E05050' },
        floresta: { DEFAULT: '#2E6B30', dark: '#1A4A1C', light: '#5A9E5C' },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass':   '0 4px 24px rgba(26, 110, 140, 0.08)',
        'card':    '0 2px 12px rgba(28, 61, 79, 0.06)',
        'float':   '0 8px 32px rgba(26, 110, 140, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
```

### TASK-03 · Variáveis CSS globais e fontes

Em `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary:    #1A6E8C;
    --color-accent:     #E8C97A;
    --color-warning:    #E07848;
    --color-surface:    #C8E8DC;
    --color-text:       #1C3D4F;
    --color-ui:         #7BB8CC;
    --color-background: #FAF6EE;
    --color-danger:     #B81C1C;
    --color-success:    #2E6B30;

    --radius-sm:  8px;
    --radius-md:  12px;
    --radius-lg:  16px;
    --radius-xl:  20px;
    --radius-2xl: 24px;
  }

  * {
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background-color: #FAF6EE;
    color: #1C3D4F;
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Safe area para iOS */
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

@layer components {
  /* Glass morphism */
  .glass {
    background: rgba(250, 246, 238, 0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(123, 184, 204, 0.22);
  }

  /* Card base */
  .card {
    @apply bg-white rounded-2xl shadow-card border border-ceu/10 p-5;
  }

  /* Input base */
  .input-base {
    @apply w-full rounded-xl border border-ceu/40 bg-espuma/20 px-4 py-3
           text-sm font-sans text-noite placeholder:text-noite/40
           focus:outline-none focus:ring-2 focus:ring-mar/30 focus:border-mar
           transition-all duration-200;
  }

  /* Tap target mínimo */
  .tap-target {
    @apply min-h-[48px] min-w-[48px];
  }
}
```

### TASK-04 · Schema Prisma

Criar `prisma/schema.prisma` com o schema completo de `./project-specs/05-banco-de-dados.md`.

Configurar `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
```

Executar migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

Criar `prisma/seed.ts` com os dados de `./project-specs/06-tabela-de-precos.md` — seção "Dados iniciais (seed)".

### TASK-05 · Autenticação NextAuth.js

Criar `src/lib/auth.ts`:

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        const valid = await compare(parsed.data.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
```

Criar `src/lib/prisma.ts` (singleton):
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Criar `src/middleware.ts`:
```typescript
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/((?!login|api/auth|_next|favicon.ico).*)'],
}
```

Criar `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
export { handlers as GET, handlers as POST } from '@/lib/auth'
```

### TASK-06 · Tela de Login

Criar `src/app/login/page.tsx` — tela de login com:
- Logo centralizada (usar `public/logo.png` — copiar de `./images/Logomarca.png`)
- Campo de e-mail
- Campo de senha com toggle de visibilidade
- Botão "Entrar" com loading state
- Fundo com gradiente suave usando a paleta (creme → espuma)
- Tipografia: "Estúdio de Modelagem" em Cormorant Garamond abaixo da logo

Comportamento:
- Submit chama `signIn('credentials', { email, password, redirectTo: '/dashboard' })`
- Exibe mensagem de erro se credenciais inválidas
- Redireciona para `/dashboard` ao autenticar

### TASK-07 · Layout base autenticado

Criar `src/app/(app)/layout.tsx` com:
- Bottom Navigation Bar fixa (5 abas)
- Header contextual por rota
- Safe area padding no bottom
- Conteúdo com `pb-20` para não ficar atrás da nav

**Bottom Nav — 5 abas com ícones Lucide:**
```
Início     → /dashboard      → icon: LayoutDashboard
Orçamentos → /orcamentos     → icon: FileText
Despesas   → /despesas       → icon: Receipt
Foco       → /foco           → icon: Timer
Config     → /configuracoes  → icon: Settings
```

Estilo da Bottom Nav:
```
background: glass (rgba branco + blur)
border-top: 1px solid rgba(123, 184, 204, 0.20)
aba ativa: cor mar (#1A6E8C), label visível
aba inativa: cor noite/40, sem label
```

### TASK-08 · Páginas placeholder das 5 abas

Criar páginas mínimas para cada rota (apenas título + ícone centralizado, para confirmar a navegação funciona):

- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/orcamentos/page.tsx`
- `src/app/(app)/despesas/page.tsx`
- `src/app/(app)/foco/page.tsx`
- `src/app/(app)/configuracoes/page.tsx`

### TASK-09 · Componentes base do Design System

Criar em `src/components/ui/`:

**`button.tsx`** — variantes: primary, secondary, ghost, danger, loading state

**`input.tsx`** — text, number, currency (formatação BRL automática), date

**`badge.tsx`** — variantes por QuoteStatus (cores da paleta):
- AGUARDANDO: fundo `#FEF5E6` texto `#A05A10`
- APROVADO: fundo `#E3F2E3` texto `#1A501A`
- EM_ANDAMENTO: fundo `#E6F3F8` texto `#1A4E6C`
- FINALIZADO: fundo `#E3F2E3` texto `#1A501A`
- CANCELADO: fundo `#F5F5F5` texto `#6B6B6B`

**`card.tsx`** — wrapper com shadow-card, rounded-2xl, border ceu/10

**`toast.tsx`** — usando Radix Toast:
- success: fundo floresta
- error: fundo coral
- warning: fundo poente
- info: fundo mar

**`loading.tsx`** — spinner e skeleton screen

**`combo-create.tsx`** — componente reutilizável mais complexo:

O ComboCreate é um select com busca + criação inline. Leia a especificação completa em `./project-specs/03-mapa-de-telas.md` — seção "Padrão ComboCreate".

Props:
```typescript
interface ComboCreateProps<T> {
  items: T[]
  value: string | null
  onChange: (value: string) => void
  getLabel: (item: T) => string
  getValue: (item: T) => string
  placeholder: string
  createLabel: string  // ex: "Cadastrar cliente"
  onCreateSubmit: (data: CreateFormData) => Promise<T>
  createFields: CreateField[]  // campos do mini-formulário
  loading?: boolean
}
```

Comportamento:
1. Campo de busca com ícone Search
2. Lista filtrada em tempo real
3. Se query sem resultados: exibe mensagem + botão de criar
4. Botão de criar expande mini-form inline (não modal)
5. Mini-form com campos definidos em `createFields`
6. Ao salvar: chama `onCreateSubmit`, fecha form, seleciona o novo item
7. Ao cancelar: volta ao estado de busca

### TASK-10 · Estrutura de pastas completa

Garantir que a estrutura de pastas esteja criada conforme `./project-specs/04-stack.md` — seção "Estrutura de pastas do projeto".

Criar os diretórios vazios com `.gitkeep` onde necessário.

### TASK-11 · Deploy inicial Vercel

```bash
# Instalar Vercel CLI se não tiver
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente na Vercel dashboard:
# DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

---

## Critério de aceite

- [ ] `npm run dev` inicia sem erros
- [ ] `npx prisma migrate status` mostra todas as migrations aplicadas
- [ ] `npx prisma db seed` executa sem erros e popula PricingItems + PricingConfig
- [ ] Acessar `/login` exibe a tela com logo e formulário estilizados
- [ ] Login com credenciais corretas redireciona para `/dashboard`
- [ ] Login com credenciais erradas exibe mensagem de erro
- [ ] Rota protegida sem login redireciona para `/login`
- [ ] Bottom navigation exibe 5 abas e navega entre elas
- [ ] Aba ativa está visualmente destacada
- [ ] Em mobile (375px), layout não transborda horizontalmente
- [ ] `npm run build` completa sem erros de TypeScript
- [ ] Deploy na Vercel acessível e funcional

---

## Notas para o Claude Code

- Manter **todas as strings de UI em português** (labels, placeholders, mensagens)
- Usar `clsx` + `tailwind-merge` via função utilitária `cn()` em `src/lib/utils.ts`
- Nunca usar `any` — TypeScript strict mode
- Validar todos os formulários com Zod
- Server Actions preferíveis a API Routes para mutations simples
- Comentar a lógica de negócio (graduação, piloto) mas não o óbvio
- Criar o usuário inicial da Débora no seed com senha hasheada
