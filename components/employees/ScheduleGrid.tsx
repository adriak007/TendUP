"use client";

import { Fragment } from "react";
import { TIME_SLOTS, WEEKDAY_LABELS } from "@/lib/constants";
import { formatDay } from "@/lib/format";
import type { Week } from "@/lib/data/types";
import { inputClass } from "@/components/ui/styles";
import { ScheduleCell } from "./ScheduleCell";

interface ScheduleGridProps {
  week: Week;
  meta: number;
  onChangeName: (name: string) => void;
  onBlurName: () => void;
  onChangeDay: (col: number, value: string) => void;
  onChangeCell: (row: number, col: number, value: string) => void;
}

export function ScheduleGrid({
  week,
  meta,
  onChangeName,
  onBlurName,
  onChangeDay,
  onChangeCell,
}: ScheduleGridProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-3 border-b border-border bg-slate-50 px-4 py-3">
        <label htmlFor="week-name" className="text-sm font-medium text-muted">
          Nome da semana
        </label>
        <input
          id="week-name"
          type="text"
          value={week.name}
          onChange={(e) => onChangeName(e.target.value)}
          onBlur={onBlurName}
          className={`${inputClass} max-w-xs`}
        />
      </div>

      <div className="overflow-x-auto p-4">
        <div className="grid min-w-[700px] grid-cols-[90px_repeat(5,1fr)] gap-1.5">
          <div />
          {week.days.map((day, col) => (
            <div key={`day-${col}`}>
              <input
                type="text"
                placeholder={`Dia ${col + 1}`}
                value={day}
                inputMode="numeric"
                maxLength={5}
                onChange={(e) => onChangeDay(col, formatDay(e.target.value))}
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-center text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          ))}

          <div />
          {WEEKDAY_LABELS.map((label, col) => (
            <div key={`weekday-${col}`} className="py-1 text-center text-xs font-medium text-muted">
              {label}
            </div>
          ))}

          {TIME_SLOTS.map((slot, row) => (
            <Fragment key={`row-${row}`}>
              <div className="flex items-center text-xs text-muted">{slot}</div>
              {week.values[row].map((value, col) => (
                <ScheduleCell
                  key={`cell-${row}-${col}`}
                  value={value}
                  meta={meta}
                  onChange={(v) => onChangeCell(row, col, v)}
                />
              ))}
            </Fragment>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted">
          <span>Baixo</span>
          <span
            className="h-2 w-16 rounded-full border border-border"
            style={{
              background: "linear-gradient(90deg, hsl(0 70% 50%) 0%, hsl(60 70% 45%) 50%, hsl(120 70% 40%) 100%)",
            }}
            aria-hidden="true"
          />
          <span>Alto</span>
        </div>
      </div>
    </div>
  );
}
