"use client";

import { useEffect, useState } from "react";
import type { Employee, Week } from "@/lib/data/types";
import { useDataProvider } from "@/lib/data/DataProviderContext";
import { emptyWeekValues } from "@/lib/constants";
import { WeekTabs } from "./WeekTabs";
import { ScheduleGrid } from "./ScheduleGrid";

interface EmployeeOverlayProps {
  employee: Employee;
  onClose: () => void;
  onMetaChange: (meta: number) => void;
}

interface OverlayState {
  weeks: Week[];
  draftWeek: Week | null;
  currentWeekId: string | null;
}

function createDraftWeek(weekNumber: number): Week {
  return {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    name: `Semana - ${weekNumber}`,
    days: ["", "", "", "", ""],
    values: emptyWeekValues(),
  };
}

function initialOverlayState(employee: Employee): OverlayState {
  if (employee.weeks.length > 0) {
    return {
      weeks: employee.weeks,
      draftWeek: null,
      currentWeekId: employee.weeks[employee.weeks.length - 1].id,
    };
  }
  const draft = createDraftWeek(1);
  return { weeks: [], draftWeek: draft, currentWeekId: draft.id };
}

export function EmployeeOverlay({ employee, onClose, onMetaChange }: EmployeeOverlayProps) {
  const dataProvider = useDataProvider();
  const [{ weeks, draftWeek, currentWeekId }, setState] = useState<OverlayState>(() =>
    initialOverlayState(employee),
  );
  const [meta, setMeta] = useState(employee.meta);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dataProvider.updateEmployeeMeta(employee.id, meta);
    }, 400);
    return () => clearTimeout(timeout);
  }, [meta, employee.id, dataProvider]);

  const currentWeek: Week | null =
    (draftWeek && draftWeek.id === currentWeekId ? draftWeek : weeks.find((w) => w.id === currentWeekId)) ?? null;

  function updateCurrentWeek(updater: (week: Week) => Week) {
    if (!currentWeek) return;
    setState((prev) => {
      if (prev.draftWeek && prev.draftWeek.id === currentWeek.id) {
        return { ...prev, draftWeek: updater(prev.draftWeek) };
      }
      return { ...prev, weeks: prev.weeks.map((w) => (w.id === currentWeek.id ? updater(w) : w)) };
    });
  }

  function handleMetaChange(value: string) {
    const v = Number(value);
    const next = Number.isFinite(v) ? v : 0;
    setMeta(next);
    onMetaChange(next);
  }

  function handleAddWeek() {
    setState((prev) => {
      const draft = createDraftWeek(prev.weeks.length + 1);
      return { ...prev, draftWeek: draft, currentWeekId: draft.id };
    });
  }

  function handleSelectWeek(id: string) {
    setState((prev) => ({ ...prev, currentWeekId: id }));
  }

  async function handleSaveWeek() {
    if (!currentWeek) return;
    const isDraft = draftWeek && draftWeek.id === currentWeek.id;
    if (isDraft) {
      const saved = await dataProvider.insertWeek(employee.id, {
        name: currentWeek.name,
        days: currentWeek.days,
        values: currentWeek.values,
      });
      if (saved) {
        setState((prev) => ({ weeks: [...prev.weeks, saved], draftWeek: null, currentWeekId: saved.id }));
      }
      return;
    }
    await dataProvider.updateWeek(currentWeek);
  }

  return (
    <div
      className="overlay open"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="overlay-content" role="dialog" aria-modal="true" aria-label="Detalhes do funcionário">
        <div className="overlay-header">
          <button className="btn-icon" aria-label="Voltar" onClick={onClose}>
            ← Voltar
          </button>
          <div className="overlay-title">{employee.name}</div>
          <div className="meta">
            <label htmlFor={`meta-${employee.id}`}>Meta de Produção</label>
            <input
              id={`meta-${employee.id}`}
              type="number"
              min={0}
              step={1}
              value={meta}
              onChange={(e) => handleMetaChange(e.target.value)}
            />
          </div>
        </div>

        <div className="overlay-body">
          <WeekTabs
            weeks={weeks}
            currentWeekId={currentWeekId}
            onSelectWeek={handleSelectWeek}
            onAddWeek={handleAddWeek}
            onSaveWeek={handleSaveWeek}
          />

          {currentWeek ? (
            <ScheduleGrid
              week={currentWeek}
              meta={meta}
              onChangeName={(name) => updateCurrentWeek((w) => ({ ...w, name }))}
              onBlurName={() => dataProvider.updateWeek(currentWeek)}
              onChangeDay={(col, value) =>
                updateCurrentWeek((w) => {
                  const days = [...w.days];
                  days[col] = value;
                  return { ...w, days };
                })
              }
              onChangeCell={(row, col, value) =>
                updateCurrentWeek((w) => {
                  const values = w.values.map((r) => [...r]);
                  values[row][col] = value;
                  return { ...w, values };
                })
              }
            />
          ) : (
            <div style={{ padding: 16, color: "var(--muted)" }}>
              Nenhuma semana selecionada. Clique em &quot;Adicionar Semana&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
