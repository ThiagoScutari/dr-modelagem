import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local
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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await hash("dr@modelagem2024", 12);
  const user = await prisma.user.update({
    where: { email: "debora@drmodelagem.com" },
    data: { password: hashed },
  });
  console.log("✅ Senha restaurada para: dr@modelagem2024");
  console.log("   User:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
