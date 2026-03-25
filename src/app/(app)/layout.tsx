import { BottomNav } from "@/components/shared/bottom-nav";
import { Header } from "@/components/shared/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
