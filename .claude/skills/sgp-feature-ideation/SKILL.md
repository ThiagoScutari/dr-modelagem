---
name: sgp-feature-ideation
description: >
  Contexto de negócio e ideação de features para o SGP Costura (DRX Têxtil).
  Use esta SKILL sempre que for sugerir novas funcionalidades, avaliar viabilidade
  de features, pensar em melhorias de processo, ou explorar o potencial SaaS do
  sistema. Também use ao responder "o que mais podemos fazer?", "como melhorar X?",
  ou qualquer pedido de brainstorming, roadmap, ou visão de produto. Esta SKILL
  fornece contexto real do negócio têxtil para que sugestões sejam práticas e
  relevantes para o chão de fábrica — não ideias genéricas de software.
---

# SGP Costura — Contexto de Negócio e Feature Ideation

## O Negócio: DRX Têxtil

**O que fazem:** Fabricação de peças de vestuário (camisas, calças, uniformes).
O processo produtivo é dividido em **operações sequenciais** executadas por
costureiras especializadas em postos de trabalho específicos.

**Atores principais:**
- **Costureira** — executa operações no chão de fábrica, usa tablet/celular
- **Supervisor** — balanceia carga, publica planejamentos, monitora produção
- **Admin** — gerencia usuários, importa PSOs, configura turnos
- **Viewer** — gerente/dono, vê dashboards sem intervir

**Fluxo produtivo atual:**
```
PSO (PDF do cliente)
  → Importação via GPT-4o (extrai operações + tempos)
  → Cockpit VAC (balanceia costureiras por operação)
  → Planejamento publicado
  → Monitor de Fábrica (costureiras executam lote a lote)
  → Dashboard BI (analytics de eficiência)
```

**O que é um PSO?** Planilha de Sequência de Operações — documento do
cliente que lista cada operação necessária para costurar uma peça,
o tempo padrão (em segundos) e a máquina necessária.

**O que é um CartLote?** Carrinho físico com lotes de peças que circula
entre os postos. Cada costureira dá "checkout" ao terminar seu lote.

**O que é TL (Tempo de Lote)?** Tempo calculado para completar um lote
no posto mais lento. Usado para sincronizar o ritmo da linha.

---

## Contexto Estratégico — Visão SaaS

Um consultor LEAN do SENAI visitou a DRX, viu o sistema em operação
e expressou forte interesse. Isso abre a possibilidade de evoluir o
SGP Costura para um **produto SaaS multi-tenant** para o setor têxtil.

**Segmento-alvo:** Confecções de médio porte (20-200 costureiras)
que ainda usam planilhas Excel ou papel para gestão de produção.

**Diferenciais competitivos atuais:**
- Importação de PSO via IA (GPT-4o) — único no mercado
- Balanceamento visual em tempo real (Cockpit VAC)
- Monitor de fábrica para chão de fábrica sem treinamento
- Audit trail completo de produção

---

## Features por Dimensão

### 🏭 Chão de Fábrica (Operacional)

**Alto impacto, baixa complexidade:**
- **Modo offline para o Monitor** — costureira continua registrando
  checkouts sem internet, sincroniza quando reconectar
- **Notificações de gargalo** — alertar supervisor quando um posto
  está atrasando o fluxo (TL ultrapassado em X%)
- **QR Code por posto** — costureira escaneia para iniciar operação
  sem precisar selecionar manualmente
- **Histórico por costureira** — quantas peças produziu por dia/semana,
  evolução da eficiência individual

**Médio impacto, média complexidade:**
- **Gestão de manutenção de máquinas** — vincular paradas de produção
  a máquinas específicas, gerar relatório de downtime
- **Controle de qualidade inline** — registrar rejeições por operação,
  calcular % de defeitos por costureira/posto
- **Treinamento cruzado** — registrar quais operações cada costureira
  sabe executar, sugerir alocação baseada em polivalência

### 📊 Analytics e Inteligência

