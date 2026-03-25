export const dynamic = "force-dynamic";

import { getPresenterConfig } from "@/app/actions/presenter";
import { PrestadoraForm } from "./prestadora-form";

export default async function PrestadoraPage() {
  const config = await getPresenterConfig();

  if (!config) {
    return (
      <p className="py-12 text-center text-sm text-coral">
        Dados da prestadora não encontrados. Execute o seed.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-noite">
        Dados da Prestadora
      </h2>
      <PrestadoraForm
        initialData={{
          name: config.name,
          razaoSocial: config.razaoSocial,
          cnpj: config.cnpj,
          observations: config.observations,
          telegramBotToken: config.telegramToken ?? "",
          telegramChatId: config.telegramChatId ?? "",
        }}
      />
    </div>
  );
}
