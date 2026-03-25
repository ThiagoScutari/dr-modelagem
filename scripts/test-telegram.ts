import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local
try {
  const content = readFileSync(resolve(".env.local"), "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex);
    let value = trimmed.slice(eqIndex + 1);
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch { /* ignore */ }

async function main() {
  console.log("Testando Telegram...");
  console.log(
    "BOT_TOKEN:",
    process.env.TELEGRAM_BOT_TOKEN
      ? `${process.env.TELEGRAM_BOT_TOKEN.slice(0, 10)}...`
      : "❌ NÃO CONFIGURADO"
  );
  console.log(
    "CHAT_ID:",
    process.env.TELEGRAM_CHAT_ID
      ? process.env.TELEGRAM_CHAT_ID
      : "❌ NÃO CONFIGURADO"
  );

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("❌ Variáveis faltando — abortando.");
    process.exit(1);
  }

  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  console.log("URL:", apiUrl.slice(0, 50) + "...");

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "🧪 Teste de conexão — DR Modelagem\nSe você recebeu isso, o Telegram está funcionando!",
      parse_mode: "Markdown",
    }),
  });

  const body = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(body, null, 2));

  if (res.ok) {
    console.log("✅ Telegram funcionando!");
  } else {
    console.log("❌ Falha no envio");
  }
}

main().catch(console.error);
