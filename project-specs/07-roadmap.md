# 07 — Roadmap de Sprints

## Visão geral

| Sprint | Foco | Entregáveis principais |
|---|---|---|
| 1 | Fundação & Identidade | Setup, design system, auth, layout base |
| 2 | Configurações & Clientes | Tabela de preços, cadastro de clientes |
| 3 | Módulo de Orçamentos | CRUD completo, PDF, replicação, WhatsApp |
| 4 | Dashboard & Despesas | Métricas, gráficos, despesas, relatórios |
| 5 | Foco, To-Do & Telegram | Pomodoro, lista de tarefas, notificações |

---

## Sprint 1 — Fundação & Identidade

### Objetivo
Estrutura base sólida e funcional. Ao final deste sprint o app já abre, autentica e exibe o layout com a identidade visual correta.

### Tarefas

**Setup & infraestrutura:**
- [ ] Criar projeto Next.js 15 + TypeScript
- [ ] Configurar Tailwind CSS com a paleta da DR Modelagem
- [ ] Instalar e configurar Radix UI
- [ ] Configurar ESLint + Prettier
- [ ] Setup Prisma + Supabase (PostgreSQL)
- [ ] Rodar primeira migration com schema completo
- [ ] Seed inicial (PricingConfig + PricingItems)
- [ ] Deploy inicial na Vercel

**Autenticação:**
- [ ] Configurar NextAuth.js v5 (Credentials provider)
- [ ] Tela de login com logo e identidade visual
- [ ] Middleware de proteção de rotas autenticadas
- [ ] Sessão persistente (remember me)

**Design System:**
- [ ] Importar fontes: Cormorant Garamond + DM Sans + DM Mono
- [ ] Criar tokens CSS com variáveis da paleta
- [ ] Componente `Button` (primary, secondary, ghost, danger)
- [ ] Componente `Input` (text, number, currency, date)
- [ ] Componente `Badge` / `StatusBadge` (status dos orçamentos)
- [ ] Componente `Card` (base e variantes)
- [ ] Componente `ComboCreate` (select + busca + criação inline)
- [ ] Logo em variantes (preta, branca, mar-profundo)

**Layout base:**
- [ ] Bottom Navigation Bar (5 abas)
- [ ] Header mobile com título de tela + ações contextuais
- [ ] Layout wrapper com safe areas (iOS/Android)
- [ ] Loading states e Skeleton screens

### Critério de aceite
- App abre na URL da Vercel
- Login funciona com credenciais da Débora
- Navegação entre as 5 abas funciona
- Design system visualmente idêntico ao definido nos specs

---

## Sprint 2 — Configurações & Clientes

### Objetivo
A Débora consegue cadastrar seus preços, configurar os parâmetros de cálculo e gerenciar clientes.

### Tarefas

**Tabela de preços:**
- [ ] Tela de configurações com seções por categoria
- [ ] Listagem de itens por categoria (com valores)
- [ ] Edição inline de valor de cada item
- [ ] Adicionar novo item de serviço (por categoria)
- [ ] Deletar item com confirmação
- [ ] Toast de feedback (salvo / erro)

**Parâmetros globais:**
- [ ] Tela de parâmetros com campos editáveis:
  - % Graduação básica
  - % Graduação complexa
  - % Peça piloto
  - R$/metro plotagem
  - R$/km deslocamento
- [ ] Salvar parâmetros com confirmação

**Clientes:**
- [ ] Lista de clientes com busca
- [ ] Formulário de cadastro/edição (ComboCreate compatível)
- [ ] Detalhe do cliente (dados + histórico vazio por enquanto)
- [ ] Deletar cliente (com alerta se houver orçamentos vinculados)

**Dados da prestadora:**
- [ ] Tela com formulário: nome, razão social, CNPJ
- [ ] Upload/exibição da logo
- [ ] Observações padrão do orçamento (textarea)

### Critério de aceite
- Débora consegue alterar qualquer preço da tabela
- Parâmetros de cálculo são persistidos corretamente
- CRUD de clientes funcional e fluido

---

## Sprint 3 — Módulo de Orçamentos

### Objetivo
Core do sistema. A Débora consegue criar um orçamento completo, enviar como PDF e gerenciar o status.

