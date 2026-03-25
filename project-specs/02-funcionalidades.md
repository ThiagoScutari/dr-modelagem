# 02 — Funcionalidades

## Módulos do sistema

---

### 1. Dashboard

**Objetivo:** Visão geral rápida do negócio ao abrir o app.

**Funcionalidades:**
- Cards de resumo: receita do mês, orçamentos aguardando, aprovados, finalizados
- Gráfico de receita mensal (últimos 6 meses)
- Lista de orçamentos recentes (últimos 5)
- Atalhos rápidos: Novo Orçamento, Nova Despesa, Pomodoro
- Filtro por período: semana / mês / trimestre / personalizado
- Filtro por cliente

---

### 2. Orçamentos

**Objetivo:** Criar, gerenciar e enviar orçamentos profissionais.

#### 2.1 Lista de Orçamentos
- Listagem com card por orçamento (cliente, data, valor, status)
- Busca por cliente ou descrição
- Filtro por status: Aguardando / Aprovado / Em Andamento / Finalizado / Cancelado
- Filtro por período e por cliente

#### 2.2 Criação de Orçamento — fluxo principal

**Passo 1 — Dados do cabeçalho:**
- Seleção de cliente (com criação inline se não encontrado)
- Data de validade
- Observações gerais

**Passo 2 — Adição de itens por categoria:**

Categorias disponíveis:
- Digitalização de Moldes
- Modelagem
- Graduação
- Encaixe
- Plotagem
- Peças Piloto

Para cada item:
- Descrição (seleção de serviço cadastrado ou digitação livre)
- Quantidade
- Valor unitário (pré-preenchido da tabela de preços, editável)
- Desconto individual (% ou R$)

**Passo 3 — Totais e descontos:**
- Desconto global sobre o total (% ou R$)
- Subtotais por categoria
- Total bruto e total líquido
- Preview do total em tempo real

#### 2.3 Funcionalidades avançadas de orçamento

**Ajuste em lote:**
- Selecionar categoria ou todos os itens
- Aplicar desconto ou acréscimo global por % ou valor fixo
- Aplicar sobre valor bruto ou sobre valor atual

**Replicar categoria → outra categoria:**
- Selecionar categoria origem (ex: Modelagem)
- Selecionar categoria destino (ex: Graduação ou Peças Piloto)
- Sistema replica os itens aplicando a lógica de preço automaticamente:
  - Modelagem → Graduação: aplica percentual de graduação configurado (padrão 25%)
  - Modelagem → Peças Piloto: aplica percentual de piloto configurado (padrão 50%)
  - Outras combinações: replica com o mesmo valor, editável

**Criação contextual inline (ComboCreate):**
- Ao buscar um cliente não cadastrado: botão "Cadastrar [nome] agora" abre mini-form inline
- Ao buscar serviço não configurado: botão "Configurar [serviço] com preço" abre mini-form inline
- Após criar, item já aparece selecionado automaticamente

#### 2.4 Detalhe do orçamento
- Visualização completa formatada
- Botão de mudança de status (fluxo: Aguardando → Aprovado → Em Andamento → Finalizado)
- Geração de PDF com logo, dados da prestadora, CNPJ e observações
- Envio por WhatsApp (link wa.me com mensagem pré-formatada)
- Envio por e-mail
- Duplicar orçamento (base para novos orçamentos similares)

---

### 3. Despesas

**Objetivo:** Registrar e reportar despesas vinculadas a clientes ou ao escritório.

**Funcionalidades:**
- Lançamento de despesas com: descrição, categoria, valor, data
- Vínculo opcional a cliente e/ou orçamento
- Categorias configuráveis (ex: deslocamento, material, uber, alimentação)
- Lista com filtro por período e por cliente
- Relatório de despesas exportável em PDF
- Relatório pode ser enviado diretamente ao cliente

**Categorias pré-definidas (configuráveis):**
- Deslocamento (Km)
- Transporte (Uber/mototáxi)
- Material
- Alimentação
- Outros

---

### 4. Configurações

**Objetivo:** Gerenciar a tabela de preços e dados do sistema.

