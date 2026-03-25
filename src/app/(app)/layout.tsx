import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Sidebar />
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <Header />
        <main className="mx-auto w-full max-w-lg lg:max-w-5xl flex-1 px-5 pb-24 pt-4 lg:pb-8 lg:pt-6 lg:px-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
