import indicesJson from "../../../../data/indices.json";
import linkageTopJson from "../../../../data/linkage_top.json";
import themesDetailJson from "../../../../data/themes_detail.json";
import themesPerfJson from "../../../../data/themes_perf.json";
import timelineStatsJson from "../../../../data/timeline_stats.json";

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

export interface StockStat {
  code: string;
  name: string;
  ytd_pct: number | null;
  chg_pct: number | null;
  vol_ratio: number | null;
}

export interface SubDetail {
  name: string;
  ytd_pct: number | null;
  stocks: StockStat[];
}

export interface ThemeDetail {
  key: string;
  name: string;
  color: string;
  ytd_pct: number | null;
  series: [string, number][];
  subs: SubDetail[];
}

export interface ThemesDetail {
  last_updated: string;
  note: string;
  themes: ThemeDetail[];
}

export interface IndexStat {
  id: string;
  name: string;
  last: number;
  date: string;
  chg_pct: number | null;
  ytd_pct: number | null;
  spark: number[];
}

export const themesPerf = themesPerfJson as ThemesPerf;
export const linkageTop = linkageTopJson as unknown as LinkageTop;
export const themesDetail = themesDetailJson as unknown as ThemesDetail;
export const indices = (indicesJson as unknown as { indices: IndexStat[] }).indices;
export const timelineReactions = (
  timelineStatsJson as unknown as { reactions: Record<string, Record<string, number>> }
).reactions;

/**
 * チャート線・チャート内凡例専用の派生色(dataviz 検証済み: 明度帯・彩度・CVD分離)。
 * マスタの v1 テーマ色は変更せず、線として視認できる濃度に調整したもの。
 */
export const CHART_COLORS: Record<string, string> = {
  memory: "#C03014",
  optical: "#C99A00",
  package: "#7A52E0",
  spe: "#1F7FB5",
  compute: "#17A05F",
  analog_power: "#C2621C",
  passive: "#D14A96",
  datacenter: "#1F8FD6",
  materials: "#2C5FA8",
  subsystem: "#8578CE",
  facility: "#66A33C",
  metals: "#B25E2E",
};

/** 出来高急増の段階(v1 の 2倍/3倍/5倍を踏襲) */
export function volTier(volRatio: number | null): number | null {
  if (volRatio === null) {
    return null;
  }
  if (volRatio >= 5) {
    return 5;
  }
  if (volRatio >= 3) {
    return 3;
  }
  if (volRatio >= 2) {
    return 2;
  }
  return null;
}

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
