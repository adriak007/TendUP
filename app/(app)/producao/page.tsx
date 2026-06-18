"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useDataProvider } from "@/lib/data/DataProviderContext";
import { useModal } from "@/components/ui/useModal";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { EmployeeOverlay } from "@/components/employees/EmployeeOverlay";
import type { Employee } from "@/lib/data/types";

export default function ProducaoPage() {
  const dataProvider = useDataProvider();
  const { prompt } = useModal();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    dataProvider.fetchEmployees().then((list) => {
      if (active) {
        setEmployees(list);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [dataProvider]);

  async function handleAddEmployee() {
    const name = await prompt({ title: "Novo funcionário", label: "Nome do funcionário" });
    if (name == null) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const employee = await dataProvider.createEmployee(trimmed);
    if (!employee) return;
    setEmployees((list) => [...list, employee]);
    setExpandedId(employee.id);
  }

  const selectedEmployee = employees.find((e) => e.id === expandedId) ?? null;

  return (
    <>
      <Header
        title="Produção"
        actions={
          <Button variant="primary" onClick={handleAddEmployee}>
            Adicionar Funcionário
          </Button>
        }
      />

      <div className="p-6">
        {!loading && employees.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <span className="text-3xl">🧵</span>
            <p className="text-sm font-medium text-text">Nenhum funcionário ainda</p>
            <p className="max-w-sm text-sm text-muted">
              Adicione o primeiro funcionário para começar a registrar a produção semanal.
            </p>
            <Button variant="primary" onClick={handleAddEmployee} className="mt-2">
              Adicionar Funcionário
            </Button>
          </div>
        )}

        {!loading && employees.length > 0 && (
          <EmployeeList
            employees={employees}
            onOpen={setExpandedId}
            onRename={(id, name) =>
              setEmployees((list) => list.map((e) => (e.id === id ? { ...e, name } : e)))
            }
            onDelete={(id) => {
              setEmployees((list) => list.filter((e) => e.id !== id));
              if (expandedId === id) setExpandedId(null);
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedEmployee && (
          <EmployeeOverlay
            key={selectedEmployee.id}
            employee={selectedEmployee}
            onClose={() => setExpandedId(null)}
            onMetaChange={(meta) =>
              setEmployees((list) =>
                list.map((e) => (e.id === selectedEmployee.id ? { ...e, meta } : e)),
              )
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
