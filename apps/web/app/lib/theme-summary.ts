import { indices, themesDetail, themesPerf } from "~/lib/data";

/** SOX 年初来騰落率(ベンチマーク) */
export function soxYtdPct(): number | null {
  const sox = indices.find((ix) => ix.id === "^SOX");
  return sox?.ytd_pct ?? null;
}

/** 累積騰落率系列の直近2点から前日比を算出 */
export function themeDayPct(series: [string, number][]): number | null {
  if (series.length < 2) {
    return null;
  }
  const prev = series.at(-2)?.[1];
  const curr = series.at(-1)?.[1];
  if (prev === undefined || curr === undefined) {
    return null;
  }
  return ((1 + curr / 100) / (1 + prev / 100) - 1) * 100;
}

export interface ThemeSummaryRow {
  key: string;
  name: string;
  color: string;
  dayPct: number | null;
  ytdPct: number | null;
  soxAlpha: number | null;
  volRatio: number | null;
  spark: number[];
}

/** ホーム用: 12マクロテーマの騰落サマリー(年初来順) */
export function themeSummaryRows(): ThemeSummaryRow[] {
  const detailByKey = new Map(themesDetail.themes.map((t) => [t.key, t]));
  const soxYtd = soxYtdPct();
  return themesPerf.themes
    .map((t) => {
      const detail = detailByKey.get(t.key);
      const ytdPct = t.ytd_pct;
      return {
        key: t.key,
        name: t.name,
        color: t.color,
        dayPct: detail ? themeDayPct(detail.series) : null,
        ytdPct,
        soxAlpha:
          ytdPct !== null && soxYtd !== null ? Math.round((ytdPct - soxYtd) * 10) / 10 : null,
        volRatio: t.vol_ratio,
        spark: t.spark,
      };
    })
    .sort((a, b) => (b.ytdPct ?? -1e9) - (a.ytdPct ?? -1e9));
}
