import { PrismaClient, ServiceCategory, PricingUnit } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Usuário inicial (Débora) ───
  const passwordHash = await hash("dr@modelagem2024", 12);
  await prisma.user.upsert({
    where: { email: "debora@drmodelagem.com" },
    update: {},
    create: {
      email: "debora@drmodelagem.com",
      password: passwordHash,
      name: "Débora da Rosa",
    },
  });
  console.log("✅ Usuário Débora criado");

  // ─── PricingConfig (singleton) ───
  const existing = await prisma.pricingConfig.findFirst();
  if (!existing) {
    await prisma.pricingConfig.create({
      data: {
        graduationPctBasic: 0.25,
        graduationPctComplex: 0.3,
        pilotPct: 0.5,
        plottingPricePerMeter: 8.5,
        kmPrice: 1.5,
      },
    });
    console.log("✅ PricingConfig criado");
  } else {
    console.log("✅ PricingConfig já existe");
  }

  // ─── PricingItems — Tabela oficial de preços ───
  const pricingItems: {
    category: ServiceCategory;
    name: string;
    priceMin: number;
    priceMax?: number;
    unit?: PricingUnit;
  }[] = [
    // MODELAGEM
    {
      category: "MODELAGEM",
      name: "Modelagem básica (camiseta, regata)",
      priceMin: 100,
      priceMax: 120,
    },
    {
      category: "MODELAGEM",
      name: "Modelagem intermediária 1 (t-shirt, cropped)",
      priceMin: 130,
      priceMax: 130,
    },
    {
      category: "MODELAGEM",
      name: "Modelagem intermediária 2 (blusão, calça mol.)",
      priceMin: 140,
      priceMax: 140,
    },
    {
      category: "MODELAGEM",
      name: "Modelagem elaborada/fashion 1 (top, botton)",
      priceMin: 150,
      priceMax: 180,
    },
    {
      category: "MODELAGEM",
      name: "Modelagem elaborada/fashion 2 (vestido, mac.)",
      priceMin: 180,
      priceMax: 230,
    },
    {
      category: "MODELAGEM",
      name: "Modelagem alfaiataria simples",
      priceMin: 200,
      priceMax: 250,
    },
    {
      category: "MODELAGEM",
      name: "Modelagem alfaiataria elaborada",
      priceMin: 250,
      priceMax: 350,
    },
    {
      category: "MODELAGEM",
      name: "Alteração de modelagem – arquivo",
      priceMin: 40,
      priceMax: 150,
    },
    // ENCAIXE
    {
      category: "ENCAIXE",
      name: "Encaixe molde – tamanho base",
      priceMin: 12,
      unit: "PER_FILE",
    },
    {
      category: "ENCAIXE",
      name: "Encaixe produção – 1 TEC",
      priceMin: 15,
      unit: "PER_FILE",
    },
    {
      category: "ENCAIXE",
      name: "Encaixe elaborado – 2 TEC",
      priceMin: 18,
      unit: "PER_FILE",
    },
    {
      category: "ENCAIXE",
      name: "Encaixe elaborado – 3 TEC",
      priceMin: 22,
      unit: "PER_FILE",
    },
    {
      category: "ENCAIXE",
      name: "Encaixe elaborado – 4 TEC",
      priceMin: 25,
      unit: "PER_FILE",
    },
    {
      category: "ENCAIXE",
      name: "Referência adicional – acréscimo",
      priceMin: 5,
      unit: "PER_FILE",
    },
    {
      category: "ENCAIXE",
      name: "Geração de consumo",
      priceMin: 15,
      unit: "PER_FILE",
    },
    // PLOTAGEM
    {
      category: "PLOTAGEM",
      name: "Plotagem (até 91 cm largura)",
      priceMin: 8.5,
      unit: "PER_METER",
    },
    // GRADUAÇÃO (molde recebido)
    {
      category: "GRADUACAO",
      name: "Graduação básica (molde recebido)",
      priceMin: 30,
      unit: "PER_SIZE",
    },
    {
      category: "GRADUACAO",
      name: "Graduação intermediária (molde recebido)",
      priceMin: 35,
      unit: "PER_SIZE",
    },
    {
      category: "GRADUACAO",
      name: "Graduação elaborada (molde recebido)",
      priceMin: 40,
      unit: "PER_SIZE",
    },
    // DIGITALIZAÇÃO
    {
      category: "DIGITALIZACAO",
      name: "Básico 1 – até 2 partes",
      priceMin: 30,
    },
    {
      category: "DIGITALIZACAO",
      name: "Básico 2 – até 3 partes",
      priceMin: 45,
    },
    {
      category: "DIGITALIZACAO",
      name: "Intermediário 1 – de 4 a 8 partes",
      priceMin: 60,
    },
    {
      category: "DIGITALIZACAO",
      name: "Intermediário 2 – de 9 a 12 partes",
      priceMin: 75,
    },
    {
      category: "DIGITALIZACAO",
      name: "Elaborado – acima de 13 partes",
      priceMin: 90,
    },
    // CONVERSÃO
    {
      category: "CONVERSAO",
      name: "Conversão plt/pdf – por arquivo",
      priceMin: 15,
      unit: "PER_FILE",
    },
    {
      category: "CONVERSAO",
      name: "Conversão pacote 10–30 arquivos",
      priceMin: 80,
    },
    {
      category: "CONVERSAO",
      name: "Conversão pacote até 30 arquivos",
      priceMin: 200,
    },
    // CONSULTORIA
    {
      category: "CONSULTORIA",
      name: "Assessoria – 1 hora",
      priceMin: 130,
      unit: "PER_HOUR",
    },
    {
      category: "CONSULTORIA",
      name: "Assessoria – acima de 10 horas",
      priceMin: 100,
      unit: "PER_HOUR",
    },
    {
      category: "CONSULTORIA",
      name: "Aula particular",
      priceMin: 125,
      unit: "PER_HOUR",
    },
    {
      category: "CONSULTORIA",
      name: "Diária presencial na empresa",
      priceMin: 400,
    },
  ];

  for (const [index, item] of pricingItems.entries()) {
    await prisma.pricingItem.upsert({
      where: { id: `seed-${item.category}-${index}` },
      update: {},
      create: {
        id: `seed-${item.category}-${index}`,
        category: item.category,
        name: item.name,
        priceMin: item.priceMin,
        priceMax: item.priceMax ?? null,
        unit: item.unit ?? "PER_UNIT",
        sortOrder: index,
      },
    });
  }
  console.log(`✅ ${pricingItems.length} PricingItems criados`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