#### 4.1 Tabela de Preços por Serviço

Para cada categoria, é possível gerenciar itens com:
- Nome / descrição
- Valor padrão (ou faixa min-max)
- Tipo de unidade (por arquivo, por metro, por hora, por tamanho, por modelo)

**Categorias configuráveis:**
- Digitalização de Moldes (com faixas por número de partes)
- Modelagem (com níveis de complexidade)
- Graduação (percentual e/ou valor fixo por molde recebido)
- Encaixe (por tipo e número de tecidos)
- Plotagem (por metro)
- Peças Piloto (percentual sobre modelagem)

#### 4.2 Parâmetros globais de cálculo

| Parâmetro | Padrão | Descrição |
|---|---|---|
| Percentual de graduação (básico) | 25% | Aplicado sobre valor da modelagem |
| Percentual de graduação (complexo) | 30% | Para moldes com muitos recortes/torções |
| Percentual de peça piloto | 50% | Aplicado sobre valor da modelagem |
| Valor plotagem por metro | R$ 8,50 | Editável globalmente |
| Km rodado | R$ 1,50 | Para cálculo de deslocamento |

#### 4.3 Cadastro de Clientes
- Nome, e-mail, telefone, Instagram, CNPJ/CPF, observações
- Histórico de orçamentos vinculados
- Contato rápido (WhatsApp direto)

#### 4.4 Dados da Prestadora
- Nome, razão social, CNPJ
- Logo (upload)
- Observações padrão do orçamento (texto editável)
- Configuração do Bot Telegram

---

### 5. Clientes

**Objetivo:** CRUD completo de clientes com histórico.

**Funcionalidades:**
- Lista com busca
- Cadastro completo
- Histórico de orçamentos por cliente
- Total recebido / a receber por cliente
- Contato rápido via WhatsApp

---

### 6. Foco — Pomodoro

**Objetivo:** Ajudar a Débora a manter concentração durante o trabalho.

**Funcionalidades:**
- Timer Pomodoro configurável (padrão: 25min trabalho / 5min pausa)
- Seleção da tarefa em andamento (vinculada ao To-Do)
- Indicador visual do ciclo atual
- Notificação sonora e visual ao fim da sessão
- Histórico de sessões do dia
- Total de horas focadas (semana / mês)

---

### 7. To-Do List

**Objetivo:** Lista de tarefas vinculada ao trabalho em andamento, com notificações.

**Funcionalidades:**
- Tarefas geradas automaticamente a partir de orçamentos aprovados
- Criação manual de tarefas
- Vínculo opcional a cliente e/ou orçamento
- Prioridade: Alta / Normal / Baixa
- Prazo com lembrete
- Check de conclusão com registro de data/hora
- Notificação via Telegram Bot (configurável: horário e frequência)

**Geração automática de tarefas:**
- Quando orçamento muda para "Aprovado": cria tarefa "Iniciar [serviços] — [cliente]"
- Quando prazo de validade se aproxima: alerta de acompanhamento
- Quando orçamento muda para "Em Andamento": cria subtarefas por categoria

---

## Padrão UX — Criação Contextual Inline (ComboCreate)

Este padrão se aplica em TODOS os campos de seleção do sistema:

### Comportamento
1. Usuária digita no campo de busca
2. Se nenhum resultado encontrado → exibe estado vazio com mensagem e botão de criar
3. Botão abre mini-formulário inline (sem modal, sem navegação)
4. Mini-formulário pede apenas o mínimo necessário
5. Ao salvar: item criado + automaticamente selecionado no campo original
6. Fluxo principal continua sem interrupção

### Campos que aplicam ComboCreate
- Seleção de cliente (em orçamentos e despesas)
- Seleção de serviço por categoria (em itens de orçamento)
- Seleção de categoria de despesa
- Vinculação de tarefa a orçamento

### Mini-formulários mínimos

**Novo cliente:**
- Nome (obrigatório)
- Telefone (opcional)

**Novo serviço/modelagem:**
- Descrição (obrigatório)
- Valor padrão (obrigatório)

**Nova categoria de despesa:**
- Nome (obrigatório)
