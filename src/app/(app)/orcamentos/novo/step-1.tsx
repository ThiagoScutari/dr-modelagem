"use client";

import { useEffect, useState } from "react";
import { useQuoteDraft } from "@/store/quote-draft";
import { getClients, createClient } from "@/app/actions/clients";
import { ComboCreate, type CreateField } from "@/components/ui/combo-create";
import { Button } from "@/components/ui/button";

interface ClientOption {
  id: string;
  name: string;
}

const clientCreateFields: CreateField[] = [
  { name: "name", label: "Nome", required: true },
  { name: "phone", label: "Telefone", type: "tel" },
];

export function QuoteStep1() {
  const { draft, setClient, setValidUntil, setNotes, nextStep } =
    useQuoteDraft();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients().then((data) => {
      setClients(data.map((c) => ({ id: c.id, name: c.name })));
      setLoading(false);
    });
  }, []);

  async function handleCreateClient(
    data: Record<string, string>
  ): Promise<ClientOption> {
    const result = await createClient({
      name: data.name,
      phone: data.phone ?? "",
    });
    if (!result.success) throw new Error("Erro ao criar cliente");
    const c = result.client;
    const option = { id: c.id, name: c.name };
    setClients((prev) => [...prev, option]);
    return option;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-noite">
        Dados do orçamento
      </h2>

      {/* Cliente */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-noite/70">
          Cliente *
        </label>
        <ComboCreate<ClientOption>
          items={clients}
          value={draft.clientId || null}
          onChange={(id) => {
            const c = clients.find((cl) => cl.id === id);
            setClient(id, c?.name ?? "");
          }}
          getLabel={(c) => c.name}
          getValue={(c) => c.id}
          placeholder="Buscar cliente..."
          createLabel="Cadastrar cliente"
          onCreateSubmit={handleCreateClient}
          createFields={clientCreateFields}
          loading={loading}
        />
      </div>

      {/* Validade */}
      <div className="space-y-1.5">
        <label
          htmlFor="validUntil"
          className="block text-sm font-medium text-noite/70"
        >
          Válido até
        </label>
        <input
          id="validUntil"
          type="date"
          value={draft.validUntil ?? ""}
          onChange={(e) => setValidUntil(e.target.value || null)}
          className="input-base font-mono text-sm"
        />
      </div>

      {/* Observações */}
      <div className="space-y-1.5">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-noite/70"
        >
          Observações
        </label>
        <textarea
          id="notes"
          value={draft.notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="input-base resize-none"
          placeholder="Observações adicionais..."
        />
      </div>

      <Button
        onClick={nextStep}
        disabled={!draft.clientId}
        className="w-full"
      >
        Próximo →
      </Button>
    </div>
  );
}
