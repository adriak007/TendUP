import type {
  CartaoPontoHeader,
  CartaoPontoTotais,
  DiaRegistro,
  DiaStatus,
  ParsedCartaoPonto,
} from "./types";

function matchField(text: string, regex: RegExp): string | null {
  const m = text.match(regex);
  return m ? m[1].trim() : null;
}

function normalizeWeekday(raw: string): string {
  return raw.toUpperCase().replace("Á", "A");
}

function parseHeader(text: string): CartaoPontoHeader {
  const header: CartaoPontoHeader = {
    empresa: matchField(text, /NOME DA EMPRESA:\s*([^\n]+?)(?:\s+CNPJ DA EMPRESA|\n)/i),
    cnpj: matchField(text, /CNPJ DA EMPRESA:\s*([\d./-]+)/i),
    funcionario: matchField(
      text,
      /NOME DO FUNCION[ÁA]RIO:\s*([^\n]+?)(?:\s+CPF DO FUNCION[ÁA]RIO|\n)/i,
    ),
    cpf: matchField(text, /CPF DO FUNCION[ÁA]RIO:\s*([\d.-]+)/i),
    cargo: matchField(text, /NOME DO CARGO:\s*([^\n]+?)(?:\s+N[ÚU]MERO DE MATR[ÍI]CULA|\n)/i),
    matricula: matchField(text, /N[ÚU]MERO DE MATR[ÍI]CULA:\s*(\S+)/i),
    admissao: matchField(text, /DATA DE ADMISS[ÃA]O DO FUNCION[ÁA]RIO:\s*([\d/]+)/i),
    periodoInicio: null,
    periodoFim: null,
  };

  const periodoMatch = text.match(/DE\s+(\d{2}\/\d{2}\/\d{4})\s+AT[ÉE]\s+(\d{2}\/\d{2}\/\d{4})/i);
  if (periodoMatch) {
    header.periodoInicio = periodoMatch[1];
    header.periodoFim = periodoMatch[2];
  }

  return header;
}

function parseDiaChunk(date: string, weekday: string, chunk: string): DiaRegistro {
  if (/Feriado/i.test(chunk)) {
    return { date, weekday, status: "feriado", isFullAbsence: false, punches: [], totalTrabalhado: null };
  }
  if (/Atestado/i.test(chunk)) {
    return { date, weekday, status: "atestado", isFullAbsence: false, punches: [], totalTrabalhado: null };
  }
  if (/Folga/i.test(chunk)) {
    return { date, weekday, status: "folga", isFullAbsence: false, punches: [], totalTrabalhado: null };
  }

  // Faixas previstas ("07:00-11:00") não são marcações reais - remove antes de procurar horários batidos.
  const previstoRanges = chunk.match(/\d{2}:\d{2}-\d{2}:\d{2}/g) ?? [];
  const withoutPrevisto = chunk.replace(/\d{2}:\d{2}-\d{2}:\d{2}/g, " ");

  const faltaCount = (withoutPrevisto.match(/Falta/gi) ?? []).length;
  const withoutFalta = withoutPrevisto.replace(/Falta/gi, " ");

  const positiveTimes = withoutFalta.match(/(?<!-)\b\d{2}:\d{2}\b/g) ?? [];

  // Cada faixa prevista representa 2 marcações esperadas (entrada/saída). Quando não há faixa
  // prevista (ex.: trabalho num sábado de folga), assume-se 1 par de marcações se houver horários.
  let expectedPunches = previstoRanges.length * 2;
  if (expectedPunches === 0) expectedPunches = 2;

  const actualPunchCount = Math.max(0, Math.min(expectedPunches - faltaCount, positiveTimes.length));
  const punches = positiveTimes.slice(0, actualPunchCount);
  const totalTrabalhado = positiveTimes[actualPunchCount] ?? null;

  // A coluna "DIA FALTA" marca falta de dia inteiro com um "1" isolado no relatório.
  const withoutAnyTime = withoutFalta.replace(/-?\d{2}:\d{2}/g, " ");
  const isFullAbsence = /\b1\b/.test(withoutAnyTime);

  const status: DiaStatus = faltaCount > 0 ? "falta" : "trabalhado";

  return { date, weekday, status, isFullAbsence, punches, totalTrabalhado };
}

function parseTotais(text: string): CartaoPontoTotais {
  const m = text.match(/TOTAIS\s+([\d:]+)\s+(\d+)\s+([\d:]+)\s+([\d:]+)\s+(-?[\d:]+)\s+(-?[\d:]+)/);
  if (!m) {
    return { totalNormais: null, totalDiaFalta: null, bancoTotal: null, bancoSaldo: null };
  }
  return {
    totalNormais: m[1],
    totalDiaFalta: Number(m[2]),
    bancoTotal: m[5],
    bancoSaldo: m[6],
  };
}

function parseAlteracoes(text: string): string[] {
  const m = text.match(/Altera[cç][oõ]es([\s\S]*?)(?:\n\s*\n|$)/i);
  if (!m) return [];
  return m[1]
    .split("\n")
    .map((l) => l.replace(/^[\s•-]+/, "").trim())
    .filter(Boolean);
}

export function parseCartaoPontoText(rawText: string): ParsedCartaoPonto {
  const text = rawText.replace(/ /g, " ");

  const header = parseHeader(text);

  const dayHeaderRegex = /(\d{2}\/\d{2}\/\d{4})\s*-\s*(SEG|TER|QUA|QUI|SEX|S[ÁA]B|DOM)/g;
  const headerMatches = [...text.matchAll(dayHeaderRegex)];
  const totaisIndex = text.search(/\bTOTAIS\b/);

  const dias: DiaRegistro[] = headerMatches.map((match, i) => {
    const start = match.index! + match[0].length;
    const nextStart =
      i + 1 < headerMatches.length
        ? headerMatches[i + 1].index!
        : totaisIndex === -1
          ? text.length
          : totaisIndex;
    const chunk = text.slice(start, nextStart);
    return parseDiaChunk(match[1], normalizeWeekday(match[2]), chunk);
  });

  const totais = parseTotais(text);
  const alteracoes = parseAlteracoes(text);

  return { header, totais, dias, alteracoes };
}
