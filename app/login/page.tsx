"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";

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
    <main className="login-page">
      <div className="login-card">
        <div className="brand" style={{ textAlign: "center" }}>
          <Image
            src="/img/TENDENCIA_COM_NOME_ABAIXO-removebg-preview.png"
            alt="TendUP"
            width={500}
            height={500}
            priority
            style={{ maxWidth: 220, width: "100%", height: "auto", margin: "0 auto", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))" }}
          />
        </div>
        <h1 style={{ margin: 0 }}>Entrar</h1>
        <p className="muted">
          Use seu email e senha para acessar, ou clique em Testar para explorar a versão Demo
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
        {info && <p className="muted">{info}</p>}

        <div className="login-actions">
          <button className="btn-secondary" type="button" onClick={handleTest}>
            Testar
          </button>
          <button className="btn-primary" type="button" onClick={handleLogin} disabled={submitting}>
            Entrar
          </button>
        </div>
        <div className="muted">
          Sem conta?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSignup();
            }}
          >
            Criar uma conta
          </a>
        </div>
      </div>
    </main>
  );
}
