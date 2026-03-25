"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Timer,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/despesas", label: "Despesas", icon: Receipt },
  { href: "/foco", label: "Foco", icon: Timer },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-60 lg:flex-col bg-noite">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <Image
          src="/logo.png"
          alt="DR Modelagem"
          width={40}
          height={40}
          className="rounded-full brightness-0 invert"
        />
        <div>
          <p className="text-sm font-display font-medium text-white">
            DR Modelagem
          </p>
          <p className="text-[10px] text-white/50">Hub de Gestão</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-mar text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mar text-xs font-semibold text-white">
            DR
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              Débora da Rosa
            </p>
            <p className="text-[10px] text-white/40">Estúdio de Modelagem</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
