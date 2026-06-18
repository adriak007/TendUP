"use client";

import type { Week } from "@/lib/data/types";

interface WeekTabsProps {
  weeks: Week[];
  currentWeekId: string | null;
  onSelectWeek: (id: string) => void;
  onAddWeek: () => void;
  onSaveWeek: () => void;
}

export function WeekTabs({ weeks, currentWeekId, onSelectWeek, onAddWeek, onSaveWeek }: WeekTabsProps) {
  return (
    <>
      <div className="weeks-toolbar">
        <div style={{ color: "var(--muted)" }}>Semanas do Funcionário</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-secondary" onClick={onAddWeek}>
            Adicionar Semana
          </button>
          <button className="btn-primary" onClick={onSaveWeek}>
            Salvar
          </button>
        </div>
      </div>
      <div className="weeks-list">
        {weeks.map((week) => (
          <div
            key={week.id}
            className={`week-card${currentWeekId === week.id ? " active" : ""}`}
            onClick={() => onSelectWeek(week.id)}
          >
            <span>{week.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
