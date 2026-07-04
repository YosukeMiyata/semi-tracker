import { useMemo, useState } from "react";
import {
  type CandleRow,
  type ChartTimeframe,
  fmtPrice,
  MA_DEFS,
  maSeries,
  stockChartRows,
} from "~/lib/stock-chart";

const CHART_TFS: [string, ChartTimeframe][] = [
  ["日足", "D"],
  ["週足", "W"],
  ["月足", "M"],
];

const W = 300;
const H = 280;
const PAD = { l: 6, r: 44, t: 10, b: 30 };
const PXH = 176;
const VGAP = 14;
const VOLH = 44;
const VOLT = PAD.t + PXH + VGAP;
const UP = "var(--color-up)";
const DN = "var(--color-down)";

function buildChartSvg(allRows: CandleRow[], dispCount: number): string {
  if (!allRows.length || allRows.length < 2) {
    return "";
  }
  const startIdx = Math.max(0, allRows.length - dispCount);
  const seg = allRows.slice(startIdx);
  const n = seg.length;
  if (n < 2) {
    return "";
  }

  const closesAll = allRows.map((p) => p[1]);
  const vols = seg.map((p) => p[2] || 0);
  const hasVol = vols.some((v) => v > 0);
  const hasOHLC = seg.every((r) => r.length >= 6);
  const mas = MA_DEFS.map(([nn]) => maSeries(closesAll, nn).slice(startIdx));

  let mn: number;
  let mx: number;
  if (hasOHLC) {
    mn = Math.min(...seg.map((p) => p[5] ?? p[1]));
    mx = Math.max(...seg.map((p) => p[4] ?? p[1]));
  } else {
    const vs = seg.map((p) => p[1]);
    mn = Math.min(...vs);
    mx = Math.max(...vs);
  }
  for (const m of mas) {
    for (const v of m) {
      if (v != null) {
        if (v < mn) {
          mn = v;
        }
        if (v > mx) {
          mx = v;
        }
      }
    }
  }
  const pad = (mx - mn) * 0.06 || 1;
  mn -= pad;
  mx += pad;

  const plotW = W - PAD.l - PAD.r;
  const xAt = (i: number) => PAD.l + (i / (n - 1)) * plotW;
  const yAt = (v: number) => PAD.t + (1 - (v - mn) / (mx - mn)) * PXH;

  let svg = "";
  svg += `<rect x="0" y="0" width="${W}" height="${H}" fill="#F4F5F7" rx="4"/>`;

  for (let g = 0; g <= 4; g++) {
    const gy = (PAD.t + (PXH * g) / 4).toFixed(1);
    svg += `<line x1="${PAD.l}" y1="${gy}" x2="${W - PAD.r}" y2="${gy}" stroke="rgba(138,148,168,.22)" stroke-width="1" stroke-dasharray="1 3"/>`;
  }

  for (let g = 0; g <= 4; g++) {
    const val = mx - ((mx - mn) * g) / 4;
    const gy = PAD.t + (PXH * g) / 4;
    svg += `<text x="${W - PAD.r + 4}" y="${(gy + 3).toFixed(1)}" fill="#8B94A8" font-size="9" font-family="ui-monospace,monospace">${fmtPrice(val)}</text>`;
  }

  const marks: number[] = [];
  let prevYM: string | null = null;
  for (let i = 0; i < n; i++) {
    const ym = seg[i][0].slice(0, 7);
    if (ym !== prevYM) {
      marks.push(i);
      prevYM = ym;
    }
  }
  const step = Math.ceil(marks.length / 7) || 1;
  const shown = marks.filter((_, idx) => idx % step === 0);
  for (const i of shown) {
    const x = xAt(i);
    svg += `<line x1="${x.toFixed(1)}" y1="${PAD.t}" x2="${x.toFixed(1)}" y2="${(PAD.t + PXH).toFixed(1)}" stroke="rgba(138,148,168,.15)" stroke-width="1" stroke-dasharray="1 3"/>`;
    const parts = seg[i][0].split("-");
    const label = `${Number(parts[1])}/1`;
    svg += `<text x="${x.toFixed(1)}" y="${(PAD.t + PXH + VGAP + VOLH + 16).toFixed(1)}" fill="#8B94A8" font-size="9" font-family="ui-monospace,monospace" text-anchor="middle">${label}</text>`;
  }

  if (hasOHLC) {
    const bw = Math.max(1.6, (plotW / n) * 0.66);
    for (let i = 0; i < n; i++) {
      const o = seg[i][3] ?? seg[i][1];
      const h = seg[i][4] ?? seg[i][1];
      const l = seg[i][5] ?? seg[i][1];
      const c = seg[i][1];
      const up = c >= o;
      const colr = up ? UP : DN;
      const x = xAt(i);
      svg += `<line x1="${x.toFixed(1)}" y1="${yAt(h).toFixed(1)}" x2="${x.toFixed(1)}" y2="${yAt(l).toFixed(1)}" stroke="${colr}" stroke-width="1"/>`;
      const yTop = yAt(Math.max(o, c));
      const bh = Math.max(1.2, yAt(Math.min(o, c)) - yTop);
      svg += `<rect x="${(x - bw / 2).toFixed(1)}" y="${yTop.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${up ? UP : "#F4F5F7"}" stroke="${colr}" stroke-width="1"/>`;
    }
  } else {
    const vs = seg.map((p) => p[1]);
    const pts = vs.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
    svg += `<polyline points="${pts}" fill="none" stroke="${vs[n - 1] >= vs[0] ? UP : DN}" stroke-width="2" stroke-linejoin="round"/>`;
  }

  MA_DEFS.forEach(([, colr], mi) => {
    const m = mas[mi];
    let pts = "";
    let started = false;
    for (let i = 0; i < n; i++) {
      const mv = m[i];
      if (mv == null) {
        continue;
      }
      pts += `${started ? " " : ""}${xAt(i).toFixed(1)},${yAt(mv).toFixed(1)}`;
      started = true;
    }
    if (started && pts.includes(" ")) {
      svg += `<polyline points="${pts}" fill="none" stroke="${colr}" stroke-width="1.4" opacity="0.9"/>`;
    }
  });

  if (hasVol) {
    const vmax = Math.max(...vols) || 1;
    const bw = Math.max(1.2, (plotW / n) * 0.66);
    svg += `<text x="${PAD.l}" y="${(VOLT - 3).toFixed(1)}" fill="#8A8F80" font-size="8.5" font-family="ui-monospace,monospace">出来高</text>`;
    for (let i = 0; i < n; i++) {
      if (!vols[i]) {
        continue;
      }
      const bh = Math.max(1, (vols[i] / vmax) * VOLH);
      const up = hasOHLC
        ? seg[i][1] >= (seg[i][3] ?? seg[i][1])
        : i === 0 || seg[i][1] >= seg[i - 1][1];
      svg += `<rect x="${(xAt(i) - bw / 2).toFixed(1)}" y="${(VOLT + VOLH - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${up ? UP : DN}" opacity="0.55"/>`;
    }
  }

  return svg;
}

