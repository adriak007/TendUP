import type { DiaRegistro } from "./types";

export interface CartaoPontoStats {
  totalDias: number;
  diasTrabalhados: number;
  diasFaltaIntegral: number;
  diasFaltaParcial: number;
  diasAnulados: number;
  diasFeriado: number;
  diasFolga: number;
  diasAtestado: number;
  taxaFalta: number | null;
  mediaEntrada: string | null;
  mediaSaida: string | null;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes: number): string {
  const m = Math.round(totalMinutes);
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function computeStats(dias: DiaRegistro[], exceptions: Set<string>): CartaoPontoStats {
  let diasTrabalhados = 0;
  let diasFaltaIntegral = 0;
  let diasFaltaParcial = 0;
  let diasAnulados = 0;
  let diasFeriado = 0;
  let diasFolga = 0;
  let diasAtestado = 0;
  const entradas: number[] = [];
  const saidas: number[] = [];

  for (const dia of dias) {
    const anulado = exceptions.has(dia.date);

    if (dia.status === "falta" && anulado) {
      diasAnulados++;
    } else if (dia.status === "falta" && dia.isFullAbsence) {
      diasFaltaIntegral++;
    } else if (dia.status === "falta") {
      diasFaltaParcial++;
    } else if (dia.status === "feriado") {
      diasFeriado++;
    } else if (dia.status === "folga") {
      diasFolga++;
    } else if (dia.status === "atestado") {
      diasAtestado++;
    } else {
      diasTrabalhados++;
    }

    if (dia.punches.length > 0) {
      entradas.push(timeToMinutes(dia.punches[0]));
      saidas.push(timeToMinutes(dia.punches[dia.punches.length - 1]));
    }
  }

  const diasUteis = diasTrabalhados + diasFaltaIntegral + diasFaltaParcial;
  const taxaFalta =
    diasUteis > 0 ? ((diasFaltaIntegral + diasFaltaParcial) / diasUteis) * 100 : null;

  const mediaEntrada =
    entradas.length > 0
      ? minutesToTime(entradas.reduce((a, b) => a + b, 0) / entradas.length)
      : null;
  const mediaSaida =
    saidas.length > 0 ? minutesToTime(saidas.reduce((a, b) => a + b, 0) / saidas.length) : null;

  return {
    totalDias: dias.length,
    diasTrabalhados,
    diasFaltaIntegral,
    diasFaltaParcial,
    diasAnulados,
    diasFeriado,
    diasFolga,
    diasAtestado,
    taxaFalta,
    mediaEntrada,
    mediaSaida,
  };
}