### Tarefas

**Criação de orçamento — fluxo guiado:**
- [ ] Passo 1: seleção de cliente (ComboCreate) + validade + notas
- [ ] Passo 2: adição de itens por categoria
  - [ ] Seleção de serviço (ComboCreate com itens configurados)
  - [ ] Campo de quantidade e valor unitário
  - [ ] Desconto individual (% ou R$)
  - [ ] Total do item calculado em tempo real
  - [ ] Swipe para remover item
- [ ] Passo 3: revisão com subtotais + desconto global + total

**Funcionalidades avançadas:**
- [ ] Replicar categoria → outra (sheet de seleção de destino)
- [ ] Aplicar % de graduação automaticamente ao replicar para Graduação
- [ ] Aplicar % de piloto automaticamente ao replicar para Piloto
- [ ] Ajuste em lote (modal com tipo de ajuste + valor)

**Gestão:**
- [ ] Lista de orçamentos com filtros (status, cliente, período)
- [ ] Detalhe do orçamento (visualização formatada)
- [ ] Mudança de status (botão com fluxo lógico)
- [ ] Duplicar orçamento
- [ ] Editar orçamento existente

**PDF & Compartilhamento:**
- [ ] Template PDF com logo, dados prestadora, tabela, total, observações
- [ ] Botão "Gerar PDF" → download
- [ ] Botão "Enviar WhatsApp" → link wa.me com mensagem pré-formatada

### Critério de aceite
- Orçamento do exemplo real (CEI Menino Jesus — R$ 1.450,00) reproduzido corretamente
- Replicação de Modelagem → Graduação com percentual correto
- Replicação de Modelagem → Piloto com 50%
- PDF gerado com identidade visual e dados corretos

---

## Sprint 4 — Dashboard & Despesas

### Objetivo
Visão gerencial do negócio e controle de despesas.

### Tarefas

**Dashboard:**
- [ ] Cards de métricas: receita do mês, orçamentos por status
- [ ] Gráfico de barras (receita últimos 6 meses) — Chart.js
- [ ] Lista de orçamentos recentes
- [ ] Atalhos rápidos
- [ ] Filtros de período e cliente

**Despesas:**
- [ ] Lista de despesas agrupada por mês
- [ ] Formulário de nova despesa (ComboCreate para cliente/categoria)
- [ ] Edição e exclusão
- [ ] Filtros

**Relatórios:**
- [ ] PDF de relatório de despesas por período
- [ ] Opção de enviar relatório ao cliente

### Critério de aceite
- Dashboard exibe dados reais do banco
- Filtros funcionam corretamente
- PDF de despesas gerado e formatado

---

## Sprint 5 — Foco, To-Do & Telegram

### Objetivo
Ferramentas de produtividade integradas ao fluxo de trabalho.

### Tarefas

**Pomodoro:**
- [ ] Timer circular com estados: idle, rodando, pausado, intervalo
- [ ] Configuração de duração (trabalho e pausa)
- [ ] Seleção de tarefa vinculada
- [ ] Notificação sonora ao fim
- [ ] Registro de sessão no banco

**To-Do:**
- [ ] Lista com filtro Hoje / Semana / Todas
- [ ] Criação manual de tarefa
- [ ] Geração automática ao aprovar orçamento
- [ ] Check de conclusão
- [ ] Prioridade e prazo

**Telegram Bot:**
- [ ] Configuração do Bot Token + Chat ID na tela de prestadora
- [ ] Notificação: tarefa com prazo em 24h
- [ ] Notificação: orçamento sem resposta após X dias
- [ ] Notificação: resumo diário de pendências (horário configurável)
- [ ] Webhook via API Route do Next.js

### Critério de aceite
- Pomodoro funciona com som e registro no banco
- Tarefas geradas automaticamente ao aprovar orçamento
- Notificação Telegram recebida na conta da Débora

---

## Após os sprints — backlog futuro

| Feature | Descrição |
|---|---|
| PWA | Instalar o app na tela inicial do celular |
| Modo offline | Rascunho de orçamento sem internet |
| Relatório anual | PDF consolidado do ano fiscal |
| Múltiplos usuários | Eventual expansão para equipe |
| Integração NF | Pré-preenchimento de nota fiscal |
