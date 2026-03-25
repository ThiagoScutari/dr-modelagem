export const dynamic = "force-dynamic";

import { listPricingItems } from "@/app/actions/pricing";
import { ServiceCategory } from "@prisma/client";
import { PricingCategorySection } from "./pricing-category-section";

const categoryLabels: Record<ServiceCategory, string> = {
  DIGITALIZACAO: "Digitalização de Moldes",
  MODELAGEM: "Modelagem",
  GRADUACAO: "Graduação",
  ENCAIXE: "Encaixe",
  PLOTAGEM: "Plotagem",
  PILOTO: "Peças Piloto",
  CONVERSAO: "Conversão de Arquivos",
  CONSULTORIA: "Consultoria",
  OUTROS: "Outros",
};

const categoryOrder: ServiceCategory[] = [
  "MODELAGEM",
  "GRADUACAO",
  "DIGITALIZACAO",
  "ENCAIXE",
  "PLOTAGEM",
  "PILOTO",
  "CONVERSAO",
  "CONSULTORIA",
  "OUTROS",
];

export default async function PrecosPage() {
  const items = await listPricingItems();

  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    items: items.filter((i) => i.category === cat),
  }));

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-noite">
        Tabela de Preços
      </h2>
      {grouped.map((group) => (
        <PricingCategorySection
          key={group.category}
          category={group.category}
          label={group.label}
          items={group.items.map((i) => ({
            ...i,
            priceMin: Number(i.priceMin),
            priceMax: i.priceMax ? Number(i.priceMax) : null,
          }))}
        />
      ))}
    </div>
  );
}
