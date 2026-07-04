import pricesJson from "../../../../data/prices.json";

/** [日付, 終値, 出来高, 始値?, 高値?, 安値?] */
export type CandleRow = [string, number, number, number?, number?, number?];

export type ChartTimeframe = "D" | "W" | "M";

const quotes = (pricesJson as unknown as { quotes: Record<string, { daily: CandleRow[] }> }).quotes;

export const MA_DEFS: [number, string][] = [
  [5, "#2BA8B8"],
  [25, "#C99A00"],
  [50, "#17A05F"],
  [75, "#7A52E0"],
  [200, "#D14A96"],
];

export function maSeries(closes: number[], n: number): (number | null)[] {
  const out: (number | null)[] = Array.from({ length: closes.length }, () => null);
  let s = 0;
  for (let i = 0; i < closes.length; i++) {
    s += closes[i];
    if (i >= n) {
      s -= closes[i - n];
    }
    if (i >= n - 1) {
      out[i] = s / n;
    }
  }
  return out;
}

export function aggregateRows(dd: CandleRow[], unit: "W" | "M"): CandleRow[] {
  const out: CandleRow[] = [];
  let key: string | null = null;
  let cur: CandleRow | null = null;

  for (const r of dd) {
    const dt = new Date(`${r[0]}T00:00:00Z`);
    let k: string;
    if (unit === "M") {
      k = r[0].slice(0, 7);
    } else {
      const day = (dt.getUTCDay() + 6) % 7;
      const mon = new Date(dt);
      mon.setUTCDate(dt.getUTCDate() - day);
      k = mon.toISOString().slice(0, 10);
    }
    const o = r.length >= 6 && r[3] != null ? r[3] : r[1];
    const h = r.length >= 6 && r[4] != null ? r[4] : r[1];
    const l = r.length >= 6 && r[5] != null ? r[5] : r[1];

    if (k !== key) {
      if (cur) {
        out.push(cur);
      }
      key = k;
      cur = [r[0], r[1], r[2] || 0, o, h, l];
    } else if (cur) {
      cur[1] = r[1];
      cur[2] += r[2] || 0;
      cur[4] = Math.max(cur[4] ?? r[1], h);
      cur[5] = Math.min(cur[5] ?? r[1], l);
      cur[0] = r[0];
    }
  }
  if (cur) {
    out.push(cur);
  }
  return out;
}

export function stockChartRows(symbol: string, tf: ChartTimeframe): CandleRow[] {
  const dd = quotes[symbol]?.daily;
  if (!dd || dd.length < 2) {
    return [];
  }
  if (tf === "W") {
    return aggregateRows(dd, "W");
  }
  if (tf === "M") {
    return aggregateRows(dd, "M");
  }
  return dd.slice(Math.max(0, dd.length - 80));
}

export function fmtPrice(v: number): string {
  if (v >= 10000) {
    return `${(v / 1000).toFixed(1)}k`;
  }
  if (v >= 100) {
    return v.toFixed(0);
  }
  return v.toFixed(1);
}
