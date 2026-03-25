---
name: sgp-testing-standards
description: >
  Padrões de testes obrigatórios do SGP Costura (DRX Têxtil). Use esta SKILL
  sempre que for escrever, revisar ou planejar testes no projeto SGP Costura.
  Também use ao adicionar novas rotas, corrigir bugs, ou criar features — todo
  código novo exige testes correspondentes. Esta SKILL define: banco de teste
  correto, prefixos de cleanup, fixtures obrigatórias, estrutura por router,
  e os cenários mínimos que todo endpoint deve ter coberto. Nunca escreva testes
  no SGP Costura sem consultar esta SKILL primeiro.
---

# SGP Costura — Padrões de Testes

## Regra Fundamental

**Linhas de teste ≥ linhas de código de produção adicionadas.**

Todo bug corrigido → teste que reproduz o bug.
Toda rota nova → testes mínimos cobertos.
Todo sprint → pytest verde antes de qualquer commit.

---

## Infraestrutura de Testes

### Banco de Dados

```python
# ✅ CORRETO — sempre sgp_test_db
DATABASE_URL = "postgresql://postgres:postgres@db:5432/sgp_test_db"

# ❌ PROIBIDO — nunca banco de produção
DATABASE_URL = "postgresql://postgres:xxx@db:5432/sgp_db"
```

O banco `sgp_test_db` é criado pelo `scripts/init-test-db.sql`
no startup do container. Nunca usar `sgp_db` em testes.

### Prefixos de Cleanup

Toda entidade criada em teste deve usar prefixos identificáveis
para garantir cleanup automático:

```python
# Usuários de teste
username = "testuser_operador_01"
username = "testuser_admin_sprint38"

# Ordens de produção de teste
product_reference = "TESTPROD_CAMISA_01"
product_reference = "TEST_OP_SPRINT39"

# Costureiras de teste
name = "TEST_Costureira_01"
```

**Fixture de cleanup global** (em `conftest.py`):
```python
@pytest.fixture(autouse=True)
def cleanup_test_data(db):
    yield
    db.query(User).filter(User.username.like("testuser_%")).delete()
    db.query(ProductionOrder).filter(
        ProductionOrder.product_reference.like("TEST%")
    ).delete()
    db.commit()
```

---

## Fixtures Obrigatórias

Todo arquivo de teste deve ter acesso a estas fixtures:

```python
# conftest.py — fixtures base

@pytest.fixture
def client():
    """Cliente de teste FastAPI."""
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)

@pytest.fixture
def db():
    """Sessão de banco de dados de teste."""
    # Usa sgp_test_db via DATABASE_URL de teste

@pytest.fixture
def admin_token(client, db) -> str:
    """Token JWT de usuário admin para testes."""
    # Criar usuário admin de teste, fazer login, retornar token

@pytest.fixture
def supervisor_token(client, db) -> str:
    """Token JWT de supervisor para testes."""

@pytest.fixture
def operator_token(client, db) -> str:
    """Token JWT de operador para testes."""

@pytest.fixture
def viewer_token(client, db) -> str:
    """Token JWT de viewer para testes."""
```

---

## Cenários Mínimos por Endpoint

### Para TODA rota que exige autenticação:

```python
# 1. Sem token → 401
def test_rota_sem_token_retorna_401(self, client):
    response = client.get("/api/resource")
    assert response.status_code == 401

# 2. Com token válido → 200 (ou 201, 204)
def test_rota_com_token_retorna_200(self, client, operator_token):
    response = client.get("/api/resource",
        headers={"Authorization": f"Bearer {operator_token}"}
    )
    assert response.status_code == 200

# 3. Token de role insuficiente → 403
def test_rota_operador_nao_acessa_admin(self, client, operator_token):
    response = client.delete("/api/users/1",
        headers={"Authorization": f"Bearer {operator_token}"}
    )
    assert response.status_code == 403
```

### Para rotas de criação (POST):

```python
# 4. Payload válido → 200/201 com dados retornados
def test_criar_recurso_retorna_dados(self, client, admin_token):
    payload = {"name": "TEST_Recurso", "value": 42}
    response = client.post("/api/resource",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "TEST_Recurso"

# 5. Payload inválido → 400/422
def test_criar_recurso_payload_invalido(self, client, admin_token):
    response = client.post("/api/resource",
        json={},  # payload vazio
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code in [400, 422]

# 6. Duplicata → 400 com mensagem clara
def test_criar_recurso_duplicado_retorna_400(self, client, admin_token):
    payload = {"name": "TEST_Duplicado"}
    client.post("/api/resource", json=payload, headers=...)
    response = client.post("/api/resource", json=payload, headers=...)
    assert response.status_code == 400
```

### Para rotas de estado (soft delete, archive, restore):

