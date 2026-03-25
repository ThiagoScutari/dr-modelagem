import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env
  checks.DATABASE_URL = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.slice(0, 40) + "..."
    : "MISSING";
  checks.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    ? "set (" + process.env.TELEGRAM_BOT_TOKEN.slice(0, 8) + "...)"
    : "MISSING";
  checks.TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "MISSING";

  // Check DB connection
  try {
    const count = await prisma.user.count();
    checks.db_connection = `OK (${count} users)`;
  } catch (e) {
    checks.db_connection = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check Telegram
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getMe`
      );
      const data = await res.json();
      checks.telegram = data.ok
        ? `OK (${data.result.username})`
        : `ERROR: ${JSON.stringify(data)}`;
    } else {
      checks.telegram = "MISSING ENV VARS";
    }
  } catch (e) {
    checks.telegram = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return Response.json(checks);
}