**Alto impacto:**
- **OEE (Overall Equipment Effectiveness)** — disponibilidade ×
  performance × qualidade por posto e por turno
- **Previsão de conclusão de OP** — com base no ritmo atual,
  quando a OP vai terminar? Alertar se vai atrasar entrega
- **Comparativo de eficiência entre PSOs** — qual produto é mais
  rentável de produzir com a equipe atual?
- **Heatmap de produção** — visualização por hora do dia dos
  períodos de maior/menor produtividade

**Médio impacto:**
- **Export de relatórios** — PDF/Excel de produção por período
  para enviar ao cliente ou para a gerência
- **Alertas por WhatsApp/email** — notificar supervisor quando
  OP está atrasada ou costureira está parada há X minutos

### 🧠 IA e Automação

**Diferencial competitivo:**
- **Sugestão automática de balanceamento** — IA sugere alocação
  ótima de costureiras baseada em histórico de eficiência individual
- **Detecção de anomalias** — identificar automaticamente costureiras
  com queda súbita de produtividade (possível problema pessoal/saúde)
- **Otimização de sequência de OPs** — sugerir qual OP iniciar
  a seguir para maximizar utilização da linha
- **Chat com os dados** — supervisor pergunta "qual foi nossa
  eficiência essa semana?" em linguagem natural

### 🏢 Multi-tenant / SaaS

**Para expansão do produto:**
- **Onboarding self-service** — nova confecção cria conta,
  configura costureiras e turnos em 30 minutos
- **Planos por tamanho** — Free (até 10 costureiras),
  Pro (até 50), Enterprise (ilimitado)
- **White-label** — confecções maiores com marca própria
- **Marketplace de PSOs** — biblioteca de PSOs pré-importados
  para produtos padronizados (camiseta básica, calça jeans etc.)
- **Benchmarking anônimo** — como minha eficiência compara
  com outras confecções do mesmo porte?

### 🎨 UX e Acessibilidade

- **PWA (Progressive Web App)** — instalar o Monitor na home
  screen do tablet sem app store
- **Modo escuro nativo** — para fábricas com iluminação específica
- **Tamanho de fonte ajustável** — costureiras mais velhas
- **Suporte a leitor de QR** — câmera do tablet para checkout
- **Dashboard em TV** — modo kiosk para exibir produção em
  tempo real em telão no chão de fábrica

---

## Princípios para Avaliar Features

Antes de propor uma feature, verificar:

1. **Resolve dor real do chão de fábrica?**
   Costureiras e supervisores têm tempo e contexto limitados.
   Features que exigem muitos cliques ou treinamento não são adotadas.

2. **Funciona sem internet estável?**
   Fábricas têm WiFi instável. Features críticas devem funcionar
   offline ou degradar graciosamente.

3. **É mensurável?**
   Toda feature deve ter uma métrica de sucesso:
   "reduz tempo de setup em X min", "aumenta eficiência em Y%"

4. **É compatível com a stack atual?**
   FastAPI + Vanilla JS + PostgreSQL. Sem React, sem microserviços.
   Novas features devem seguir os ADRs estabelecidos.

5. **Qual o esforço vs impacto?**
   Priorizar features de alto impacto e baixa complexidade primeiro.
   Features de médio/alto esforço exigem debate arquitetural.

---

## Roadmap Sugerido — Próximos 6 Meses

| Trimestre | Foco | Features prioritárias |
|-----------|------|-----------------------|
| Q2 2026 | Cobertura de testes + CI/CD | Sprint 40 (testes) + pipeline |
| Q2 2026 | Estabilidade | Tailwind CLI, JWT HttpOnly, indexes |
| Q3 2026 | Analytics avançado | Previsão de conclusão, OEE, export PDF |
| Q3 2026 | UX mobile | PWA, QR Code checkout, fonte ajustável |
| Q4 2026 | Fundação SaaS | Multi-tenant schema, onboarding |
| Q4 2026 | IA avançada | Sugestão de balanceamento, chat com dados |