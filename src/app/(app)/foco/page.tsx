import { Timer } from "lucide-react";

export default function FocoPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-noite/30">
      <Timer className="h-16 w-16" />
      <p className="text-sm font-medium">Foco — em breve</p>
    </div>
  );
}
