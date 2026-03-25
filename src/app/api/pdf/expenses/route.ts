import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { listExpenses } from "@/app/actions/expenses";
import { getPresenterConfig } from "@/app/actions/presenter";
import { ExpensesPDF } from "@/lib/pdf/expenses-pdf";
import { auth } from "@/lib/auth";

const LOGO_URL = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}/logo.png`
  : "http://localhost:3000/logo.png";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response("Não autorizado", { status: 401 });
  }

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId") ?? undefined;

  const [expenses, presenter] = await Promise.all([
    listExpenses({ clientId }),
    getPresenterConfig(),
  ]);

  if (!presenter) {
    return new Response("Dados da prestadora não configurados", { status: 500 });
  }

  const now = new Date();
  const period = `${now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;

  const logoSrc = LOGO_URL;

  const pdfBuffer = await renderToBuffer(
    ExpensesPDF({
      logoSrc,
      expenses: expenses.map((e) => ({
        description: e.description,
        category: e.category,
        amount: Number(e.amount),
        date: e.date.toISOString(),
        clientName: e.client?.name ?? null,
      })),
      presenter: { name: presenter.name, cnpj: presenter.cnpj },
      period,
      clientFilter: clientId
        ? expenses.find((e) => e.clientId === clientId)?.client?.name ?? undefined
        : undefined,
    })
  );

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="despesas-${now.toISOString().slice(0, 7)}.pdf"`,
    },
  });
}
