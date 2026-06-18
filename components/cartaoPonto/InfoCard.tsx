import type { CartaoPontoHeader, CartaoPontoTotais } from "@/lib/cartaoPonto/types";

interface InfoCardProps {
  header: CartaoPontoHeader;
  totais: CartaoPontoTotais;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="text-sm font-medium text-text">{value ?? "—"}</div>
    </div>
  );
}

export function InfoCard({ header, totais }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Funcionário" value={header.funcionario} />
        <Field label="Cargo" value={header.cargo} />
        <Field label="Matrícula" value={header.matricula} />
        <Field label="CPF" value={header.cpf} />
        <Field label="Empresa" value={header.empresa} />
        <Field label="Admissão" value={header.admissao} />
        <Field
          label="Período"
          value={
            header.periodoInicio && header.periodoFim
              ? `${header.periodoInicio} a ${header.periodoFim}`
              : null
          }
        />
        <Field label="Saldo do banco de horas" value={totais.bancoSaldo} />
      </div>
    </div>
  );
}
