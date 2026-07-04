import { Fragment } from "react";
import { SectionTitle } from "~/components/section";
import { type SupplyStep, stageNewsCount, stages, stockName } from "~/lib/supplychain";

export function meta() {
  return [{ title: "マップ — 半導体テーマトラッカー" }];
}

function Chips({ codes }: { codes: string[] }) {
  return (
    <>
      {codes.map((code) => (
        <span
          key={code}
          className="mt-0.5 mr-1 inline-block whitespace-nowrap rounded-full border border-line bg-card px-2 py-0.5 font-medium text-[11.5px]"
        >
          {stockName(code)}
        </span>
      ))}
    </>
  );
}

function StepRow({ step }: { step: SupplyStep }) {
  return (
    <div className="border-line border-b py-2 last:border-b-0">
      <div className="mb-1 font-bold text-[12.5px]">{step.name}</div>
      {step.equip?.length ? (
        <div className="mb-0.5">
          <span className="mr-1.5 font-mono text-[10.5px] text-copper">装置</span>
          <Chips codes={step.equip} />
        </div>
      ) : null}
      {step.material?.length ? (
        <div className="mb-0.5">
          <span className="mr-1.5 font-mono text-[10.5px] text-copper">材料</span>
          <Chips codes={step.material} />
        </div>
      ) : null}
      {step.stocks?.length ? (
        <div className="mb-0.5">
          <Chips codes={step.stocks} />
        </div>
      ) : null}
    </div>
  );
}

export default function MapPage() {
  return (
    <>
      <SectionTitle
        title="サプライチェーンマップ"
        note="製造プロセス順に「装置|材料」の対比で銘柄を配置(v1 の工程マップを継承)。今週のニュース件数つき"
      />
      {stages.map((stage, i) => {
        const count = stageNewsCount(stage);
        return (
          <Fragment key={stage.id}>
            {i > 0 ? (
              <div className="mx-auto h-4 w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--color-copper)_0_3px,transparent_3px_6px)]" />
            ) : null}
            <details open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-card border border-line bg-card px-4 py-3 [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2">
                <span className="rounded-md border border-[#E0CDB9] bg-copper-soft px-1.5 py-0.5 font-mono text-[11px] text-copper">
                  {stage.num}
                </span>
                <span className="flex-1 font-bold text-[14px]">{stage.name}</span>
                <span className="text-[10.5px] text-ink-2">
                  今週 <b className={count > 0 ? "text-up" : ""}>{count}件</b>
                </span>
              </summary>
              <div className="mx-1 mt-[-8px] rounded-b-card border border-line border-t-0 bg-[#FBFBFC] px-3.5 pt-4 pb-3 text-[13px]">
                <p className="mb-2 text-[12.5px] text-[#3C4552]">{stage.desc}</p>
                {stage.steps.map((step) => (
                  <StepRow key={step.name} step={step} />
                ))}
                <div className="mt-2.5 rounded-[10px] border border-[#E0CDB9] border-dashed bg-[#FAF7F3] px-3 py-2.5 text-[12.5px]">
                  <div className="mb-1 font-bold text-[10.5px] text-copper tracking-[0.1em]">
                    今週の論点
                  </div>
                  {stage.topic}
                </div>
              </div>
            </details>
          </Fragment>
        );
      })}
      <p className="mt-3 text-[12px] text-ink-2">
        「今週
        n件」は直近7日のニュースのうち、関連銘柄がステージ構成銘柄と重なる件数です。ステージ・銘柄の編集は
        data/supplychain.json、論点は同ファイルの topic を更新してください。
      </p>
    </>
  );
}
