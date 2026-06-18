export type DiaStatus = "trabalhado" | "falta" | "folga" | "feriado" | "atestado";

export interface DiaRegistro {
  date: string; // DD/MM/YYYY
  weekday: string; // SEG..DOM
  status: DiaStatus;
  isFullAbsence: boolean; // sinalização "1" da coluna DIA FALTA do relatório
  punches: string[]; // horários batidos, em ordem (HH:MM)
  totalTrabalhado: string | null; // HH:MM ou null
}

export interface CartaoPontoHeader {
  empresa: string | null;
  cnpj: string | null;
  funcionario: string | null;
  cpf: string | null;
  cargo: string | null;
  matricula: string | null;
  admissao: string | null;
  periodoInicio: string | null;
  periodoFim: string | null;
}

export interface CartaoPontoTotais {
  totalNormais: string | null;
  totalDiaFalta: number | null;
  bancoTotal: string | null;
  bancoSaldo: string | null;
}

export interface ParsedCartaoPonto {
  header: CartaoPontoHeader;
  totais: CartaoPontoTotais;
  dias: DiaRegistro[];
  alteracoes: string[];
}
