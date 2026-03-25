---
name: sgp-security-patterns
description: >
  Padrões de segurança obrigatórios do SGP Costura (DRX Têxtil). Use esta SKILL
  sempre que for escrever ou revisar código no projeto SGP Costura — routers FastAPI,
  frontend HTML/JS, modelos ORM, ou schemas Pydantic. Também use ao criar novos
  endpoints, modificar autenticação, tratar exceções, ou manipular dados no frontend.
  Esta SKILL é obrigatória para qualquer tarefa que envolva segurança, autenticação,
  autorização, validação de dados ou XSS. Nunca escreva código de produção no SGP
  Costura sem consultar esta SKILL primeiro.
---

# SGP Costura — Padrões de Segurança Obrigatórios

## 1. Autenticação e Autorização

### Toda rota DEVE ter uma dependência de auth

```python
# ✅ CORRETO — qualquer usuário autenticado
def get_resource(
    db: Session = Depends(get_db),
    _payload: dict = Depends(decode_token)
):

# ✅ CORRETO — apenas operadores
def start_production(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_operator_user_id)
):

# ✅ CORRETO — apenas supervisores
def publish_planning(
    db: Session = Depends(get_supervisor_user),
):

# ✅ CORRETO — apenas admins
def approve_user(
    db: Session = Depends(get_db),
    _: dict = Depends(get_admin_user)
):

# ❌ PROIBIDO — rota sem nenhum auth dependency
def get_users(db: Session = Depends(get_db)):
```

### Hierarquia de dependências de auth

| Dependência | Role mínimo | Retorna |
|-------------|-------------|---------|
| `decode_token` | Qualquer autenticado | `dict` (payload JWT) |
| `get_operator_user_id` | operator+ | `int` (user_id) |
| `get_supervisor_user` | supervisor+ | `User` (objeto) |
| `get_supervisor_user_id` | supervisor+ | `int` (user_id) |
| `get_admin_user` | admin | `dict` (payload JWT) |

**Regra:** Use o nível mínimo necessário. Não use `get_admin_user` onde
`decode_token` é suficiente.

---

## 2. Tratamento de Exceções

### NUNCA expor str(e) ao cliente

```python
# ❌ PROIBIDO — expõe stack trace, nomes de colunas, paths internos
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# ❌ PROIBIDO — mesmo problema com f-string
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

# ✅ CORRETO — mensagem genérica + log server-side
import logging
logger = logging.getLogger(__name__)

except Exception as e:
    logger.error(f"Erro interno: {e}", exc_info=True)
    raise HTTPException(
        status_code=500,
        detail="Erro interno do servidor. Tente novamente."
    )
```

### Exceções de negócio são permitidas com detail específico

```python
# ✅ PERMITIDO — erro de negócio controlado, sem dados internos
raise HTTPException(
    status_code=400,
    detail="Costureira já possui operação ativa em outro posto."
)

raise HTTPException(
    status_code=404,
    detail="Planejamento não encontrado."
)
```

---

## 3. Frontend — Prevenção de XSS

### NUNCA interpolar dados da API em innerHTML sem safeText()

```javascript
// ❌ PROIBIDO — XSS direto
container.innerHTML = `<div>${product.name}</div>`;
container.innerHTML = products.map(p => `<td>${p.description}</td>`).join('');

// ✅ CORRETO — safeText() em toda interpolação de dado da API
container.innerHTML = `<div>${safeText(product.name)}</div>`;
container.innerHTML = products.map(p =>
    `<td>${safeText(p.description)}</td>`
).join('');

// ⚠️ ATENÇÃO ESPECIAL — atributos HTML (value, href, title)
// safeText() não é suficiente para atributos — use DOM após inserção:

// ❌ ARRISCADO
`<input value="${safeText(op.description)}">`

// ✅ SEGURO — setar via DOM após inserção
const input = element.querySelector('input');
input.value = op.description;  // DOM assignment é sempre seguro
```

### SEMPRE usar authFetch() para requisições à API

```javascript
// ❌ PROIBIDO
const response = await fetch('/api/users', { headers: ... });

// ✅ CORRETO
const response = await authFetch('/api/users');
const response = await authFetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
```

---

## 4. Auditoria — Obrigatória em Mudanças de Estado

### write_audit_log ANTES de db.commit()

```python
# ✅ ORDEM CORRETA
write_audit_log(
    db=db,
    user_id=user_id,
    action="PRODUCTION_STARTED",
    details=f"OP {order_id} iniciada por operador {user_id}"
)
db.commit()  # commit APÓS audit log

# ❌ ERRADO — commit antes do audit (se audit falhar, estado fica sem log)
db.commit()
write_audit_log(...)
```

### Ações que OBRIGATORIAMENTE geram audit log

- Start / Pause / Resume / Stop de OP
- Checkout de lote
- Importação de PSO (PDF)
- Criação / aprovação / desativação de usuário
- Publicação / arquivamento / restore de planejamento
- Qualquer alteração de configuração (turno, etc.)

---

## 5. SECRET_KEY e Variáveis de Ambiente

```python
# ❌ PROIBIDO — hardcoded
SECRET_KEY = "drx-sgp-costura-secret-key"

# ✅ CORRETO — sempre de env var com fallback explícito
import os
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-apenas-para-dev")
```

**Regra:** Qualquer valor sensível (chaves, senhas, URLs de banco) deve
vir de `os.getenv()`. Nunca commitar valores reais.

---

## 6. RBAC — Segurança Real no Backend

```python
# Frontend usa data-min-role e applyRBAC() — isso é apenas UX
# A segurança REAL é garantida pelos Depends() no FastAPI

# ✅ CORRETO — validação server-side obrigatória
@router.delete("/api/planning/{id}")
def delete_planning(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_supervisor_user)  # ← segurança real aqui
):
```

---

## 7. Upload de Arquivos

```python
# Validação obrigatória para qualquer upload
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def import_file(file: UploadFile):
    # 1. Verificar tamanho
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, detail="Arquivo muito grande. Máximo 10MB.")

    # 2. Verificar magic bytes (PDF: %PDF-)
    if not contents.startswith(b'%PDF-'):
        raise HTTPException(400, detail="Arquivo inválido. Envie um PDF.")

    # 3. Sanitizar filename — nunca usar diretamente
    safe_name = os.path.basename(file.filename or "upload.pdf")
```

---

## 8. Checklist de Segurança — Revisar Antes de Commitar

Antes de qualquer commit em código de produção, verificar:

- [ ] Toda rota nova tem `Depends(decode_token)` ou equivalente?
- [ ] Nenhum `except Exception as e: ... str(e)` no diff?
- [ ] Todo `innerHTML` com dado da API usa `safeText()`?
- [ ] Audit log chamado antes de `db.commit()` em mudanças de estado?
- [ ] Nenhuma variável sensível hardcoded?
- [ ] Upload de arquivo valida tamanho e magic bytes?