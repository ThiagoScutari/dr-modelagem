import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getQuote } from "@/app/actions/quotes";
import { getPresenterConfig } from "@/app/actions/presenter";
import { QuotePDF } from "@/lib/pdf/quote-pdf";
import { auth } from "@/lib/auth";

const LOGO_URL = process.env.NEXTAUTH_URL
  ? `${process.env.NEXTAUTH_URL}/logo.png`
  : "http://localhost:3000/logo.png";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return new Response("Não autorizado", { status: 401 });
  }

  const { id } = await params;
  const [quote, presenter] = await Promise.all([
    getQuote(id),
    getPresenterConfig(),
  ]);

  if (!quote) {
    return new Response("Orçamento não encontrado", { status: 404 });
  }

  if (!presenter) {
    return new Response("Dados da prestadora não configurados", {
      status: 500,
    });
  }

  const logoSrc = LOGO_URL;

  const pdfBuffer = await renderToBuffer(
    QuotePDF({
      logoSrc,
      quote: {
        clientName: quote.client.name,
        clientDocument: quote.client.document,
        createdAt: quote.createdAt.toISOString(),
        validUntil: quote.validUntil?.toISOString() ?? null,
        items: quote.items.map((i) => ({
          category: i.category,
          description: i.description,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          finalPrice: Number(i.finalPrice),
          graduationPct: i.graduationPct ? Number(i.graduationPct) : null,
          basePrice: i.basePrice ? Number(i.basePrice) : null,
        })),
        totalGross: Number(quote.totalGross),
        totalNet: Number(quote.totalNet),
        discountPct: quote.discountPct ? Number(quote.discountPct) : null,
        notes: quote.notes,
      },
      presenter: {
        name: presenter.name,
        razaoSocial: presenter.razaoSocial,
        cnpj: presenter.cnpj,
        observations: presenter.observations,
      },
    })
  );

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orcamento-${id.slice(0, 8)}.pdf"`,
    },
  });
}
