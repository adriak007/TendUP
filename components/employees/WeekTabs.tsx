"use client";

import { motion } from "framer-motion";
import type { Week } from "@/lib/data/types";
import { Button } from "@/components/ui/Button";

interface WeekTabsProps {
  weeks: Week[];
  currentWeekId: string | null;
  onSelectWeek: (id: string) => void;
  onAddWeek: () => void;
  onSaveWeek: () => void;
}

export function WeekTabs({ weeks, currentWeekId, onSelectWeek, onAddWeek, onSaveWeek }: WeekTabsProps) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">Semanas do Funcionário</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onAddWeek}>
            Adicionar Semana
          </Button>
          <Button variant="primary" size="sm" onClick={onSaveWeek}>
            Salvar
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {weeks.map((week) => {
          const active = currentWeekId === week.id;
          return (
            <button
              key={week.id}
              onClick={() => onSelectWeek(week.id)}
              className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "text-accent" : "text-muted hover:bg-slate-50 hover:text-text"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="week-tab-active"
                  className="absolute inset-0 rounded-lg bg-accent-soft ring-1 ring-accent/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{week.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
