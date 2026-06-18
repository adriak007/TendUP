"use client";

import { Fragment } from "react";
import { TIME_SLOTS, WEEKDAY_LABELS } from "@/lib/constants";
import { formatDay } from "@/lib/format";
import type { Week } from "@/lib/data/types";
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
    <div className="editor-section">
      <div className="editor-header">
        <label htmlFor="week-name" style={{ color: "var(--muted)" }}>
          Nome da semana
        </label>
        <input
          id="week-name"
          type="text"
          value={week.name}
          onChange={(e) => onChangeName(e.target.value)}
          onBlur={onBlurName}
        />
      </div>

      <div className="schedule">
        <div className="grid">
          <div className="time" />
          {week.days.map((day, col) => (
            <div className="day" key={`day-${col}`}>
              <input
                type="text"
                placeholder={`Dia ${col + 1}`}
                value={day}
                inputMode="numeric"
                maxLength={5}
                onChange={(e) => onChangeDay(col, formatDay(e.target.value))}
              />
            </div>
          ))}

          <div className="time" />
          {WEEKDAY_LABELS.map((label, col) => (
            <div className="day" key={`weekday-${col}`}>
              {label}
            </div>
          ))}

          {TIME_SLOTS.map((slot, row) => (
            <Fragment key={`row-${row}`}>
              <div className="time">{slot}</div>
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

        <div className="legend">
          <span>Baixo</span>
          <span className="legend-swatch" aria-hidden="true" />
          <span>Alto</span>
        </div>
      </div>
    </div>
  );
}
