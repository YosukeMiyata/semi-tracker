import { fmtPct } from "~/lib/data";
import linkageJson from "../../../../data/linkage.json";
import pricesJson from "../../../../data/prices.json";
import themesMaster from "../../../../data/themes.json";

export type TrackerView = "theme" | "rank" | "vol" | "link" | "flow" | "proc";
export type TrackerMarket = "both" | "us" | "jp";
export type TrackerPeriodId = "1D" | "5D" | "10D" | "1M" | "2M" | "3M" | "6M" | "1Y" | "YTD";

type DailyRow = [string, number, number];

interface Quote {
  name: string;
  market: "jp" | "us";
  daily: DailyRow[];
}

interface SubTheme {
  name: string;
  us: { symbol: string; name: string }[];
  jp: { code: string; name: string; note?: string }[];
  solo: { code: string; name: string; note?: string }[];
}

interface MacroTheme {
  key: string;
  name: string;
  color: string;
  subs: SubTheme[];
}

export interface TrackerPeriod {
  id: TrackerPeriodId;
  label: string;
  days: number | null;
}

export interface RankedTheme {
  key: string;
  name: string;
  color: string;
  idx: number;
  series: [string, number][];
  avg: number | null;
  subs: SubTheme[];
}

export interface SearchHit {
  symbol: string;
  name: string;
  market: "jp" | "us";
  chgPct: number | null;
}

export const TRACKER_PERIODS: TrackerPeriod[] = [
  { id: "1D", label: "1日", days: 1 },
  { id: "5D", label: "5日", days: 5 },
  { id: "10D", label: "10日", days: 10 },
  { id: "1M", label: "1ヶ月", days: 21 },
  { id: "2M", label: "2ヶ月", days: 42 },
  { id: "3M", label: "3ヶ月", days: 63 },
  { id: "6M", label: "6ヶ月", days: 126 },
  { id: "1Y", label: "1年", days: 252 },
  { id: "YTD", label: "年初来", days: null },
];

export const TRACKER_MARKETS: { id: TrackerMarket; label: string }[] = [
  { id: "both", label: "統合" },
  { id: "us", label: "米国" },
  { id: "jp", label: "日本" },
];

export const TRACKER_VIEWS: { id: TrackerView; label: string }[] = [
  { id: "theme", label: "テーマ" },
  { id: "rank", label: "銘柄" },
  { id: "vol", label: "前日比・出来高" },
  { id: "link", label: "連動" },
  { id: "flow", label: "フロー図" },
  { id: "proc", label: "工程" },
];

const pricesData = pricesJson as unknown as { last_updated: string; quotes: Record<string, Quote> };
const quotes = pricesData.quotes;
const macros = (themesMaster as { macro: MacroTheme[] }).macro;
export const trackerLastUpdated = pricesData.last_updated;

function periodDays(period: TrackerPeriodId): number | null {
  return TRACKER_PERIODS.find((p) => p.id === period)?.days ?? null;
}

function sliceDaily(daily: DailyRow[], days: number | null, year: string): DailyRow[] | null {
  if (!daily || daily.length < 2) {
    return null;
  }
  if (days === null) {
    const ys = daily.filter((p) => p[0] >= `${year}-01-01`);
    return ys.length >= 2 ? ys : null;
  }
  return daily.slice(Math.max(0, daily.length - 1 - days));
}

function cumLine(daily: DailyRow[]): [string, number][] | null {
  const base = daily[0][1];
  if (!base) {
    return null;
  }
  return daily.map((p) => [p[0], (p[1] / base - 1) * 100]);
}

function symCumLine(symbol: string, period: TrackerPeriodId): [string, number][] | null {
  const q = quotes[symbol];
  if (!q?.daily) {
    return null;
  }
  const sliced = sliceDaily(q.daily, periodDays(period), trackerLastUpdated.slice(0, 4));
  if (!sliced) {
    return null;
  }
  return cumLine(sliced);
}

function symRet(symbol: string, period: TrackerPeriodId): number | null {
  const line = symCumLine(symbol, period);
  return line?.length ? line[line.length - 1][1] : null;
}

function chgPct(symbol: string): number | null {
  const daily = quotes[symbol]?.daily;
  if (!daily || daily.length < 2 || !daily[daily.length - 2][1]) {
    return null;
  }
  const last = daily[daily.length - 1][1];
  const prev = daily[daily.length - 2][1];
  return (last / prev - 1) * 100;
}

