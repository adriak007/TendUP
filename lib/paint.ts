export function getCellColor(value: string | number, meta: number): string {
  const v = Number(value);
  const m = Number(meta);

  if (!Number.isFinite(v) || !Number.isFinite(m) || m <= 0) {
    return "var(--color-cell-empty)";
  }

  const r = Math.max(0, Math.min(1, v / m));

  let hue: number;
  if (r <= 0.5) {
    hue = 0; // vermelho
  } else {
    // Curva não linear para concentrar o degradê perto da meta
    const t = Math.pow((r - 0.5) / 0.5, 1.4);
    hue = 120 * Math.max(0, Math.min(1, t)); // até verde
  }

  const sat = 70;
  const light = 42;
  return `hsl(${hue} ${sat}% ${light}%)`;
}
