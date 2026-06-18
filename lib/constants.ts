export const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:30",
  "13:30",
  "14:30",
  "15:30",
  "16:30",
  "17:30",
];

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

export function emptyWeekValues(): string[][] {
  return Array.from({ length: TIME_SLOTS.length }, () => Array(5).fill(""));
}
