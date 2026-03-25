import { getClients } from "@/app/actions/clients";
import { ClientList } from "./client-list";

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-medium text-noite">
        Clientes
      </h2>
      <ClientList
        initialClients={clients.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          quotesCount: c._count.quotes,
        }))}
      />
    </div>
  );
}
