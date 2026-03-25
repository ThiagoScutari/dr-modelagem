import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const client = await prisma.client.upsert({
    where: { id: "sample-client-01" },
    update: {},
    create: {
      id: "sample-client-01",
      name: "Atelier Rosa",
      phone: "47999887766",
      email: "contato@atelierrosa.com.br",
    },
  });

  const quote = await prisma.quote.create({
    data: {
      clientId: client.id,
      status: "APROVADO",
      totalGross: 660,
      totalNet: 660,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      notes: "Coleção verão 2025",
      items: {
        create: [
          {
            category: "MODELAGEM",
            description: "Molde Vestido Evasê",
            quantity: 1,
            unitPrice: 200,
            finalPrice: 200,
            sortOrder: 0,
          },
          {
            category: "MODELAGEM",
            description: "Molde Blusa Cropped",
            quantity: 1,
            unitPrice: 130,
            finalPrice: 130,
            sortOrder: 1,
          },
          {
            category: "GRADUACAO",
            description: "Graduação Vestido Evasê",
            quantity: 4,
            unitPrice: 50,
            finalPrice: 200,
            sortOrder: 2,
          },
          {
            category: "GRADUACAO",
            description: "Graduação Blusa Cropped",
            quantity: 4,
            unitPrice: 32.5,
            finalPrice: 130,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  console.log("✓ Dados criados:", quote.id);
  return quote.id;
}

main()
  .then((id) => {
    console.log("Abrir em: /orcamentos/" + id);
    process.exit(0);
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
