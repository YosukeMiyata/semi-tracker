import { Card, Placeholder, SectionTitle } from "~/components/section";
import { fmtPct, linkageTop, pctColor, themesPerf } from "~/lib/data";

export function meta() {
  return [{ title: "ホーム — 半導体テーマトラッカー 2.0" }];
}

function splitTheme(theme: string): { macro: string; sub: string } {
  const [macro, sub] = theme.split(" > ");
  return { macro, sub: sub ?? macro };
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
          ニュース運用の開始後に表示
        </span>
        <div className="mt-2 border-line border-t border-dashed pt-2.5 text-[11px] text-ink-2">
          ダイ1つ=1テーマのウェハーマップ(v1の12マクロテーマ × ニュース感情スコアで着色)を
          ここに表示します。
        </div>
      </Card>

      <h2 className="mt-[26px] mb-1 flex items-center gap-2 font-bold font-serif text-[17px]">
        年初来テーマ Top3
        <span className="h-px flex-1 bg-line" />
      </h2>
      <div className="mb-3 text-[12px] text-ink-2">資金が来ているテーマ(詳細はテーマタブ)</div>
      <Card>
        {themesPerf.themes.slice(0, 3).map((t) => (
          <div
            key={t.key}
            className="flex items-center gap-2.5 border-line border-b py-2.5 last:border-b-0"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: t.color }}
            />
            <div className="flex-1 font-bold text-[13.5px]">{t.name}</div>
            <div className={`font-mono font-semibold text-[14px] ${pctColor(t.ytd_pct)}`}>
              {fmtPct(t.ytd_pct)}
            </div>
          </div>
        ))}
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
    </>
  );
}
