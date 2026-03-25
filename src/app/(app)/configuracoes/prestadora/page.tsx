import { PrestadoraForm } from "./prestadora-form";

const defaultObservations = `1. Valores podem sofrer alteração de acordo com o nível de complexidade do modelo. Solicitar orçamento prévio.
2. A contagem do prazo só inicia após a entrega de todo o material (croqui, matéria-prima, especificações) e confirmação do pagamento.
3. Peça Piloto é obrigatória para o teste de modelagem e pode ser executada pela empresa contratante.
4. Deslocamento: além do valor por Km, o tempo em horário comercial é cobrado a 40% do valor da hora de trabalho.
5. Custos extras (alimentação, estadia e outros) para execução do serviço são de responsabilidade do contratante.`;

export default function PrestadoraPage() {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-noite">
        Dados da Prestadora
      </h2>
      <PrestadoraForm
        initialData={{
          name: "Débora da Rosa",
          razaoSocial: "Débora da Rosa Estúdio de Modelagem Têxtil",
          cnpj: "49.647.364/0001-57",
          observations: defaultObservations,
          telegramBotToken: "",
          telegramChatId: "",
        }}
      />
    </div>
  );
}
