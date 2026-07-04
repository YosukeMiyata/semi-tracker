import { Link } from "react-router";
import { Card } from "~/components/section";
import { fmtPct } from "~/lib/data";
import { linkageGroups, linkageMethod } from "~/lib/tracker";

export function LinkageAlert() {
  const triggered = linkageGroups().filter((g) => g.triggered);

  if (triggered.length === 0) {
    return (
      <Card className="border-dashed bg-panel2 py-3 text-[12.5px] text-ink-2">
        <span className="font-bold text-ink">本日の連動トリガー: なし</span>
        <span className="mx-1.5 text-faint">·</span>
        直近営業日に米国テーマが+2%超で上昇したサブテーマはありませんでした。
      </Card>
    );
  }

  return (
    <div className="mb-3 rounded-card border-2 border-copper/50 bg-copper-soft/40 p-4">
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

      {triggered.map((g) => {
        const topRows = g.rows.slice(0, 3);
        return (
          <div
            key={g.theme}
            className="mb-2 rounded-[10px] border border-line bg-card p-3 last:mb-0"
          >
            <div className="mb-2 font-bold text-[13.5px]">
              {g.sub}
              <small className="ml-1.5 font-normal text-[11px] text-ink-2">
                {g.macro} · 米国平均 {fmtPct(g.usAvg)}
              </small>
            </div>
            {g.us.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-1 text-[10.5px] text-ink-2">
                {g.us.map((u) => (
                  <span
                    key={u.symbol}
                    className="rounded-full border border-line bg-panel2 px-2 py-0.5 font-mono"
                  >
                    {u.name} {fmtPct(u.chgPct)}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="text-[11px] text-ink-2">過去実績ベースの連動候補(翌日)</div>
            <div className="mt-1.5 space-y-1">
              {topRows.map((r) => (
                <div
                  key={r.code}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-[12.5px]"
                >
                  <span className="font-bold">
                    {r.name}
                    <small className="ml-1 font-mono font-normal text-ink-2">{r.code}</small>
                  </span>
                  <span className="font-mono text-copper">陽性率 {r.rate}%</span>
                  <span className="font-mono text-ink-2">
                    平均 {fmtPct(r.avg, 2)}
                    <small className="text-[10px]">(n={r.n})</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <p className="mt-2 text-[10.5px] text-ink-2">手法: {linkageMethod()}</p>
    </div>
  );
}
