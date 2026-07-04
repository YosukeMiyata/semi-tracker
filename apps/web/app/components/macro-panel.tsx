import { Card, SectionTitle } from "~/components/section";
import { fmtPct, pctColor } from "~/lib/data";
import { macro, monthLabel, wstsRecent } from "~/lib/macro";

const BAR_W = 28;
const CHART_H = 72;
const PAD = { l: 4, r: 4, t: 8, b: 22 };

export function MacroPanel() {
  const points = wstsRecent(6);
  const yoys = points.map((p) => p.yoy_pct);
  const yMin = Math.min(...yoys, 0);
  const yMax = Math.max(...yoys, 1);
  const yRange = yMax - yMin || 1;
  const plotW = points.length * BAR_W;
  const W = PAD.l + plotW + PAD.r;
  const plotH = CHART_H - PAD.t - PAD.b;
  const yAt = (v: number) => PAD.t + (1 - (v - yMin) / yRange) * plotH;
  const zeroY = yAt(Math.max(0, yMin));

  return (
    <>
      <SectionTitle title="マクロ指標" note={`WSTS月次(手動) · 更新 ${macro.last_updated}`} />
      <Card>
        <div className="mb-2 font-bold text-[13px]">{macro.wsts.label}</div>
        <svg
          viewBox={`0 0 ${W} ${CHART_H}`}
          className="mb-2 w-full max-w-[360px]"
          role="img"
          aria-label="WSTS月次前年比推移"
        >
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={zeroY}
            y2={zeroY}
            stroke="var(--color-faint)"
            strokeDasharray="3 3"
          />
          {points.map((p, i) => {
            const cx = PAD.l + BAR_W * i + BAR_W / 2;
            const barW = BAR_W * 0.55;
            const y = yAt(p.yoy_pct);
            const h = Math.max(Math.abs(y - zeroY), 1.5);
            return (
              <g key={p.month}>
                <rect
                  x={cx - barW / 2}
                  y={p.yoy_pct >= 0 ? y : zeroY}
                  width={barW}
                  height={h}
                  rx={2}
                  fill={p.yoy_pct >= 0 ? "var(--color-up)" : "var(--color-down)"}
                >
                  <title>{`${p.month}: ${p.value}${macro.wsts.unit} / 前年比 ${p.yoy_pct}%`}</title>
                </rect>
                <text
                  x={cx}
                  y={CHART_H - 6}
                  textAnchor="middle"
                  className="fill-ink-2 font-mono text-[8px]"
                >
                  {monthLabel(p.month)}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
          {points.map((p) => (
            <span key={p.month} className="text-ink-2">
              {monthLabel(p.month)} <b className={pctColor(p.yoy_pct)}>{fmtPct(p.yoy_pct, 1)}</b>
              <small className="ml-0.5 text-faint">({p.value}B$)</small>
            </span>
          ))}
        </div>
        <div className="rounded-[10px] border border-copper/30 border-dashed bg-panel2 px-3 py-2.5 text-[12.5px]">
          <div className="mb-1 font-bold text-[10.5px] text-copper tracking-[0.1em]">
            サイクル位置づけ
          </div>
          {macro.cycle_note}
        </div>
        {macro.source_url ? (
          <a
            href={macro.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[11px] text-copper underline"
          >
            出典: WSTS ↗
          </a>
        ) : null}

        {macro.capex ? (
          <div className="mt-4 border-line border-t pt-4">
            <div className="mb-2 flex flex-wrap items-baseline gap-2">
              <span className="font-bold text-[13px]">{macro.capex.label}</span>
              <span className="font-mono text-[10.5px] text-ink-2">
                {macro.capex.as_of} · {macro.capex.unit}
              </span>
            </div>
            <div className="space-y-2">
              {macro.capex.items.map((c) => (
                <div
                  key={c.company}
                  className="rounded-[10px] border border-line bg-panel2 px-3 py-2 text-[12.5px]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold">{c.company}</span>
                    <span className="font-mono text-[12px]">
                      <b className={pctColor(c.yoy_pct)}>{fmtPct(c.yoy_pct, 0)}</b>
                      <span className="ml-1.5 text-ink">{c.value}B$</span>
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-ink-2">{c.note}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}
