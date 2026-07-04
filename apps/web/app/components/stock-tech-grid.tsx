import type { ReactNode } from "react";
import { fmtPct, pctColor } from "~/lib/data";
import type { StockTechnical } from "~/lib/technical";
import { stockHints } from "~/lib/technical";

function devColor(v: number | null, low: number, high: number): string {
  if (v === null) {
    return "text-ink";
  }
  if (v <= low) {
    return "text-up";
  }
  if (v >= high) {
    return "text-down";
  }
  return "text-ink";
}

function rsiColor(v: number | null): string {
  if (v === null) {
    return "text-ink";
  }
  if (v <= 35) {
    return "text-up";
  }
  if (v >= 70) {
    return "text-down";
  }
  return "text-ink";
}

function TechCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-[#FBFBFC] px-2 py-1.5">
      <div className="text-[10px] text-ink-2">{label}</div>
      <div className="mt-0.5 font-mono text-[12px]">{children}</div>
    </div>
  );
}

export function StockTechGrid({ tech }: { tech: StockTechnical }) {
  const hints = stockHints(tech);
  const poLabel = tech.po ? "5>25>75 ✅強気PO" : tech.poBear ? "5<25<75 弱気" : "バラバラ";
  const poClass = tech.po ? "text-up" : tech.poBear ? "text-down" : "text-ink-2";
  const bbWalkLabel =
    tech.bbWalk === "up" ? "+2σ 上昇中 🔥" : tech.bbWalk === "down" ? "-2σ 下落中" : "なし";
  const bbWalkClass =
    tech.bbWalk === "up" ? "text-up" : tech.bbWalk === "down" ? "text-down" : "text-ink-2";
  const streakLabel =
    tech.streak > 0 ? `+${tech.streak}日` : tech.streak < 0 ? `${tech.streak}日` : "—";
  const streakClass = tech.streak > 0 ? "text-up" : tech.streak < 0 ? "text-down" : "text-ink";

  return (
    <div className="mb-4 rounded-xl border border-line bg-card p-3">
      <div className="mb-2 font-bold text-[12px] text-ink-2">📅 スイング目線(中期・数日〜数週)</div>
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <TechCell label="25日線乖離">
          <span className={devColor(tech.dev25, -5, 8)}>{fmtPct(tech.dev25)}</span>
        </TechCell>
        <TechCell label="1ヶ月騰落">
          <span className={pctColor(tech.ret1m)}>{fmtPct(tech.ret1m)}</span>
        </TechCell>
        <TechCell label="RSI(14)">
          <span className={rsiColor(tech.rsi)}>{tech.rsi ?? "—"}</span>
        </TechCell>
        <TechCell label="52週位置">
          <span>{tech.posPct !== null ? `${tech.posPct}%` : "—"}</span>
        </TechCell>
        <TechCell label="52週高値">
          <span>{tech.hi52 !== null ? tech.hi52.toLocaleString() : "—"}</span>
        </TechCell>
        <TechCell label="52週安値">
          <span>{tech.lo52 !== null ? tech.lo52.toLocaleString() : "—"}</span>
        </TechCell>
        <TechCell label="移動平均の並び">
          <span className={`text-[11px] ${poClass}`}>{poLabel}</span>
        </TechCell>
      </div>

      {tech.pullback ? (
        <div className="mb-2 rounded-lg border border-up/25 bg-up-soft/50 px-2.5 py-1.5 text-[11px] text-up">
          🎯 {tech.pullback}(上昇トレンド中の買い場候補)
        </div>
      ) : null}

      <div className="mb-2 mt-3 font-bold text-[12px] text-ink-2">
        ⚡ デイトレ目線(超短期・当日〜数日)
      </div>
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <TechCell label="5日線乖離">
          <span className={devColor(tech.dev5, -4, 5)}>{fmtPct(tech.dev5)}</span>
        </TechCell>
        <TechCell label="3日騰落">
          <span className={pctColor(tech.ret3d)}>{fmtPct(tech.ret3d)}</span>
        </TechCell>
        <TechCell label="出来高率">
          <span className={tech.volRatio !== null && tech.volRatio >= 2 ? "text-up" : "text-ink"}>
            {tech.volRatio !== null ? `${tech.volRatio.toFixed(1)}×` : "—"}
          </span>
        </TechCell>
        <TechCell label="連続">
          <span className={streakClass}>{streakLabel}</span>
        </TechCell>
        <TechCell label="BB %B(2σ位置)">
          <span
            className={
              tech.bbPctB !== null && tech.bbPctB >= 0.9
                ? "text-up"
                : tech.bbPctB !== null && tech.bbPctB <= 0.1
                  ? "text-down"
                  : "text-ink"
            }
          >
            {tech.bbPctB !== null ? `${Math.round(tech.bbPctB * 100)}%` : "—"}
          </span>
        </TechCell>
        <TechCell label="バンドウォーク">
          <span className={`text-[11px] ${bbWalkClass}`}>{bbWalkLabel}</span>
        </TechCell>
      </div>

      {tech.daytrade ? (
        <div className="mb-2 rounded-lg border border-up/25 bg-up-soft/40 px-2.5 py-1.5 text-[11px] text-up">
          ⚡ {tech.daytrade}
        </div>
      ) : null}

      {hints.length > 0 ? (
        <div className="rounded-lg border border-line bg-[#FBFBFC] px-2.5 py-2 text-[11px] text-ink-2 leading-[1.65]">
          {hints.map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
