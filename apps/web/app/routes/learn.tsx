import { Link } from "react-router";
import { SectionTitle } from "~/components/section";
import { glossaryTerms, themeNames } from "~/lib/news";

export function meta() {
  return [{ title: "学ぶ — 半導体テーマトラッカー" }];
}

export default function Learn() {
  return (
    <>
      <SectionTitle title="用語辞典" note="「なぜ株価に効くのか」まで解説する投資家向け辞典" />
      {glossaryTerms.map((term) => (
        <details key={term.en} className="mb-2 md:mb-3">
          <summary className="flex cursor-pointer list-none items-baseline gap-2.5 rounded-[12px] border border-line bg-card px-4 py-3 [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2 md:gap-3 md:px-5 md:py-4">
            <span className="type-mono-accent shrink-0">{term.en}</span>
            <span className="type-list-primary font-bold">{term.jp}</span>
          </summary>
          <div className="type-body-sm px-4 pt-3 pb-2 md:px-5 md:pt-4 md:pb-3">
            {term.body}
            <div className="type-body-sm mt-3 rounded-[10px] bg-copper-soft px-3 py-2.5 md:mt-4 md:px-4 md:py-3">
              <b className="text-copper">なぜ株価に効く?</b> {term.why}
            </div>
            {term.tags && term.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 md:mt-4 md:gap-2">
                <span className="type-meta">関連テーマ:</span>
                {term.tags.map((tag) => (
                  <Link
                    key={tag}
                    to="/themes"
                    className="type-meta rounded-full border border-cyan/40 bg-cyan/10 px-2 py-0.5 text-cyan underline-offset-2 hover:underline md:px-2.5 md:py-1"
                  >
                    {themeNames.get(tag) ?? tag} ↗
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </details>
      ))}
      <p className="type-body-sm mt-4 md:mt-6">
        用語の追加は data/glossary.json を編集して commit すれば反映されます。
      </p>
    </>
  );
}
