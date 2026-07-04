import macroJson from "../../../../data/macro.json";

export interface WstsPoint {
  month: string;
  value: number;
  yoy_pct: number;
}

export interface MacroData {
  last_updated: string;
  source_url: string;
  cycle_note: string;
  wsts: {
    label: string;
    unit: string;
    series: WstsPoint[];
  };
  capex?: {
    label: string;
    unit: string;
    as_of: string;
    items: { company: string; value: number; yoy_pct: number; note: string }[];
  };
}

export const macro = macroJson as MacroData;

/** "2026-05" → "5月" */
export function monthLabel(ym: string): string {
  const [, m] = ym.split("-");
  return m ? `${Number(m)}月` : ym;
}

export function wstsRecent(count = 6): WstsPoint[] {
  return macro.wsts.series.slice(-count);
}
