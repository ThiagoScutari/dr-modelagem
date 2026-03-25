# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DR Modelagem — Hub de Gestão** is a mobile-first web app for managing quotes, expenses, focus/productivity for Débora da Rosa's textile modeling studio (Estúdio de Modelagem Têxtil). This is a single-user app (Débora is the sole user).

The project is currently in **pre-development** — all specs are complete in `project-specs/`, sprint plans in `sprints/`, and implementation follows a 5-sprint roadmap.

## Available Skills — Read Before Acting

Skills are located at `.claude/skills/`. **Always read the relevant skill before starting any task category:**

| Skill | Path | When to read |
|---|---|---|
| Sprint Workflow | `.claude/skills/sgp-sprint-workflow/SKILL.md` | **Before starting any sprint or task** |
| Architecture Decisions | `.claude/skills/sgp-architecture-decisions/SKILL.md` | Before any structural decision or library choice |
| Security Patterns | `.claude/skills/sgp-security-patterns/SKILL.md` | Before writing auth, API routes, Server Actions, input handling |
| Frontend Patterns | `.claude/skills/sgp-frontend-patterns/SKILL.md` | Before creating any component, page, or UI logic |
| Testing Standards | `.claude/skills/sgp-testing-standards/SKILL.md` | Before writing any test file |
| Sprint Review | `.claude/skills/sgp-sprint-review/SKILL.md` | After completing a sprint, before committing |
| Feature Ideation | `.claude/skills/sgp-feature-ideation/SKILL.md` | When a task is ambiguous or requires design decisions |

**Rule:** If a skill exists for the task type, reading it is mandatory — not optional.

## Tech Stack

- **Framework:** Next.js 15 (App Router, `app/` directory)
- **Language:** TypeScript (strict mode, no `any`)
- **Styling:** Tailwind CSS with custom color tokens
- **Components:** Radix UI (unstyled, accessible primitives)
- **Database:** PostgreSQL 16 via Supabase
- **ORM:** Prisma 5
- **Auth:** NextAuth.js v5 (Credentials provider, JWT sessions)
- **PDF:** @react-pdf/renderer
- **Forms:** react-hook-form + Zod validation
- **Icons:** lucide-react
- **Deploy:** Vercel (frontend + API) + Supabase (database)

## Common Commands

```bash
npm run dev                           # Start dev server
npm run build                         # Production build (catches TS errors)
npm run lint                          # ESLint

npx prisma generate                   # Regenerate Prisma Client after schema changes
npx prisma migrate dev                # Create and apply migration
npx prisma migrate dev --name <name>  # Named migration
npx prisma db seed                    # Seed: PricingConfig + PricingItems + initial User
npx prisma studio                     # Visual DB browser
```

## Architecture

**Monorepo — no separate backend.** API Routes and Server Actions live inside the Next.js app.

```
src/
├── app/
│   ├── (auth)/login/         # Public login page
│   ├── (app)/                # Authenticated layout with bottom nav
│   │   ├── dashboard/
│   │   ├── orcamentos/       # Quotes (list, [id], novo/)
│   │   ├── despesas/         # Expenses
│   │   ├── foco/             # Pomodoro + To-Do
│   │   └── configuracoes/    # Pricing, clients, company settings
│   └── api/                  # API routes (auth, pdf, telegram, cron)
├── components/
│   ├── ui/                   # Design system (Button, Input, Badge, Card, Toast, ComboCreate)
│   ├── forms/                # Reusable form components
│   ├── orcamento/            # Quote-specific components
│   ├── dashboard/
│   └── shared/               # ComboCreate, StatusBadge, etc.
├── lib/
│   ├── prisma.ts             # Prisma Client singleton
│   ├── auth.ts               # NextAuth config
│   ├── pdf.ts                # PDF generator
│   ├── telegram.ts           # Telegram Bot client
│   ├── format.ts             # BRL currency, phone, CNPJ formatters
│   └── utils.ts              # cn() helper (clsx + tailwind-merge)
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Key Conventions

### Language
- **UI strings, business domain names, and enums in Portuguese** (`Orcamento`, `Cliente`, `AGUARDANDO`, `APROVADO`, etc.)
- Infrastructure and utility code uses English

### Styling
- Custom Tailwind tokens: `mar`, `areia`, `poente`, `espuma`, `noite`, `ceu`, `creme`, `coral`, `floresta` (each with `DEFAULT`, `dark`, `light` variants)
- Fonts: `font-display` (Cormorant Garamond), `font-sans` (DM Sans), `font-mono` (DM Mono)
- Glass morphism via `.glass` utility class (`backdrop-filter: blur`)
- Mobile-first: **48px minimum tap targets**, bottom navigation (never hamburger menu)
- Use `cn()` from `src/lib/utils.ts` for conditional class merging

### Data & Validation
- Validate all inputs with Zod — both forms and Server Actions
- Server Actions preferred over API Routes for mutations
- Dates stored as UTC, displayed in America/Sao_Paulo timezone
- Passwords hashed with bcrypt (salt rounds: 12)
- Prisma type-safe queries only — never raw SQL

### Key UX Pattern: ComboCreate
Select + search + inline creation. When search yields no results, an inline mini-form expands (never a modal) to create the item on the spot. After creation, the new item is auto-selected. Full spec: `project-specs/03-mapa-de-telas.md`.

## Business Logic — Pricing Rules (Sprint 3 critical)

1. **Graduation on Débora's models:** `graduation_price = modeling_price × graduation_pct` (25% basic, 30% complex)
2. **Graduation on received models:** Fixed price per size — R$30 (basic) / R$35 (intermediate) / R$40 (complex)
3. **Pilot piece:** `pilot_price = modeling_price × 0.50`
4. **Category replication:** Modelagem → Graduação or → Piloto auto-applies the percentage rules above
5. **Discount cascade:** item discount → category discount → global discount (inside-out)

All configurable percentages live in the `PricingConfig` singleton table.

## Spec Reference

| File | Content |
|---|---|
| `project-specs/01-identidade-visual.md` | Color palette, typography, design principles, component patterns |
| `project-specs/02-funcionalidades.md` | All modules, features, business rules, ComboCreate behaviour |
| `project-specs/03-mapa-de-telas.md` | Screen map, navigation tree, UX flows, ComboCreate full spec |
| `project-specs/04-stack.md` | Tech stack details, folder structure, SOLID conventions |
| `project-specs/05-banco-de-dados.md` | Full Prisma schema, relationships, indexes, seed data |
| `project-specs/06-tabela-de-precos.md` | Official pricing table, calculation logic, real examples |
| `project-specs/07-roadmap.md` | Sprint roadmap with deliverables and acceptance criteria |

Sprint implementation plans: `sprints/sprint-01-fundacao.md` → `sprints/sprint-05-foco.md`