function pickSymbols(sub: SubTheme, market: TrackerMarket): string[] {
  if (market === "us") {
    return sub.us.map((x) => x.symbol);
  }
  if (market === "jp") {
    return [...sub.jp.map((x) => x.code), ...sub.solo.map((x) => x.code)];
  }
  return [
    ...sub.us.map((x) => x.symbol),
    ...sub.jp.map((x) => x.code),
    ...sub.solo.map((x) => x.code),
  ];
}

function macroSymbols(macro: MacroTheme, market: TrackerMarket): string[] {
  const set = new Set<string>();
  for (const sub of macro.subs) {
    for (const sym of pickSymbols(sub, market)) {
      set.add(sym);
    }
  }
  return [...set];
}

function avgSeries(symbols: string[], period: TrackerPeriodId): [string, number][] | null {
  const lines = symbols.map((s) => symCumLine(s, period)).filter(Boolean) as [string, number][][];
  if (!lines.length) {
    return null;
  }
  const n = Math.min(...lines.map((a) => a.length));
  const out: [string, number][] = [];
  for (let i = 0; i < n; i++) {
    const vals = lines.map((a) => a[a.length - n + i][1]);
    out.push([lines[0][lines[0].length - n + i][0], vals.reduce((x, y) => x + y, 0) / vals.length]);
  }
  return out;
}

function lastOf(series: [string, number][] | null): number | null {
  return series?.length ? series[series.length - 1][1] : null;
}

export function periodLabel(period: TrackerPeriodId): string {
  return TRACKER_PERIODS.find((p) => p.id === period)?.label ?? period;
}

export function rankedThemes(period: TrackerPeriodId, market: TrackerMarket): RankedTheme[] {
  return macros
    .map((m, idx) => {
      const series = avgSeries(macroSymbols(m, market), period);
      return {
        key: m.key,
        name: m.name,
        color: m.color,
        idx,
        series: series ?? [],
        avg: lastOf(series),
        subs: m.subs,
      };
    })
    .filter((m) => m.series.length >= 2)
    .sort((a, b) => (b.avg ?? -1e9) - (a.avg ?? -1e9));
}

export function subAvg(
  sub: SubTheme,
  period: TrackerPeriodId,
  market: TrackerMarket,
): number | null {
  return lastOf(avgSeries(pickSymbols(sub, market), period));
}

export function searchStocks(query: string, limit = 15): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }
  return Object.entries(quotes)
    .filter(([sym, row]) => sym.toLowerCase().includes(q) || row.name.toLowerCase().includes(q))
    .map(([symbol, row]) => ({
      symbol,
      name: row.name,
      market: row.market,
      chgPct: chgPct(symbol),
    }))
    .sort((a, b) => Math.abs(b.chgPct ?? 0) - Math.abs(a.chgPct ?? 0))
    .slice(0, limit);
}

export function stockChgPct(symbol: string): number | null {
  return chgPct(symbol);
}

export function stockPeriodRet(symbol: string, period: TrackerPeriodId): number | null {
  return symRet(symbol, period);
}

export function stockVolRatio(symbol: string): number | null {
  const daily = quotes[symbol]?.daily;
  if (!daily || daily.length < 2) {
    return null;
  }
  const vols = daily.map((r) => r[2]);
  const past = vols.length > 21 ? vols.slice(-21, -1) : vols.slice(0, -1);
  const avg = past.reduce((a, b) => a + b, 0) / past.length;
  return avg ? Math.round((vols[vols.length - 1] / avg) * 100) / 100 : null;
}

export function stockRowLabel(
  row: { code?: string; symbol?: string; name: string },
  market: "jp" | "us",
): { code: string; name: string; market: "jp" | "us" } {
  return {
    code: row.code ?? row.symbol ?? "",
    name: row.name,
    market,
  };
}

export function formatTrackerPct(v: number | null | undefined): string {
  return fmtPct(v);
}

export function sparkFromSeries(series: [string, number][]): number[] {
  return series.map(([, v]) => v);
}

export function stockThemes(symbol: string): { macroIdx: number; label: string }[] {
  const hits: { macroIdx: number; label: string }[] = [];
  macros.forEach((m, macroIdx) => {
    for (const sub of m.subs) {
      const inUs = sub.us.some((x) => x.symbol === symbol);
      const inJp = sub.jp.some((x) => x.code === symbol);
      const inSolo = sub.solo.some((x) => x.code === symbol);
      if (inUs || inJp || inSolo) {
        hits.push({ macroIdx, label: `${m.name} › ${sub.name}` });
      }
    }
  });
  return hits;
}

