"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Pencil, Trash2, MessageCircle, ChevronRight } from "lucide-react";
import { initials, avatarColor, formatPhone, formatCNPJ, formatCPF, formatBRL, formatDate } from "@/lib/format";
import { deleteClient, getClientStats } from "@/app/actions/clients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/loading";
import type { ClientData } from "./client-list";
import type { QuoteStatus } from "@prisma/client";

interface Props {
  client: ClientData;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: (id: string) => void;
}

interface ClientStats {
  totalRevenue: number;
  totalExpenses: number;
  recentQuotes: { id: string; status: QuoteStatus; totalNet: number; createdAt: string }[];
}

export function ClientDetailSheet({ client, onClose, onEdit, onDeleted }: Props) {
  const { toast } = useToast();
  const [stats, setStats] = useState<ClientStats | null>(null);

  useEffect(() => {
    getClientStats(client.id).then(setStats);
  }, [client.id]);

  function formatDocument(doc: string) {
    const digits = doc.replace(/\D/g, "");
    if (digits.length === 14) return formatCNPJ(doc);
    if (digits.length === 11) return formatCPF(doc);
    return doc;
  }

  function whatsappUrl() {
    if (!client.phone) return null;
    const digits = client.phone.replace(/\D/g, "");
    return `https://wa.me/55${digits}`;
  }

  async function handleDelete() {
    if (!confirm(`Excluir ${client.name}?`)) return;
    const result = await deleteClient(client.id);
    if (result.success) {
      toast("Cliente excluído", "success");
      onDeleted(client.id);
    } else {
      toast(result.error ?? "Erro ao excluir", "error");
    }
  }

  const waUrl = whatsappUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-float sm:rounded-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${avatarColor(client.name)}`}
            >
              {initials(client.name)}
            </div>
            <div>
              <h3 className="font-display text-lg font-medium text-noite">
                {client.name}
              </h3>
              {client.phone && (
                <p className="text-sm text-noite/60">
                  {formatPhone(client.phone)}
                </p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-noite/40 tap-target flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dados */}
        <div className="space-y-2 mb-4">
          {client.email && (
            <InfoRow label="E-mail" value={client.email} />
          )}
          {client.instagram && (
            <InfoRow label="Instagram" value={client.instagram} />
          )}
          {client.document && (
            <InfoRow label="CPF/CNPJ" value={formatDocument(client.document)} />
          )}
          {client.notes && (
            <InfoRow label="Observações" value={client.notes} />
          )}
        </div>

        {/* Stats + Histórico */}
        <div className="rounded-xl bg-creme p-4 mb-4 space-y-3">
          {!stats ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <>
              <div className="flex gap-3">
                <div className="flex-1 text-center">
                  <p className="text-xs text-noite/50">Receita</p>
                  <p className="text-sm font-mono font-semibold text-floresta">
                    {formatBRL(stats.totalRevenue)}
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-noite/50">Despesas</p>
                  <p className="text-sm font-mono font-semibold text-coral">
                    {formatBRL(stats.totalExpenses)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-noite/50 uppercase tracking-wide">
                    Orçamentos recentes
                  </p>
                  {client.quotesCount > 5 && (
                    <Link
                      href={`/orcamentos?client=${client.id}`}
                      className="text-[10px] text-mar font-medium flex items-center gap-0.5"
                    >
                      Ver todos <ChevronRight className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
                {stats.recentQuotes.length === 0 ? (
                  <p className="text-sm text-noite/40">Nenhum orçamento</p>
                ) : (
                  <div className="space-y-1.5">
                    {stats.recentQuotes.map((q) => (
                      <Link
                        key={q.id}
                        href={`/orcamentos/${q.id}`}
                        className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 text-xs hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge status={q.status} />
                          <span className="text-noite/50">{formatDate(q.createdAt)}</span>
                        </div>
                        <span className="font-mono font-medium text-noite">
                          {formatBRL(q.totalNet)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-floresta py-3 text-sm font-medium text-white hover:bg-floresta-dark tap-target"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onEdit} className="flex-1">
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-noite/50">{label}</span>
      <span className="text-noite font-medium">{value}</span>
    </div>
  );
}
