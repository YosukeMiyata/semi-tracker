import linkageTopJson from "../../../../data/linkage_top.json";
import themesPerfJson from "../../../../data/themes_perf.json";

export interface ThemePerf {
  key: string;
  name: string;
  color: string;
  ytd_pct: number | null;
  vol_ratio: number | null;
  spark: number[];
  n_stocks: number;
  n_ok: number;
}

export interface ThemesPerf {
  last_updated: string;
  note: string;
  themes: ThemePerf[];
}

export interface LinkageRow {
  theme: string;
  us_avg: number | null;
  trig_level: number;
  code: string;
  name: string;
  rate: number;
  avg: number;
  n: number;
}

export interface LinkageTop {
  last_updated: string;
  method: string;
  rows: LinkageRow[];
}

export const themesPerf = themesPerfJson as ThemesPerf;
export const linkageTop = linkageTopJson as unknown as LinkageTop;

/** 騰落率の表示形式(日本市場の慣習: 全角マイナス) */
export function fmtPct(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined) {
    return "—";
  }
  return `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(digits)}%`;
}

export function pctColor(v: number | null | undefined): string {
  if (v === null || v === undefined) {
    return "text-neutral";
  }
  return v >= 0 ? "text-up" : "text-down";
}
