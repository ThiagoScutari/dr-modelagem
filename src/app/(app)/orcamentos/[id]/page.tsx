import { notFound } from "next/navigation";
import { getQuote } from "@/app/actions/quotes";
import { getPresenterConfig } from "@/app/actions/presenter";
import { QuoteDetail } from "./quote-detail";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, presenter] = await Promise.all([
    getQuote(id),
    getPresenterConfig(),
  ]);

  if (!quote) notFound();

  return (
    <QuoteDetail
      quote={{
        ...quote,
        totalGross: Number(quote.totalGross),
        totalNet: Number(quote.totalNet),
        discountPct: quote.discountPct ? Number(quote.discountPct) : null,
        discountFixed: quote.discountFixed ? Number(quote.discountFixed) : null,
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
        validUntil: quote.validUntil?.toISOString() ?? null,
        items: quote.items.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          finalPrice: Number(i.finalPrice),
          discountPct: i.discountPct ? Number(i.discountPct) : null,
          discountFixed: i.discountFixed ? Number(i.discountFixed) : null,
        })),
      }}
      presenter={
        presenter
          ? {
              name: presenter.name,
              razaoSocial: presenter.razaoSocial,
              cnpj: presenter.cnpj,
              observations: presenter.observations,
            }
          : null
      }
    />
  );
}
