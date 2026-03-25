import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const content = readFileSync(resolve(".env.local"), "utf-8");
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq);
    let v = t.slice(eq + 1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

console.log("DATABASE_URL:", process.env.DATABASE_URL?.slice(0, 60) + "...");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log("\n--- Users ---");
  users.forEach((u) => console.log(`  ${u.email} (${u.name})`));

  const clients = await prisma.client.findMany();
  console.log(`\n--- Clients: ${clients.length} ---`);
  clients.forEach((c) => console.log(`  ${c.name}`));

  const pricing = await prisma.pricingItem.count();
  console.log(`\n--- PricingItems: ${pricing} ---`);

  const config = await prisma.pricingConfig.findFirst();
  console.log(`\n--- PricingConfig: ${config ? "exists" : "MISSING"} ---`);

  const presenter = await prisma.presenterConfig.findFirst();
  console.log(`--- PresenterConfig: ${presenter ? presenter.name : "MISSING"} ---`);

  const quotes = await prisma.quote.findMany({ include: { client: true } });
  console.log(`\n--- Quotes: ${quotes.length} ---`);
  quotes.forEach((q) =>
    console.log(`  ${q.client.name} — ${q.status} — R$ ${Number(q.totalNet)}`)
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
