"use client";

import { useState } from "react";
import { fmtPct, pctColor } from "~/lib/data";
import { stockChgPct } from "~/lib/tracker";
import flowJson from "../../../../data/flow.json";

interface FlowItem {
  code: string;
  name: string;
  market: "jp" | "us";
}

interface FlowRole {
  label: string;
  items: FlowItem[];
}

interface FlowStep {
  name: string;
  icon: string;
  desc: string;
  roles: FlowRole[];
  visual: string | null;
}

interface FlowStage {
  key: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  visual: string | null;
  steps: FlowStep[];
}

const stages = (flowJson as { stages: FlowStage[] }).stages;

function StageVisual({ kind }: { kind: string | null }) {
  if (kind === "loop") {
    return (
      <div className="mx-3 mb-3 rounded-[10px] border border-line border-dashed bg-[#FBFBFC] px-3 py-2.5 text-center text-[12px] text-ink-2 leading-[1.6]">
        🔄 洗浄→成膜→露光→エッチング→CMP を何層も繰り返して回路ビルを建てる
      </div>
    );
  }
  if (kind === "package3") {
    return (
      <div className="mx-3 mb-3 space-y-1 text-[11.5px]">
        <div className="rounded-md border border-[#9D7CF0]/40 bg-[#9D7CF0]/15 px-2 py-1.5 text-center font-bold">
          GPU / HBM / CPO — チップ&光の出口
        </div>
        <div className="rounded-md border border-copper/30 bg-copper-soft px-2 py-1.5 text-center font-bold">
          ◧ インターポーザー(Si / ガラス) — 歪まない中間層
        </div>
        <div className="rounded-md border border-down/30 bg-down-soft px-2 py-1.5 text-center font-bold">
          ▦ パッケージ基板(ABF/樹脂) — 骨格・密着
        </div>
        <div className="rounded-md border border-[#3E9B62]/30 bg-[#EAF5EE] px-2 py-1.5 text-center font-bold">
          ▩ マザーボード(PCB) — 大地
        </div>
      </div>
    );
  }
  if (kind === "test") {
    return (
      <div className="mx-3 mb-3 rounded-[10px] border border-line bg-[#FBFBFC] px-3 py-2.5 text-center text-[12px]">
        ✅ 完成チップを全数検査・テストして出荷
      </div>
    );
  }
  if (kind === "cpo") {
    return (
      <div className="mx-3 mb-3 space-y-1 text-[11.5px]">
        <div className="rounded-md border border-[#9D7CF0]/40 bg-[#9D7CF0]/15 px-2 py-1.5 text-center">
          GPU / HBM / 💠光エンジン
        </div>
        <div className="rounded-md border border-copper/30 bg-copper-soft px-2 py-1.5 text-center">
          シリコンフォトニクス層(光配線)
        </div>
        <div className="rounded-md border border-down/30 bg-down-soft px-2 py-1.5 text-center">
          🧵 光ファイバーで外部へ → 海底ケーブルで大陸間へ
        </div>
      </div>
    );
  }
  if (kind === "iceberg") {
    return (
      <div className="mx-3 mb-3 rounded-[10px] border-2 border-ink bg-[#0B0E15] px-3 py-3 text-[11.5px] text-card leading-[1.65]">
        <div className="mb-2 border border-card/30 px-2 py-1.5 text-[12px]">
          <span className="text-up">♥</span>{" "}
          海面の上=GPUサーバー。海面下=ストレージ・ネットワーク・電源・冷却の「見えない土台」
        </div>
        <div className="space-y-1 text-center font-bold">
          <div className="bg-[#EAF6FF]/90 py-1 text-ink">⛰️ GPUサーバー(海面)</div>
          <div className="bg-[#7FD8E8]/90 py-1 text-ink">📚 ストレージ層</div>
          <div className="bg-[#4FB3D9]/90 py-1 text-card">🕸️ ネットワーク層</div>
          <div className="bg-[#2E86C1]/90 py-1 text-card">⚡ 電源・配電層</div>
          <div className="bg-[#1B4F8A] py-1 text-card">❄️ 冷却層(氷山の底)</div>
        </div>
      </div>
    );
  }
  return null;
}

function StockChip({ item, onPick }: { item: FlowItem; onPick: (code: string) => void }) {
  const chg = stockChgPct(item.code);
  return (
    <button
      type="button"
      onClick={() => onPick(item.code)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1 text-[11px] hover:bg-[#FBFBFC]"
    >
      <span
        className={`font-mono font-bold ${item.market === "jp" ? "text-copper" : "text-[#7A52E0]"}`}
      >
        {item.code}
      </span>
      <span className="max-w-[88px] truncate">{item.name}</span>
      <span className={`font-mono text-[10.5px] ${pctColor(chg)}`}>{fmtPct(chg, 0)}</span>
    </button>
  );
}

function FlowStepBlock({
  step,
  stepKey,
  open,
  onToggle,
  onPickStock,
}: {
  step: FlowStep;
  stepKey: string;
  open: boolean;
  onToggle: (key: string) => void;
  onPickStock: (code: string) => void;
}) {
  const total = step.roles.reduce((a, r) => a + r.items.length, 0);
  return (
    <div
      className={`rounded-[10px] border border-line bg-[#FBFBFC] ${open ? "border-ink-2/40" : ""}`}
    >
      <button
        type="button"
        onClick={() => onToggle(stepKey)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <span className="text-[18px]">{step.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-[13px]">{step.name}</span>
          <span className="block text-[11px] text-ink-2">{step.desc}</span>
        </span>
        <span className="shrink-0 text-[11px] text-ink-2">
          {total}銘柄 {open ? "▲" : "▼"}
        </span>
      </button>
      {open ? (
        <div className="space-y-2 border-line border-t px-3 pt-2 pb-3">
          {step.roles.map((role) => (
            <div key={role.label}>
              <div className="mb-1 font-mono text-[10.5px] text-copper">{role.label}</div>
              <div className="flex flex-wrap gap-1">
                {role.items.map((item) => (
                  <StockChip key={item.code} item={item} onPick={onPickStock} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function FlowView({ onPickStock }: { onPickStock: (symbol: string) => void }) {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <p className="text-[12px] text-ink-2 leading-[1.55]">
        半導体づくりを<b>5ステージ</b>
        で図解。①前工程→②中工程・先端パッケージング→③後工程→④光電融合→⑤データセンター/インフラ(氷山)。
        各工程をタップで銘柄が展開します。
      </p>

      <div className="space-y-2">
        {stages.map((stage, si) => (
          <div key={stage.key}>
            <div
              className="overflow-hidden rounded-card border-2 bg-card"
              style={{ borderColor: stage.color }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ backgroundColor: `${stage.color}22` }}
              >
                <span className="text-[22px]">{stage.icon}</span>
                <span className="font-bold text-[14px]" style={{ color: stage.color }}>
                  {stage.name}
                </span>
              </div>
              <p className="px-3 py-2 text-[12px] text-ink-2 leading-[1.6]">{stage.desc}</p>
              <StageVisual kind={stage.visual} />
              <div className="space-y-1.5 px-3 pb-3">
                {stage.steps.map((step, i) => {
                  const key = `${stage.key}_${i}`;
                  return (
                    <FlowStepBlock
                      key={key}
                      step={step}
                      stepKey={key}
                      open={!!openSteps[key]}
                      onToggle={toggle}
                      onPickStock={onPickStock}
                    />
                  );
                })}
              </div>
            </div>
            {si < stages.length - 1 ? (
              <div className="py-1 text-center text-[12px] text-ink-2">▼</div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
