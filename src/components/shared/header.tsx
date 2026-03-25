"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Início",
  "/orcamentos": "Orçamentos",
  "/despesas": "Despesas",
  "/foco": "Foco",
  "/configuracoes": "Configurações",
};

export function Header() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "DR Modelagem";

  return (
    <header className="sticky top-0 z-40 glass border-b border-ceu/20">
      <div className="mx-auto flex h-14 max-w-lg items-center px-5">
        <h1 className="font-display text-lg font-medium text-noite">
          {title}
        </h1>
      </div>
    </header>
  );
}
