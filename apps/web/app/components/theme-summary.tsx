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

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-[18px] md:mt-0 md:ml-auto md:shrink-0 md:flex-nowrap md:pl-0">
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
