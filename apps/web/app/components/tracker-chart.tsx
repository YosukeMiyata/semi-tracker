import { useMemo } from "react";
import { CHART_COLORS, fmtPct } from "~/lib/data";
import type { RankedTheme as TrackerRankedTheme } from "~/lib/tracker";

const W = 360;
const H = 200;
const PAD = { l: 34, r: 18, t: 10, b: 16 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

function resolveColor(key: string, fallback: string): string {
  return CHART_COLORS[key] ?? fallback;
}

export function TrackerChart({ themes }: { themes: TrackerRankedTheme[] }) {
  const drawable = useMemo(() => themes.filter((t) => t.series.length >= 2), [themes]);

  const { yMin, yMax } = useMemo(() => {
    const vals = drawable.flatMap((t) => t.series.map(([, v]) => v));
    if (!vals.length) {
      return { yMin: -5, yMax: 5 };
    }
    const lo = Math.min(...vals, 0);
    const hi = Math.max(...vals, 0);
    const pad = (hi - lo || 10) * 0.08;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [drawable]);

  if (drawable.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-ink-2">チャートデータがありません。</p>
    );
  }

  const n = Math.max(...drawable.map((t) => t.series.length));
  const xAt = (i: number) => PAD.l + (i / Math.max(n - 1, 1)) * PLOT_W;
  const yAt = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * PLOT_H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-none"
      role="img"
      aria-label="テーマ別累積騰落率チャート"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((g) => {
        const v = yMin + (yMax - yMin) * (1 - g);
        return (
          <g key={g}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke={Math.abs(v) < 0.01 ? "#C9CED6" : "var(--color-line)"}
              strokeDasharray={Math.abs(v) < 0.01 ? "3 3" : undefined}
            />
            <text
              x={PAD.l - 4}
              y={yAt(v) + 3}
              textAnchor="end"
              className="fill-ink-2 font-mono text-[8px]"
            >
              {v.toFixed(0)}%
            </text>
          </g>
        );
      })}
      {drawable.map((t, rank) => {
        const offset = t.series.length - n;
        const pts = t.series
          .map(([, v], i) => `${xAt(i + offset).toFixed(1)},${yAt(v).toFixed(1)}`)
          .join(" ");
        const last = t.series[t.series.length - 1];
        const cx = xAt(t.series.length - 1);
        const cy = yAt(last[1]);
        const color = resolveColor(t.key, t.color);
        return (
          <g key={t.key}>
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              opacity={0.92}
            />
            <rect
              x={cx - 6}
              y={cy - 6}
              width={12}
              height={12}
              rx={2}
              fill={color}
              stroke="var(--color-card)"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy + 3.5}
              textAnchor="middle"
              className="fill-card font-mono font-bold text-[8px]"
            >
              {rank + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function TrackerChartLegend({ themes }: { themes: TrackerRankedTheme[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
      <span>
        <i className="mr-1 inline-block h-2 w-2 rounded-full bg-up align-[-1px]" />
        上昇
      </span>
      <span>
        <i className="mr-1 inline-block h-2 w-2 rounded-full bg-down align-[-1px]" />
        下落
      </span>
      {themes.slice(0, 3).map((t) => (
        <span key={t.key} className="inline-flex items-center gap-1 font-mono">
          <i
            className="inline-block h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: resolveColor(t.key, t.color) }}
          />
          {fmtPct(t.avg, 0)}
        </span>
      ))}
    </div>
  );
}
