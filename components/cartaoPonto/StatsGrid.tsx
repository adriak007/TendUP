import type { CartaoPontoStats } from "@/lib/cartaoPonto/stats";

interface StatsGridProps {
  stats: CartaoPontoStats;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ? "text-accent" : "text-text"}`}>
        {value}
      </div>
    </div>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard label="Dias trabalhados" value={String(stats.diasTrabalhados)} />
      <StatCard label="Faltas integrais" value={String(stats.diasFaltaIntegral)} accent />
      <StatCard label="Faltas parciais" value={String(stats.diasFaltaParcial)} />
      <StatCard label="Anuladas (exceção)" value={String(stats.diasAnulados)} />
      <StatCard
        label="Taxa de falta"
        value={stats.taxaFalta != null ? `${stats.taxaFalta.toFixed(1)}%` : "—"}
      />
      <StatCard label="Média de entrada" value={stats.mediaEntrada ?? "—"} />
      <StatCard label="Média de saída" value={stats.mediaSaida ?? "—"} />
      <StatCard label="Feriados" value={String(stats.diasFeriado)} />
      <StatCard label="Folgas" value={String(stats.diasFolga)} />
      <StatCard label="Atestados" value={String(stats.diasAtestado)} />
    </div>
  );
}
