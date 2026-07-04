import pricesJson from "../../../../data/prices.json";

type DailyRow = [string, number, number];

interface Quote {
  name: string;
  market: "jp" | "us";
  daily: DailyRow[];
}

export interface StockTechnical {
  chgPct: number | null;
  volRatio: number | null;
  volSurge: number;
  bbWalk: "up" | "down" | null;
  bbPctB: number | null;
  dev25: number | null;
  dev50: number | null;
  dev5: number | null;
  ret3d: number | null;
  ret5d: number | null;
  ret1m: number | null;
  ret3m: number | null;
  rsi: number | null;
  posPct: number | null;
  hi52: number | null;
  lo52: number | null;
  streak: number;
  daytrade: string | null;
  signal: string | null;
  pattern: string | null;
  po: boolean;
  poBear: boolean;
  pullback: string | null;
  pullbackMa: number | null;
}

const quotes = (pricesJson as unknown as { quotes: Record<string, Quote> }).quotes;
const cache = new Map<string, StockTechnical>();

function pstdev(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
}

function localPeaks(arr: number[], lo = false, minProm = 0.02): [number, number][] {
  const raw: [number, number][] = [];
  for (let i = 3; i < arr.length - 3; i++) {
    const win = arr.slice(i - 3, i + 4);
    if ((!lo && arr[i] === Math.max(...win)) || (lo && arr[i] === Math.min(...win))) {
      raw.push([i, arr[i]]);
    }
  }
  const pts: [number, number][] = [];
  for (const [i, v] of raw) {
    const left = arr.slice(Math.max(0, i - 10), i);
    const right = arr.slice(i + 1, i + 11);
    if (left.length === 0 || right.length === 0) {
      continue;
    }
    const prom = lo
      ? Math.min(Math.max(...left), Math.max(...right)) / v - 1
      : 1 - Math.max(Math.min(...left), Math.min(...right)) / v;
    if (prom >= minProm) {
      pts.push([i, v]);
    }
  }
  return pts;
}

