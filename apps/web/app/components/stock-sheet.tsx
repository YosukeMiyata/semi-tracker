import { fmtPct, pctColor } from "~/lib/data";
import { analyzeStock } from "~/lib/technical";
import {
  periodLabel,
  stockPeriodRet,
  stockRow,
  stockThemes,
  TRACKER_PERIODS,
  type TrackerPeriodId,
} from "~/lib/tracker";

function externalLinks(symbol: string, market: "jp" | "us") {
  if (market === "jp") {
    return [
      { label: "株探", href: `https://s.kabutan.jp/stocks/${symbol}/` },
      { label: "Yahoo", href: `https://finance.yahoo.co.jp/quote/${symbol}.T` },
    ];
  }
  return [
    { label: "株探US", href: `https://us.kabutan.jp/stocks/${symbol}` },
    { label: "Yahoo", href: `https://finance.yahoo.com/quote/${symbol}` },
  ];
}

export function StockSheet({ symbol, onClose }: { symbol: string; onClose: () => void }) {
  const row = stockRow(symbol);
  if (!row) {
    return null;
  }

  const themes = stockThemes(symbol);
  const tech = analyzeStock(symbol);
  const mkClass = row.market === "jp" ? "text-copper" : "text-[#7A52E0]";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div className="relative max-h-[85vh] overflow-y-auto rounded-t-[18px] border-line border-t bg-card px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(23,28,38,.15)]">
        <div className="mb-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className={`font-mono font-bold text-[15px] ${mkClass}`}>{row.symbol}</div>
            <div className="font-bold text-[16px]">{row.name}</div>
            <div className="mt-1 font-mono text-[11px] text-ink-2">
              終値 {row.last.toLocaleString()} ・ {row.lastDate} ・{" "}
              {row.market === "jp" ? "東証" : "US"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-2.5 py-1 text-[13px] text-ink-2"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12.5px]">
          <span>
            前日比 <b className={pctColor(row.chgPct)}>{fmtPct(row.chgPct)}</b>
          </span>
          <span>
            出来高率{" "}
            <b className={row.volRatio !== null && row.volRatio >= 2 ? "text-up" : ""}>
              {row.volRatio !== null ? `${row.volRatio.toFixed(1)}×` : "—"}
            </b>
          </span>
        </div>

        {tech && (tech.pattern || tech.signal || tech.po || tech.pullback || tech.daytrade) ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tech.pattern ? (
              <span className="rounded-full border border-line bg-[#FBFBFC] px-2 py-0.5 text-[10.5px]">
                {tech.pattern}
              </span>
            ) : null}
            {tech.signal ? (
              <span className="rounded-full border border-copper/40 bg-copper-soft px-2 py-0.5 text-[10.5px] text-copper">
                {tech.signal}
              </span>
            ) : null}
            {tech.po ? (
              <span className="rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                パーフェクトオーダー
              </span>
            ) : null}
            {tech.pullback ? (
              <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px]">
                🎯 {tech.pullback}
              </span>
            ) : null}
            {tech.daytrade ? (
              <span className="rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                ⚡ {tech.daytrade}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mb-3 font-bold text-[12px] text-ink-2">期間別騰落率</div>
        <div className="mb-4 grid grid-cols-3 gap-1.5">
          {TRACKER_PERIODS.map((p) => {
            const v = stockPeriodRet(symbol, p.id as TrackerPeriodId);
            return (
              <div
                key={p.id}
                className="rounded-lg border border-line bg-[#FBFBFC] px-2 py-1.5 text-center"
              >
                <div className="text-[10px] text-ink-2">{p.label}</div>
                <div className={`font-mono font-semibold text-[12.5px] ${pctColor(v)}`}>
                  {fmtPct(v)}
                </div>
              </div>
            );
          })}
        </div>

        {themes.length > 0 ? (
          <div className="mb-4">
            <div className="mb-1.5 font-bold text-[12px] text-ink-2">
              属するテーマ({themes.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {themes.map((t) => (
                <span
                  key={t.label}
                  className="rounded-full border border-line bg-[#FBFBFC] px-2.5 py-0.5 text-[11px]"
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-2 font-bold text-[12px] text-ink-2">外部サイト</div>
        <div className="flex flex-wrap gap-2">
          {externalLinks(symbol, row.market).map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] hover:bg-[#FBFBFC]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="mt-3 text-[10.5px] text-ink-2">
          {periodLabel("1M")}などの騰落率は期間始値=0%の累積値です。
        </p>
      </div>
    </div>
  );
}
