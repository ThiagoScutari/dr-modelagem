import { describe, it, expect } from "vitest";
import {
  calcItemFinalPrice,
  calcTotalGross,
  calcTotalNet,
  calcGraduationPrice,
  calcPilotPrice,
  replicateItems,
  recalcDraft,
} from "../lib/quote-calc";
import type { QuoteItemDraft } from "../types/quote";

function makeItem(
  overrides: Partial<QuoteItemDraft> = {}
): QuoteItemDraft {
  return {
    id: "test-1",
    category: "MODELAGEM",
    description: "Molde Jaqueta",
    quantity: 1,
    unitPrice: 130,
    discountPct: 0,
    finalPrice: 130,
    sourceItemId: null,
    ...overrides,
  };
}

describe("calcItemFinalPrice", () => {
  it("calcula preço sem desconto", () => {
    expect(calcItemFinalPrice(makeItem())).toBe(130);
  });

  it("calcula preço com quantidade", () => {
    expect(calcItemFinalPrice(makeItem({ quantity: 6 }))).toBe(780);
  });

  it("calcula preço com desconto 10%", () => {
    expect(calcItemFinalPrice(makeItem({ discountPct: 0.1 }))).toBeCloseTo(117);
  });
});

describe("calcTotalGross", () => {
  it("soma itens corretamente", () => {
    const items = [
      makeItem({ unitPrice: 130 }),
      makeItem({ id: "test-2", unitPrice: 120 }),
      makeItem({ id: "test-3", unitPrice: 80 }),
    ];
    expect(calcTotalGross(items)).toBe(330);
  });
});

describe("calcTotalNet", () => {
  it("aplica desconto global", () => {
    expect(calcTotalNet(1000, 0.1)).toBe(900);
  });

  it("sem desconto retorna o bruto", () => {
    expect(calcTotalNet(1450, 0)).toBe(1450);
  });
});

describe("calcGraduationPrice", () => {
  it("25% sobre R$130 = R$32,50", () => {
    expect(calcGraduationPrice(130, 0.25)).toBeCloseTo(32.5);
  });

  it("30% sobre R$130 = R$39", () => {
    expect(calcGraduationPrice(130, 0.3)).toBeCloseTo(39);
  });
});

describe("calcPilotPrice", () => {
  it("50% sobre R$130 = R$65", () => {
    expect(calcPilotPrice(130, 0.5)).toBe(65);
  });
});

describe("replicateItems — caso CEI Menino Jesus", () => {
  const config = {
    graduationPctBasic: 0.25,
    graduationPctComplex: 0.3,
    pilotPct: 0.5,
    plottingPricePerMeter: 8.5,
    kmPrice: 1.5,
  };

  const modelagem: QuoteItemDraft[] = [
    makeItem({ id: "m1", description: "Jaqueta", unitPrice: 130 }),
    makeItem({ id: "m2", description: "Camiseta Polo", unitPrice: 120 }),
    makeItem({ id: "m3", description: "Camiseta sem Manga", unitPrice: 80 }),
    makeItem({ id: "m4", description: "Jaqueta Canguru", unitPrice: 150 }),
    makeItem({ id: "m5", description: "Blusão Careca", unitPrice: 100 }),
  ];

  it("replica para graduação com 25%", () => {
    const graduacao = replicateItems(modelagem, "GRADUACAO", config);
    expect(graduacao).toHaveLength(5);
    expect(graduacao[0].unitPrice).toBeCloseTo(32.5); // 130 × 0.25
    expect(graduacao[1].unitPrice).toBeCloseTo(30); // 120 × 0.25
    expect(graduacao[2].unitPrice).toBeCloseTo(20); // 80 × 0.25
    expect(graduacao[3].unitPrice).toBeCloseTo(37.5); // 150 × 0.25
    expect(graduacao[4].unitPrice).toBeCloseTo(25); // 100 × 0.25
    expect(graduacao[0].category).toBe("GRADUACAO");
  });

  it("replica para piloto com 50%", () => {
    const piloto = replicateItems(modelagem, "PILOTO", config);
    expect(piloto[0].unitPrice).toBe(65); // 130 × 0.50
    expect(piloto[4].unitPrice).toBe(50); // 100 × 0.50
  });

  it("total CEI Menino Jesus = R$ 1.450,00", () => {
    // Modelagem: 130+120+80+150+100 = 580
    const modelagemTotal = calcTotalGross(modelagem);
    expect(modelagemTotal).toBe(580);

    // Graduação com 6 tamanhos cada
    const graduacao = replicateItems(modelagem, "GRADUACAO", config).map(
      (item) => ({ ...item, quantity: 6, finalPrice: item.unitPrice * 6 })
    );
    const graduacaoTotal = calcTotalGross(graduacao);
    expect(graduacaoTotal).toBe(870);

    // Total
    expect(modelagemTotal + graduacaoTotal).toBe(1450);
  });
});

describe("recalcDraft", () => {
  it("recalcula tudo corretamente", () => {
    const items = [
      makeItem({ unitPrice: 100, quantity: 2, discountPct: 0 }),
    ];
    const result = recalcDraft(items, 0.1);
    expect(result.totalGross).toBe(200);
    expect(result.totalNet).toBeCloseTo(180);
    expect(result.items[0].finalPrice).toBe(200);
  });
});
