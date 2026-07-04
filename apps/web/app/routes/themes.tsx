import { Card, SectionTitle } from "~/components/section";
import master from "../../../../data/themes.json";

export function meta() {
  return [{ title: "テーマ — 半導体テーマトラッカー 2.0" }];
}

export default function Themes() {
  return (
    <>
      <SectionTitle
        title="テーマ別トラッカー"
        note={`v1 の ${master.stats.macro_themes} マクロテーマ × 日本株 ${master.stats.jp_stocks} 銘柄を踏襲。年初来騰落率・スパークライン・出来高シグナルを実装予定`}
      />
      <Card>
        {master.macro.map((m) => {
          const codes = new Set<string>();
          for (const sub of m.subs) {
            for (const row of [...sub.jp, ...sub.solo]) {
              codes.add(row.code);
            }
          }
          return (
            <div
              key={m.key}
              className="flex items-center gap-2.5 border-line border-b py-[11px] last:border-b-0"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: m.color }}
              />
              <div className="flex-1 font-bold text-[13.5px]">
                {m.name}
                <small className="block font-normal text-[11px] text-ink-2">
                  サブテーマ {m.subs.length} / 日本株 {codes.size} 銘柄
                </small>
              </div>
              <div className="min-w-[72px] text-right font-mono font-semibold text-[14px] text-neutral">
                —%
              </div>
            </div>
          );
        })}
      </Card>
      <p className="mt-3 text-[12px] text-ink-2">
        テーマ・銘柄の追加は pipeline/themes.py を編集(v1 と同じ運用)→ `pnpm data:master`
        で反映されます。
      </p>
    </>
  );
}
