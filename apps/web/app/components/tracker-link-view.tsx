import { fmtPct, pctColor } from "~/lib/data";
import { highlightRowClass } from "~/lib/highlight";
import { linkageGroups, linkageMethod } from "~/lib/tracker";

function trigBadge(level: number, usAvg: number | null) {
  if (level >= 3) {
    return (
      <span className="rounded-full bg-up px-2 py-0.5 font-bold text-[10px] text-white">
        ▲▲▲ 急騰 {fmtPct(usAvg)}
      </span>
    );
  }
  if (level >= 2) {
    return (
      <span className="rounded-full bg-up/85 px-2 py-0.5 font-bold text-[10px] text-white">
        ▲▲ 大幅高 {fmtPct(usAvg)}
      </span>
    );
  }
  if (level >= 1) {
    return (
      <span className="rounded-full border border-up bg-up-soft px-2 py-0.5 font-bold text-[10px] text-up">
        ▲ 点灯 {fmtPct(usAvg)}
      </span>
    );
  }
  return (
    <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-2">
      平均 {fmtPct(usAvg)}
    </span>
  );
}

export function LinkView({
  onPickStock,
  highlightSymbol = null,
}: {
  onPickStock: (symbol: string) => void;
  highlightSymbol?: string | null;
}) {
  const groups = linkageGroups();
  const triggered = groups.filter((g) => g.triggered);
  const rest = groups.filter((g) => !g.triggered);

  if (groups.length === 0) {
    return (
      <p className="text-[12.5px] text-ink-2">
        連動データがありません。米国テーマが前日+2%超で上昇した日の集計が表示されます。
      </p>
    );
  }

  return (
    <>
      <p className="text-[12px] text-ink-2 leading-[1.55]">
        米国系テーマが <b className="text-up">+2%以上</b>{" "}
        上昇した翌営業日に連動しやすい「テーマ→日本株」ランキング。
        銘柄タップで、どのテーマにどれだけ連動するかの内訳を表示します。
      </p>

      {triggered.length === 0 ? (
        <p className="rounded-card border border-line border-dashed bg-panel2 px-3 py-2.5 text-[12px] text-ink-2">
          直近の営業日に +2% 超で上昇した米国テーマはありませんでした。以下は過去実績の連動率です。
        </p>
      ) : null}

      {[...triggered, ...rest].map((g) => (
        <div
          key={g.theme}
          className={`mb-3 border-line border-t ${g.triggered ? "border-up/40" : ""}`}
        >
          <div className="flex items-start justify-between gap-2 border-line border-b py-3">
            <div>
              <div className="font-bold text-[14px]">{g.sub}</div>
              <div className="text-[12px] text-ink-2">{g.macro}</div>
            </div>
            {trigBadge(g.trigLevel, g.usAvg)}
          </div>

          {g.us.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 border-line border-b py-2 text-[11px] text-ink-2">
              <span className="mr-1">前日の米国:</span>
              {g.us.map((u) => (
                <span key={u.symbol} className="rounded bg-panel2 px-1.5 py-0.5 font-mono">
                  <span className="text-us">{u.symbol}</span>{" "}
                  <span className={pctColor(u.chgPct)}>{fmtPct(u.chgPct)}</span>
                </span>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-line border-b py-2 text-[11px] text-ink-2">
            <span>翌日に連動する日本株</span>
            <span className="text-right">連動率</span>
            <span className="text-right">翌日平均</span>
            <span className="text-right">回数</span>
          </div>

          {g.rows.map((r) => (
            <button
              key={`${g.theme}-${r.code}`}
              type="button"
              data-symbol={r.code}
              onClick={() => onPickStock(r.code)}
              className={`grid w-full grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-line border-b py-3 text-left text-[13.5px] last:border-b-0 hover:bg-panel2/35 ${highlightRowClass(r.code, highlightSymbol)}`}
            >
              <span>
                <span className="font-mono font-bold text-[13px] text-copper">{r.code}</span>{" "}
                <span className="font-medium">{r.name}</span>
              </span>
              <span
                className={`font-mono font-bold text-[13.5px] ${r.rate >= 60 ? "text-up" : r.rate <= 40 ? "text-down" : ""}`}
              >
                {r.rate}%
              </span>
              <span className={`font-mono font-bold text-[13.5px] ${pctColor(r.avg)}`}>
                {fmtPct(r.avg, 2)}
              </span>
              <span
                className={`font-mono text-right text-[12px] ${r.n < 5 ? "text-down" : "text-ink-2"}`}
              >
                n{r.n}
              </span>
            </button>
          ))}
        </div>
      ))}

      <p className="text-[11px] text-ink-2">手法: {linkageMethod()}</p>
    </>
  );
}
