"use client";

import { useState } from "react";
import { ChipGroup } from "~/components/chip-group";
import { fmtPct, pctColor } from "~/lib/data";
import { analyzeStock } from "~/lib/technical";
import processJson from "../../../../data/process.json";

interface ProcStock {
  code: string;
  name: string;
  market: "jp" | "us";
}

interface ProcGroup {
  label: string;
  stocks: ProcStock[];
}

interface ProcStep {
  stage: string;
  name: string;
  desc: string;
  icon: string;
  groups?: ProcGroup[];
  equip?: ProcStock[];
  material?: ProcStock[];
}

type ProcPeriod = "chg" | "ret5d" | "ret1m" | "ret3m";

const steps = (processJson as { steps: ProcStep[] }).steps;

const STAGE_COLORS: Record<string, string> = {
  design: "#8E7CC3",
  front: "#3FA7D6",
  back: "#E0A458",
  facility: "#5B9279",
  maker: "#C77DA0",
};

const STAGE_LABELS: Record<string, string> = {
  design: "設計",
  front: "前工程",
  back: "後工程",
  facility: "インフラ・部品",
  maker: "メーカー",
};

const PROC_PERIODS: { id: ProcPeriod; label: string }[] = [
  { id: "chg", label: "前日比" },
  { id: "ret5d", label: "5日" },
  { id: "ret1m", label: "1ヶ月" },
  { id: "ret3m", label: "3ヶ月" },
];

function procVal(symbol: string, period: ProcPeriod): number | null {
  const tech = analyzeStock(symbol);
  if (!tech) {
    return null;
  }
  if (period === "chg") {
    return tech.chgPct;
  }
  if (period === "ret5d") {
    return tech.ret5d;
  }
  if (period === "ret1m") {
    return tech.ret1m;
  }
  return tech.ret3m;
}

function StockChip({
  stock,
  period,
  onPick,
}: {
  stock: ProcStock;
  period: ProcPeriod;
  onPick: (code: string) => void;
}) {
  const val = procVal(stock.code, period);
  const mkClass = stock.market === "jp" ? "text-copper" : "text-us";
  return (
    <button
      type="button"
      onClick={() => onPick(stock.code)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1 text-left text-[11px] hover:bg-panel2"
    >
      <span className={`font-mono font-bold ${mkClass}`}>{stock.code}</span>
      <span className="max-w-[88px] truncate">{stock.name}</span>
      <span className={`font-mono text-[10.5px] ${pctColor(val)}`}>{fmtPct(val, 0)}</span>
    </button>
  );
}

function StockChips({
  stocks,
  period,
  onPick,
}: {
  stocks: ProcStock[];
  period: ProcPeriod;
  onPick: (code: string) => void;
}) {
  if (stocks.length === 0) {
    return <span className="text-[11px] text-ink-2">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {stocks.map((s) => (
        <StockChip key={s.code} stock={s} period={period} onPick={onPick} />
      ))}
    </div>
  );
}

function ProcStepBlock({
  step,
  showArrow,
  period,
  onPickStock,
}: {
  step: ProcStep;
  showArrow: boolean;
  period: ProcPeriod;
  onPickStock: (code: string) => void;
}) {
  const color = STAGE_COLORS[step.stage] ?? "#888";
  const hasMaterial = (step.material?.length ?? 0) > 0;

  return (
    <>
      {showArrow ? <div className="py-0.5 text-center text-[12px] text-ink-2">↓</div> : null}
      <div
        className="overflow-hidden rounded-card border border-line bg-card"
        style={{ borderLeftWidth: 3, borderLeftColor: color }}
      >
        <div className="flex items-start gap-2 px-3 py-2.5">
          <span className="text-[18px]">{step.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[13px]">{step.name}</div>
            <div className="text-[11px] text-ink-2">{step.desc}</div>
          </div>
        </div>

        {step.groups ? (
          <div className="space-y-2 border-line border-t px-3 pt-2 pb-3">
            {step.groups.map((g) => (
              <div key={g.label}>
                <div className="mb-1 font-mono text-[10.5px] text-copper">{g.label}</div>
                <StockChips stocks={g.stocks} period={period} onPick={onPickStock} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-2 border-line border-t px-3 pt-2 pb-3 ${hasMaterial ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <div>
              <div className="mb-1 font-mono text-[10.5px]" style={{ color }}>
                装置
              </div>
              <StockChips stocks={step.equip ?? []} period={period} onPick={onPickStock} />
            </div>
            {hasMaterial ? (
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-2">材料</div>
                <StockChips stocks={step.material ?? []} period={period} onPick={onPickStock} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

export function ProcView({ onPickStock }: { onPickStock: (symbol: string) => void }) {
  const [period, setPeriod] = useState<ProcPeriod>("chg");

  return (
    <>
      <p className="text-[12px] text-ink-2 leading-[1.55]">
        製造プロセス順に<b>装置｜材料</b>の対比で銘柄を配置(v1
        工程マップ)。期間チップで騰落率表示を切替、銘柄タップで詳細。
      </p>

      <ChipGroup label="表示" options={PROC_PERIODS} value={period} onChange={setPeriod} />

      <div className="space-y-2">
        {steps.map((step, i) => {
          const showStageHeader = i === 0 || steps[i - 1].stage !== step.stage;
          const showArrow = i > 0 && !showStageHeader;
          return (
            <div key={`${step.stage}-${step.name}`}>
              {showStageHeader ? (
                <div
                  className="pt-1 font-bold text-[12.5px]"
                  style={{ color: STAGE_COLORS[step.stage] ?? "#888" }}
                >
                  ■ {STAGE_LABELS[step.stage] ?? step.stage}
                </div>
              ) : null}
              <ProcStepBlock
                step={step}
                showArrow={showArrow}
                period={period}
                onPickStock={onPickStock}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
