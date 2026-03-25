import { formatBRL, formatDate } from "@/lib/format";

interface QuoteForWhatsApp {
  clientName: string;
  items: { description: string; finalPrice: number }[];
  totalNet: number;
  createdAt: string;
  validUntil: string | null;
}

export function buildWhatsAppMessage(quote: QuoteForWhatsApp): string {
  const items = quote.items
    .map((i) => `• ${i.description}: ${formatBRL(i.finalPrice)}`)
    .join("\n");

  const lines = [
    `*Orçamento DR Modelagem*`,
    ``,
    `Cliente: ${quote.clientName}`,
    `Data: ${formatDate(quote.createdAt)}`,
    ``,
    `*Serviços:*`,
    items,
    ``,
    `*Total: ${formatBRL(quote.totalNet)}*`,
  ];

  if (quote.validUntil) {
    lines.push(``, `Válido até: ${formatDate(quote.validUntil)}`);
  }

  lines.push(``, `Para mais detalhes, solicite o PDF completo.`);

  return encodeURIComponent(lines.join("\n"));
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${message}`;
}
