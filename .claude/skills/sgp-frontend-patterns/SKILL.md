---
name: sgp-frontend-patterns
description: >
  Padrões de frontend obrigatórios do SGP Costura (DRX Têxtil). Use esta SKILL
  sempre que for escrever, modificar ou revisar HTML, JavaScript ou CSS no projeto
  SGP Costura. Também use ao criar novas páginas, componentes de modal, tabelas,
  botões de ação, ou qualquer elemento de interface. Esta SKILL define: paleta de
  cores, componentes Tailwind aprovados, padrão de modais, RBAC no frontend,
  authFetch obrigatório, safeText obrigatório, e estrutura de páginas. Nunca
  escreva frontend no SGP Costura sem consultar esta SKILL primeiro.
---

# SGP Costura — Padrões de Frontend

## Stack Frontend

- **HTML5** semântico, sem framework reativo
- **Tailwind CSS** via Play CDN (migração para CLI no backlog)
- **JavaScript** ES6+ vanilla (sem jQuery, sem React, sem Alpine)
- **Fontes:** Google Fonts (Inter)
- **Ícones:** Inline SVG ou emoji funcional

---

## Paleta de Cores

```css
/* Backgrounds */
--bg-primary:    #0a0e14  /* página principal */
--bg-card:       #0f1418  /* cards e modais */
--bg-surface:    #141920  /* inputs, tabelas */
--bg-hover:      #1a2230  /* hover state */

/* Borders */
--border:        #1e2836  /* borda padrão */
--border-focus:  #3b82f6  /* foco (blue-500) */

/* Text */
--text-primary:  #ffffff
--text-secondary:#94a3b8  /* slate-400 */
--text-muted:    #64748b  /* slate-500 */

/* Status */
--success:       #10b981  /* emerald-500 */
--warning:       #f59e0b  /* amber-500 */
--error:         #ef4444  /* red-500 */
--info:          #3b82f6  /* blue-500 */

/* Roles (badge colors) */
--role-admin:    #8b5cf6  /* violet-500 */
--role-supervisor: #3b82f6 /* blue-500 */
--role-operator: #10b981  /* emerald-500 */
--role-viewer:   #64748b  /* slate-500 */
```

---

