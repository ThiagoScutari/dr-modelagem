"use client";

import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { initials, avatarColor, formatPhone } from "@/lib/format";
import { ClientFormModal } from "./client-form-modal";
import { ClientDetailSheet } from "./client-detail-sheet";

export interface ClientData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  document: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  quotesCount: number;
}

interface Props {
  initialClients: ClientData[];
}

export function ClientList({ initialClients }: Props) {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleCreated(client: ClientData) {
    setClients((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
    setShowForm(false);
  }

  function handleUpdated(client: ClientData) {
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? client : c)).sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingClient(null);
    setSelectedClient(null);
  }

  function handleDeleted(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setSelectedClient(null);
  }

  return (
    <>
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-noite/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente..."
          className="input-base pl-9"
        />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-noite/30">
          <Users className="h-12 w-12" />
          <p className="text-sm">
            {query ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setSelectedClient(client)}
              className="card flex w-full items-center gap-3 text-left transition-shadow hover:shadow-glass active:scale-[0.98]"
            >
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(client.name)}`}
              >
                {initials(client.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-noite truncate">
                  {client.name}
                </p>
                <p className="text-xs text-noite/50 truncate">
                  {client.phone
                    ? formatPhone(client.phone)
                    : client.email || "Sem contato"}
                </p>
              </div>
              {client.quotesCount > 0 && (
                <span className="rounded-full bg-mar/10 px-2 py-0.5 text-xs font-medium text-mar">
                  {client.quotesCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 lg:bottom-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-mar text-white shadow-float hover:bg-mar-dark active:scale-95 transition-all"
        aria-label="Adicionar cliente"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modal de cadastro/edição */}
      {(showForm || editingClient) && (
        <ClientFormModal
          client={editingClient}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
        />
      )}

      {/* Sheet de detalhe */}
      {selectedClient && (
        <ClientDetailSheet
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => {
            setEditingClient(selectedClient);
            setSelectedClient(null);
          }}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
