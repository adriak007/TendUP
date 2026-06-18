import type { ReactNode } from "react";
import { DataProviderProvider } from "@/lib/data/DataProviderContext";
import { ModalProvider } from "@/components/ui/useModal";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebarBackdrop } from "@/components/layout/MobileSidebarBackdrop";

// Toda essa área exige sessão real ou modo demo (garantido pelo middleware) -
// não há ganho em pré-renderizar estaticamente no build.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DataProviderProvider>
      <ModalProvider>
        <SidebarProvider>
          <div className="app">
            <Sidebar />
            <main className="main">{children}</main>
          </div>
          <MobileSidebarBackdrop />
        </SidebarProvider>
      </ModalProvider>
    </DataProviderProvider>
  );
}
