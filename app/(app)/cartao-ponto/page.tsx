"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { UploadCard } from "@/components/cartaoPonto/UploadCard";
import { InfoCard } from "@/components/cartaoPonto/InfoCard";
import { StatsGrid } from "@/components/cartaoPonto/StatsGrid";
import { DiasTable } from "@/components/cartaoPonto/DiasTable";
import { computeStats } from "@/lib/cartaoPonto/stats";
import type { ParsedCartaoPonto } from "@/lib/cartaoPonto/types";

export default function CartaoPontoPage() {
  const [parsed, setParsed] = useState<ParsedCartaoPonto | null>(null);
  const [exceptions, setExceptions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(
    () => (parsed ? computeStats(parsed.dias, exceptions) : null),
    [parsed, exceptions],
  );

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cartao-ponto/parse", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Erro ao processar o PDF");
      }
      const data: ParsedCartaoPonto = await res.json();
      setParsed(data);
      setExceptions(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar o PDF");
    } finally {
      setLoading(false);
    }
  }

  function toggleException(date: string) {
    setExceptions((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function reset() {
    setParsed(null);
    setExceptions(new Set());
    setError(null);
  }

  return (
    <>
      <Header
        title="Cartão de Ponto"
        actions={
          parsed ? (
            <Button variant="secondary" size="sm" onClick={reset}>
              Novo upload
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 p-6">
        {!parsed && <UploadCard onFile={handleFile} loading={loading} error={error} />}

        {parsed && stats && (
          <>
            <InfoCard header={parsed.header} totais={parsed.totais} />
            <StatsGrid stats={stats} />

            {parsed.alteracoes.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div className="mb-2 text-sm font-medium text-text">
                  Alterações já registradas no cartão
                </div>
                <ul className="grid gap-1 text-sm text-muted">
                  {parsed.alteracoes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <DiasTable dias={parsed.dias} exceptions={exceptions} onToggle={toggleException} />
          </>
        )}
      </div>
    </>
  );
}
