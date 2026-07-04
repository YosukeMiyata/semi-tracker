import { weeklySentimentSeries } from "~/lib/news";

const W = 360;
const H = 130;
const PAD = { l: 28, r: 6, t: 10, b: 18 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const Y_MAX = 2; // スコアは -2〜+2 の固定ドメイン

export function SentimentChart({ weeks = 12 }: { weeks?: number }) {
  const series = weeklySentimentSeries(weeks);
  const slot = PLOT_W / series.length;
  const barW = slot * 0.55;
  const yAt = (v: number) => PAD.t + (1 - (v + Y_MAX) / (2 * Y_MAX)) * PLOT_H;
  const zeroY = yAt(0);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="週次センチメント推移チャート"
      >
        {[2, 1, 0, -1, -2].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke={v === 0 ? "#C9CED6" : "var(--color-line)"}
              strokeDasharray={v === 0 ? "3 3" : undefined}
            />
            <text
              x={PAD.l - 4}
              y={yAt(v) + 3}
              textAnchor="end"
              className="fill-ink-2 font-mono text-[8.5px]"
            >
              {v > 0 ? `+${v}` : v}
            </text>
          </g>
        ))}
        {series.map((wk, i) => {
          const cx = PAD.l + slot * i + slot / 2;
          const [, m, d] = wk.weekStart.split("-");
          const label = `${Number(m)}/${Number(d)}`;
          return (
            <g key={wk.weekStart}>
              {wk.avg !== null ? (
                <>
                  <rect
                    x={cx - barW / 2}
                    y={wk.avg >= 0 ? yAt(wk.avg) : zeroY}
                    width={barW}
                    height={Math.max(Math.abs(yAt(wk.avg) - zeroY), 1.5)}
                    rx={2}
                    fill={wk.avg >= 0 ? "var(--color-up)" : "var(--color-down)"}
                  >
                    <title>{`${label}週: 平均 ${wk.avg >= 0 ? "+" : "−"}${Math.abs(wk.avg).toFixed(1)}(${wk.count}本)`}</title>
                  </rect>
                  <text
                    x={cx}
                    y={wk.avg >= 0 ? yAt(wk.avg) - 3 : yAt(wk.avg) + 9}
                    textAnchor="middle"
                    className="fill-ink font-mono text-[8px]"
                  >
                    {wk.avg >= 0 ? "+" : "−"}
                    {Math.abs(wk.avg).toFixed(1)}
                  </text>
                </>
              ) : null}
              {i % 2 === (series.length - 1) % 2 ? (
                <text
                  x={cx}
                  y={H - 5}
                  textAnchor="middle"
                  className="fill-ink-2 font-mono text-[8px]"
                >
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-[10.5px] text-ink-2">
        週次平均(月曜起点、バー上は平均スコア)。ニュースが無い週は空欄。手動運用の蓄積とともに伸びていきます。
      </p>
    </div>
  );
}
