"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard": "Início",
  "/orcamentos": "Orçamentos",
  "/despesas": "Despesas",
  "/foco": "Foco",
  "/configuracoes": "Configurações",
  "/configuracoes/precos": "Tabela de Preços",
  "/configuracoes/parametros": "Parâmetros",
  "/configuracoes/clientes": "Clientes",
  "/configuracoes/prestadora": "Prestadora",
};

const subRouteParents: Record<string, string> = {
  "/configuracoes/precos": "/configuracoes",
  "/configuracoes/parametros": "/configuracoes",
  "/configuracoes/clientes": "/configuracoes",
  "/configuracoes/prestadora": "/configuracoes",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = titles[pathname] ?? "DR Modelagem";
  const parentRoute = subRouteParents[pathname];

  return (
    <header className="sticky top-0 z-40 glass border-b border-ceu/20">
      <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-5">
        {parentRoute && (
          <button
            type="button"
            onClick={() => router.push(parentRoute)}
            className="flex items-center justify-center text-noite/60 tap-target -ml-2"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="font-display text-lg font-medium text-noite">
          {title}
        </h1>
      </div>
    </header>
  );
}