function detectPattern(
  closes: number[],
  volRatio: number | null,
  dev5: number | null,
  hi52: number | null,
  lo52: number | null,
  ma25: number | null,
): string | null {
  if (closes.length < 60) {
    return null;
  }
  const cur = closes[closes.length - 1];
  const ma75 = closes.slice(-75).reduce((a, b) => a + b, 0) / Math.min(75, closes.length);
  const recent20Hi = Math.max(...closes.slice(-20));
  const recent60Hi = Math.max(...closes.slice(-60));
  const priorHi = closes.length >= 65 ? Math.max(...closes.slice(-60, -5)) : recent60Hi;
  const volUp = volRatio !== null && volRatio >= 1.3;
  const seg = closes.slice(-60);
  const segHi = Math.max(...seg);
  const segLo = Math.min(...seg);
  const peaks = localPeaks(seg, false);
  const troughs = localPeaks(seg, true);
  const uptrend = ma25 !== null && cur > ma25 && ma25 > ma75;
  const downtrend = ma25 !== null && cur < ma25 && ma25 < ma75;

  let santen = false;
  if (peaks.length >= 3 && !downtrend) {
    const last3 = peaks.slice(-3);
    const l = last3[0][1];
    const m = last3[1][1];
    const r = last3[2][1];
    if (m > l && m > r && Math.abs(l - r) / m < 0.06 && m >= segHi * 0.97 && seg[0] < m * 0.94) {
      const neckLo =
        last3[2][0] > last3[0][0] ? Math.min(...seg.slice(last3[0][0], last3[2][0] + 1)) : null;
      if (neckLo && cur < neckLo * 1.01) {
        santen = true;
      }
    }
  }

  let gyaku = false;
  if (troughs.length >= 3 && !uptrend) {
    const last3 = troughs.slice(-3);
    const l = last3[0][1];
    const m = last3[1][1];
    const r = last3[2][1];
    if (
      m < l &&
      m < r &&
      Math.abs(l - r) / m < 0.06 &&
      m <= segLo * 1.03 &&
      seg[0] > m * 1.06 &&
      cur > m * 1.03
    ) {
      gyaku = true;
    }
  }

  let tripleTop = false;
  if (peaks.length >= 3 && !santen && !downtrend) {
    const last3 = peaks.slice(-3).map((p) => p[1]);
    const avg = last3.reduce((a, b) => a + b, 0) / 3;
    if (
      last3.every((v) => Math.abs(v - avg) / avg < 0.04) &&
      avg >= segHi * 0.95 &&
      cur < avg * 0.98
    ) {
      tripleTop = true;
    }
  }

  let tripleBottom = false;
  if (troughs.length >= 3 && !gyaku && !uptrend) {
    const last3 = troughs.slice(-3).map((t) => t[1]);
    const avg = last3.reduce((a, b) => a + b, 0) / 3;
    if (
      last3.every((v) => Math.abs(v - avg) / avg < 0.04) &&
      avg <= segLo * 1.05 &&
      cur > avg * 1.02
    ) {
      tripleBottom = true;
    }
  }

  let doubleTop = false;
  if (peaks.length >= 2 && !santen && !tripleTop && !downtrend) {
    const last2 = peaks.slice(-2).map((p) => p[1]);
    if (
      Math.abs(last2[0] - last2[1]) / Math.max(...last2) < 0.04 &&
      Math.max(...last2) >= segHi * 0.96 &&
      cur < Math.min(...last2) * 0.97
    ) {
      const pi = peaks[peaks.length - 2][0];
      const valley = pi < seg.length ? Math.min(...seg.slice(pi)) : cur;
      if (valley < Math.min(...last2) * 0.94) {
        doubleTop = true;
      }
    }
  }

  let doubleBottom = false;
  if (troughs.length >= 2 && !gyaku && !tripleBottom && !uptrend) {
    const last2 = troughs.slice(-2).map((t) => t[1]);
    if (
      Math.abs(last2[0] - last2[1]) / Math.max(...last2) < 0.04 &&
      Math.min(...last2) <= segLo * 1.04 &&
      cur > Math.max(...last2) * 1.03
    ) {
      const ti = troughs[troughs.length - 2][0];
      const peakBetween = ti < seg.length ? Math.max(...seg.slice(ti)) : cur;
      if (peakBetween > Math.max(...last2) * 1.06) {
        doubleBottom = true;
      }
    }
  }

  let flag = false;
  if (seg.length >= 25) {
    const runUp = Math.max(
      seg.length >= 25 ? seg[seg.length - 15] / seg[seg.length - 25] - 1 : 0,
      seg.length >= 20 ? seg[seg.length - 10] / seg[seg.length - 20] - 1 : 0,
    );
    const box = seg.slice(-12);
    const boxRange = (Math.max(...box) - Math.min(...box)) / Math.max(...box);
    const h1 = box.slice(0, 6);
    const h2 = box.slice(6);
    const r1 = h1.length ? (Math.max(...h1) - Math.min(...h1)) / Math.max(...h1) : 0;
    const r2 = h2.length ? (Math.max(...h2) - Math.min(...h2)) / Math.max(...h2) : 1;
    const contracting = r1 > r2 * 1.25;
    const boxy = boxRange <= 0.12;
    if (
      runUp >= 0.08 &&
      (boxy || (contracting && boxRange <= 0.16)) &&
      cur >= Math.max(...box.slice(0, -1)) * 0.985
    ) {
      flag = true;
    }
  }

  let triPre = false;
  let triPost = false;
  if (seg.length >= 20 && !flag) {
    const tri = seg.slice(-20);
    const h1t = Math.max(...tri.slice(0, 10));
    const h2t = Math.max(...tri.slice(10));
    const l1t = Math.min(...tri.slice(0, 10));
    const l2t = Math.min(...tri.slice(10));
    const triRange = (Math.max(...tri) - Math.min(...tri)) / Math.max(...tri);
    const converging = h2t <= h1t * 1.005 && l2t >= l1t * 0.995 && h1t - l1t > (h2t - l2t) * 1.25;
    if (converging && triRange >= 0.03 && triRange <= 0.2) {
      const upper = tri.slice(10, -1).length ? Math.max(...tri.slice(10, -1)) : h2t;
      if (cur > upper * 1.005) {
        triPost = true;
      } else if (cur >= l2t) {
        triPre = true;
      }
    }
  }

  if (hi52 && cur >= hi52 * 0.985) {
    return "52週高値更新";
  }
  if (flag) {
    return "フラッグブレイク";
  }
  if (gyaku) {
    return "逆三尊・底打ち";
  }
  if (santen) {
    return "三尊・天井注意";
  }
  if (tripleBottom) {
    return "トリプルボトム";
  }
  if (tripleTop) {
    return "トリプルトップ";
  }
  if (doubleBottom) {
    return "ダブルボトム";
  }
  if (doubleTop) {
    return "ダブルトップ";
  }
  if (triPost) {
    return "三角ブレイク";
  }
  if (cur >= priorHi && volUp && cur > recent20Hi * 0.99) {
    return "直近高値ブレイク";
  }
  if (priorHi && priorHi * 0.98 <= cur && cur < priorHi) {
    return "直近高値ブレイクリーチ";
  }
  if (triPre) {
    return "三角ブレイクリーチ";
  }
  if (closes.length >= 40 && ma25 !== null) {
    const cupZone = closes.slice(-40, -8);
    const cupBottom = cupZone.length ? Math.min(...cupZone) : null;
    const leftPeak = closes.length >= 60 ? Math.max(...closes.slice(-60, -40)) : recent60Hi;
    const neckline = leftPeak;
    if (cupBottom && cupBottom <= recent60Hi * 0.82) {
      const pos = neckline > cupBottom ? (cur - cupBottom) / (neckline - cupBottom) : 0;
      if (cur >= neckline * 0.985 || (pos >= 0.72 && dev5 !== null && dev5 >= -6 && dev5 <= 1)) {
        return "CWH押し目/抜け";
      }
      if (pos >= 0.5) {
        return "CWH形成中";
      }
    }
  }
  if (lo52 && cur <= lo52 * 1.02) {
    return "52週安値圏";
  }
  return null;
}

