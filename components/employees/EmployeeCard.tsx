"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { useDataProvider } from "@/lib/data/DataProviderContext";
import { useModal } from "@/components/ui/useModal";
import { Button } from "@/components/ui/Button";
import type { Employee } from "@/lib/data/types";

interface EmployeeCardProps {
  employee: Employee;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={onOpen}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {initials(employee.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-text">{employee.name}</div>
          <div className="text-xs text-muted">Clique para abrir</div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-1.5 border-t border-border pt-3">
        <Button variant="ghost" size="sm" title="Editar nome" onClick={handleEdit}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="text-danger" title="Excluir funcionário" onClick={handleDelete}>
          Apagar
        </Button>
      </div>
    </motion.article>
  );
}
