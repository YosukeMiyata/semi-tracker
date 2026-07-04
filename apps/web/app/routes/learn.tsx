import { SectionTitle } from "~/components/section";
import { glossaryTerms } from "~/lib/news";

export function meta() {
  return [{ title: "学ぶ — 半導体テーマトラッカー" }];
}

export default function Learn() {
  return (
    <>
      <SectionTitle title="用語辞典" note="「なぜ株価に効くのか」まで解説する投資家向け辞典" />
      {glossaryTerms.map((term) => (
        <details key={term.en} className="mb-2">
          <summary className="flex cursor-pointer list-none items-baseline gap-2.5 rounded-[12px] border border-line bg-card px-4 py-3 [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2">
            <span className="font-mono text-[11px] text-copper">{term.en}</span>
            <span className="font-bold text-[14px]">{term.jp}</span>
          </summary>
          <div className="px-4 pt-3 pb-1.5 text-[13px] text-[#3C4552]">
            {term.body}
            <div className="mt-2 rounded-[10px] bg-copper-soft px-3 py-2 text-[12.5px]">
              <b className="text-copper">なぜ株価に効く?</b> {term.why}
            </div>
          </div>
        </details>
      ))}
      <p className="mt-3 text-[12px] text-ink-2">
        用語の追加は data/glossary.json を編集して commit すれば反映されます。
      </p>
    </>
  );
}