export function analyzeStock(symbol: string): StockTechnical | null {
  const cached = cache.get(symbol);
  if (cached) {
    return cached;
  }
  const q = quotes[symbol];
  if (!q?.daily?.length) {
    return null;
  }
  const closes = q.daily.map((r) => r[1]);
  const vols = q.daily.map((r) => r[2]);
  const volToday = vols[vols.length - 1];
  const past = vols.length > 21 ? vols.slice(-21, -1) : vols.slice(0, -1);
  const volAvg = past.length ? past.reduce((a, b) => a + b, 0) / past.length : 0;
  const volRatio = volAvg ? Math.round((volToday / volAvg) * 100) / 100 : null;

  let volSurge = 0;
  if (volRatio !== null) {
    if (volRatio >= 5) {
      volSurge = 3;
    } else if (volRatio >= 3) {
      volSurge = 2;
    } else if (volRatio >= 2) {
      volSurge = 1;
    }
  }

  let bbWalk: "up" | "down" | null = null;
  let bbPctB: number | null = null;
  if (closes.length >= 25) {
    const win = closes.slice(-25);
    const bbMid = win.reduce((a, b) => a + b, 0) / 25;
    const bbSd = pstdev(win);
    if (bbSd > 0) {
      const upper = bbMid + 2 * bbSd;
      const lower = bbMid - 2 * bbSd;
      bbPctB = Math.round(((closes[closes.length - 1] - lower) / (upper - lower)) * 100) / 100;
      const pctbs: number[] = [];
      for (let i = -5; i < 0; i++) {
        const w = closes.slice(i - 24, i + 1);
        if (w.length >= 25) {
          const m = w.reduce((a, b) => a + b, 0) / w.length;
          const s = pstdev(w);
          if (s > 0) {
            pctbs.push((closes[closes.length + i] - (m - 2 * s)) / (4 * s));
          }
        }
      }
      if (pctbs.length) {
        const hiCnt = pctbs.filter((p) => p >= 0.8).length;
        const loCnt = pctbs.filter((p) => p <= 0.2).length;
        if (hiCnt >= 3 && closes[closes.length - 1] > closes[closes.length - 5]) {
          bbWalk = "up";
        } else if (loCnt >= 3 && closes[closes.length - 1] < closes[closes.length - 5]) {
          bbWalk = "down";
        }
      }
    }
  }

  const prev = closes.length >= 2 ? closes[closes.length - 2] : null;
  const chgPct = prev ? Math.round((closes[closes.length - 1] / prev - 1) * 100 * 100) / 100 : null;

  const ma25 = closes.length
    ? closes.slice(-25).reduce((a, b) => a + b, 0) / Math.min(25, closes.length)
    : null;
  const ma75v = closes.length
    ? closes.slice(-75).reduce((a, b) => a + b, 0) / Math.min(75, closes.length)
    : null;
  const ma50v = closes.length
    ? closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length)
    : null;
  const ma5v = closes.length
    ? closes.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, closes.length)
    : null;

  const dev25 = ma25 ? Math.round((closes[closes.length - 1] / ma25 - 1) * 100 * 10) / 10 : null;
  const dev50 = ma50v ? Math.round((closes[closes.length - 1] / ma50v - 1) * 100 * 10) / 10 : null;
  const dev5v = ma5v ? Math.round((closes[closes.length - 1] / ma5v - 1) * 100 * 10) / 10 : null;
  const dev75 = ma75v ? Math.round((closes[closes.length - 1] / ma75v - 1) * 100 * 10) / 10 : null;

  let po = false;
  let poBear = false;
  if (closes.length >= 80 && ma5v && ma25 && ma75v) {
    const ma5Prev = closes.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
    const ma25Prev = closes.slice(-30, -5).reduce((a, b) => a + b, 0) / 25;
    const ma75Prev = closes.slice(-80, -5).reduce((a, b) => a + b, 0) / 75;
    if (ma5v > ma25 && ma25 > ma75v && ma5v > ma5Prev && ma25 > ma25Prev && ma75v > ma75Prev) {
      po = true;
    }
    if (ma5v < ma25 && ma25 < ma75v && ma5v < ma5Prev && ma25 < ma25Prev && ma75v < ma75Prev) {
      poBear = true;
    }
  }

  let pullback: string | null = null;
  let pullbackMa: number | null = null;
  const uptrendBase = ma25 !== null && ma75v !== null && ma25 >= ma75v * 0.99;
  if (uptrendBase) {
    if (dev25 !== null && dev25 >= -4 && dev25 <= 2.5) {
      pullback = "25日線の押し目";
      pullbackMa = 25;
    } else if (dev50 !== null && dev50 >= -4 && dev50 <= 3) {
      pullback = "50日線の押し目";
      pullbackMa = 50;
    } else if (dev75 !== null && dev75 >= -4 && dev75 <= 3) {
      pullback = "75日線の押し目(深い)";
      pullbackMa = 75;
    } else if (dev5v !== null && dev5v >= -3 && dev5v <= 1.5) {
      pullback = "5日線の押し目(浅い)";
      pullbackMa = 5;
    }
  }

  const ret1m =
    closes.length >= 22
      ? Math.round((closes[closes.length - 1] / closes[closes.length - 22] - 1) * 100 * 10) / 10
      : null;
  const ret3m =
    closes.length >= 64
      ? Math.round((closes[closes.length - 1] / closes[closes.length - 64] - 1) * 100 * 10) / 10
      : null;

  let rsi: number | null = null;
  if (closes.length >= 15) {
    let ag = 0;
    let al = 0;
    for (let i = closes.length - 14; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      ag += Math.max(diff, 0);
      al += Math.max(-diff, 0);
    }
    ag /= 14;
    al /= 14;
    rsi = Math.round(al ? 100 - 100 / (1 + ag / al) : 100);
  }

  const hi52 = closes.length ? Math.max(...closes.slice(-250)) : null;
  const lo52 = closes.length ? Math.min(...closes.slice(-250)) : null;
  const posPct =
    hi52 && lo52 && hi52 !== lo52
      ? Math.round(((closes[closes.length - 1] - lo52) / (hi52 - lo52)) * 100)
      : null;

  const dev5 = dev5v;
  const ret3d =
    closes.length >= 4
      ? Math.round((closes[closes.length - 1] / closes[closes.length - 4] - 1) * 100 * 10) / 10
      : null;
  const ret5d =
    closes.length >= 6
      ? Math.round((closes[closes.length - 1] / closes[closes.length - 6] - 1) * 100 * 10) / 10
      : null;

  let streak = 0;
  for (let i = closes.length - 1; i > 0; i--) {
    if (closes[i] > closes[i - 1]) {
      if (streak >= 0) {
        streak += 1;
      } else {
        break;
      }
    } else if (closes[i] < closes[i - 1]) {
      if (streak <= 0) {
        streak -= 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  let daytrade: string | null = null;
  if (volRatio !== null && chgPct !== null) {
    if (volRatio >= 2 && chgPct >= 2) {
      daytrade = "資金流入急増";
    } else if (volRatio >= 1.5 && chgPct > 0 && chgPct < 2) {
      daytrade = "初動の兆し";
    } else if (volRatio >= 2 && chgPct <= -2) {
      daytrade = "急落・リバ狙い";
    }
  }

  let signal: string | null = null;
  if (dev25 !== null && rsi !== null) {
    if (dev25 <= -8 && rsi <= 35) {
      signal = "押し目";
    } else if (dev25 <= -3 && rsi < 45) {
      signal = "調整中";
    } else if (dev25 >= 8 && rsi >= 70) {
      signal = "過熱";
    } else if (Math.abs(dev25) <= 3) {
      signal = "25日線付近";
    }
  }

  const pattern = detectPattern(closes, volRatio, dev5, hi52, lo52, ma25);

  const result: StockTechnical = {
    chgPct,
    volRatio,
    volSurge,
    bbWalk,
    bbPctB,
    dev25,
    dev50,
    dev5,
    ret3d,
    ret5d,
    ret1m,
    ret3m,
    rsi,
    posPct,
    hi52: hi52 ? Math.round(hi52 * 100) / 100 : null,
    lo52: lo52 ? Math.round(lo52 * 100) / 100 : null,
    streak,
    daytrade,
    signal,
    pattern,
    po,
    poBear,
    pullback,
    pullbackMa,
  };
  cache.set(symbol, result);
  return result;
}

export const BULL_PATTERNS = new Set([
  "直近高値ブレイク",
  "直近高値ブレイクリーチ",
  "52週高値更新",
  "三角ブレイク",
  "三角ブレイクリーチ",
  "CWH形成中",
  "CWH押し目/抜け",
  "フラッグブレイク",
  "逆三尊・底打ち",
  "トリプルボトム",
  "ダブルボトム",
]);

export function stockHints(tech: StockTechnical): string[] {
  const hints: string[] = [];
  if (tech.daytrade === "資金流入急増") {
    hints.push("⚡ 出来高2倍↑＋前日比2%↑=今日の主役。寄り付き〜前場の値動きに注目");
  } else if (tech.daytrade === "初動の兆し") {
    hints.push("⚡ 出来高増え始め＋小幅上昇=初動の可能性。早めの監視");
  } else if (tech.daytrade === "急落・リバ狙い") {
    hints.push("⚡ 出来高急増＋急落=狼狽売り後のリバウンド狙い候補");
  }
  if (tech.signal === "押し目") {
    hints.push("📉 25日線から大きく下＋RSI低い=反発狙いの押し目候補(スイング)");
  } else if (tech.signal === "過熱") {
    hints.push("🔥 過熱気味。短期は利確・調整に注意");
  } else if (tech.signal === "25日線付近") {
    hints.push("⚖️ 25日線付近。方向感待ち");
  }
  if (tech.streak <= -4) {
    hints.push(`📍 ${-tech.streak}日連続下落=売られすぎ反発に警戒`);
  }
  if (tech.streak >= 4) {
    hints.push(`📈 ${tech.streak}日連続上昇=勢いあるが過熱も`);
  }
  if (tech.ret1m !== null && tech.ret1m <= -15) {
    hints.push(`📍 1ヶ月で${tech.ret1m}%下落=出遅れ・リバ狙いの監視対象`);
  }
  if (tech.posPct !== null && tech.posPct >= 90) {
    hints.push("🚀 52週高値圏=強いが高値掴み注意");
  }
  if (tech.posPct !== null && tech.posPct <= 15) {
    hints.push("🔻 52週安値圏=底値狙いの監視対象");
  }
  return hints;
}
