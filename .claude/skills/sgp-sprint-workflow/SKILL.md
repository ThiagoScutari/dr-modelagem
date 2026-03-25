---
name: sgp-sprint-workflow
description: >
  Workflow obrigatório de desenvolvimento do SGP Costura (DRX Têxtil). Use esta
  SKILL sempre que for iniciar qualquer tarefa de desenvolvimento no SGP Costura —
  correção de bug, nova feature, refatoração, migração de banco, ou atualização de
  testes. Esta SKILL define o ritual completo: inspeção → feedback → aprovação →
  implementação → testes → commits atômicos. Nunca pule etapas. Nunca implemente
  sem inspeção prévia aprovada pelo arquiteto. Use também ao planejar sprints,
  escrever PRDs, ou estruturar prompts de implementação.
---

# SGP Costura — Workflow de Sprint

## Filosofia Central

**A IA é o estagiário sênior, o humano é o arquiteto.**

- Nunca tome decisões arquiteturais sem debate
- Nunca implemente sem inspeção prévia aprovada
- Nunca commite sem pytest verde
- Sempre commits atômicos por bug/feature

---

## O Ritual — 7 Passos Obrigatórios

### Passo 1 — Inspeção Cirúrgica

**Antes de qualquer implementação**, gerar prompt de inspeção para o Claude Code.
A inspeção deve:
- Mostrar arquivo, linha e código literal exato
- NÃO sugerir correções ainda
- NÃO modificar nenhum arquivo

```
# Formato do prompt de inspeção
Read docs/knowledge-base.md and docs/PRD_Sprint_NN_*.md.

Do NOT implement anything yet. Inspection only.

1. [Item a inspecionar]
   - Show exact file:line and literal code
   - Confirm [condição específica]

2. [Próximo item]
   ...
```

### Passo 2 — Feedback e Análise

O arquiteto recebe o resultado da inspeção e reporta aqui.
Claude analisa:
- ✅ Confirmado — gap real, proceder
- ❌ Falso positivo — descartar, documentar
- ⚠️ Parcial — ajustar escopo antes de implementar

**Nunca avançar sem este passo.**

### Passo 3 — Aprovação

O arquiteto aprova explicitamente cada item confirmado.
Claude aguarda aprovação antes de gerar prompts de implementação.

### Passo 4 — Implementação

Gerar prompt de implementação para o Claude Code com:
- Ordem explícita de execução
- Arquivos e linhas exatas a modificar
- NÃO rodar pytest ainda
- NÃO commitar ainda

```
# Formato do prompt de implementação
Implement in this exact order. Do NOT run pytest until all changes complete.

── ITEM 1 ──────────────────────────
File: app/routers/xxx.py

[mudança específica com código exato]

── ITEM 2 ──────────────────────────
...

── AFTER ALL CHANGES ────────────────
docker-compose up -d --build
docker-compose exec api python -m pytest app/tests/ -v

Target: NNN passed, 0 failed.
Do NOT commit until approved.
```

### Passo 5 — Testes

O Claude Code reporta resultado do pytest.
Claude analisa:
- ✅ `NNN passed, 0 failed` → aprovado para commit
- ❌ Falhas → identificar causa, corrigir, repetir pytest

**Nunca commitar com testes falhando.**

### Passo 6 — Commits Atômicos

Um commit por bug/feature. Nunca agrupar mudanças não relacionadas.

```bash
# Formato de commit message
tipo(escopo): descrição curta em português [ID]

# Tipos válidos
feat     — nova feature
fix      — correção de bug
test     — apenas testes
docs     — documentação
refactor — refatoração sem mudança de comportamento
perf     — melhoria de performance
devops   — infraestrutura, CI, Docker
security — mudança de segurança

# Exemplos reais do projeto
fix(security): load SECRET_KEY from environment variable [S38-01]
feat(db): add FK indexes migration sprint 39 [S39-01]
fix(frontend): wrap API data with safeText() in page_03.html [S38-03]
test(sprint38): add 9 tests for unauthenticated routes and SECRET_KEY
```

### Passo 7 — PR e Merge

Abrir PR com descrição estruturada:
- O que muda (por item)
- Resultado dos testes
- Verificação manual realizada
- Checklist de aceite

Merge apenas após aprovação do arquiteto.

---

## Estrutura de PRD

Todo sprint começa com um PRD salvo em `docs/PRD_SprintNN_*.md`.

```markdown
# PRD — Sprint NN: Título
**Status:** Aprovação Pendente
**Origem:** [auditoria / bug report / feature request]

## Sumário Executivo
| ID | Severidade | Descrição | Esforço |

## SNN-01 — Nome do Item
### Evidência confirmada
[arquivo:linha com código literal]

### Risco
[impacto se não corrigido]

### Correção
[código exato da solução]

### Testes
[testes novos a adicionar]

## Ordem de Execução
## Commits Atômicos
## Critérios de Aceite
```

---

## Migrações de Banco de Dados

**Regras inegociáveis:**
- Sempre idempotentes (verificar existência antes de criar)
- Sempre acompanhadas de script de rollback (`revert_sprint_NN.py`)
- Sempre em `app/migrations/migrate_sprint_NN.py`
- Sempre rodar manualmente na VPS após deploy

```python
# Template de migration idempotente
def migrate():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name='tabela' AND column_name='coluna'
        """))
        if not result.fetchone():
            conn.execute(text("ALTER TABLE tabela ADD COLUMN ..."))
            conn.commit()
            print("✅ Coluna adicionada.")
        else:
            print("✅ Coluna já existe.")
```

---

## Padrão de Testes

```python
# Banco de teste: sgp_test_db (nunca o banco de produção)
# Prefixos de cleanup: testuser_*, TESTPROD_*, TEST_*
# Estrutura mínima por router novo:
#   - GET sem token → 401
#   - GET com token → 200
#   - POST com payload válido → 200/201
#   - POST com payload inválido → 400/422
#   - Ação de escrita gera audit log

# Meta de cobertura por sprint:
# linhas de teste >= linhas de código de produção adicionadas
```

---

## Deploy na VPS

```bash
# Após merge no main
git pull origin main
docker-compose up -d --build
docker-compose exec api python app/migrations/migrate_sprint_NN.py

# Verificar logs
docker-compose logs api --tail=20
# Esperado: "Application startup complete" SEM "--reload"
```

**Checklist pós-deploy:**
- [ ] Login funciona
- [ ] Console do browser — zero erros de CSP
- [ ] Páginas principais carregam (Monitor, Cockpit, Dashboard BI)
- [ ] Migration aplicada com sucesso (verificar output)

---

## Severidade de Bugs

| 🔴 Crítico | Sistema quebrado, segurança comprometida, dados perdidos |
|-----------|--------------------------------------------------------|
| 🟡 Médio | Funcionalidade degradada, UX ruim, comportamento incorreto |
| 🟢 Baixo | Cosmético, warning no console, melhoria de qualidade |

Bugs 🔴 bloqueiam o deploy. Bugs 🟡 e 🟢 podem ser backlog.