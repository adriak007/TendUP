"use client";

import { AnimatePresence } from "framer-motion";
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
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-live="polite"
    >
      <AnimatePresence>
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onOpen={() => onOpen(employee.id)}
            onRename={(name) => onRename(employee.id, name)}
            onDelete={() => onDelete(employee.id)}
          />
        ))}
      </AnimatePresence>
    </section>
  );
}
