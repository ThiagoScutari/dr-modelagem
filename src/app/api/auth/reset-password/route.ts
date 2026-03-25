import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendTelegramNotification } from "@/lib/telegram";

const words = ["Mar", "Sol", "Praia", "Onda", "Areia"];

function generateTempPassword(): string {
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${word}@${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return Response.json(
        { message: "Se o e-mail estiver cadastrado, você receberá a nova senha pelo Telegram." },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (user) {
      const tempPassword = generateTempPassword();
      const hashed = await hash(tempPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      await sendTelegramNotification(
        `🔑 *Nova senha temporária*\n\n` +
          `Senha: \`${tempPassword}\`\n\n` +
          `Acesse: https://dr-modelagem.vercel.app\n` +
          `Troque sua senha após entrar.`
      );
    }

    // Always return the same response — don't reveal if email exists
    return Response.json({
      message: "Se o e-mail estiver cadastrado, você receberá a nova senha pelo Telegram.",
    });
  } catch {
    return Response.json({
      message: "Se o e-mail estiver cadastrado, você receberá a nova senha pelo Telegram.",
    });
  }
}
