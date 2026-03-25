# 01 — Identidade Visual

## Conceito

A paleta remete ao universo da Débora: **mar, areia, pôr do sol e floresta litorânea**.
O design é minimalista e clean, com elementos de glass morphism suave (backdrop-filter, bordas translúcidas).

---

## Paleta de Cores

| Nome | Hex | Uso |
|---|---|---|
| Mar Profundo | `#1A6E8C` | Cor primária — CTAs, links, elementos de destaque |
| Areia Dourada | `#E8C97A` | Accent — hover states, badges, destaques |
| Pôr do Sol | `#E07848` | Status de atenção, avisos, prazo próximo |
| Espuma do Mar | `#C8E8DC` | Backgrounds suaves, cards secundários |
| Noite Tropical | `#1C3D4F` | Textos principais, headers, navbar |
| Céu ao Entardecer | `#7BB8CC` | Elementos de UI, borders, separadores |
| Creme de Coco | `#FAF6EE` | Background base da aplicação |
| Coral Vivo | `#B81C1C` | Erros, ações críticas, cancelamentos |
| Verde Floresta | `#2E6B30` | Aprovado, correto, validado, salvo com sucesso |

### Tokens semânticos

```css
--color-primary:     #1A6E8C;
--color-accent:      #E8C97A;
--color-warning:     #E07848;
--color-surface:     #C8E8DC;
--color-text:        #1C3D4F;
--color-ui:          #7BB8CC;
--color-background:  #FAF6EE;
--color-danger:      #B81C1C;
--color-success:     #2E6B30;
```

---

## Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display / Logo | Cormorant Garamond | Títulos de tela, logo, cabeçalhos principais |
| Interface | DM Sans | Todo o corpo do app — campos, labels, botões |
| Números / Código | DM Mono | Valores monetários, CNPJ, datas tabuladas |

### Escala tipográfica

```
Display:    32px / weight 300 / Cormorant Garamond
H1:         24px / weight 400 / Cormorant Garamond
H2:         18px / weight 500 / DM Sans
H3:         15px / weight 500 / DM Sans
Body:       14px / weight 400 / DM Sans
Caption:    12px / weight 400 / DM Sans
Mono:       13px / weight 400 / DM Mono
```

---

## Logo

- **Arquivo:** `images/Logomarca.png`
- **Estilo:** Círculo sólido com letras DR em tipografia serifada; silhueta de molde ao fundo
- **Cores originais:** Preto (#000000) sobre fundo branco — monocromática
- **Subtítulo:** "Estúdio de Modelagem"

### Variações previstas no sistema

| Variação | Fundo | Uso |
|---|---|---|
| Original preta | Branco / Creme | PDF de orçamento, telas claras |
| Branca | Noite Tropical / Mar Profundo | Header mobile dark, splash |
| Mar Profundo | Espuma / Creme | Elementos de identidade coloridos |

---

## Princípios de design

### 1. Glass morphism suave
Backgrounds com `backdrop-filter: blur()`, bordas translúcidas, sombras sutis que remetem à superfície da água. Nunca exagerado — apenas para criar profundidade.

### 2. Minimalismo quente
Muito espaço negativo. Tipografia clara. Apenas o essencial na tela — sem poluição visual. A paleta quente (areia, creme) impede que o minimalismo fique frio.

### 3. Mobile-first absoluto
Tudo projetado para polegar no celular:
- Tap targets mínimos de 48px
- Campos com padding generoso (16px vertical)
- Bottom navigation bar — nunca menu hamburger
- Ações destrutivas sempre com confirmação

### 4. Zero atrito
- Campos pré-preenchidos com valores padrão
- Cálculos automáticos em tempo real
- Replicação de categoria com 1 toque
- Nunca encerrar um fluxo para ir buscar um dado — criação contextual inline

### 5. Feedback visual imediato
- Verde Floresta para tudo que é positivo, salvo, correto
- Coral Vivo para erros e críticos
- Pôr do Sol para alertas e atenção
- Animações de transição suaves (200-300ms)

---

## Componentes de UI — padrões visuais

### Cards
```
background: white
border: 1px solid rgba(28, 61, 79, 0.08)
border-radius: 16px
padding: 16px 20px
box-shadow: 0 2px 12px rgba(26, 110, 140, 0.06)
```

### Botão primário
```
background: #1A6E8C
color: white
border-radius: 12px
padding: 14px 24px
font: 500 14px DM Sans
```

### Botão secundário
```
background: transparent
border: 1.5px solid #1A6E8C
color: #1A6E8C
border-radius: 12px
```

### Input
```
background: rgba(200, 232, 220, 0.2)
border: 1px solid rgba(123, 184, 204, 0.4)
border-radius: 10px
padding: 12px 16px
font: 400 14px DM Sans
```

### Status badges

| Status | Background | Texto |
|---|---|---|
| Aguardando | `#FEF5E6` | `#A05A10` |
| Aprovado | `#E3F2E3` | `#1A501A` |
| Em Andamento | `#E6F3F8` | `#1A4E6C` |
| Finalizado | `#E3F2E3` | `#1A501A` |
| Cancelado | `#F5F5F5` | `#6B6B6B` |
