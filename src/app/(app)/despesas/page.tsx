import { Receipt } from "lucide-react";

export default function DespesasPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-noite/30">
      <Receipt className="h-16 w-16" />
      <p className="text-sm font-medium">Despesas — em breve</p>
    </div>
  );
}
