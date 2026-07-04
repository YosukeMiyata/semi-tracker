"use client";

import { useState } from "react";
import { ChipGroup } from "~/components/chip-group";
import { StockListGroupLabel, StockThemeListRow } from "~/components/stock-list-row";
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

function StockList({
  stocks,
  period,
  onPick,
}: {
  stocks: ProcStock[];
  period: ProcPeriod;
  onPick: (code: string) => void;
}) {
  if (stocks.length === 0) {
    return <span className="text-[12px] text-ink-2">—</span>;
  }
  return (
    <>
      {stocks.map((s) => (
        <StockThemeListRow
          key={s.code}
          symbol={s.code}
          name={s.name}
          market={s.market}
          pct={procVal(s.code, period)}
          onClick={() => onPick(s.code)}
        />
      ))}
    </>
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
      <div className="border-line border-t border-l-[3px]" style={{ borderLeftColor: color }}>
        <div className="flex items-start gap-2 py-3">
          <span className="text-[18px]">{step.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[14px]">{step.name}</div>
            <div className="text-[12px] text-ink-2">{step.desc}</div>
          </div>
        </div>

        {step.groups ? (
          <div className="border-line border-t pb-2 pt-1">
            {step.groups.map((g) => (
              <div key={g.label} className="mb-2 last:mb-0">
                <StockListGroupLabel>{g.label}</StockListGroupLabel>
                <StockList stocks={g.stocks} period={period} onPick={onPickStock} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-3 border-line border-t pb-2 pt-1 ${hasMaterial ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
          >
            <div>
              <StockListGroupLabel>
                <span style={{ color }}>装置</span>
              </StockListGroupLabel>
              <StockList stocks={step.equip ?? []} period={period} onPick={onPickStock} />
            </div>
            {hasMaterial ? (
              <div>
                <StockListGroupLabel>材料</StockListGroupLabel>
                <StockList stocks={step.material ?? []} period={period} onPick={onPickStock} />
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
                  className="border-line border-t pt-3 font-bold text-[13.5px]"
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
