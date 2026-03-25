# 05 — Banco de Dados

## Schema Prisma completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────────
// USUÁRIO (acesso único — a Débora)
// ─────────────────────────────────────────────
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────────
// CLIENTES
// ─────────────────────────────────────────────
model Client {
  id        String    @id @default(cuid())
  name      String
  email     String?
  phone     String?
  instagram String?
  document  String?   // CPF ou CNPJ
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  quotes    Quote[]
  expenses  Expense[]
  tasks     Task[]

  @@map("clients")
}

// ─────────────────────────────────────────────
// CONFIGURAÇÃO DE PREÇOS
// ─────────────────────────────────────────────
model PricingItem {
  id          String      @id @default(cuid())
  category    ServiceCategory
  name        String
  description String?
  priceMin    Decimal     @db.Decimal(10, 2)
  priceMax    Decimal?    @db.Decimal(10, 2)
  unit        PricingUnit @default(PER_UNIT)
  active      Boolean     @default(true)
  sortOrder   Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("pricing_items")
}

model PricingConfig {
  id                      String   @id @default(cuid())
  graduationPctBasic      Decimal  @default(0.25) @db.Decimal(5, 4) // 25%
  graduationPctComplex    Decimal  @default(0.30) @db.Decimal(5, 4) // 30%
  pilotPct                Decimal  @default(0.50) @db.Decimal(5, 4) // 50%
  plottingPricePerMeter   Decimal  @default(8.50) @db.Decimal(10, 2)
  kmPrice                 Decimal  @default(1.50) @db.Decimal(10, 2)
  updatedAt               DateTime @updatedAt

  @@map("pricing_config")
}

// ─────────────────────────────────────────────
// ORÇAMENTOS
// ─────────────────────────────────────────────
model Quote {
  id            String      @id @default(cuid())
  clientId      String
  client        Client      @relation(fields: [clientId], references: [id])
  status        QuoteStatus @default(AGUARDANDO)
  discountPct   Decimal?    @db.Decimal(5, 4)
  discountFixed Decimal?    @db.Decimal(10, 2)
  totalGross    Decimal     @db.Decimal(10, 2)
  totalNet      Decimal     @db.Decimal(10, 2)
  notes         String?
  validUntil    DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  items     QuoteItem[]
  expenses  Expense[]
  tasks     Task[]

  @@map("quotes")
}

model QuoteItem {
  id            String          @id @default(cuid())
  quoteId       String
  quote         Quote           @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  category      ServiceCategory
  description   String
  quantity      Int             @default(1)
  unitPrice     Decimal         @db.Decimal(10, 2)
  discountPct   Decimal?        @db.Decimal(5, 4)
  discountFixed Decimal?        @db.Decimal(10, 2)
  finalPrice    Decimal         @db.Decimal(10, 2)
  sortOrder     Int             @default(0)
  // Referência ao item de origem (para rastrear replicações)
  sourceItemId  String?

  @@map("quote_items")
}

// ─────────────────────────────────────────────
// DESPESAS
// ─────────────────────────────────────────────
model Expense {
  id          String          @id @default(cuid())
  clientId    String?
  client      Client?         @relation(fields: [clientId], references: [id])
  quoteId     String?
  quote       Quote?          @relation(fields: [quoteId], references: [id])
  category    String
  description String
  amount      Decimal         @db.Decimal(10, 2)
  date        DateTime
  createdAt   DateTime        @default(now())

  @@map("expenses")
}

// ─────────────────────────────────────────────
// TAREFAS (TO-DO)
// ─────────────────────────────────────────────
model Task {
  id               String       @id @default(cuid())
  clientId         String?
  client           Client?      @relation(fields: [clientId], references: [id])
  quoteId          String?
  quote            Quote?       @relation(fields: [quoteId], references: [id])
  title            String
  priority         TaskPriority @default(NORMAL)
  dueDate          DateTime?
  completedAt      DateTime?
  telegramNotified Boolean      @default(false)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  pomodoroSessions PomodoroSession[]

  @@map("tasks")
}

