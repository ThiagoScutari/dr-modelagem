---
name: sgp-architecture-decisions
description: >
  Decisões arquiteturais e ADRs do SGP Costura (DRX Têxtil). Use esta SKILL
  sempre que for sugerir mudanças estruturais, novos padrões, bibliotecas,
  frameworks, ou abordagens de design no SGP Costura. Também use ao responder
  perguntas sobre "por que fazemos X dessa forma", ao avaliar trade-offs técnicos,
  ou ao planejar features que afetam a arquitetura. Esta SKILL previne sugestões
  que contradizem decisões já tomadas — como React, hard delete, Alembic, ou
  múltiplos serviços. Consulte sempre antes de propor mudanças estruturais.
---

# SGP Costura — Decisões Arquiteturais (ADRs)

## Stack Tecnológico — Imutável por Decisão

| Camada | Tecnologia | Alternativas REJEITADAS |
|--------|-----------|------------------------|
| Backend | FastAPI + Python 3.11 | Django, Flask |
| ORM | SQLAlchemy 2.0 | Tortoise, Peewee |
| Banco | PostgreSQL 15 | MySQL, SQLite |
| Frontend | HTML/JS Vanilla + Tailwind CSS | React, Vue, Angular, Alpine.js |
| Auth | PyJWT + bcrypt | OAuth2 externo, Auth0 |
| PDF | ReportLab | WeasyPrint, Puppeteer |
| AI/Import | GPT-4o (OpenAI) | Gemini, Claude (para PSO import) |

**Por que Vanilla JS?** Sistema de chão de fábrica — operadores em
tablets básicos, conectividade instável. Zero build step, zero bundle,
carrega instantaneamente. Reatividade não é necessária — o fluxo é
linear (importar PSO → planejar → monitorar).

---

## ADR-01 — Monolito, não Microserviços

**Decisão:** Monolito FastAPI com routers modulares.

**Contexto:** Sistema para uma fábrica têxtil de médio porte.
Volume previsível, equipe de 1 desenvolvedor, VPS única.

**Consequências:**
- `app/main.py` é apenas bootstrap (≤200 linhas)
- Lógica de negócio em `app/routers/` (7 arquivos)
- Helpers stateless em `app/services/`
- Schemas Pydantic em `app/schemas/`
- Modelos ORM em `app/core/models.py`

**Rejeitar:** Sugestões de separar em serviços independentes,
message queues, event sourcing, ou CQRS.

---

## ADR-02 — Soft Delete Universal

**Decisão:** Nunca hard delete em entidades de negócio.

```python
# ✅ CORRETO — soft delete
is_active: bool = Column(Boolean, default=True)    # para usuários, costureiras
is_archived: bool = Column(Boolean, default=False) # para PSO, planejamentos

# ❌ PROIBIDO — hard delete em entidade de negócio
db.delete(entity)
```

**Exceção:** Logs temporários, dados de sessão, cache — podem ser
deletados fisicamente.

**Por quê:** Rastreabilidade de auditoria, possibilidade de restore,
integridade referencial sem cascata destrutiva.

**Bloquear delete quando há dependências:**
```python
# Se CartLote referencia Planning, bloquear delete do Planning
if db.query(CartLote).filter_by(planning_id=id).first():
    raise HTTPException(400, detail="Planejamento possui lotes vinculados.")
```

---

## ADR-03 — Migrações Manuais, não Alembic

**Decisão:** Scripts Python idempotentes em `app/migrations/`.

**Por quê:** Ambiente de fábrica sem CD automatizado. Cada migração
é revisada, testada e aplicada manualmente na VPS. Alembic adiciona
complexidade desnecessária e risco de auto-migrate acidental.

**Padrão:**
```
app/migrations/
  migrate_sprint_NN.py   ← aplica mudança
  revert_sprint_NN.py    ← rollback
```

**Rejeitar:** Sugestões de Alembic, auto-migrate no startup,
Django-style migrations.

---

## ADR-04 — RBAC em Camadas

**Decisão:** Segurança real no backend, UX no frontend.

```
Backend (REAL):  Depends(get_admin_user), Depends(decode_token)
Frontend (UX):   data-min-role="admin", applyRBAC()
```

**Roles em ordem crescente de permissão:**
`viewer` < `operator` < `supervisor` < `admin`

**Regra:** Frontend RBAC é apenas para esconder botões.
Nunca confiar em role vindo do frontend. Sempre validar
via dependency injection no FastAPI.

---

## ADR-05 — Múltiplas OPs Concorrentes

**Decisão:** Restrição de conflito por costureira, não por OP.