export interface StockRow {
  symbol: string;
  name: string;
  market: "jp" | "us";
  last: number;
  lastDate: string;
  chgPct: number | null;
  volRatio: number | null;
}

export function stockRow(symbol: string): StockRow | null {
  const q = quotes[symbol];
  if (!q?.daily?.length) {
    return null;
  }
  const last = q.daily[q.daily.length - 1];
  return {
    symbol,
    name: q.name,
    market: q.market,
    last: last[1],
    lastDate: last[0],
    chgPct: chgPct(symbol),
    volRatio: stockVolRatio(symbol),
  };
}

export function allStockRows(): StockRow[] {
  return Object.keys(quotes)
    .map((symbol) => stockRow(symbol))
    .filter((r): r is StockRow => r !== null);
}

export interface LinkageGroupRow {
  code: string;
  name: string;
  rate: number;
  avg: number;
  n: number;
}

export interface LinkageGroup {
  theme: string;
  macro: string;
  sub: string;
  usAvg: number | null;
  triggered: boolean;
  trigLevel: number;
  us: { symbol: string; name: string; chgPct: number | null }[];
  rows: LinkageGroupRow[];
}

interface LinkageJsonEntry {
  us: [string, string, number][];
  usAvg: number | null;
  triggered: boolean;
  trigLevel: number;
  rows: LinkageGroupRow[];
}

export function linkageGroups(): LinkageGroup[] {
  const raw = linkageJson as unknown as {
    method: string;
    themes: Record<string, LinkageJsonEntry>;
  };
  return Object.entries(raw.themes)
    .map(([theme, entry]) => {
      const parts = theme.split(" > ");
      const sub = parts.pop() ?? theme;
      const macro = parts.join(" > ") || sub;
      return {
        theme,
        macro,
        sub,
        usAvg: entry.usAvg,
        triggered: entry.triggered,
        trigLevel: entry.trigLevel,
        us: entry.us.map(([symbol, name, chg]) => ({
          symbol,
          name,
          chgPct: chg,
        })),
        rows: entry.rows,
      };
    })
    .sort(
      (a, b) => (b.trigLevel || 0) - (a.trigLevel || 0) || (b.usAvg ?? -1e9) - (a.usAvg ?? -1e9),
    );
}

export function linkageMethod(): string {
  return (linkageJson as unknown as { method: string }).method;
}

export const SPE_PROCESS = {
  front: {
    label: "前工程",
    subs: [
      "露光(リソグラフィ)",
      "成膜(Deposition)",
      "エッチング(Etch)",
      "洗浄(Clean)",
      "検査・計測(Metrology)",
      "EUVマスク・材料",
      "イオン注入・CMP",
    ],
  },
  middle: { label: "中工程・先端パッケージング", subs: ["後工程・ダイシング・封止"] },
  back: { label: "後工程", subs: ["テスト(ATE)・プローブカード"] },
} as const;

export function sectorSymbolSet(macroKey: string): Set<string> | null {
  const m = macros.find((x) => x.key === macroKey);
  if (!m) {
    return null;
  }
  const set = new Set<string>();
  for (const sub of m.subs) {
    for (const sym of pickSymbols(sub, "both")) {
      set.add(sym);
    }
  }
  return set;
}

export function subSymbolSet(macroKey: string, subName: string): Set<string> | null {
  const m = macros.find((x) => x.key === macroKey);
  const sub = m?.subs.find((s) => s.name === subName);
  if (!sub) {
    return null;
  }
  return new Set(pickSymbols(sub, "both"));
}

export function speProcessSymbolSet(procKey: keyof typeof SPE_PROCESS): Set<string> | null {
  const m = macros.find((x) => x.key === "spe");
  const names = SPE_PROCESS[procKey]?.subs;
  if (!m || !names) {
    return null;
  }
  const set = new Set<string>();
  for (const sub of m.subs.filter((s) => (names as readonly string[]).includes(s.name))) {
    for (const sym of pickSymbols(sub, "both")) {
      set.add(sym);
    }
  }
  return set;
}

export function macroSectorOptions(): { id: string; label: string }[] {
  return [{ id: "all", label: "すべて" }, ...macros.map((m) => ({ id: m.key, label: m.name }))];
}
