"use client";

import { useState } from "react";
import { updatePricingConfig } from "@/app/actions/pricing";
import { formatBRL } from "@/lib/format";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

interface Props {
  initialData: {
    graduationPctBasic: number;
    graduationPctComplex: number;
    pilotPct: number;
    plottingPricePerMeter: number;
    kmPrice: number;
  };
}

const EXAMPLE_MODELING_PRICE = 130;

export function ParametrosForm({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function updateField(field: keyof typeof data, value: string) {
    const num = parseFloat(value.replace(",", "."));
    if (isNaN(num)) return;
    setData((prev) => ({ ...prev, [field]: num }));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updatePricingConfig(data);
    setSaving(false);
    if (result.success) {
      toast("Parâmetros salvos com sucesso", "success");
    } else {
      toast("Erro ao salvar parâmetros", "error");
    }
  }

  return (
    <div className="space-y-4">
      {/* Graduação básica */}
      <ParameterCard
        label="Graduação básica"
        description="Aplicado sobre o valor da modelagem por tamanho"
        value={(data.graduationPctBasic * 100).toFixed(0)}
        suffix="%"
        onChange={(v) => updateField("graduationPctBasic", String(parseFloat(v) / 100))}
        example={`Ex: molde ${formatBRL(EXAMPLE_MODELING_PRICE)} → grad. ${formatBRL(EXAMPLE_MODELING_PRICE * data.graduationPctBasic)}/tam.`}
      />

      {/* Graduação complexa */}
      <ParameterCard
        label="Graduação complexa"
        description="Para moldes com muitos recortes/torções"
        value={(data.graduationPctComplex * 100).toFixed(0)}
        suffix="%"
        onChange={(v) => updateField("graduationPctComplex", String(parseFloat(v) / 100))}
        example={`Ex: molde ${formatBRL(EXAMPLE_MODELING_PRICE)} → grad. ${formatBRL(EXAMPLE_MODELING_PRICE * data.graduationPctComplex)}/tam.`}
      />

      {/* Peça piloto */}
      <ParameterCard
        label="Peça piloto"
        description="Percentual sobre o valor da modelagem (corte e costura)"
        value={(data.pilotPct * 100).toFixed(0)}
        suffix="%"
        onChange={(v) => updateField("pilotPct", String(parseFloat(v) / 100))}
        example={`Ex: molde ${formatBRL(EXAMPLE_MODELING_PRICE)} → piloto ${formatBRL(EXAMPLE_MODELING_PRICE * data.pilotPct)}`}
      />

      {/* Plotagem */}
      <ParameterCard
        label="Plotagem por metro"
        description="Valor por metro linear (até 91cm de largura)"
        value={data.plottingPricePerMeter.toFixed(2).replace(".", ",")}
        prefix="R$"
        suffix="/m"
        onChange={(v) => updateField("plottingPricePerMeter", v)}
      />

      {/* Km rodado */}
      <ParameterCard
        label="Km rodado"
        description="Valor por quilômetro de deslocamento"
        value={data.kmPrice.toFixed(2).replace(".", ",")}
        prefix="R$"
        suffix="/km"
        onChange={(v) => updateField("kmPrice", v)}
      />

      <Button onClick={handleSave} loading={saving} className="w-full">
        Salvar parâmetros
      </Button>
    </div>
  );
}

function ParameterCard({
  label,
  description,
  value,
  prefix,
  suffix,
  onChange,
  example,
}: {
  label: string;
  description: string;
  value: string;
  prefix?: string;
  suffix?: string;
  onChange: (value: string) => void;
  example?: string;
}) {
  return (
    <div className="card space-y-2">
      <p className="text-sm font-medium text-noite">{label}</p>
      <p className="text-xs text-noite/50">{description}</p>
      <div className="flex items-center gap-2">
        {prefix && (
          <span className="text-sm font-mono text-noite/60">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-lg border border-ceu/40 bg-espuma/20 px-3 py-2 text-center text-sm font-mono text-noite focus:outline-none focus:ring-2 focus:ring-mar/30 focus:border-mar"
        />
        {suffix && (
          <span className="text-sm font-mono text-noite/60">{suffix}</span>
        )}
      </div>
      {example && (
        <p className="text-xs font-mono text-floresta/70">{example}</p>
      )}
    </div>
  );
}
