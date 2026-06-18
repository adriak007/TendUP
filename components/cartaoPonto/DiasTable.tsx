"use client";

import type { DiaRegistro } from "@/lib/cartaoPonto/types";
import { Button } from "@/components/ui/Button";

interface DiasTableProps {
  dias: DiaRegistro[];
  exceptions: Set<string>;
  onToggle: (date: string) => void;
}

const STATUS_LABEL: Record<DiaRegistro["status"], string> = {
  trabalhado: "Trabalhado",
  falta: "Falta",
  folga: "Folga",
  feriado: "Feriado",
  atestado: "Atestado",
};

const STATUS_CLASS: Record<DiaRegistro["status"], string> = {
  trabalhado: "bg-emerald-50 text-emerald-700",
  falta: "bg-red-50 text-red-700",
  folga: "bg-slate-100 text-slate-600",
  feriado: "bg-indigo-50 text-indigo-700",
  atestado: "bg-purple-50 text-purple-700",
};

export function DiasTable({ dias, exceptions, onToggle }: DiasTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border bg-slate-50 text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Dia</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Marcações</th>
              <th className="px-4 py-3 font-medium">Total no dia</th>
              <th className="px-4 py-3 font-medium">Exceção</th>
            </tr>
          </thead>
          <tbody>
            {dias.map((dia) => {
              const anulado = exceptions.has(dia.date);
              return (
                <tr key={dia.date} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-text">{dia.date}</td>
                  <td className="px-4 py-2.5 text-muted">{dia.weekday}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        anulado ? "bg-accent-soft text-accent" : STATUS_CLASS[dia.status]
                      }`}
                    >
                      {anulado ? "Falta anulada" : STATUS_LABEL[dia.status]}
                      {dia.status === "falta" && dia.isFullAbsence && !anulado ? " (dia inteiro)" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {dia.punches.length > 0 ? dia.punches.join(" · ") : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{dia.totalTrabalhado ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {dia.status === "falta" && (
                      <Button
                        variant={anulado ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onToggle(dia.date)}
                      >
                        {anulado ? "Reverter" : "Anular falta"}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
