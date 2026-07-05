import { Link } from "react-router";
import { StockListShell } from "~/components/stock-list-row";
import { fmtPct, pctColor } from "~/lib/data";
import { linkageGroups, linkageMethod } from "~/lib/tracker";

export function LinkageAlert() {
  const triggered = linkageGroups().filter((g) => g.triggered);

  if (triggered.length === 0) {
    return (
      <div className="type-body-sm border-line border-t border-dashed p-4 md:p-6">
        <span className="font-bold text-ink">本日の連動トリガー: なし</span>
        <span className="mx-1.5 text-faint">·</span>
        直近営業日に米国テーマが+2%超で上昇したサブテーマはありませんでした。
      </div>
    );
  }

  return (
    <div className="card-surface mb-3 border-2 border-copper/50 border-t">
      <div className="mb-3 flex flex-wrap items-center gap-2 md:mb-4 md:gap-3">
        <span className="type-badge rounded-md bg-copper px-2 py-0.5 text-paper tracking-[0.08em]">
          連動トリガー発火
        </span>
        <span className="type-card-title">米国テーマ前日+2%超 → 翌営業日の連動候補</span>
        <Link
          to="/themes"
          className="type-body-sm ml-auto text-copper underline focus-visible:outline-2 focus-visible:outline-copper"
        >
          連動ビューで詳細 ↗
        </Link>
      </div>

      <StockListShell>
        {triggered.map((g) => {
          const topRows = g.rows.slice(0, 3);
          return (
            <div key={g.theme} className="border-line border-b py-3 last:border-b-0 md:py-4">
              <div className="type-list-primary mb-2 font-bold">
                {g.sub}
                <small className="type-body-sm ml-1.5 font-normal">
                  {g.macro} · 米国平均 {fmtPct(g.usAvg)}
                </small>
              </div>
              {g.us.length > 0 ? (
                <div className="type-meta mb-2 flex flex-wrap gap-1.5 md:gap-2">
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
              <div className="type-meta mb-1.5">過去実績ベースの連動候補(翌日)</div>
              <div>
                {topRows.map((r) => (
                  <div
                    key={r.code}
                    className="type-list-primary grid grid-cols-[1fr_auto_auto] items-center gap-2 border-line/70 border-b py-2.5 last:border-b-0 md:gap-4 md:py-3"
                  >
                    <span>
                      {r.name}
                      <small className="type-mono-code ml-1.5 text-copper">{r.code}</small>
                    </span>
                    <span
                      className={`type-mono-value ${r.rate >= 60 ? "text-up" : r.rate <= 40 ? "text-down" : "text-copper"}`}
                    >
                      陽性率 {r.rate}%
                    </span>
                    <span className={`type-mono-value ${pctColor(r.avg)}`}>
                      平均 {fmtPct(r.avg, 2)}
                      <small className="type-meta font-normal">(n={r.n})</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </StockListShell>

      <p className="type-meta mt-3">手法: {linkageMethod()}</p>
    </div>
  );
}
