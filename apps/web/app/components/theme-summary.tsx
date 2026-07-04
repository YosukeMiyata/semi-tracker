import { Link } from "react-router";
import { SectionTitle } from "~/components/section";
import { Sparkline } from "~/components/sparkline";
import { StockListShell } from "~/components/stock-list-row";
import { fmtPct, pctColor, volTier } from "~/lib/data";
import { themeSummaryRows } from "~/lib/theme-summary";

export function ThemeSummary() {
  const rows = themeSummaryRows();

  return (
    <>
      <SectionTitle
        title="テーマ騰落サマリー"
        note="12マクロテーマの前日比・年初来・SOX比(α)。構成銘柄の単純平均"
        info={{
          label: "テーマ騰落サマリーの説明を表示",
          title: "テーマ騰落サマリーとは",
          content: (
            <>
              <p>
                半導体関連の12マクロテーマ（メモリ・光接続・装置など）ごとに、構成銘柄の株価変動をまとめた一覧です。テーマ全体の強弱を素早く把握するためのサマリーです。
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>
                  <strong className="font-medium text-ink">前日比</strong>
                  ：直近営業日の騰落率
                </li>
                <li>
                  <strong className="font-medium text-ink">YTD</strong>
                  ：年初来の騰落率
                </li>
                <li>
                  <strong className="font-medium text-ink">α（SOX比）</strong>
                  ：テーマの年初来騰落率からSOX指数の年初来騰落率を引いた値。指数に対する相対パフォーマンス
                </li>
                <li>
                  <strong className="font-medium text-ink">スパークライン</strong>
                  ：直近の株価推移
                </li>
                <li>
                  <strong className="font-medium text-ink">2× / 3× / 5×</strong>
                  ：出来高が直近20日平均の何倍か（急増シグナル）
                </li>
              </ul>
              <p>各テーマの騰落率は、構成銘柄の単純平均（等ウェイト）で算出しています。</p>
            </>
          ),
        }}
      />
      <StockListShell>
        {rows.map((t) => {
          const vol = volTier(t.volRatio);
          return (
            <Link
              key={t.key}
              to="/themes"
              className="block border-line border-b py-3 hover:bg-panel2/35 focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-[-2px] md:flex md:items-center md:gap-2.5 last:border-b-0"
            >
              <div className="flex min-w-0 items-start gap-2 md:flex-1 md:items-center">
                <span
                  className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[2px] md:mt-0"
                  style={{ backgroundColor: t.color }}
                  aria-hidden
                />
                <span className="font-bold text-[14px] leading-snug">{t.name}</span>
              </div>

              <div className="mt-1.5 flex w-full flex-wrap items-center justify-end gap-x-2 gap-y-1 md:mt-0 md:ml-auto md:w-auto md:shrink-0 md:flex-nowrap md:justify-start">
                <Sparkline values={t.spark} />
                <span className={`font-mono font-bold text-[13.5px] ${pctColor(t.dayPct)}`}>
                  {fmtPct(t.dayPct)}
                </span>
                <span
                  className={`font-mono font-bold text-[13.5px] md:w-[4.5rem] md:text-right ${pctColor(t.ytdPct)}`}
                >
                  {fmtPct(t.ytdPct, 0)}
                  <small className="ml-0.5 text-[10px] font-normal text-ink-2">YTD</small>
                </span>
                <span
                  className={`font-mono font-bold text-[13px] md:w-[3.25rem] md:text-right ${pctColor(t.soxAlpha)}`}
                  title="年初来騰落率 − SOX年初来"
                >
                  {t.soxAlpha === null ? "—" : fmtPct(t.soxAlpha, 0)}
                  <small className="ml-0.5 text-[10px] font-normal text-ink-2">α</small>
                </span>
                {vol !== null ? (
                  <span className="rounded-full border border-copper/40 bg-copper-soft px-1.5 py-0.5 font-mono text-[10.5px] text-copper">
                    {vol}×
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </StockListShell>
    </>
  );
}
