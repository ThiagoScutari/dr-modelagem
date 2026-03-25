import Link from "next/link";
import {
  DollarSign,
  SlidersHorizontal,
  Users,
  Building2,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    href: "/configuracoes/precos",
    icon: DollarSign,
    title: "Tabela de Preços",
    description: "Serviços, valores e categorias",
  },
  {
    href: "/configuracoes/parametros",
    icon: SlidersHorizontal,
    title: "Parâmetros de Cálculo",
    description: "Graduação, piloto, plotagem, km",
  },
  {
    href: "/configuracoes/clientes",
    icon: Users,
    title: "Clientes",
    description: "Cadastro e histórico",
  },
  {
    href: "/configuracoes/prestadora",
    icon: Building2,
    title: "Dados da Prestadora",
    description: "Razão social, CNPJ, logo, Telegram",
  },
] as const;

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="card flex items-center gap-4 transition-shadow hover:shadow-glass active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mar/10 text-mar">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-noite">{item.title}</p>
              <p className="text-xs text-noite/50">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-noite/30" />
          </Link>
        );
      })}
    </div>
  );
}
