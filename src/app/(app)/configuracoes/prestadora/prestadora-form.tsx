"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface Props {
  initialData: {
    name: string;
    razaoSocial: string;
    cnpj: string;
    observations: string;
    telegramBotToken: string;
    telegramChatId: string;
  };
}

export function PrestadoraForm({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function update(field: keyof typeof data, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    // TODO: persistir em model dedicado (PresenterConfig) no Sprint futuro
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast("Dados da prestadora salvos", "success");
  }

  return (
    <div className="space-y-4">
      {/* Logo */}
      <div className="card flex items-center gap-4">
        <Image
          src="/logo.png"
          alt="Logo DR Modelagem"
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <p className="text-sm font-medium text-noite">Logo atual</p>
          <p className="text-xs text-noite/50">
            PNG ou SVG — altere em public/logo.png
          </p>
        </div>
      </div>

      {/* Dados */}
      <div className="card space-y-3">
        <Input
          id="name"
          label="Nome"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <Input
          id="razaoSocial"
          label="Razão social"
          value={data.razaoSocial}
          onChange={(e) => update("razaoSocial", e.target.value)}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-noite/70">
            CNPJ
          </label>
          <p className="input-base bg-ceu/5 text-noite/60 font-mono text-sm">
            {data.cnpj}
          </p>
        </div>
      </div>

      {/* Observações do orçamento */}
      <div className="card space-y-2">
        <label
          htmlFor="observations"
          className="block text-sm font-medium text-noite/70"
        >
          Observações padrão do orçamento
        </label>
        <textarea
          id="observations"
          value={data.observations}
          onChange={(e) => update("observations", e.target.value)}
          rows={7}
          className="input-base resize-none text-xs leading-relaxed"
        />
      </div>

      {/* Telegram */}
      <div className="card space-y-3">
        <p className="text-sm font-medium text-noite">Telegram Bot</p>
        <Input
          id="telegramBotToken"
          label="Bot Token"
          type="password"
          value={data.telegramBotToken}
          onChange={(e) => update("telegramBotToken", e.target.value)}
          placeholder="123456:ABC-DEF..."
          autoComplete="off"
        />
        <Input
          id="telegramChatId"
          label="Chat ID"
          value={data.telegramChatId}
          onChange={(e) => update("telegramChatId", e.target.value)}
          placeholder="1234567890"
        />
      </div>

      <Button onClick={handleSave} loading={saving} className="w-full">
        Salvar dados
      </Button>
    </div>
  );
}
