"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { createLocalDataProvider } from "./localProvider";
import { createSupabaseDataProvider } from "./supabaseProvider";
import type { DataProvider } from "./types";

const DataProviderContext = createContext<DataProvider | null>(null);

export function DataProviderProvider({ children }: { children: ReactNode }) {
  const { user, isDemo, loading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const provider = useMemo<DataProvider | null>(() => {
    if (isDemo) return createLocalDataProvider();
    if (user && supabase) return createSupabaseDataProvider(supabase, user.id);
    return null;
  }, [isDemo, user, supabase]);

  // Enquanto o estado de autenticação ainda não foi resolvido (SSR e primeira
  // passada no cliente), nenhum provider existe ainda - renderizar os filhos
  // nesse instante faria useDataProvider() lançar erro. Mostra um estado de
  // carregamento até a sessão real (ou o modo demo) ser confirmada.
  if (!provider) {
    if (loading) {
      return <div className="placeholder-card" style={{ margin: 24 }}>Carregando...</div>;
    }
    return (
      <div className="placeholder-card" style={{ margin: 24 }}>
        Sessão expirada. <a href="/login">Voltar ao login</a>
      </div>
    );
  }

  return (
    <DataProviderContext.Provider value={provider}>{children}</DataProviderContext.Provider>
  );
}

export function useDataProvider(): DataProvider {
  const ctx = useContext(DataProviderContext);
  if (!ctx) {
    throw new Error("useDataProvider deve ser usado dentro de <DataProviderProvider>");
  }
  return ctx;
}
