"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Employee, Week } from "@/lib/data/types";
import { useDataProvider } from "@/lib/data/DataProviderContext";
import { emptyWeekValues } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
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
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="flex h-[min(90vh,900px)] w-[min(1100px,96vw)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do funcionário"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" aria-label="Voltar" onClick={onClose}>
              ← Voltar
            </Button>
            <div className="font-semibold text-text">{employee.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={`meta-${employee.id}`} className="text-sm text-muted">
              Meta de Produção
            </label>
            <input
              id={`meta-${employee.id}`}
              type="number"
              min={0}
              step={1}
              value={meta}
              onChange={(e) => handleMetaChange(e.target.value)}
              className="w-28 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
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
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted">
              Nenhuma semana selecionada. Clique em &quot;Adicionar Semana&quot;.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
