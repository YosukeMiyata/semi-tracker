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
          className="type-body-sm mt-0.5 mr-1 inline-block whitespace-nowrap rounded-full border border-line bg-card px-2.5 py-0.5 font-medium text-ink md:mr-1.5 md:px-3 md:py-1"
        >
          {stockName(code)}
        </span>
      ))}
    </>
  );
}

function StepRow({ step }: { step: SupplyStep }) {
  return (
    <div className="border-line border-b py-3 last:border-b-0 md:py-3.5">
      <div className="type-list-primary mb-2 font-bold">{step.name}</div>
      {step.equip?.length ? (
        <div className="mb-1.5 md:mb-2">
          <span className="type-mono-accent mr-2 font-bold">装置</span>
          <Chips codes={step.equip} />
        </div>
      ) : null}
      {step.material?.length ? (
        <div className="mb-1.5 md:mb-2">
          <span className="type-mono-accent mr-2 font-bold">材料</span>
          <Chips codes={step.material} />
        </div>
      ) : null}
      {step.stocks?.length ? (
        <div className="mb-1.5 md:mb-2">
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
              <div className="mx-auto h-4 w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--color-copper)_0_3px,transparent_3px_6px)] md:h-5" />
            ) : null}
            <details open={i === 0} className="mb-2 md:mb-3">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-card border border-line bg-card px-4 py-3 [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2 md:gap-3 md:px-5 md:py-4">
                <span className="type-badge rounded-md border border-copper/40 bg-copper-soft px-1.5 py-0.5 font-mono text-copper md:px-2 md:py-1">
                  {stage.num}
                </span>
                <span className="type-list-primary flex-1 font-bold">{stage.name}</span>
                <span className="type-body-sm">
                  今週 <b className={count > 0 ? "text-up" : "text-ink"}>{count}件</b>
                </span>
              </summary>
              <div className="mx-1 mt-[-8px] rounded-b-card border border-line border-t-0 bg-panel2 px-4 pt-4 pb-4 md:px-6 md:pt-5 md:pb-5">
                <p className="type-body-medium mb-3 md:mb-4">{stage.desc}</p>
                {stage.steps.map((step) => (
                  <StepRow key={step.name} step={step} />
                ))}
                <div className="type-body mt-4 rounded-[10px] border border-copper/30 border-dashed bg-card px-4 py-3 md:mt-5 md:px-5 md:py-4">
                  <div className="type-badge mb-1.5 text-copper tracking-[0.1em] md:mb-2">
                    今週の論点
                  </div>
                  <p className="text-ink">{stage.topic}</p>
                </div>
              </div>
            </details>
          </Fragment>
        );
      })}
      <p className="type-body-sm mt-4 md:mt-6">
        「今週
        n件」は直近7日のニュースのうち、関連銘柄がステージ構成銘柄と重なる件数です。ステージ・銘柄の編集は
        data/supplychain.json、論点は同ファイルの topic を更新してください。
      </p>
    </>
  );
}
