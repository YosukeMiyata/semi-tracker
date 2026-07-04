import { Card, SectionTitle } from "~/components/section";
import { Sparkline } from "~/components/sparkline";
import { fmtPct, pctColor, themesPerf } from "~/lib/data";
import master from "../../../../data/themes.json";

export function meta() {
  return [{ title: "テーマ — 半導体テーマトラッカー 2.0" }];
}

const subCounts = new Map(master.macro.map((m) => [m.key, m.subs.length]));

export default function Themes() {
  return (
    <>
      <SectionTitle
        title="テーマ別トラッカー"
        note={`v1 の ${master.stats.macro_themes} マクロテーマ × 日本株 ${master.stats.jp_stocks} 銘柄。年初来騰落率+出来高シグナル、スパークラインは直近3ヶ月`}
      />
      <Card>
        {themesPerf.themes.map((t) => (
          <div
            key={t.key}
            className="flex items-center gap-2.5 border-line border-b py-[11px] last:border-b-0"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: t.color }}
            />
            <div className="min-w-0 flex-1 font-bold text-[13.5px]">
              {t.name}
              <small className="block font-normal text-[11px] text-ink-2">
                サブテーマ {subCounts.get(t.key) ?? "—"} / 日本株 {t.n_stocks} 銘柄
              </small>
            </div>
            <Sparkline values={t.spark} />
            <div
              className={`min-w-[64px] text-right font-mono font-semibold text-[14px] ${pctColor(t.ytd_pct)}`}
            >
              {fmtPct(t.ytd_pct)}
            </div>
            {t.vol_ratio !== null && t.vol_ratio >= 1.5 ? (
              <span className="rounded-md bg-copper-soft px-1.5 py-0.5 font-bold text-[10.5px] text-copper">
                出来高{t.vol_ratio.toFixed(1)}×
              </span>
            ) : null}
          </div>
        ))}
      </Card>
      <p className="mt-3 text-[12px] text-ink-2">
        {themesPerf.note}(データ基準日 {themesPerf.last_updated})
      </p>
    </>
  );
}
