# 03 — Mapa de Telas

## Estrutura de navegação

```
App
├── Login
├── (Tab) Dashboard
├── (Tab) Orçamentos
│   ├── Lista de Orçamentos
│   ├── Novo Orçamento
│   │   ├── Passo 1: Dados do cabeçalho
│   │   ├── Passo 2: Itens por categoria
│   │   └── Passo 3: Revisão e totais
│   └── Detalhe do Orçamento
│       └── PDF Preview
├── (Tab) Despesas
│   ├── Lista de Despesas
│   └── Nova Despesa
├── (Tab) Foco
│   ├── Timer Pomodoro
│   └── To-Do List
└── (Tab) Config
    ├── Tabela de Preços
    │   ├── Modelagem
    │   ├── Graduação
    │   ├── Digitalização
    │   ├── Encaixe
    │   ├── Plotagem
    │   └── Peças Piloto
    ├── Clientes
    │   ├── Lista de Clientes
    │   └── Cadastro / Edição
    ├── Parâmetros de Cálculo
    └── Dados da Prestadora
```

---

## Telas detalhadas

### T01 — Login
- Logo central (Logomarca.png)
- Campo e-mail + senha
- Sessão persistente (lembrar login)
- Sem cadastro — acesso único da Débora

---

### T02 — Dashboard
**Layout:** scroll vertical, mobile-first

**Seções:**
1. Saudação + data
2. Cards métricas (2 colunas):
   - Receita do mês
   - Orçamentos aguardando
   - Aprovados este mês
   - Total finalizado
3. Gráfico de barras — receita últimos 6 meses
4. Lista "Recentes" — últimos 5 orçamentos (card com status badge)
5. Atalhos rápidos: `+ Orçamento`, `+ Despesa`, `Iniciar Pomodoro`

**Filtros disponíveis:** período, cliente

---

### T03 — Lista de Orçamentos
**Layout:** lista com cards + FAB (+)

**Card de orçamento:**
- Nome do cliente
- Data de criação
- Valor total
- Badge de status (colorido)
- Indicador de itens (ex: "3 categorias")

**Filtros:**
- Status (pills horizontais scrolláveis)
- Cliente (select)
- Período (date range)

---

### T04 — Novo Orçamento (Passo 1)
**Campos:**
- Cliente (ComboCreate)
- Data de validade (date picker, padrão: +15 dias)
- Observações gerais (textarea, opcional)

---

### T05 — Novo Orçamento (Passo 2 — Itens)
**Layout:** seções por categoria, expansíveis

Cada seção de categoria:
- Header com nome da categoria + total parcial
- Botão `+ Adicionar item`
- Lista de itens adicionados
- Botão `Replicar para →` (abre sheet de seleção de destino)
- Botão `Ajuste em lote` (abre sheet com opções %)

**Item de orçamento:**
- Descrição (ComboCreate com serviços da categoria)
- Quantidade (número, mínimo 1)
- Valor unitário (monetário, editável)
- Desconto (%, opcional)
- Valor final (calculado, exibido em verde)
- Swipe left para remover

---

### T06 — Novo Orçamento (Passo 3 — Revisão)
**Seções:**
- Resumo do cabeçalho (cliente, validade)
- Subtotais por categoria
- Desconto global (campo opcional)
- Total bruto / Total líquido
- Botão "Criar Orçamento"

---

### T07 — Detalhe do Orçamento
**Header:**
- Nome do cliente + badge de status
- Data + validade
- Botão de mudança de status

**Corpo:**
- Dados da prestadora (Débora da Rosa, CNPJ)
- Tabela de itens por categoria
- Totais

**Rodapé de ações:**
- `Gerar PDF`
- `Enviar WhatsApp`
- `Duplicar`
- `Editar`

---

### T08 — Lista de Despesas
**Layout:** lista agrupada por mês

**Card de despesa:**
- Descrição
- Categoria (badge)
- Valor
- Data
- Cliente vinculado (se houver)

**Ações:**
- FAB (+) nova despesa
- Filtro por período / cliente
- Botão "Gerar relatório"

---

### T09 — Nova Despesa
**Campos:**
- Descrição (obrigatório)
- Categoria (ComboCreate)
- Valor (monetário)
- Data (date picker, padrão: hoje)
- Vincular a cliente (ComboCreate, opcional)
- Vincular a orçamento (select filtrado pelo cliente, opcional)

---

### T10 — Foco (Pomodoro + To-Do)
**Layout:** duas seções na mesma tela (scroll)

**Seção Pomodoro:**
- Timer grande (display circular)
- Indicador de sessão atual (1 de 4, etc)
- Tarefa atual selecionada
- Botões: Iniciar / Pausar / Pular
- Configuração: duração trabalho / pausa

**Seção To-Do:**
- Filtro: Hoje / Esta semana / Todas
- Cards de tarefa com:
  - Checkbox de conclusão
  - Descrição
  - Cliente vinculado
  - Badge de prioridade
  - Data de prazo
- FAB (+) nova tarefa

---

### T11 — Configurações — Tabela de Preços
**Layout:** lista de categorias, cada uma expansível

Por categoria:
- Listar itens cadastrados (nome + valor)
- Editar valor de cada item (inline)
- Adicionar novo item
- Deletar item (com confirmação)

**Parâmetros globais (seção separada):**
- % graduação básica
- % graduação complexa
- % peça piloto
- Valor/metro plotagem
- Km rodado

---

### T12 — Clientes
**Layout:** lista com busca + FAB (+)

**Card de cliente:**
- Iniciais (avatar colorido)
- Nome
- Quantidade de orçamentos
- Total acumulado

**Detalhe do cliente:**
- Dados completos
- Histórico de orçamentos
- Contato rápido (WhatsApp)

---

### T13 — Dados da Prestadora
- Upload de logo
- Nome / razão social / CNPJ
- Observações padrão do orçamento (textarea)
- Token do Bot Telegram (campo seguro)
- Chat ID do Telegram

---

## Padrão ComboCreate — especificação técnica de comportamento

### Estado: lista disponível (query vazia ou com resultados)
```
[campo de busca com ícone de lupa]
─────────────────────────────────
  ● Item A
  ● Item B
  ● Item C
```

### Estado: sem resultados
```
[campo de busca: "Nome não encontrado"]
─────────────────────────────────
  Nenhum resultado para "Nome não encontrado"
  [+ Cadastrar "Nome não encontrado" agora]
```

### Estado: mini-form aberto (inline, sem modal)
```
[campo de busca: "Nome não encontrado"]
─────────────────────────────────
  ┌─ Novo cliente ─────────────────┐
  │  Nome *      [_______________] │
  │  Telefone    [_______________] │
  │  [Cancelar]      [Salvar e usar│
  └────────────────────────────────┘
```

### Estado: após criar — seleção automática
```
[campo: "Nome não encontrado" ✓]
─────────────────────────────────
  Criado e selecionado com sucesso
```

### Regras de implementação
- Mini-form aparece como expansão inline dentro do dropdown, nunca como modal ou bottom sheet separado
- Ao cancelar: volta ao estado de "sem resultados" com o campo preenchido
- Ao salvar: fecha o dropdown, preenche o campo com o novo item, foca o próximo campo do formulário
- O item recém-criado deve ser imediatamente persistido no banco
- Campos opcionais do cadastro completo podem ser preenchidos depois em Configurações
