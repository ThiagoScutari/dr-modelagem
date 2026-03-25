import { listExpenses } from "@/app/actions/expenses";
import { getPricingConfig } from "@/app/actions/pricing";
import { ExpensesClient } from "./expenses-client";

export default async function DespesasPage() {
  const [expenses, config] = await Promise.all([
    listExpenses(),
    getPricingConfig(),
  ]);

  return (
    <ExpensesClient
      initialExpenses={expenses.map((e) => ({
        id: e.id,
        description: e.description,
        category: e.category,
        amount: Number(e.amount),
        date: e.date.toISOString(),
        clientName: e.client?.name ?? null,
        clientId: e.clientId,
        quoteId: e.quoteId,
      }))}
      kmPrice={config ? Number(config.kmPrice) : 1.5}
    />
  );
}
