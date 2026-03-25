"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient, updateClient } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { ClientData } from "./client-list";

interface Props {
  client: ClientData | null;
  onClose: () => void;
  onCreated: (client: ClientData) => void;
  onUpdated: (client: ClientData) => void;
}

export function ClientFormModal({ client, onClose, onCreated, onUpdated }: Props) {
  const isEdit = !!client;
  const [name, setName] = useState(client?.name ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [instagram, setInstagram] = useState(client?.instagram ?? "");
  const [document, setDocument] = useState(client?.document ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Nome deve ter ao menos 2 caracteres");
      return;
    }

    setSaving(true);
    const data = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      instagram: instagram.trim(),
      document: document.trim(),
      notes: notes.trim(),
    };

    if (isEdit) {
      const result = await updateClient(client.id, data);
      if (result.success) {
        onUpdated({
          ...client,
          ...data,
          updatedAt: new Date().toISOString(),
        });
        toast("Cliente atualizado", "success");
      }
    } else {
      const result = await createClient(data);
      if (result.success) {
        onCreated({
          ...result.client,
          createdAt: result.client.createdAt.toISOString(),
          updatedAt: result.client.updatedAt.toISOString(),
          quotesCount: 0,
        });
        toast("Cliente cadastrado", "success");
      }
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-float sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-medium text-noite">
            {isEdit ? "Editar cliente" : "Novo cliente"}
          </h3>
          <button type="button" onClick={onClose} className="text-noite/40 tap-target flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="name"
            label="Nome *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do cliente"
            required
            autoFocus
          />
          <Input
            id="phone"
            label="Telefone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 91234-5678"
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@email.com"
          />
          <Input
            id="instagram"
            label="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@usuario"
          />
          <Input
            id="document"
            label="CPF / CNPJ"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="000.000.000-00"
          />
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-sm font-medium text-noite/70">
              Observações
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input-base resize-none"
              placeholder="Notas sobre o cliente..."
            />
          </div>

          {error && <p className="text-sm text-coral font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {isEdit ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