```python
# 7. Arquivar → is_archived = True
def test_arquivar_recurso(self, client, supervisor_token, db):
    # criar recurso
    # arquivar
    response = client.delete(f"/api/resource/{id}",
        headers={"Authorization": f"Bearer {supervisor_token}"}
    )
    assert response.status_code == 200
    # verificar no banco
    resource = db.query(Resource).get(id)
    assert resource.is_archived == True

# 8. Restore → is_archived = False
def test_restaurar_recurso(self, client, supervisor_token, db):
    ...

# 9. Arquivar com dependências → 400
def test_arquivar_com_dependencias_retorna_400(self, client, supervisor_token):
    # criar recurso com dependência vinculada
    response = client.delete(f"/api/resource/{id}", headers=...)
    assert response.status_code == 400
```

### Para rotas que geram audit log:

```python
# 10. Ação crítica gera registro em audit_logs
def test_acao_gera_audit_log(self, client, admin_token, db):
    response = client.post("/api/resource", json=payload, headers=...)
    assert response.status_code == 200

    log = db.query(AuditLog).filter(
        AuditLog.action == "RESOURCE_CREATED"
    ).order_by(AuditLog.id.desc()).first()
    assert log is not None
    assert "TEST_Recurso" in log.details
```

---

## Estrutura de Arquivos de Teste

```
app/tests/
  conftest.py              ← fixtures globais, cleanup
  test_auth_logic.py       ← unit tests JWT, hashing (13 testes)
  test_audit_flow.py       ← fluxo completo de auditoria (29 testes)
  test_ops_audit.py        ← produção + checkout + eventos (37 testes)
  test_planning.py         ← CRUD de planejamentos (27 testes)
  test_registration_flow.py← registro, aprovação, login (17 testes)
  test_security_headers.py ← CSP, CORS, headers HTTP (23 testes)
  test_change_password.py  ← troca de senha (8 testes)
  test_users.py            ← CRUD de usuários (7 testes)
  test_analytics.py        ← dashboard analytics (3 testes)
  test_db_isolation.py     ← sanity check de isolamento (1 teste)
```

**Arquivos FALTANDO (Sprint 40):**
```
  test_config.py    ← config router — 0% cobertura atual
  test_production.py← ciclo completo start→pause→resume→stop
  test_pso.py       ← archive, restore, details, delete PSO
  test_seamstress.py← CRUD completo de costureiras
```

---

## Cobertura Atual por Router

| Router | Rotas | Cobertas | % | Prioridade |
|--------|-------|----------|---|------------|
| auth | 4 | 3 | 75% | — |
| users | 9 | 7 | 78% | — |
| planning | 9 | 8 | 89% | — |
| production | 9 | 2 | 22% | 🔴 Sprint 40 |
| pso | 8 | 2 | 25% | 🔴 Sprint 40 |
| config | 4 | 0 | 0% | 🔴 Sprint 40 |
| analytics | 2 | 2 | 100% | ✅ |
| **Total** | **45** | **24** | **53%** | — |

---

## Top 5 Cenários Críticos Não Testados

1. **Ciclo de produção completo** — `start → pause → resume → stop`
   com e sem justificativa. 10-15 testes em `test_production.py`.

2. **Checkout de lotes** — quantity tracking, auto-stop quando
   quantidade atingida, `is_delayed` tracking. 5-8 testes.

3. **PSO archive/restore/delete** — cascatas, dependências,
   regras de negócio. 8-12 testes em `test_pso.py`.

4. **Config shift** — criar, atualizar, ler configuração de turno.
   Geração de PDF manual (mock ReportLab). 6-10 testes.

5. **CRUD de costureiras** — criar, listar, atualizar, soft-delete,
   reativar. 7-12 testes em `test_seamstress.py` ou `test_users.py`.

---

## Anti-Patterns de Teste

```python
# ❌ PROIBIDO — teste não-determinístico
import time
time.sleep(2)  # nunca usar sleep em testes

# ❌ PROIBIDO — banco de produção em teste
DATABASE_URL = os.getenv("DATABASE_URL")  # pode apontar para produção

# ❌ PROIBIDO — teste dependente de ordem
def test_b(self):
    # assume que test_a rodou antes — frágil
    ...

# ❌ PROIBIDO — assert genérico sem mensagem
assert response.status_code == 200  # ok mas...
# ✅ MELHOR — com mensagem de diagnóstico
assert response.status_code == 200, \
    f"Esperado 200, recebido {response.status_code}: {response.json()}"

# ❌ PROIBIDO — não limpar dados criados
def test_criar_usuario(self, client, db):
    client.post("/api/users", json={"username": "joao"})  # sem cleanup!

# ✅ CORRETO — usar prefixo testuser_ para cleanup automático
def test_criar_usuario(self, client, db):
    client.post("/api/users", json={"username": "testuser_joao"})
```

---

## Comando de Execução

```bash
# Rodar todos os testes
docker-compose exec api python -m pytest app/tests/ -v

# Rodar arquivo específico
docker-compose exec api python -m pytest app/tests/test_planning.py -v

# Rodar classe específica
docker-compose exec api python -m pytest \
  app/tests/test_security_headers.py::TestCSPDirectives -v

# Com cobertura
docker-compose exec api python -m pytest app/tests/ --cov=app --cov-report=term
```

**Target sempre:** `NNN passed, 0 failed, 0 errors`
Nunca aceitar testes pulados (`skipped`) sem justificativa explícita.