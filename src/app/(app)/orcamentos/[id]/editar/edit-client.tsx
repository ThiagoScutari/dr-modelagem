"use client";

import { useEffect } from "react";
import { useQuoteDraft } from "@/store/quote-draft";
import { QuoteStep1 } from "../../novo/step-1";
import { QuoteStep2 } from "../../novo/step-2";
import { QuoteStep3Edit } from "./step-3-edit";
import type { QuoteDraft } from "@/types/quote";

interface Props {
  quoteId: string;
  initialDraft: QuoteDraft;
}

export function EditQuoteClient({ quoteId, initialDraft }: Props) {
  const { step, loadDraft } = useQuoteDraft();

  useEffect(() => {
    loadDraft(initialDraft);
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
                ? "w-8 bg-poente"
                : s < step
                  ? "w-2 bg-poente/60"
                  : "w-2 bg-ceu/30"
            }`}
          />
        ))}
      </div>

      {step === 1 && <QuoteStep1 />}
      {step === 2 && <QuoteStep2 />}
      {step === 3 && <QuoteStep3Edit quoteId={quoteId} />}
    </div>
  );
}
