import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-noite/30">
      <LayoutDashboard className="h-16 w-16" />
      <p className="text-sm font-medium">Dashboard — em breve</p>
    </div>
  );
}
