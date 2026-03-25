"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileDown,
  MessageCircle,
  Copy,
  Pencil,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react";
import {
  updateQuoteStatus,
  duplicateQuote,
} from "@/app/actions/quotes";
import { formatBRL, formatDate, formatCNPJ } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { QuoteStatus, ServiceCategory } from "@prisma/client";

const categoryLabels: Record<ServiceCategory, string> = {
  DIGITALIZACAO: "Digitalização",
  MODELAGEM: "Modelagem",
  GRADUACAO: "Graduação",
  ENCAIXE: "Encaixe",
  PLOTAGEM: "Plotagem",
  PILOTO: "Peças Piloto",
  CONVERSAO: "Conversão",
  CONSULTORIA: "Consultoria",
  OUTROS: "Outros",
};

const nextStatusMap: Partial<Record<QuoteStatus, { status: QuoteStatus; label: string }>> = {
  AGUARDANDO: { status: "APROVADO", label: "Marcar como Aprovado" },
  APROVADO: { status: "EM_ANDAMENTO", label: "Iniciar Trabalho" },
  EM_ANDAMENTO: { status: "FINALIZADO", label: "Finalizar" },
};

interface QuoteItem {
  id: string;
  category: ServiceCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  discountPct: number | null;
  discountFixed: number | null;
  sortOrder: number;
  sourceItemId: string | null;
}

interface QuoteData {
  id: string;
  status: QuoteStatus;
  totalGross: number;
  totalNet: number;
  discountPct: number | null;
  discountFixed: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  validUntil: string | null;
  client: { id: string; name: string; phone: string | null; document: string | null };
  items: QuoteItem[];
}

interface PresenterData {
  name: string;
  razaoSocial: string;
  cnpj: string;
  observations: string;
}

export function QuoteDetail({
  quote: initialQuote,
  presenter,
}: {
  quote: QuoteData;
  presenter: PresenterData | null;
}) {
  const [quote, setQuote] = useState(initialQuote);
  const [showMenu, setShowMenu] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const nextStatus = nextStatusMap[quote.status];

  // Group items by category
  const categories = [...new Set(quote.items.map((i) => i.category))] as ServiceCategory[];

  async function handleStatusChange() {
    if (!nextStatus) return;
    if (!confirm(`Confirma: ${nextStatus.label}?`)) return;

    setChangingStatus(true);
    const result = await updateQuoteStatus(quote.id, nextStatus.status);
    if (result.success) {
      setQuote((q) => ({ ...q, status: nextStatus.status }));
      toast(nextStatus.label, "success");
    }
    setChangingStatus(false);
  }

  async function handleDuplicate() {
    await duplicateQuote(quote.id);
  }

  function handleWhatsApp() {
    const message = buildWhatsAppMessage({
      clientName: quote.client.name,
      items: quote.items,
      totalNet: quote.totalNet,
      createdAt: quote.createdAt,
      validUntil: quote.validUntil,
    });
    const url = buildWhatsAppUrl(quote.client.phone ?? "", message);
    window.open(url, "_blank");
  }

  const discountValue = quote.discountPct
    ? quote.totalGross * quote.discountPct
    : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-medium text-noite">
            {quote.client.name}
          </h2>
          <p className="text-xs text-noite/50">
            {formatDate(quote.createdAt)}
            {quote.validUntil &&
              ` · Válido até ${formatDate(quote.validUntil)}`}
          </p>
        </div>
        <Badge status={quote.status} />
      </div>

      {/* Prestadora */}
      {presenter && (
        <div className="rounded-xl bg-creme p-4 text-xs text-noite/60 space-y-0.5">
          <p className="font-medium text-noite">{presenter.name}</p>
          <p>{presenter.razaoSocial}</p>
          <p>CNPJ: {formatCNPJ(presenter.cnpj)}</p>
        </div>
      )}

      {/* Itens por categoria */}
      {categories.map((cat) => {
        const catItems = quote.items.filter((i) => i.category === cat);
        const catTotal = catItems.reduce((s, i) => s + i.finalPrice, 0);

        return (
          <div key={cat} className="card p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ceu/10">
              <span className="text-sm font-medium text-noite">
                {categoryLabels[cat]}
              </span>
              <span className="text-sm font-mono text-mar">
                {formatBRL(catTotal)}
              </span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {catItems.map((item) => (
                  <tr key={item.id} className="border-b border-ceu/5">
                    <td className="px-4 py-2 text-noite">{item.description}</td>
                    <td className="px-2 py-2 text-right font-mono text-noite/60">
                      {formatBRL(item.unitPrice)}
                    </td>
                    <td className="px-2 py-2 text-center text-noite/60">
                      ×{item.quantity}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-medium text-noite">
                      {formatBRL(item.finalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Totais */}
      <div className="card space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-noite/60">Subtotal</span>
          <span className="font-mono">{formatBRL(quote.totalGross)}</span>
        </div>
        {discountValue > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-coral/70">
              Desconto ({((quote.discountPct ?? 0) * 100).toFixed(0)}%)
            </span>
            <span className="font-mono text-coral">
              -{formatBRL(discountValue)}
            </span>
          </div>
        )}
        <div className="border-t border-ceu/20 pt-2 flex justify-between">
          <span className="font-semibold text-noite">TOTAL</span>
          <span className="text-lg font-mono font-bold text-noite">
            {formatBRL(quote.totalNet)}
          </span>
        </div>
      </div>

      {/* Observações */}
      {presenter && (
        <div className="text-[10px] text-noite/40 leading-relaxed space-y-0.5 px-1">
          {presenter.observations.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {/* Barra de ações fixada no bottom */}
      <div className="fixed bottom-20 left-0 right-0 z-30 mx-auto max-w-lg px-5">
        <div className="glass rounded-xl border border-ceu/20 p-3 flex items-center gap-2">
          {nextStatus && (
            <Button
              onClick={handleStatusChange}
              loading={changingStatus}
              className="flex-1 text-xs"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {nextStatus.label}
            </Button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-ceu/15 text-noite/60 hover:bg-ceu/25"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute bottom-12 right-0 z-50 w-48 rounded-xl bg-white border border-ceu/20 shadow-float py-1">
                <MenuButton
                  icon={<FileDown className="h-4 w-4" />}
                  label="Gerar PDF"
                  onClick={() => {
                    window.open(`/api/pdf/quote/${quote.id}`, "_blank");
                    setShowMenu(false);
                  }}
                />
                <MenuButton
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="Enviar WhatsApp"
                  onClick={() => {
                    handleWhatsApp();
                    setShowMenu(false);
                  }}
                />
                <MenuButton
                  icon={<Copy className="h-4 w-4" />}
                  label="Duplicar"
                  onClick={() => {
                    handleDuplicate();
                    setShowMenu(false);
                  }}
                />
                <MenuButton
                  icon={<Pencil className="h-4 w-4" />}
                  label="Editar"
                  onClick={() => {
                    router.push(`/orcamentos/${quote.id}/editar`);
                    setShowMenu(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-noite hover:bg-espuma/20 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
