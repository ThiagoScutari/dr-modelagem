import { BottomNav } from "@/components/shared/bottom-nav";
import { Header } from "@/components/shared/header";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </ToastProvider>
  );
}
