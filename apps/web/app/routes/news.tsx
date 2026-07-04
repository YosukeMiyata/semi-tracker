import { useState } from "react";
import { NewsCard } from "~/components/news-card";
import { Card, SectionTitle } from "~/components/section";
import { newsItems, timelineItems } from "~/lib/news";

export function meta() {
  return [{ title: "ニュース — 半導体テーマトラッカー 2.0" }];
}

type Filter = "all" | "pos" | "neg" | "geo";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "pos", label: "ポジティブ" },
  { key: "neg", label: "ネガティブ" },
  { key: "geo", label: "地政学" },
];

const TL_DOT = {
  pos: "border-up",
  neg: "border-down",
  neu: "border-neutral",
} as const;

export default function News() {
  const [filter, setFilter] = useState<Filter>("all");
  const items = newsItems.filter((n) => {
    if (filter === "pos") {
      return n.sentiment > 0;
    }
    if (filter === "neg") {
      return n.sentiment < 0;
    }
    if (filter === "geo") {
      return n.geo;
    }
    return true;
  });

  return (
    <>
      <SectionTitle
        title="ニュース感情分析"
        note="論調を−2〜+2でスコア化。投資判断ではなくニュースの温度計です"
      />
      <div className="mt-2.5 mb-3.5 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-[12px] focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2 ${
              filter === f.key ? "border-ink bg-ink text-card" : "border-line bg-card text-ink-2"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {items.length > 0 ? (
        items.map((item) => <NewsCard key={item.id} item={item} />)
      ) : (
        <Card className="text-[12.5px] text-ink-2">該当するニュースがありません。</Card>
      )}

      <SectionTitle title="地政学タイムライン" note="規制イベントと影響を時系列で整理" />
      <Card>
        <div className="relative pl-[22px] before:absolute before:top-1 before:bottom-1 before:left-1.5 before:w-0.5 before:bg-line before:content-['']">
          {timelineItems.map((t) => (
            <div key={`${t.date}-${t.title}`} className="relative pb-[18px] last:pb-0">
              <span
                className={`absolute top-[5px] left-[-21px] h-[11px] w-[11px] rounded-full border-[3px] bg-card ${TL_DOT[t.tone]}`}
              />
              <div className="font-mono text-[11px] text-ink-2">{t.date}</div>
              <div className="mt-0.5 mb-0.5 font-bold text-[13.5px]">{t.title}</div>
              <div className="text-[12.5px] text-[#3C4552]">{t.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
