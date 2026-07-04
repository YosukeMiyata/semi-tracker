import { CopySummary } from "~/components/copy-summary";
import { HeadlineList } from "~/components/headline-list";
import { NewsCard } from "~/components/news-card";
import { Card, SectionTitle } from "~/components/section";
import { Sparkline } from "~/components/sparkline";
import { Wafer } from "~/components/wafer";
import { fmtPct, indices, linkageTop, pctColor } from "~/lib/data";
import { recentHeadlines } from "~/lib/headlines";
import { featuredNews, themeSentiments, verdictLabel, weeklySentiment } from "~/lib/news";

export function meta() {
  return [{ title: "ホーム — 半導体テーマトラッカー 2.0" }];
}

function splitTheme(theme: string): { macro: string; sub: string } {
  const [macro, sub] = theme.split(" > ");
  return { macro, sub: sub ?? macro };
}

const weekly = weeklySentiment();
const waferThemes = themeSentiments();
const featured = featuredNews();
const headlines = recentHeadlines(3, 5);

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-[150px_1fr] items-center gap-3.5 rounded-card border border-line bg-card px-4 pt-5 pb-4">
        <Wafer themes={waferThemes} />
        <div>
          <div className="text-[11px] text-ink-2 tracking-[0.14em]">今週のセンチメント</div>
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
                ・
              </>
            ) : null}{" "}
            分析ニュース {weekly.count}本
          </div>
        </div>
        <div className="col-span-full border-line border-t border-dashed pt-2.5 text-[11px] text-ink-2">
          ダイ1つ=1テーマ(v1の12マクロテーマ)。直近7日のニュース論調スコアで着色。今週ニュースの無いテーマは中立色です。
          <div className="mt-1 flex flex-wrap gap-3">
            <span>
              <i className="mr-1 inline-block h-2.5 w-2.5 rounded-[2px] bg-up align-[-1px]" />
              ポジティブ
            </span>
            <span>
              <i className="mr-1 inline-block h-2.5 w-2.5 rounded-[2px] bg-[#C9CED6] align-[-1px]" />
              中立
            </span>
            <span>
              <i className="mr-1 inline-block h-2.5 w-2.5 rounded-[2px] bg-down align-[-1px]" />
              ネガティブ
            </span>
          </div>
        </div>
      </div>

      {indices.length > 0 ? (
        <div className="mt-3">
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
        </div>
      ) : null}

      <SectionTitle
        title="最新ヘッドライン"
        note="主要メディアの見出しを RSS で自動掲載(RSS 全文はニュースタブ)"
      />
      <HeadlineList items={headlines} compact />

      <SectionTitle
        title="今週の注目 3本"
        note="手動の分析ニュース — どの銘柄に効くかまで翻訳して届けます"
      />
      {featured.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}

      <SectionTitle
        title="米国テーマ → 翌日の日本株"
        note="米国テーマが前日+2%超上昇したとき、翌営業日に連動しやすい日本株(過去実績)"
      />
      <Card>
        {linkageTop.rows.length > 0 ? (
          linkageTop.rows.map((r) => {
            const { macro, sub } = splitTheme(r.theme);
            return (
              <div
                key={`${r.theme}-${r.code}`}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-line border-b py-2.5 text-[13px] last:border-b-0"
              >
                <div className="font-bold">
                  {sub}
                  <small className="block font-normal text-[11px] text-ink-2">
                    {macro} ・ 前日 {fmtPct(r.us_avg)}
                  </small>
                </div>
                <div className="text-center font-mono text-copper">
                  →<div className="text-[11px]">{r.rate}%</div>
                </div>
                <div className="text-right font-bold">
                  {r.name}
                  <small className="block font-normal text-[11px] text-ink-2">
                    平均 {fmtPct(r.avg, 2)}(n={r.n})
                  </small>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-1 text-[12.5px] text-ink-2">
            直近の営業日に +2%
            超で上昇した米国テーマはありませんでした。トリガー発生日のみ表示されます。
          </p>
        )}
      </Card>
      <p className="mt-2 text-[11px] text-ink-2">手法: {linkageTop.method}</p>

      <CopySummary />
    </>
  );
}
