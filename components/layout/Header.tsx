"use client";

import type { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  title: string;
  actions?: ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const { toggle } = useSidebar();
  const { user, isDemo, signOut, exitDemoMode } = useAuth();

  function handleAuthClick() {
    if (isDemo) exitDemoMode();
    else if (user) signOut();
    else window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
      <div className="flex items-center gap-3">
        <button
          className="shrink-0 rounded-lg p-2 text-muted hover:bg-slate-100 md:hidden"
          aria-label="Abrir menu"
          title="Menu"
          onClick={toggle}
        >
          ☰
        </button>
        <h1 className="whitespace-nowrap text-lg font-semibold text-text">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isDemo && (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            Modo Teste
          </span>
        )}
        <Button variant="secondary" size="sm" className="shrink-0 whitespace-nowrap" onClick={handleAuthClick}>
          {isDemo ? "Sair do Teste" : user ? "Sair" : "Entrar"}
        </Button>
        {actions}
      </div>
    </header>
  );
}
