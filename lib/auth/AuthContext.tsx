"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  isDemo: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readDemoCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").includes("tendup_demo=1");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  // Começa em false (igual ao servidor, que não tem acesso a document.cookie) e só é
  // corrigido no efeito abaixo - ler o cookie já no render inicial do cliente divergiria
  // da renderização do servidor e quebraria a hidratação.
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura de document.cookie só é segura após montar no cliente
    setIsDemo(readDemoCookie());

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const exitDemoMode = () => {
    document.cookie = "tendup_demo=; path=/; max-age=0";
    setIsDemo(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isDemo, loading, signIn, signUp, signOut, exitDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
