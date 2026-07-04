import { StockPriceChart } from "~/components/stock-chart";
import { StockTechGrid } from "~/components/stock-tech-grid";
import { fmtPct, pctColor } from "~/lib/data";
import { analyzeStock } from "~/lib/technical";
import {
  periodLabel,
  stockLinkageHits,
  stockPeriodRet,
  stockRow,
  stockTags,
  stockThemes,
  TRACKER_PERIODS,
  type TrackerPeriodId,
  type TrackerView,
} from "~/lib/tracker";

function externalLinks(symbol: string, market: "jp" | "us") {
  if (market === "jp") {
    return [
      { label: "株探", href: `https://s.kabutan.jp/stocks/${symbol}/` },
      { label: "株探チャート", href: `https://kabutan.jp/stock/chart?code=${symbol}` },
      { label: "Yahoo", href: `https://finance.yahoo.co.jp/quote/${symbol}.T` },
    ];
  }
  return [
    { label: "株探US", href: `https://us.kabutan.jp/stocks/${symbol}` },
    { label: "Yahoo", href: `https://finance.yahoo.com/quote/${symbol}` },
    { label: "TradingView", href: `https://www.tradingview.com/symbols/${symbol}/` },
  ];
}

export function StockSheet({
  symbol,
  onClose,
  onNavigate,
  onSearchTag,
}: {
  symbol: string;
  onClose: () => void;
  onNavigate?: (view: TrackerView, sym: string) => void;
  onSearchTag?: (tag: string) => void;
}) {
  const row = stockRow(symbol);
  if (!row) {
    return null;
  }

  const themes = stockThemes(symbol);
  const tags = stockTags(symbol);
  const linkHits = stockLinkageHits(symbol);
  const tech = analyzeStock(symbol);
  const mkClass = row.market === "jp" ? "text-copper" : "text-us";

  const nav = (view: TrackerView) => {
    onClose();
    onNavigate?.(view, symbol);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-paper/80"
        onClick={onClose}
      />
      <div className="relative max-h-[85vh] overflow-y-auto rounded-t-[18px] border-line border-t bg-card px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,.5)]">
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

        {tech &&
        (tech.pattern ||
          tech.signal ||
          tech.po ||
          tech.poBear ||
          tech.pullback ||
          tech.daytrade ||
          tech.volSurge ||
          tech.bbWalk) ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tech.po ? (
              <span className="rounded-full border border-up/40 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                📈 パーフェクトオーダー
              </span>
            ) : null}
            {tech.poBear ? (
              <span className="rounded-full border border-down/40 bg-down-soft px-2 py-0.5 text-[10.5px] text-down">
                📉 逆PO
              </span>
            ) : null}
            {tech.bbWalk === "up" ? (
              <span className="rounded-full border border-up/40 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                📊 +2σバンドウォーク
              </span>
            ) : null}
            {tech.bbWalk === "down" ? (
              <span className="rounded-full border border-down/40 bg-down-soft px-2 py-0.5 text-[10.5px] text-down">
                📊 -2σバンドウォーク
              </span>
            ) : null}
            {tech.volSurge === 3 ? (
              <span className="rounded-full border border-up/40 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                🔊 出来高5倍↑
              </span>
            ) : null}
            {tech.volSurge === 2 ? (
              <span className="rounded-full border border-up/40 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                🔊 出来高3倍↑
              </span>
            ) : null}
            {tech.volSurge === 1 ? (
              <span className="rounded-full border border-up/40 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                🔊 出来高2倍↑
              </span>
            ) : null}
            {tech.pullback ? (
              <span className="rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                🎯 {tech.pullback}
              </span>
            ) : null}
            {tech.pattern ? (
              <span className="rounded-full border border-line bg-panel2 px-2 py-0.5 text-[10.5px]">
                {tech.pattern}
              </span>
            ) : null}
            {tech.signal ? (
              <span className="rounded-full border border-copper/40 bg-copper-soft px-2 py-0.5 text-[10.5px] text-copper">
                {tech.signal}
              </span>
            ) : null}
            {tech.daytrade ? (
              <span className="rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10.5px] text-up">
                ⚡ {tech.daytrade}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mb-1 font-bold text-[12px] text-ink-2">値動きチャート</div>
        <div className="mb-4">
          <StockPriceChart symbol={symbol} />
        </div>

        <div className="mb-3 font-bold text-[12px] text-ink-2">期間別騰落率</div>
        <div className="mb-4 grid grid-cols-3 gap-1.5">
          {TRACKER_PERIODS.map((p) => {
            const v = stockPeriodRet(symbol, p.id as TrackerPeriodId);
            return (
              <div
                key={p.id}
                className="rounded-lg border border-line bg-panel2 px-2 py-1.5 text-center"
              >
                <div className="text-[10px] text-ink-2">{p.label}</div>
                <div className={`font-mono font-semibold text-[12.5px] ${pctColor(v)}`}>
                  {fmtPct(v)}
                </div>
              </div>
            );
          })}
        </div>

        {tech ? <StockTechGrid tech={tech} /> : null}

        {linkHits.length > 0 ? (
          <div className="mb-4">
            <div className="mb-1.5 font-bold text-[12px] text-ink-2">
              米国テーマ連動内訳({linkHits.length})
            </div>
            <div className="space-y-1.5">
              {linkHits.map((hit) => (
                <div
                  key={hit.theme}
                  className={`rounded-lg border px-2.5 py-2 text-[11.5px] ${hit.triggered ? "border-up/30 bg-up-soft/40" : "border-line bg-panel2"}`}
                >
                  <div className="font-bold">{hit.sub}</div>
                  <div className="text-[10.5px] text-ink-2">{hit.macro}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px]">
                    <span>
                      連動率{" "}
                      <b className={hit.rate >= 60 ? "text-up" : hit.rate <= 40 ? "text-down" : ""}>
                        {hit.rate}%
                      </b>
                    </span>
                    <span>
                      翌日平均 <b className={pctColor(hit.avg)}>{fmtPct(hit.avg, 2)}</b>
                    </span>
                    <span className="text-ink-2">n{hit.n}</span>
                    {hit.usAvg !== null ? (
                      <span className="text-ink-2">米国前日 {fmtPct(hit.usAvg)}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {themes.length > 0 || tags.length > 0 ? (
          <div className="mb-4">
            <div className="mb-1.5 font-bold text-[12px] text-ink-2">
              属するテーマ/タグ({themes.length + tags.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {themes.map((t) => (
                <span
                  key={t.label}
                  className="rounded-full border border-line bg-panel2 px-2.5 py-0.5 text-[11px]"
                >
                  {t.label}
                </span>
              ))}
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSearchTag?.(tag);
                  }}
                  className="rounded-full border border-copper/30 bg-copper-soft px-2.5 py-0.5 text-[11px] text-copper"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {onNavigate ? (
          <div className="mb-4">
            <div className="mb-1.5 font-bold text-[12px] text-ink-2">他のページで見る</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => nav("vol")}
                className="rounded-lg border border-line bg-panel2 px-2 py-2 text-[12px] hover:bg-card"
              >
                📊 出来高率
              </button>
              <button
                type="button"
                onClick={() => nav("ret")}
                className="rounded-lg border border-line bg-panel2 px-2 py-2 text-[12px] hover:bg-card"
              >
                📈 騰落率
              </button>
              <button
                type="button"
                onClick={() => nav("link")}
                className="rounded-lg border border-line bg-panel2 px-2 py-2 text-[12px] hover:bg-card"
              >
                🔗 連動
              </button>
              <button
                type="button"
                onClick={() => nav("theme")}
                className="rounded-lg border border-line bg-panel2 px-2 py-2 text-[12px] hover:bg-card"
              >
                🗂️ テーマ
              </button>
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
              className="rounded-lg border border-line bg-card px-3 py-1.5 text-[12px] hover:bg-panel2"
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
