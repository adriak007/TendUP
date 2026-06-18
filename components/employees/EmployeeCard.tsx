"use client";

import type { MouseEvent } from "react";
import { useDataProvider } from "@/lib/data/DataProviderContext";
import { useModal } from "@/components/ui/useModal";
import type { Employee } from "@/lib/data/types";

interface EmployeeCardProps {
  employee: Employee;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function EmployeeCard({ employee, onOpen, onRename, onDelete }: EmployeeCardProps) {
  const dataProvider = useDataProvider();
  const { prompt, confirm } = useModal();

  async function handleEdit(e: MouseEvent) {
    e.stopPropagation();
    const name = await prompt({
      title: "Editar nome",
      label: "Novo nome do funcionário",
      initial: employee.name,
    });
    if (name == null) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === employee.name) return;
    await dataProvider.updateEmployeeName(employee.id, trimmed);
    onRename(trimmed);
  }

  async function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    const ok = await confirm(
      `Tem certeza que deseja apagar "${employee.name}"? Esta ação não pode ser desfeita.`,
      { title: "Confirmar exclusão", confirmText: "Apagar", cancelText: "Cancelar" },
    );
    if (!ok) return;
    const deleted = await dataProvider.deleteEmployee(employee.id);
    if (!deleted) return;
    onDelete();
  }

  return (
    <article className="employee-card">
      <div className="employee-compact" onClick={onOpen}>
        <div className="employee-info">
          <div className="employee-name">{employee.name}</div>
          <div className="employee-hint">Clique para abrir</div>
        </div>
        <div className="employee-actions" aria-label="Ações do funcionário">
          <button className="btn-secondary btn-sm" title="Editar nome" onClick={handleEdit}>
            Editar
          </button>
          <button className="btn-danger btn-sm" title="Excluir funcionário" onClick={handleDelete}>
            Apagar
          </button>
        </div>
      </div>
    </article>
  );
}