// ─────────────────────────────────────────────
// SESSÕES POMODORO
// ─────────────────────────────────────────────
model PomodoroSession {
  id          String   @id @default(cuid())
  taskId      String?
  task        Task?    @relation(fields: [taskId], references: [id])
  durationMin Int      @default(25)
  startedAt   DateTime @default(now())
  completedAt DateTime?
  completed   Boolean  @default(false)

  @@map("pomodoro_sessions")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
enum ServiceCategory {
  DIGITALIZACAO
  MODELAGEM
  GRADUACAO
  ENCAIXE
  PLOTAGEM
  PILOTO
  CONVERSAO
  CONSULTORIA
  OUTROS
}

enum PricingUnit {
  PER_UNIT      // por unidade / por modelo
  PER_METER     // por metro (plotagem)
  PER_FILE      // por arquivo (encaixe, conversão)
  PER_SIZE      // por tamanho (graduação)
  PER_HOUR      // por hora (consultoria)
  PER_KM        // por km (deslocamento)
  PERCENTAGE    // percentual (graduação sobre modelagem)
}

enum QuoteStatus {
  AGUARDANDO
  APROVADO
  EM_ANDAMENTO
  FINALIZADO
  CANCELADO
}

enum TaskPriority {
  ALTA
  NORMAL
  BAIXA
}
```

---

## Relacionamentos

```
User
  (acesso único — sem FK para outros modelos)

Client 1──N Quote
Client 1──N Expense
Client 1──N Task

Quote 1──N QuoteItem
Quote 1──N Expense
Quote 1──N Task

Task 1──N PomodoroSession

PricingItem (tabela de referência — sem FK)
PricingConfig (tabela de configuração — singleton)
```

---

## Índices recomendados

```sql
-- Buscas frequentes
CREATE INDEX idx_quotes_client_id     ON quotes(client_id);
CREATE INDEX idx_quotes_status        ON quotes(status);
CREATE INDEX idx_quotes_created_at    ON quotes(created_at DESC);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_expenses_client_id   ON expenses(client_id);
CREATE INDEX idx_expenses_date        ON expenses(date DESC);
CREATE INDEX idx_tasks_due_date       ON tasks(due_date);
CREATE INDEX idx_tasks_completed_at   ON tasks(completed_at);
CREATE INDEX idx_pricing_items_cat    ON pricing_items(category, active);
```

---

## Dados iniciais (seed)

```typescript
// prisma/seed.ts

// PricingConfig — singleton com valores padrão da Débora
await prisma.pricingConfig.create({
  data: {
    graduationPctBasic:    0.25,
    graduationPctComplex:  0.30,
    pilotPct:              0.50,
    plottingPricePerMeter: 8.50,
    kmPrice:               1.50,
  }
})

// PricingItems — tabela oficial de preços
const pricingItems = [
  // MODELAGEM
  { category: 'MODELAGEM', name: 'Modelagem básica (camiseta, regata)',           priceMin: 100, priceMax: 120 },
  { category: 'MODELAGEM', name: 'Modelagem intermediária 1 (t-shirt, cropped)',  priceMin: 130, priceMax: 130 },
  { category: 'MODELAGEM', name: 'Modelagem intermediária 2 (blusão, calça mol)', priceMin: 140, priceMax: 140 },
  { category: 'MODELAGEM', name: 'Modelagem elaborada/fashion 1 (top, botton)',   priceMin: 150, priceMax: 180 },
  { category: 'MODELAGEM', name: 'Modelagem elaborada/fashion 2 (vestido, mac.)', priceMin: 180, priceMax: 230 },
  { category: 'MODELAGEM', name: 'Modelagem alfaiataria simples',                 priceMin: 200, priceMax: 250 },
  { category: 'MODELAGEM', name: 'Modelagem alfaiataria elaborada',               priceMin: 250, priceMax: 350 },
  { category: 'MODELAGEM', name: 'Alteração de modelagem – arquivo',              priceMin: 40,  priceMax: 150 },
  // ENCAIXE
  { category: 'ENCAIXE', name: 'Encaixe molde – tamanho base',    priceMin: 12,  unit: 'PER_FILE' },
  { category: 'ENCAIXE', name: 'Encaixe produção – 1 TEC',        priceMin: 15,  unit: 'PER_FILE' },
  { category: 'ENCAIXE', name: 'Encaixe elaborado – 2 TEC',       priceMin: 18,  unit: 'PER_FILE' },
  { category: 'ENCAIXE', name: 'Encaixe elaborado – 3 TEC',       priceMin: 22,  unit: 'PER_FILE' },
  { category: 'ENCAIXE', name: 'Encaixe elaborado – 4 TEC',       priceMin: 25,  unit: 'PER_FILE' },
  { category: 'ENCAIXE', name: 'Referência adicional – acréscimo', priceMin: 5,  unit: 'PER_FILE' },
  { category: 'ENCAIXE', name: 'Geração de consumo',              priceMin: 15,  unit: 'PER_FILE' },
  // PLOTAGEM
  { category: 'PLOTAGEM', name: 'Plotagem (até 91 cm largura)', priceMin: 8.50, unit: 'PER_METER' },
  // GRADUAÇÃO (molde recebido — valores fixos)
  { category: 'GRADUACAO', name: 'Graduação básica (molde recebido)',        priceMin: 30, unit: 'PER_SIZE' },
  { category: 'GRADUACAO', name: 'Graduação intermediária (molde recebido)', priceMin: 35, unit: 'PER_SIZE' },
  { category: 'GRADUACAO', name: 'Graduação elaborada (molde recebido)',     priceMin: 40, unit: 'PER_SIZE' },
  // DIGITALIZAÇÃO
  { category: 'DIGITALIZACAO', name: 'Básico 1 – até 2 partes',          priceMin: 30 },
  { category: 'DIGITALIZACAO', name: 'Básico 2 – até 3 partes',          priceMin: 45 },
  { category: 'DIGITALIZACAO', name: 'Intermediário 1 – de 4 a 8 partes', priceMin: 60 },
  { category: 'DIGITALIZACAO', name: 'Intermediário 2 – de 9 a 12 partes',priceMin: 75 },
  { category: 'DIGITALIZACAO', name: 'Elaborado – acima de 13 partes',    priceMin: 90 },
  // CONVERSÃO
  { category: 'CONVERSAO', name: 'Conversão plt/pdf – por arquivo',      priceMin: 15,  unit: 'PER_FILE' },
  { category: 'CONVERSAO', name: 'Conversão pacote 10–30 arquivos',      priceMin: 80  },
  { category: 'CONVERSAO', name: 'Conversão pacote até 30 arquivos',     priceMin: 200 },
  // CONSULTORIA
  { category: 'CONSULTORIA', name: 'Assessoria – 1 hora',                priceMin: 130, unit: 'PER_HOUR' },
  { category: 'CONSULTORIA', name: 'Assessoria – acima de 10 horas',     priceMin: 100, unit: 'PER_HOUR' },
  { category: 'CONSULTORIA', name: 'Aula particular',                    priceMin: 125, unit: 'PER_HOUR' },
  { category: 'CONSULTORIA', name: 'Diária presencial na empresa',       priceMin: 400 },
]
```
