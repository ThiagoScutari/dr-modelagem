"use client";

import { useQuoteDraft } from "@/store/quote-draft";
import { QuoteStep1 } from "./step-1";
import { QuoteStep2 } from "./step-2";
import { QuoteStep3 } from "./step-3";
import { useEffect } from "react";

export default function NovoOrcamentoPage() {
  const { step, reset } = useQuoteDraft();

  useEffect(() => {
    reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Indicador de passo */}
      <div className="flex items-center justify-center gap-2 py-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step
                ? "w-8 bg-mar"
                : s < step
                  ? "w-2 bg-mar/60"
                  : "w-2 bg-ceu/30"
            }`}
          />
        ))}
      </div>

      {step === 1 && <QuoteStep1 />}
      {step === 2 && <QuoteStep2 />}
      {step === 3 && <QuoteStep3 />}
    </div>
  );
}
