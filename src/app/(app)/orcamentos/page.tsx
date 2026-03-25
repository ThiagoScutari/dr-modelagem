import { listQuotes } from "@/app/actions/quotes";
import { QuoteListClient } from "./quote-list-client";

export default async function OrcamentosPage() {
  const quotes = await listQuotes();

  return (
    <QuoteListClient
      initialQuotes={quotes.map((q) => ({
        id: q.id,
        clientName: q.client.name,
        status: q.status,
        totalNet: Number(q.totalNet),
        createdAt: q.createdAt.toISOString(),
        validUntil: q.validUntil?.toISOString() ?? null,
        itemsCount: q._count.items,
      }))}
    />
  );
}
