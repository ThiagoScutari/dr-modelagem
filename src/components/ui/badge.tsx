import { cn } from "@/lib/utils";

type QuoteStatus =
  | "AGUARDANDO"
  | "APROVADO"
  | "EM_ANDAMENTO"
  | "FINALIZADO"
  | "CANCELADO";

const statusConfig: Record<
  QuoteStatus,
  { bg: string; text: string; label: string }
> = {
  AGUARDANDO: { bg: "bg-[#FEF5E6]", text: "text-[#A05A10]", label: "Aguardando" },
  APROVADO: { bg: "bg-[#E3F2E3]", text: "text-[#1A501A]", label: "Aprovado" },
  EM_ANDAMENTO: { bg: "bg-[#E6F3F8]", text: "text-[#1A4E6C]", label: "Em Andamento" },
  FINALIZADO: { bg: "bg-[#E3F2E3]", text: "text-[#1A501A]", label: "Finalizado" },
  CANCELADO: { bg: "bg-[#F5F5F5]", text: "text-[#6B6B6B]", label: "Cancelado" },
};

interface BadgeProps {
  status: QuoteStatus;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}
