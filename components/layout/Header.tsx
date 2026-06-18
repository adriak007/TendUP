"use client";

import type { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/lib/auth/AuthContext";

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
    <header className="main-header">
      <button className="btn-icon mobile-only" aria-label="Abrir menu" title="Menu" onClick={toggle}>
        ☰
      </button>
      <h1>{title}</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {isDemo && <span className="badge-test">Modo Teste</span>}
        <button className="btn-secondary" onClick={handleAuthClick}>
          {isDemo ? "Sair do Teste" : user ? "Sair" : "Entrar"}
        </button>
        {actions}
      </div>
    </header>
  );
}
