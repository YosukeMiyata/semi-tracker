import { Placeholder, SectionTitle } from "~/components/section";

export function meta() {
  return [{ title: "ニュース — 半導体テーマトラッカー 2.0" }];
}

const FILTERS = ["すべて", "ポジティブ", "ネガティブ", "地政学"];

export default function News() {
  return (
    <>
      <SectionTitle
        title="ニュース感情分析"
        note="論調を−2〜+2でスコア化。投資判断ではなくニュースの温度計です"
      />
      <div className="mt-2.5 mb-3.5 flex flex-wrap gap-1.5">
        {FILTERS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`rounded-full border px-3 py-1.5 text-[12px] ${
              i === 0 ? "border-ink bg-ink text-card" : "border-line bg-card text-ink-2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <Placeholder>
        data/news.json の一覧をここに表示(感情スコアバッジ・影響の連鎖・関連銘柄チップ)。
        1件追記して commit すれば反映される構造にします。
      </Placeholder>

      <SectionTitle title="地政学タイムライン" note="規制イベントと影響を時系列で整理" />
      <Placeholder>data/timeline.json から規制・地政学イベントを時系列表示。</Placeholder>
    </>
  );
}
