import { Header } from "@/components/layout/Header";

export default function ConfiguracoesPage() {
  return (
    <>
      <Header title="Configurações" />
      <div className="p-6">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="text-3xl">⚙️</span>
          <p className="text-sm font-medium text-text">Configurações chegando em breve</p>
          <p className="max-w-sm text-sm text-muted">
            Em breve você poderá ajustar preferências da conta e da empresa por aqui.
          </p>
        </div>
      </div>
    </>
  );
}
