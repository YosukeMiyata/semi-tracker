"use client";

import { useState } from "react";
import { FlowStageVisual } from "~/components/flow-visuals";
import { fmtPct, pctColor } from "~/lib/data";
import { stockChgPct } from "~/lib/tracker";
import flowJson from "../../../../data/flow.json";
import "../flow-v1.css";

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

function FlowChip({ item, onPick }: { item: FlowItem; onPick: (code: string) => void }) {
  const chg = stockChgPct(item.code);
  const mkCol = item.market === "jp" ? "var(--color-copper)" : "var(--color-us)";

  return (
    <button
      type="button"
      className="fchip"
      onClick={(e) => {
        e.stopPropagation();
        onPick(item.code);
      }}
    >
      <span className="font-mono font-bold" style={{ color: mkCol }}>
        {item.code}
      </span>
      <span className="fchip-nm">{item.name}</span>
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
    <div className={`fstep ${open ? "open" : ""}`}>
      <button type="button" className="fstep-h" onClick={() => onToggle(stepKey)}>
        <span className="fstep-icon">{step.icon}</span>
        <span className="fstep-main">
          <span className="fstep-name">{step.name}</span>
          <span className="fstep-desc">{step.desc}</span>
        </span>
        <span className="fstep-cnt">
          {total}銘柄 {open ? "▲" : "▼"}
        </span>
      </button>
      {open ? (
        <div className="fstep-body">
          {step.roles.map((role) => (
            <div key={role.label} className="frole">
              <span className="frole-label">{role.label}</span>
              <div className="fchips">
                {role.items.map((item) => (
                  <FlowChip key={item.code} item={item} onPick={onPickStock} />
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
  const [flowOpen, setFlowOpen] = useState<Record<string, boolean>>({});

  const toggleFlowStep = (key: string) => {
    setFlowOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flow-v1">
      <div className="flow-intro">
        半導体づくりを<b>5ステージ</b>
        で図解。①前工程→②中工程・先端パッケージング→③後工程→④光電融合→⑤データセンター/インフラ(氷山)。
        <br />
        <span>
          各工程をタップで銘柄が展開。銘柄タップで詳細へ。⑤は氷山の見えない土台=電源・冷却・超純水・ネットワークまで一望。
        </span>
      </div>

      <div>
        {stages.map((stage, si) => (
          <div key={stage.key}>
            <div className="fstage" style={{ borderColor: stage.color }}>
              <div className="fstage-h" style={{ background: `${stage.color}22` }}>
                <span className="fstage-icon">{stage.icon}</span>
                <span className="fstage-name" style={{ color: stage.color }}>
                  {stage.name}
                </span>
              </div>
              <div className="fstage-desc">{stage.desc}</div>
              <FlowStageVisual kind={stage.visual} />
              <div className="fsteps">
                {stage.steps.map((step, stepIdx) => {
                  const key = `${stage.key}_${stepIdx}`;
                  return (
                    <FlowStepBlock
                      key={key}
                      step={step}
                      stepKey={key}
                      open={!!flowOpen[key]}
                      onToggle={toggleFlowStep}
                      onPickStock={onPickStock}
                    />
                  );
                })}
              </div>
            </div>
            {si < stages.length - 1 ? <div className="farrow">▼</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
