# 06 — Tabela de Preços & Lógica de Cálculo

> Fonte: `docs/tabela_preco.pdf` e `docs/tabela_preco_2.xlsx`
> Última revisão: Débora da Rosa — Estúdio de Modelagem Têxtil

---

## Tabela oficial de preços

### Modelagem & Peça Piloto

| Serviço | Valor |
|---|---|
| Modelagem com moldes base – por modelo | R$ 100,00 a R$ 220,00 |
| Modelagem básica (camiseta básica, regata) | R$ 100,00 a R$ 120,00 |
| Modelagem intermediária 1 (t-shirt, cropped básico, bermuda) | R$ 130,00 |
| Modelagem intermediária 2 (blusão moletom básico, calça moletom com bolsos) | R$ 140,00 |
| Modelagem elaborada/fashion 1 (top, botton) | R$ 150,00 a R$ 180,00 |
| Modelagem elaborada/fashion 2 (vestido, macacão) | R$ 180,00 a R$ 230,00 |
| Modelagem alfaiataria simples (blazer sem forro, vestidos) | R$ 200,00 a R$ 250,00 |
| Modelagem alfaiataria elaborada (modelagens forradas, jaquetas, blazer, vestidos) | R$ 250,00 a R$ 350,00 |
| Alteração de modelagens – arquivo | R$ 40,00 a R$ 150,00 |
| Peça piloto – corte e costura (material fornecido pelo cliente) | 50% do valor da modelagem |

### Encaixes & Plotagem

| Serviço | Valor |
|---|---|
| Encaixe molde – tamanho base – por arquivo | R$ 12,00 |
| Encaixe produção – 1 TEC – por arquivo | R$ 15,00 |
| Encaixe elaborado – 2 TEC – por arquivo | R$ 18,00 |
| Encaixe elaborado – 3 TEC – por arquivo | R$ 22,00 |
| Encaixe elaborado – 4 TEC – por arquivo | R$ 25,00 |
| Encaixe com mais de uma referência – acréscimo por arquivo | R$ 5,00 |
| Geração de consumo | R$ 15,00 |
| Plotagem de encaixe (até 91 cm de largura) – por metro | R$ 8,50/m |

### Graduação

| Serviço | Valor |
|---|---|
| Graduação de moldes básicos (molde desenvolvido pela Débora) | 25% do valor da modelagem por tamanho |
| Graduação de moldes complexos (molde desenvolvido pela Débora) | 30% do valor da modelagem por tamanho |
| Graduação de moldes básicos por tamanho (molde recebido) | R$ 30,00/tamanho |
| Graduação de moldes intermediários por tamanho (molde recebido) | R$ 35,00/tamanho |
| Graduação de moldes elaborados por tamanho (molde recebido) | R$ 40,00/tamanho |

### Digitalização

| Serviço | Valor |
|---|---|
| Básico 1 – até 2 partes | R$ 30,00 |
| Básico 2 – até 3 partes | R$ 45,00 |
| Intermediário 1 – de 4 a 8 partes | R$ 60,00 |
| Intermediário 2 – de 9 a 12 partes | R$ 75,00 |
| Elaborado – acima de 13 partes | R$ 90,00 |
| Conversão de arquivos (plt ou pdf) – por arquivo | R$ 15,00 |
| Conversão – pacote de 10 a 30 arquivos | R$ 80,00 |
| Conversão – pacote até 30 arquivos | R$ 200,00 |

### Demais serviços

| Serviço | Valor |
|---|---|
| Tabelas de medidas | R$ 60,00 a R$ 150,00 |
| Ficha técnica | R$ 100,00 a R$ 250,00 |
| Assessoria – 1 hora | R$ 130,00/h |
| Assessoria – acima de 10 horas | R$ 100,00/h |
| Aula particular | R$ 125,00/h |
| Diária presencial na empresa | R$ 400,00 |
| Km rodado (deslocamento) | R$ 1,50/km |

---

## Lógica de cálculo — regras de negócio

### Regra 1 — Graduação sobre modelagem desenvolvida pela Débora

Quando os moldes foram **criados pela Débora** no mesmo orçamento:

```
valor_graduação_por_tamanho = valor_modelagem × percentual_graduação
```

