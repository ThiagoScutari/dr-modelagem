import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { compare } from "bcryptjs";
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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "debora@drmodelagem.com" },
  });
  if (!user) {
    console.log("❌ Usuário não encontrado");
    return;
  }

  const originalMatch = await compare("dr@modelagem2024", user.password);
  console.log("Senha original (dr@modelagem2024):", originalMatch ? "✅ MATCH" : "❌ não match");

  if (!originalMatch) {
    console.log("→ A senha foi alterada pelo reset. Verifique o Telegram para a nova senha.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
