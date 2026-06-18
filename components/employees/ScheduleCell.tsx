"use client";

import { getCellColor } from "@/lib/paint";

interface ScheduleCellProps {
  value: string;
  meta: number;
  onChange: (value: string) => void;
}

export function ScheduleCell({ value, meta, onChange }: ScheduleCellProps) {
  return (
    <div
      className="flex min-h-10 items-center justify-center rounded-md border border-border/60 transition-colors duration-300"
      style={{ background: getCellColor(value, meta) }}
    >
      <input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        className={`w-full bg-transparent text-center text-sm font-semibold outline-none ${
          value ? "text-white" : "text-transparent"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
