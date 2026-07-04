import { Link } from "react-router";
import { StockListShell } from "~/components/stock-list-row";
import { fmtPct, pctColor } from "~/lib/data";
import { linkageGroups, linkageMethod } from "~/lib/tracker";

export function LinkageAlert() {
  const triggered = linkageGroups().filter((g) => g.triggered);

  if (triggered.length === 0) {
    return (
      <div className="border-line border-t border-dashed py-4 text-[13px] text-ink-2">
        <span className="font-bold text-ink">本日の連動トリガー: なし</span>
        <span className="mx-1.5 text-faint">·</span>
        直近営業日に米国テーマが+2%超で上昇したサブテーマはありませんでした。
      </div>
    );
  }

  return (
    <div className="mb-3 border-2 border-copper/50 border-t py-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-copper px-2 py-0.5 font-bold text-[11px] text-paper tracking-[0.08em]">
          連動トリガー発火
        </span>
        <span className="font-bold text-[14px]">米国テーマ前日+2%超 → 翌営業日の連動候補</span>
        <Link
          to="/themes"
          className="ml-auto text-[12px] text-copper underline focus-visible:outline-2 focus-visible:outline-copper"
        >
          連動ビューで詳細 ↗
        </Link>
      </div>

      <StockListShell>
        {triggered.map((g) => {
          const topRows = g.rows.slice(0, 3);
          return (
            <div key={g.theme} className="border-line border-b py-3 last:border-b-0">
              <div className="mb-2 font-bold text-[14px]">
                {g.sub}
                <small className="ml-1.5 font-normal text-[12px] text-ink-2">
                  {g.macro} · 米国平均 {fmtPct(g.usAvg)}
                </small>
              </div>
              {g.us.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1.5 text-[11px] text-ink-2">
                  {g.us.map((u) => (
                    <span
                      key={u.symbol}
                      className="rounded-full border border-line bg-panel2/50 px-2 py-0.5 font-mono"
                    >
                      <span className="text-us">{u.symbol}</span> {fmtPct(u.chgPct)}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mb-1 text-[11px] text-ink-2">過去実績ベースの連動候補(翌日)</div>
              <div>
                {topRows.map((r) => (
                  <div
                    key={r.code}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-line/70 border-b py-2 text-[13.5px] last:border-b-0"
                  >
                    <span className="font-medium">
                      {r.name}
                      <small className="ml-1.5 font-mono font-bold text-[13px] text-copper">
                        {r.code}
                      </small>
                    </span>
                    <span
                      className={`font-mono font-bold text-[13.5px] ${r.rate >= 60 ? "text-up" : r.rate <= 40 ? "text-down" : "text-copper"}`}
                    >
                      陽性率 {r.rate}%
                    </span>
                    <span className={`font-mono font-bold text-[13.5px] ${pctColor(r.avg)}`}>
                      平均 {fmtPct(r.avg, 2)}
                      <small className="text-[10px] font-normal text-ink-2">(n={r.n})</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </StockListShell>

      <p className="mt-2 text-[10.5px] text-ink-2">手法: {linkageMethod()}</p>
    </div>
  );
}
