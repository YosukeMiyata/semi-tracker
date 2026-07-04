import { CopySummary } from "~/components/copy-summary";
import { EventCalendarPreview } from "~/components/event-calendar";
import { HeadlineList } from "~/components/headline-list";
import { LinkageAlert } from "~/components/linkage-alert";
import { MacroPanel } from "~/components/macro-panel";
import { NewsCard } from "~/components/news-card";
import { Card, SectionTitle } from "~/components/section";
import { Sparkline } from "~/components/sparkline";
import { ThemeSummary } from "~/components/theme-summary";
import { Wafer } from "~/components/wafer";
import { WeeklyDigest } from "~/components/weekly-digest";
import { fmtPct, indices, pctColor } from "~/lib/data";
import { HOME_SECTION_SCROLL_MT } from "~/lib/home-sections";
import { recentHeadlines } from "~/lib/headlines";
import { featuredNews, themeSentiments, verdictLabel, weeklySentiment } from "~/lib/news";

export function meta() {
  return [{ title: "ホーム — 半導体テーマトラッカー" }];
}

const weekly = weeklySentiment();
const waferThemes = themeSentiments();
const featured = featuredNews();
const headlines = recentHeadlines(3, 5);

export default function Home() {
  return (
    <>
      <section id="weekly-digest" className={HOME_SECTION_SCROLL_MT}>
        <WeeklyDigest />
      </section>

      <section id="theme-summary" className={HOME_SECTION_SCROLL_MT}>
        <ThemeSummary />
      </section>

      <section id="events" className={HOME_SECTION_SCROLL_MT}>
        <EventCalendarPreview />
      </section>

      <section id="linkage" className={`mt-3 ${HOME_SECTION_SCROLL_MT}`}>
        <LinkageAlert />
      </section>

      {indices.length > 0 ? (
        <section id="indices" className={`mt-3 ${HOME_SECTION_SCROLL_MT}`}>
          {indices.map((ix) => (
            <Card key={ix.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[13px]">
                  {ix.name}
                  <small className="ml-1.5 font-mono font-normal text-[10px] text-ink-2">
                    {ix.date}
                  </small>
                </div>
                <div className="font-mono font-semibold text-[16px]">
                  {ix.last.toLocaleString()}
                </div>
              </div>
              <Sparkline values={ix.spark} />
              <div className="text-right font-mono text-[12px]">
                <div className={pctColor(ix.chg_pct)}>前日 {fmtPct(ix.chg_pct)}</div>
                <div className={pctColor(ix.ytd_pct)}>年初来 {fmtPct(ix.ytd_pct)}</div>
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      <section id="macro" className={HOME_SECTION_SCROLL_MT}>
        <MacroPanel />
      </section>

      <section id="sentiment" className={HOME_SECTION_SCROLL_MT}>
        <SectionTitle
          title="今週のセンチメント"
          note="分析ニュースの論調スコア(手動キュレーション)。テーマ別の着色は下のウェハーマップ"
        />
        <div className="grid grid-cols-[150px_1fr] items-center gap-3.5 rounded-card border border-line bg-card px-4 pt-5 pb-4">
          <Wafer themes={waferThemes} />
          <div>
            <div className="font-mono font-semibold text-[44px] leading-[1.05]">
              {weekly.score === null
                ? "—"
                : `${weekly.score > 0 ? "+" : weekly.score < 0 ? "−" : ""}${Math.abs(weekly.score).toFixed(1)}`}
              <small className="font-medium text-[16px] text-ink-2"> / ±2.0</small>
            </div>
            <span className="mt-1.5 inline-block rounded-full bg-copper-soft px-2.5 py-0.5 font-bold text-[12px] text-copper">
              {verdictLabel(weekly.score)}
            </span>
            <div className="mt-2 text-[12px] text-ink-2">
              {weekly.delta !== null ? (
                <>
                  先週比{" "}
                  <b className={weekly.delta >= 0 ? "text-up" : "text-down"}>
                    {weekly.delta >= 0 ? "▲" : "▼"}
                    {Math.abs(weekly.delta).toFixed(1)}
                  </b>{" "}
                  ·
                </>
              ) : null}{" "}
              分析ニュース {weekly.count}本
            </div>
          </div>
          <div className="col-span-full border-line border-t border-dashed pt-2.5 text-[11px] text-ink-2">
            ダイ1つ=1テーマ。直近7日のニュース論調で着色。
          </div>
        </div>
      </section>

      <section id="featured-news" className={HOME_SECTION_SCROLL_MT}>
        <SectionTitle
          title="今週の注目 3本"
          note="手動の分析ニュース — どの銘柄に効くかまで翻訳して届けます"
        />
        {featured.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </section>

      <section id="headlines" className={HOME_SECTION_SCROLL_MT}>
        <SectionTitle
          title="最新ヘッドライン"
          note="主要メディアの見出し(RSS 自動)。詳細はニュースタブ"
        />
        <HeadlineList items={headlines} compact />
      </section>

      <CopySummary />
    </>
  );
}