export function StockPriceChart({ symbol }: { symbol: string }) {
  const [tf, setTf] = useState<ChartTimeframe>("D");

  const { svg, legend } = useMemo(() => {
    const all = stockChartRows(symbol, tf);
    const dispCount = tf === "D" ? 80 : 9999;
    const svgInner = buildChartSvg(all, dispCount);
    const closesAll = all.map((p) => p[1]);
    const startIdx = Math.max(0, all.length - dispCount);
    const mas = MA_DEFS.map(([nn]) => maSeries(closesAll, nn).slice(startIdx));
    const legendItems = MA_DEFS.map(([nn, colr], mi) => {
      const avail = mas[mi].some((v) => v != null);
      return { nn, colr: avail ? colr : "var(--color-faint)" };
    });
    return { svg: svgInner, legend: legendItems };
  }, [symbol, tf]);

  if (!svg) {
    return <p className="py-4 text-center text-[12px] text-ink-2">チャートデータがありません。</p>;
  }

  return (
    <div>
      <div className="mb-2 flex gap-1.5">
        {CHART_TFS.map(([label, id]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTf(id)}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
              tf === id
                ? "border-copper bg-copper-soft font-semibold text-copper"
                : "border-line bg-transparent text-ink-2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mb-1 flex flex-wrap gap-x-2.5 gap-y-0.5 font-mono text-[9.5px]">
        {legend.map(({ nn, colr }) => (
          <span key={nn} style={{ color: colr }}>
            ━{nn}MA
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full max-w-[420px] touch-none"
        role="img"
        aria-label="株価チャート"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG paths from trusted local data
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
