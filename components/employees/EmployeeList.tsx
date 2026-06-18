"use client";

import type { Employee } from "@/lib/data/types";
import { EmployeeCard } from "./EmployeeCard";

interface EmployeeListProps {
  employees: Employee[];
  onOpen: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function EmployeeList({ employees, onOpen, onRename, onDelete }: EmployeeListProps) {
  return (
    <section className="employees" aria-live="polite">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onOpen={() => onOpen(employee.id)}
          onRename={(name) => onRename(employee.id, name)}
          onDelete={() => onDelete(employee.id)}
        />
      ))}
    </section>
  );
}
