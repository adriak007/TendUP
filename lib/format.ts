export function formatDay(value: string): string {
  const digits = String(value).replace(/\D+/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}