## Estrutura de Página Padrão

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGP Costura — [Nome da Página]</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-[#0a0e14] text-white min-h-screen">

    <!-- HEADER (via layout.js) -->
    <div id="header-container"></div>

    <!-- CONTEÚDO PRINCIPAL -->
    <main class="max-w-7xl mx-auto px-4 py-6">
        <!-- conteúdo da página aqui -->
    </main>

    <!-- SCRIPTS — ordem obrigatória -->
    <script src="/static/js/auth.js"></script>
    <script src="/static/js/layout.js"></script>
    <script>
        // Inicialização da página
        document.addEventListener('DOMContentLoaded', () => {
            initPage();
        });

        async function initPage() {
            const user = await requireAuth(); // redireciona se não logado
            if (!user) return;
            applyRBAC(user.role);
            await loadData();
        }
    </script>
</body>
</html>
```

---

## RBAC no Frontend

```html
<!-- Esconder elementos por role mínimo -->
<button
    data-min-role="supervisor"
    onclick="publishPlanning()"
    class="hidden bg-blue-600 ...">
    Publicar
</button>

<button
    data-min-role="admin"
    onclick="deleteUser()"
    class="hidden bg-red-600 ...">
    Excluir
</button>
```

```javascript
// applyRBAC() em auth.js aplica visibilidade automaticamente
// chamada após login e em initPage()
applyRBAC(user.role);

// Hierarquia de roles (ordem crescente de permissão):
// viewer < operator < supervisor < admin
```

**Regra crítica:** `data-min-role` é apenas UX. A segurança real
está nos `Depends()` do FastAPI. Nunca confiar no frontend para
controle de acesso.

---

## Padrão de Modal

```html
<!-- Modal fullscreen overlay -->
<div id="recurso-modal"
     class="hidden fixed inset-0 bg-black bg-opacity-70
            flex items-center justify-center z-50 p-4">

    <!-- Card do modal -->
    <div class="bg-[#0f1418] border border-gray-700 rounded-2xl
                w-full max-w-lg p-6">

        <!-- Header -->
        <h2 id="modal-title" class="text-xl font-bold text-white mb-6">
            TÍTULO DO MODAL
        </h2>

        <!-- Campos sempre dentro de <form> -->
        <form onsubmit="return false" autocomplete="on">
            <div class="space-y-4">
                <input
                    id="campo-nome"
                    type="text"
                    placeholder="Nome"
                    autocomplete="name"
                    class="w-full bg-[#0f1418] border border-gray-700
                           rounded-xl p-4 font-bold text-white
                           focus:border-blue-500 outline-none">
            </div>
        </form>

        <!-- Botões — sempre type="button" para evitar submit implícito -->
        <div class="flex gap-3 mt-6">
            <button
                type="button"
                onclick="closeModal()"
                class="flex-1 border border-gray-700 text-gray-400
                       rounded-xl py-3 hover:bg-gray-800 transition-colors">
                Cancelar
            </button>
            <button
                type="button"
                onclick="saveForm()"
                class="flex-1 bg-blue-600 hover:bg-blue-700
                       text-white rounded-xl py-3 font-bold transition-colors">
                Salvar
            </button>
        </div>
    </div>
</div>
```

```javascript
function openModal() {
    document.getElementById('recurso-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('recurso-modal').classList.add('hidden');
    clearForm();
}
```

---

## Padrão de Tabela

```html
<div class="bg-[#0f1418] border border-gray-800 rounded-2xl overflow-hidden">
    <table class="w-full">
        <thead>
            <tr class="border-b border-gray-800">
                <th class="text-left p-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                    Coluna
                </th>
                <!-- mais colunas -->
                <th class="text-right p-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                    Ações
                </th>
            </tr>
        </thead>
        <tbody id="tabela-body">
            <!-- populado via JS -->
        </tbody>
    </table>
</div>
```

```javascript
// Renderizar linhas — SEMPRE safeText() em dados da API
function renderTabela(items) {
    const tbody = document.getElementById('tabela-body');
    tbody.innerHTML = items.map(item => `
        <tr class="border-b border-gray-800 hover:bg-[#141920] transition-colors">
            <td class="p-4 text-white font-medium">
                ${safeText(item.name)}
            </td>
            <td class="p-4 text-gray-400">
                ${safeText(item.description)}
            </td>
            <td class="p-4 text-right">
                <button type="button"
                        onclick="editItem(${item.id})"
                        class="text-blue-400 hover:text-blue-300 text-sm mr-3">
                    Editar
                </button>
                <button type="button"
                        onclick="deleteItem(${item.id})"
                        data-min-role="admin"
                        class="hidden text-red-400 hover:text-red-300 text-sm">
                    Excluir
                </button>
            </td>
        </tr>
    `).join('');
    applyRBAC(getCurrentUser().role);
}
```

---

## Padrão de Formulário e Inputs

```html
<!-- Input padrão -->
<input
    type="text"
    id="campo-id"
    placeholder="Placeholder"
    autocomplete="off"
    class="w-full bg-[#0f1418] border border-gray-700 rounded-xl
           p-4 font-bold text-white focus:border-blue-500 outline-none
           transition-colors">

<!-- Input de senha -->
<input
    type="password"
    id="campo-senha"
    placeholder="Senha"
    autocomplete="new-password"
    class="w-full bg-[#0f1418] border border-gray-700 rounded-xl
           p-4 font-bold text-white focus:border-blue-500 outline-none">

<!-- Select padrão -->
<select
    id="campo-select"
    class="w-full bg-[#0f1418] border border-gray-700 rounded-xl
           p-4 font-bold text-white focus:border-blue-500 outline-none">
    <option value="">Selecione...</option>
    <option value="opcao1">Opção 1</option>
</select>

<!-- Regras autocomplete obrigatórias -->
<!-- username    → autocomplete="username" -->
<!-- email       → autocomplete="email" -->
<!-- nova senha  → autocomplete="new-password" -->
<!-- senha atual → autocomplete="current-password" -->
```

---

## Padrão de Status Badge

```html
<!-- Badge de status inline -->
<span class="px-2 py-1 rounded-full text-xs font-bold
             bg-emerald-500/20 text-emerald-400">
    Ativo
</span>

<span class="px-2 py-1 rounded-full text-xs font-bold
             bg-amber-500/20 text-amber-400">
    Pausado
</span>

<span class="px-2 py-1 rounded-full text-xs font-bold
             bg-red-500/20 text-red-400">
    Inativo
</span>
```

```javascript
// Função helper para badges de status
function statusBadge(status) {
    const map = {
        'active':   ['bg-emerald-500/20 text-emerald-400', 'Ativo'],
        'paused':   ['bg-amber-500/20 text-amber-400',     'Pausado'],
        'stopped':  ['bg-red-500/20 text-red-400',         'Parado'],
        'pending':  ['bg-blue-500/20 text-blue-400',       'Pendente'],
        'archived': ['bg-gray-500/20 text-gray-400',       'Arquivado'],
    };
    const [cls, label] = map[status] || ['bg-gray-500/20 text-gray-400', status];
    return `<span class="px-2 py-1 rounded-full text-xs font-bold ${cls}">
                ${safeText(label)}
            </span>`;
}
```

---

## Padrão de Loading e Estados Vazios

```javascript
// Estado de loading
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8
                        border-b-2 border-blue-500"></div>
        </div>
    `;
}

// Estado vazio
function showEmpty(containerId, message = 'Nenhum registro encontrado.') {
    document.getElementById(containerId).innerHTML = `
        <div class="text-center py-12 text-gray-500">
            <p class="text-sm">${safeText(message)}</p>
        </div>
    `;
}

// Estado de erro
function showError(containerId, message = 'Erro ao carregar dados.') {
    document.getElementById(containerId).innerHTML = `
        <div class="text-center py-12 text-red-400">
            <p class="text-sm">${safeText(message)}</p>
        </div>
    `;
}
```

---

## Chamadas à API — Padrão authFetch

```javascript
// GET simples
async function loadItems() {
    showLoading('container-id');
    try {
        const response = await authFetch('/api/resource');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        renderItems(data.items);
    } catch (error) {
        showError('container-id', 'Erro ao carregar recursos.');
    }
}

// POST com payload
async function saveItem() {
    const payload = {
        name: document.getElementById('campo-nome').value.trim(),
        value: parseInt(document.getElementById('campo-valor').value)
    };

    if (!payload.name) {
        alert('Nome é obrigatório.');
        return;
    }

    try {
        const response = await authFetch('/api/resource', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.detail || 'Erro ao salvar.');
            return;
        }

        closeModal();
        await loadItems(); // recarregar lista
    } catch (error) {
        alert('Erro de conexão. Tente novamente.');
    }
}

// DELETE (soft delete)
async function deleteItem(id) {
    if (!confirm('Confirma o arquivamento deste item?')) return;

    try {
        const response = await authFetch(`/api/resource/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            alert(error.detail || 'Erro ao arquivar.');
            return;
        }
        await loadItems();
    } catch (error) {
        alert('Erro de conexão. Tente novamente.');
    }
}
```

---

## Checklist de Frontend — Antes de Commitar

- [ ] Todo `innerHTML` com dado da API usa `safeText()`?
- [ ] Atributos HTML com dado da API usam DOM assignment?
- [ ] Todo `fetch()` foi substituído por `authFetch()`?
- [ ] Todos os botões dentro de `<form>` têm `type="button"`?
- [ ] Campos de senha têm `autocomplete` correto?
- [ ] Campos username/email têm `autocomplete` correto?
- [ ] Elementos com restrição de role têm `data-min-role`?
- [ ] Zero `console.log()` no código commitado?
- [ ] Zero hardcoded `localhost` ou IP fixo?
- [ ] Estados de loading, vazio e erro implementados?