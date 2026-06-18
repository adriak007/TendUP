"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/styles";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password.trim()) {
      setError("Informe email e senha");
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password.trim());
    setSubmitting(false);
    if (signInError) {
      setError("Erro de login: " + signInError);
      return;
    }
    router.push("/producao");
  }

  async function handleSignup() {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password.trim()) {
      setError("Preencha email e senha para criar a conta");
      return;
    }
    setSubmitting(true);
    const { error: signUpError } = await signUp(email.trim(), password.trim());
    setSubmitting(false);
    if (signUpError) {
      setError("Erro ao cadastrar: " + signUpError);
      return;
    }
    setInfo("Cadastro criado. Tente entrar em seguida.");
  }

  function handleTest() {
    window.location.href = "/producao?demo=1";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent-soft)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-xl"
      >
        <div className="mb-6 flex justify-center">
          <Image
            src="/img/TENDENCIA_COM_NOME_ABAIXO-removebg-preview.png"
            alt="TendUP"
            width={500}
            height={500}
            priority
            className="h-auto w-36"
          />
        </div>

        <h1 className="text-xl font-semibold text-text">Entrar</h1>
        <p className="mt-1 text-sm text-muted">
          Use seu email e senha para acessar, ou clique em Testar para explorar a versão Demo
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="voce@email.com"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-muted">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Sua senha"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm text-danger"
            >
              {error}
            </motion.p>
          )}
          {info && <p className="text-sm text-muted">{info}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={handleTest}>
              Testar
            </Button>
            <Button variant="primary" type="button" onClick={handleLogin} disabled={submitting}>
              Entrar
            </Button>
          </div>

          <p className="text-center text-sm text-muted">
            Sem conta?{" "}
            <button
              type="button"
              className="font-medium text-accent hover:text-accent-hover"
              onClick={handleSignup}
            >
              Criar uma conta
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
