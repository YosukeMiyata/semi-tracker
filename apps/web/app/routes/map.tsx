import { Card, SectionTitle } from "~/components/section";

export function meta() {
  return [{ title: "マップ — 半導体テーマトラッカー 2.0" }];
}

const STAGES = [
  { num: "STAGE 1", name: "前工程(ウェハー・露光・成膜)" },
  { num: "STAGE 2", name: "先端パッケージング(CoWoS等)" },
  { num: "STAGE 3", name: "後工程(組立・テスト)" },
  { num: "STAGE 4", name: "光電融合(シリコンフォトニクス)" },
];

export default function MapPage() {
  return (
    <>
      <SectionTitle
        title="サプライチェーンマップ"
        note="製造プロセス順に銘柄を配置(v1 の process_map を刷新)。今週のニュース件数つき"
      />
      {STAGES.map((stage, i) => (
        <div key={stage.num}>
          {i > 0 ? (
            <div className="mx-auto h-4 w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--color-copper)_0_3px,transparent_3px_6px)]" />
          ) : null}
          <Card className="mb-0 flex items-center gap-2.5">
            <span className="rounded-md border border-copper-soft bg-copper-soft px-1.5 py-0.5 font-mono text-[11px] text-copper">
              {stage.num}
            </span>
            <span className="flex-1 font-bold text-[14px]">{stage.name}</span>
            <span className="text-[10.5px] text-ink-2">準備中</span>
          </Card>
        </div>
      ))}
      <p className="mt-3 text-[12px] text-ink-2">
        各ステージの構成銘柄は pipeline/themes.py(v1 の銘柄マスタを踏襲)から生成します。
      </p>
    </>
  );
}
