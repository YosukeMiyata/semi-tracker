import { Card, Placeholder, SectionTitle } from "~/components/section";

export function meta() {
  return [{ title: "ホーム — 半導体テーマトラッカー 2.0" }];
}

export default function Home() {
  return (
    <>
      <Card>
        <div className="text-[11px] text-ink-2 tracking-[0.14em]">今週のセンチメント</div>
        <div className="font-mono font-semibold text-[44px] leading-[1.05]">
          — <small className="font-medium text-[16px] text-ink-2">/ ±2.0</small>
        </div>
        <span className="mt-1.5 inline-block rounded-full bg-copper-soft px-2.5 py-0.5 font-bold text-[12px] text-copper">
          データ準備中
        </span>
        <div className="mt-2 border-line border-t border-dashed pt-2.5 text-[11px] text-ink-2">
          ダイ1つ=1テーマのウェハーマップ(v1の12マクロテーマ × ニュース感情スコアで着色)を
          ここに表示します。
        </div>
      </Card>

      <SectionTitle
        title="今週の注目 3本"
        note="ニュースを「どの銘柄に効くか」まで翻訳して届けます"
      />
      <Placeholder>
        data/news.json(手動運用)から感情スコア上位・注目のニュースを3本表示。影響の連鎖 +
        関連銘柄チップ付き。
      </Placeholder>

      <SectionTitle
        title="米国テーマ → 翌日の日本株"
        note="米国テーマが+2%超上昇した翌営業日の連動(陽性率+平均リターン、手法は明記)"
      />
      <Placeholder>
        v1 の linkage ロジック(トリガー +2% / 陽性率 / 平均リターン)を踏襲し、Top3 を表示。
      </Placeholder>
    </>
  );
}