```python
# Uma costureira só pode ter UMA operação ativa por vez
# Mas múltiplas OPs podem rodar simultaneamente
# com costureiras diferentes

# Verificação de conflito:
conflict = db.query(WorkstationAllocation).filter(
    WorkstationAllocation.seamstress_id == seamstress_id,
    WorkstationAllocation.status == "active"
).first()
if conflict:
    raise HTTPException(409, detail="Costureira já possui operação ativa.")
```

---

## ADR-06 — Auditoria Obrigatória

**Decisão:** `write_audit_log` antes de `db.commit()` em toda
mudança de estado relevante.

**Tabela de auditoria:** `audit_logs` com `user_id`, `action`,
`details`, `timestamp`.

**Ações auditadas obrigatoriamente:**
- `PRODUCTION_STARTED`, `PRODUCTION_PAUSED`, `PRODUCTION_RESUMED`, `PRODUCTION_STOPPED`
- `BATCH_CHECKOUT`
- `PSO_IMPORTED`, `PSO_ARCHIVED`, `PSO_RESTORED`
- `PLANNING_PUBLISHED`, `PLANNING_ARCHIVED`, `PLANNING_RESTORED`
- `USER_CREATED`, `USER_APPROVED`, `USER_DEACTIVATED`
- `PASSWORD_CHANGED`
- `SHIFT_CONFIG_UPDATED`

---

## ADR-07 — CSP e Segurança HTTP

**Decisão:** Headers de segurança via FastAPI middleware,
não via Nginx.

**Por quê:** Sistema usa Traefik como reverse proxy.
Configurar CSP no Nginx adicionaria complexidade desnecessária
e possibilidade de conflito com headers do Traefik.

**Status atual:**
- CSP: Enforçado (não Report-Only)
- `unsafe-inline`: necessário enquanto Tailwind Play CDN for usado
- Migração Tailwind CDN → CLI: backlog documentado

---

## ADR-08 — Tailwind Play CDN é Dívida Técnica

**Decisão:** Manter temporariamente, migrar para Tailwind CLI
quando houver sprint dedicada.

**Impacto atual:**
- Warning no console de todas as páginas (esperado, aceito)
- `unsafe-inline` obrigatório na CSP (risco aceito temporariamente)
- Performance: CDN carrega ~300KB desnecessários

**Quando migrar:** Sprint dedicada com tempo suficiente para
testar todas as 8 páginas após mudança no build step.

**Rejeitar:** Sugestões de migrar Tailwind "junto" com outra sprint.
Deve ser sprint isolada.

---

## ADR-09 — JWT em localStorage (Dívida Técnica)

**Decisão atual:** JWT armazenado em localStorage via `authFetch()`.

**Risco:** Vulnerável a XSS — mitigado por `safeText()` e CSP.

**Plano futuro:** Migrar para HttpOnly cookie — sprint dedicada.

**Rejeitar:** Implementar JWT em cookie "junto" com outra sprint.

---

## Padrões de Código Estabelecidos

### Backend
```python
# Estrutura de rota padrão
@router.post("/api/resource")
def create_resource(
    payload: ResourceCreateSchema,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_operator_user_id)
):
    try:
        # 1. Validação de negócio
        # 2. Criar entidade
        # 3. write_audit_log(...)
        # 4. db.commit()
        # 5. return resultado
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro: {e}", exc_info=True)
        raise HTTPException(500, detail="Erro interno do servidor.")
```

### Frontend
```javascript
// Padrão de chamada à API
async function loadData() {
    try {
        const response = await authFetch('/api/resource');
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        // Usar safeText() em toda interpolação
        container.innerHTML = data.items.map(item =>
            `<div>${safeText(item.name)}</div>`
        ).join('');
    } catch (error) {
        showError('Erro ao carregar dados.');
    }
}
```

---

## O que NÃO Fazer — Anti-Patterns

| Anti-pattern | Por quê é proibido | Alternativa |
|-------------|-------------------|-------------|
| `db.delete(entity)` | Perde histórico, quebra auditoria | `entity.is_archived = True` |
| `detail=str(e)` | Expõe internos ao cliente | Mensagem genérica + `logger.error()` |
| `innerHTML` sem `safeText()` | XSS | `safeText()` obrigatório |
| `fetch()` direto | Sem auth header | `authFetch()` |
| Rota sem `Depends(auth)` | Dados públicos indevidos | `Depends(decode_token)` mínimo |
| Valor hardcoded no código | Exposto no repo | `os.getenv()` |
| `allow_methods=["*"]` | CORS muito permissivo | Lista explícita de métodos |
| React / Vue / Alpine | Fora da stack aprovada | HTML/JS Vanilla + Tailwind |
| Alembic / auto-migrate | Risco em produção | Scripts manuais idempotentes |