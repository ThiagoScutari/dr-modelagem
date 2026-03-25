export const dynamic = "force-dynamic";

import { getPricingConfig } from "@/app/actions/pricing";
import { ParametrosForm } from "./parametros-form";

export default async function ParametrosPage() {
  const config = await getPricingConfig();

  if (!config) {
    return (
      <p className="py-12 text-center text-sm text-coral">
        PricingConfig não encontrado. Execute o seed.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-noite">
        Parâmetros de Cálculo
      </h2>
      <ParametrosForm
        initialData={{
          graduationPctBasic: Number(config.graduationPctBasic),
          graduationPctComplex: Number(config.graduationPctComplex),
          pilotPct: Number(config.pilotPct),
          plottingPricePerMeter: Number(config.plottingPricePerMeter),
          kmPrice: Number(config.kmPrice),
        }}
      />
    </div>
  );
}
