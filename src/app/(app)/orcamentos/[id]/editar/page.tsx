import { notFound } from "next/navigation";
import { getQuote } from "@/app/actions/quotes";
import { EditQuoteClient } from "./edit-client";

export default async function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) notFound();

  return (
    <EditQuoteClient
      quoteId={id}
      initialDraft={{
        clientId: quote.clientId,
        clientName: quote.client.name,
        validUntil: quote.validUntil
          ? quote.validUntil.toISOString().split("T")[0]
          : null,
        notes: quote.notes ?? "",
        discountPct: quote.discountPct ? Number(quote.discountPct) : 0,
        totalGross: Number(quote.totalGross),
        totalNet: Number(quote.totalNet),
        items: quote.items.map((i) => ({
          id: i.id,
          category: i.category,
          description: i.description,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          discountPct: i.discountPct ? Number(i.discountPct) : 0,
          finalPrice: Number(i.finalPrice),
          sourceItemId: i.sourceItemId,
        })),
      }}
    />
  );
}