- Moldes básicos: `percentual = 0.25` (25%)
- Moldes complexos (muitos recortes, torções): `percentual = 0.30` (30%)

**Exemplo real (extraído de orcamento_1.jpeg):**
```
Molde Jaqueta         → R$ 130,00
Graduação Jaqueta     → R$ 130,00 × 0.25 = R$ 32,50 por tamanho
Graduação × 6 tam.    → R$ 32,50 × 6 = R$ 195,00

Molde Camiseta Polo   → R$ 120,00
Graduação Camiseta    → R$ 120,00 × 0.25 = R$ 30,00 por tamanho
Graduação × 6 tam.    → R$ 30,00 × 6 = R$ 180,00
```

### Regra 2 — Peça piloto

```
valor_piloto = valor_modelagem × 0.50
```

O cliente fornece o tecido e os aviamentos. O serviço é exclusivamente corte e costura.

**Exemplo:**
```
Molde Jaqueta → R$ 130,00
Piloto Jaqueta → R$ 130,00 × 0.50 = R$ 65,00
```

> ⚠️ Nota: O PDF listava "mesmo valor da modelagem", mas a planilha Excel confirma 50% (`=$E$5*C7` com E5=0.50). O sistema usa 50% como padrão, configurável.

### Regra 3 — Replicação de categoria

Ao replicar Modelagem → Graduação, o sistema:
1. Cria um item de Graduação para cada item de Modelagem
2. Aplica automaticamente `valor = valor_modelagem × percentual_graduação`
3. Preenche a quantidade como "número de tamanhos" (editável)
4. Mantém o valor unitário editável manualmente

Ao replicar Modelagem → Piloto, o sistema:
1. Cria um item de Piloto para cada item de Modelagem
2. Aplica automaticamente `valor = valor_modelagem × 0.50`
3. Mantém o valor unitário editável manualmente

### Regra 4 — Desconto

Descontos podem ser aplicados em três níveis:

| Nível | Onde | Tipo |
|---|---|---|
| Item individual | Campo de desconto por item | % ou R$ fixo |
| Categoria | Ajuste em lote na seção | % ou R$ fixo |
| Orçamento total | Campo no passo de revisão | % ou R$ fixo |

**Prioridade:** os descontos são aplicados de dentro para fora:
1. Desconto do item → `preço_item_com_desconto`
2. Desconto de categoria → aplicado sobre soma dos itens (após desconto individual)
3. Desconto global → aplicado sobre o total geral

### Regra 5 — Graduação de molde recebido

Quando o cliente traz o molde pronto (não desenvolvido pela Débora), o valor é **fixo por tamanho**, não percentual:

| Complexidade | Valor por tamanho |
|---|---|
| Básico | R$ 30,00 |
| Intermediário | R$ 35,00 |
| Elaborado | R$ 40,00 |

No sistema, ao adicionar um item de Graduação sem Modelagem correspondente, o campo de valor é preenchido com o valor fixo da tabela (editável).

---

## Observações obrigatórias do orçamento

Estas observações aparecem em todo PDF de orçamento emitido:

1. Valores podem sofrer alteração de acordo com o nível de complexidade do modelo. Solicitar orçamento prévio.
2. A contagem do prazo só inicia após a entrega de todo o material (croqui, matéria-prima, especificações) e confirmação do pagamento.
3. Peça Piloto é obrigatória para o teste de modelagem e pode ser executada pela empresa contratante.
4. Deslocamento: além do valor por Km, o tempo em horário comercial é cobrado a 40% do valor da hora de trabalho.
5. Custos extras (alimentação, estadia e outros) para execução do serviço são de responsabilidade do contratante.

---

## Parâmetros configuráveis no sistema

| Parâmetro | Valor padrão | Onde configurar |
|---|---|---|
| % Graduação básica | 25% | Configurações → Parâmetros |
| % Graduação complexa | 30% | Configurações → Parâmetros |
| % Peça piloto | 50% | Configurações → Parâmetros |
| R$/metro plotagem | R$ 8,50 | Configurações → Parâmetros |
| R$/km deslocamento | R$ 1,50 | Configurações → Parâmetros |
