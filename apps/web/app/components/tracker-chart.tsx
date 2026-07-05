"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CHART_COLORS, fmtPct } from "~/lib/data";
import type { RankedTheme as TrackerRankedTheme } from "~/lib/tracker";
import { useIsDesktop } from "~/lib/use-media-query";

const W = 360;
const H = 208;
const PAD = { l: 38, r: 10, t: 8, b: 18 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

function resolveColor(key: string, fallback: string): string {
  return CHART_COLORS[key] ?? fallback;
}

function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const rawStep = span / count;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) ?? rawStep;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}

function ChartHoverTooltip({
  crosshairX,
  date,
  items,
  yAt,
  clipId,
}: {
  crosshairX: number;
  date: string;
  items: { name: string; value: number; color: string }[];
  yAt: (v: number) => number;
  clipId: string;
}) {
  const padX = 7;
  const padY = 6;
  const lineH = 13;
  const headerH = 12;
  const dotSize = 5;
  const dotGap = 2;
  const nameGap = 2;
  const fontDate = 7.5;
  const fontValue = 8;
  const fontName = 7.5;
  const charW = 8.5;
  const sortedItems = [...items].sort((a, b) => b.value - a.value);
  const longestName = sortedItems.reduce((max, item) => Math.max(max, item.name.length), 0);
  const valueColW = sortedItems.reduce(
    (max, item) => Math.max(max, fmtPct(item.value).length * 4.9),
    20,
  );
  const nameColW = Math.min(68, Math.max(36, longestName * charW));
  const boxW = padX + dotSize + dotGap + valueColW + nameGap + nameColW + padX;
  const boxH = padY * 2 + headerH + sortedItems.length * lineH;
  const anchorRight = crosshairX > W / 2;
  let tx = anchorRight ? crosshairX - boxW - 6 : crosshairX + 6;
  const ys = sortedItems.map((item) => yAt(item.value));
  const midY = ys.length > 0 ? (Math.min(...ys) + Math.max(...ys)) / 2 : PAD.t;
  let ty = midY - boxH / 2;
  ty = Math.max(PAD.t, Math.min(H - PAD.b - boxH, ty));
  tx = Math.max(PAD.l, Math.min(W - PAD.r - boxW, tx));

  const valueX = tx + padX + dotSize + dotGap;
  const nameX = valueX + valueColW + nameGap;

  const truncateName = (name: string) => {
    const maxChars = Math.max(2, Math.floor(nameColW / charW));
    return name.length > maxChars ? `${name.slice(0, maxChars - 1)}…` : name;
  };

  return (
    <g pointerEvents="none">
      <defs>
        <clipPath id={clipId}>
          <rect x={tx} y={ty} width={boxW} height={boxH} rx={5} />
        </clipPath>
      </defs>
      <rect
        x={tx}
        y={ty}
        width={boxW}
        height={boxH}
        rx={5}
        fill="var(--color-card)"
        stroke="var(--color-line)"
        strokeWidth={0.75}
      />
      <g clipPath={`url(#${clipId})`}>
        <text
          x={tx + padX}
          y={ty + padY + fontDate}
          fontSize={fontDate}
          className="fill-ink-2 font-mono"
        >
          {date}
        </text>
        {sortedItems.map((item, i) => {
          const rowY = ty + padY + headerH + i * lineH;
          const rowCenterY = rowY + lineH / 2;
          return (
            <g key={item.name}>
              <rect
                x={tx + padX}
                y={rowCenterY - dotSize / 2}
                width={dotSize}
                height={dotSize}
                rx={1}
                fill={item.color}
              />
              <text
                x={valueX}
                y={rowCenterY}
                fontSize={fontValue}
                dominantBaseline="middle"
                textAnchor="start"
                className="fill-ink font-mono font-semibold"
              >
                {fmtPct(item.value)}
              </text>
              <text
                x={nameX}
                y={rowCenterY}
                fontSize={fontName}
                dominantBaseline="middle"
                textAnchor="start"
                className="fill-ink-2"
              >
                {truncateName(item.name)}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}

export function TrackerChart({ themes }: { themes: TrackerRankedTheme[] }) {
  const isDesktop = useIsDesktop();
  const tooltipClipId = `chart-tip${useId().replace(/:/g, "")}`;
  const drawable = useMemo(() => themes.filter((t) => t.series.length >= 2), [themes]);

  const defaultSelected = useMemo(
    () =>
      new Set(
        drawable
          .slice()
          .sort((a, b) => (b.avg ?? -1e9) - (a.avg ?? -1e9))
          .slice(0, 3)
          .map((t) => t.key),
      ),
    [drawable],
  );
  const [selected, setSelected] = useState(defaultSelected);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    setSelected(defaultSelected);
    setHoverIdx(null);
  }, [defaultSelected]);

  const { dates, dateIndex, yMin, yMax } = useMemo(() => {
    const ref = drawable.reduce(
      (best, t) => (t.series.length > best.length ? t.series.map((r) => r[0]) : best),
      [] as string[],
    );
    const idx = new Map(ref.map((d, i) => [d, i]));
    let lo = 0;
    let hi = 0;
    for (const t of drawable) {
      for (const [, v] of t.series) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
    const padY = (hi - lo || 10) * 0.06;
    return { dates: ref, dateIndex: idx, yMin: lo - padY, yMax: hi + padY };
  }, [drawable]);

  if (drawable.length === 0) {
    return <p className="type-body-sm py-6 text-center">チャートデータがありません。</p>;
  }

  const xAt = (dateI: number) => PAD.l + (dateI / Math.max(dates.length - 1, 1)) * PLOT_W;
  const yAt = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * PLOT_H;
  const ticks = niceTicks(yMin, yMax);
  const activeStroke = isDesktop ? 1 : 2;
  const inactiveStroke = isDesktop ? 0.55 : 1.2;
  const dotRadius = isDesktop ? 2.5 : 3;

  const monthTicks: { x: number; label: string }[] = [];
  for (let i = 0; i < dates.length; i++) {
    if (i === 0 || dates[i].slice(5, 7) !== dates[i - 1].slice(5, 7)) {
      monthTicks.push({ x: xAt(i), label: `${Number(dates[i].slice(5, 7))}月` });
    }
  }

  const readoutIdx = hoverIdx ?? dates.length - 1;
  const readoutDate = dates[readoutIdx];
  const selectedThemes = drawable.filter((t) => selected.has(t.key));

  const endLabels = selectedThemes
    .map((t) => {
      const last = t.series[t.series.length - 1];
      return { key: t.key, v: last[1], y: yAt(last[1]) };
    })
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < endLabels.length; i++) {
    if (endLabels[i].y - endLabels[i - 1].y < 11) {
      endLabels[i].y = endLabels[i - 1].y + 11;
    }
  }

  const hoverTooltipItems = selectedThemes
    .map((t) => {
      const row = t.series.find(([d]) => d === dates[hoverIdx ?? -1]);
      if (!row) {
        return null;
      }
      return {
        name: t.name,
        value: row[1],
        color: resolveColor(t.key, t.color),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((x - PAD.l) / PLOT_W) * (dates.length - 1));
    setHoverIdx(Math.max(0, Math.min(dates.length - 1, i)));
  };

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const line = (t: TrackerRankedTheme, active: boolean) => {
    const color = resolveColor(t.key, t.color);
    const pts = t.series
      .map(([d, v]) => {
        const i = dateIndex.get(d);
        return i === undefined ? null : `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
    return (
      <polyline
        key={t.key}
        fill="none"
        stroke={color}
        strokeWidth={active ? activeStroke : inactiveStroke}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={active ? 1 : 0.16}
        points={pts}
      >
        <title>{`${t.name} ${fmtPct(t.avg)}`}</title>
      </polyline>
    );
  };

  const chartSvg = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full max-w-full touch-none aspect-[360/208]"
      role="img"
      aria-label="テーマ別累積騰落率チャート"
      onPointerMove={handlePointer}
      onPointerDown={handlePointer}
      onPointerLeave={() => setHoverIdx(null)}
    >
      {ticks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={yAt(v)}
            y2={yAt(v)}
            stroke={Math.abs(v) < 0.01 ? "var(--color-faint)" : "var(--color-line)"}
            strokeWidth={isDesktop ? 0.75 : 1}
            strokeDasharray={Math.abs(v) < 0.01 ? "3 3" : undefined}
          />
          <text
            x={PAD.l - 4}
            y={yAt(v) + 3}
            textAnchor="end"
            className="fill-ink-2 font-mono text-[8.5px] md:text-[10px]"
          >
            {v}%
          </text>
        </g>
      ))}
      {monthTicks.map((m) => (
        <text
          key={`${m.label}-${m.x}`}
          x={m.x}
          y={H - 5}
          textAnchor="middle"
          className="fill-ink-2 font-mono text-[8.5px] md:text-[10px]"
        >
          {m.label}
        </text>
      ))}
      {drawable.filter((t) => !selected.has(t.key)).map((t) => line(t, false))}
      {selectedThemes.map((t) => line(t, true))}
      {hoverIdx !== null ? (
        <line
          x1={xAt(hoverIdx)}
          x2={xAt(hoverIdx)}
          y1={PAD.t}
          y2={H - PAD.b}
          stroke="var(--color-faint)"
          strokeWidth={isDesktop ? 0.75 : 1}
          strokeDasharray="2 3"
        />
      ) : null}
      {selectedThemes.map((t) => {
        const row = t.series.find(([d]) => d === readoutDate);
        if (!row) {
          return null;
        }
        const i = dateIndex.get(readoutDate);
        if (i === undefined) {
          return null;
        }
        return (
          <circle
            key={t.key}
            cx={xAt(i)}
            cy={yAt(row[1])}
            r={dotRadius}
            fill={resolveColor(t.key, t.color)}
            stroke="var(--color-card)"
            strokeWidth={isDesktop ? 1 : 1.5}
          />
        );
      })}
      {hoverIdx !== null && hoverTooltipItems.length > 0 ? (
        <ChartHoverTooltip
          crosshairX={xAt(hoverIdx)}
          date={dates[hoverIdx]}
          items={hoverTooltipItems}
          yAt={yAt}
          clipId={tooltipClipId}
        />
      ) : null}
      {endLabels.map((l) => (
        <text
          key={l.key}
          x={W - PAD.r}
          y={l.y + 3}
          textAnchor="end"
          className="fill-ink font-mono font-semibold text-[9px] md:text-[10.5px]"
        >
          {fmtPct(l.v, 0)}
        </text>
      ))}
    </svg>
  );

  return (
    <div className="min-w-0 max-w-full">
      {chartSvg}

      <div className="type-meta mt-1.5 flex min-h-[18px] flex-wrap items-center gap-x-3 gap-y-0.5 md:mt-2">
        <span className="font-mono text-ink-2">{readoutDate}</span>
        {selectedThemes.map((t) => {
          const row = t.series.find(([d]) => d === readoutDate);
          return (
            <span key={t.key} className="inline-flex items-center gap-1">
              <i
                className="inline-block h-2 w-2 rounded-[2px] md:h-2.5 md:w-2.5"
                style={{ backgroundColor: resolveColor(t.key, t.color) }}
              />
              <span className="type-mono-value">{row ? fmtPct(row[1]) : "—"}</span>
            </span>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1 md:mt-3 md:gap-1.5">
        {drawable.map((t) => {
          const active = selected.has(t.key);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => toggle(t.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-1 md:px-3 md:py-1 type-meta md:text-[13px] lg:text-[14px] ${
                active
                  ? "border-ink-2 bg-card text-ink"
                  : "border-line bg-card text-ink-2 opacity-55"
              }`}
            >
              <i
                className="inline-block h-2 w-2 rounded-[2px] md:h-2.5 md:w-2.5"
                style={{ backgroundColor: resolveColor(t.key, t.color) }}
              />
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** @deprecated 凡例は TrackerChart 内に統合済み */
export function TrackerChartLegend({ themes: _themes }: { themes: TrackerRankedTheme[] }) {
  return (
    <p className="type-meta mt-1.5 md:mt-2">
      構成銘柄の単純平均。凡例をタップで表示切替、チャートをなぞると日付の値を表示します。
    </p>
  );
}
