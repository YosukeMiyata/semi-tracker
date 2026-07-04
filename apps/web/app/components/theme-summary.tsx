import { Link } from "react-router";
import { Card, SectionTitle } from "~/components/section";
import { Sparkline } from "~/components/sparkline";
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
      <Card className="p-0">
        {rows.map((t, i) => {
          const vol = volTier(t.volRatio);
          return (
            <Link
              key={t.key}
              to="/themes"
              className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-panel2 focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-[-2px] ${
                i > 0 ? "border-line border-t" : ""
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: t.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate font-bold">{t.name}</span>
              <Sparkline values={t.spark} />
              <span className={`shrink-0 font-mono text-[12px] ${pctColor(t.dayPct)}`}>
                {fmtPct(t.dayPct)}
              </span>
              <span
                className={`w-[4.5rem] shrink-0 text-right font-mono text-[12px] ${pctColor(t.ytdPct)}`}
              >
                {fmtPct(t.ytdPct, 0)}
                <small className="ml-0.5 text-[9px] text-ink-2">YTD</small>
              </span>
              <span
                className={`w-[3.25rem] shrink-0 text-right font-mono text-[11px] ${pctColor(t.soxAlpha)}`}
                title="年初来騰落率 − SOX年初来"
              >
                {t.soxAlpha === null ? "—" : fmtPct(t.soxAlpha, 0)}
                <small className="ml-0.5 text-[9px] text-ink-2">α</small>
              </span>
              {vol !== null ? (
                <span className="shrink-0 rounded-full border border-copper/40 bg-copper-soft px-1.5 py-0.5 font-mono text-[10px] text-copper">
                  {vol}×
                </span>
              ) : null}
            </Link>
          );
        })}
      </Card>
    </>
  );
}
