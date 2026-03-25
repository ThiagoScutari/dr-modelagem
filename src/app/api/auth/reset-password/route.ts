import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendTelegramNotification } from "@/lib/telegram";

const words = ["Mar", "Sol", "Praia", "Onda", "Areia"];

export function generateTempPassword(): string {
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${word}@${num}`;
}

const GENERIC_MESSAGE =
  "Se o e-mail estiver cadastrado, você receberá a nova senha pelo Telegram.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return Response.json({ message: GENERIC_MESSAGE });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return Response.json({ message: GENERIC_MESSAGE });
    }

    const tempPassword = generateTempPassword();
    const hashed = await hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    const sent = await sendTelegramNotification(
      `🔑 *Nova senha temporária*\n\n` +
        `Senha: \`${tempPassword}\`\n\n` +
        `Acesse: https://dr-modelagem.vercel.app\n` +
        `Troque sua senha após entrar.`
    );

    return Response.json({
      message: GENERIC_MESSAGE,
      telegramSent: sent,
    });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return Response.json(
      { message: GENERIC_MESSAGE, error: "internal" },
      { status: 500 }
    );
  }
}
