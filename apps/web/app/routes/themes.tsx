import { Card, SectionTitle } from "~/components/section";
import { Sparkline } from "~/components/sparkline";
import { ThemeChart } from "~/components/theme-chart";
import { fmtPct, pctColor, type SubDetail, themesDetail, themesPerf, volTier } from "~/lib/data";
import master from "../../../../data/themes.json";

export function meta() {
  return [{ title: "テーマ — 半導体テーマトラッカー 2.0" }];
}

const subCounts = new Map(master.macro.map((m) => [m.key, m.subs.length]));
const detailByKey = new Map(themesDetail.themes.map((t) => [t.key, t]));

function SubRow({ sub }: { sub: SubDetail }) {
  return (
    <div className="border-line border-b py-2 last:border-b-0">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-bold text-[12.5px]">{sub.name}</span>
        <span className={`font-mono font-semibold text-[12px] ${pctColor(sub.ytd_pct)}`}>
          {fmtPct(sub.ytd_pct)}
        </span>
      </div>
      {sub.stocks.map((s) => {
        const tier = volTier(s.vol_ratio);
        return (
          <span
            key={s.code}
            title={`${s.name}(${s.code}) 前日 ${fmtPct(s.chg_pct, 2)} / 出来高 ${s.vol_ratio ?? "—"}×`}
            className={`mt-0.5 mr-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] ${
              s.ytd_pct !== null && s.ytd_pct < 0
                ? "border-[#BFD3EA] bg-down-soft"
                : "border-[#EBC3BF] bg-up-soft"
            }`}
          >
            {s.name}
            <span className={`font-mono font-semibold ${pctColor(s.ytd_pct)}`}>
              {fmtPct(s.ytd_pct, 0)}
            </span>
            {tier !== null ? (
              <span className="rounded bg-copper-soft px-1 font-bold text-[9.5px] text-copper">
                出来高{tier}×
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export default function Themes() {
  return (
    <>
      <SectionTitle
        title="テーマ別トラッカー"
        note={`v1 の ${master.stats.macro_themes} マクロテーマ × 日本株 ${master.stats.jp_stocks} 銘柄。年初来の累積騰落率で資金の流出入を一望`}
      />
      <Card>
        <ThemeChart themes={themesDetail.themes} />
      </Card>

      <SectionTitle
        title="テーマ別ランキング"
        note="タップでサブテーマ→構成銘柄へ掘り下げ(騰落率順・出来高2×/3×/5×は急増シグナル)"
      />
      {themesPerf.themes.map((t) => {
        const detail = detailByKey.get(t.key);
        return (
          <details key={t.key} className="group mb-1.5">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-card border border-line bg-card px-4 py-[11px] [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2">
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
            </summary>
            {detail ? (
              <div className="mx-1 mt-[-8px] rounded-b-card border border-line border-t-0 bg-[#FBFBFC] px-3.5 pt-4 pb-2">
                {detail.subs.map((sub) => (
                  <SubRow key={sub.name} sub={sub} />
                ))}
              </div>
            ) : null}
          </details>
        );
      })}
      <p className="mt-3 text-[12px] text-ink-2">
        {themesDetail.note}(データ基準日 {themesDetail.last_updated})。テーマ・銘柄の追加は
        pipeline/themes.py を編集(v1 と同じ運用)。
      </p>
    </>
  );
}
