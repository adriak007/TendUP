"use client";

import { getCellColor } from "@/lib/paint";

interface ScheduleCellProps {
  value: string;
  meta: number;
  onChange: (value: string) => void;
}

export function ScheduleCell({ value, meta, onChange }: ScheduleCellProps) {
  return (
    <div className="cell" style={{ background: getCellColor(value, meta) }}>
      <input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        className={value ? "" : "empty"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
