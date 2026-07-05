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

const TECH_BADGE =
  "type-meta rounded-full border px-2.5 py-0.5 md:px-3 md:py-1";

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
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-8">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-paper/80 md:bg-paper/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${row.name}の詳細`}
        className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-[18px] border-line border-t bg-card px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,.5)] md:max-h-[90vh] md:max-w-[680px] md:rounded-[18px] md:border md:px-6 md:pt-5 md:pb-6 md:shadow-[0_16px_48px_rgba(0,0,0,.55)] lg:max-w-[720px] lg:px-8 lg:pt-6 lg:pb-8"
      >
        <div className="mb-4 flex items-start gap-3 md:mb-5">
          <div className="min-w-0 flex-1">
            <div className={`type-mono-value ${mkClass}`}>{row.symbol}</div>
            <div className="type-card-title mt-0.5">{row.name}</div>
            <div className="type-meta mt-1.5 font-mono md:mt-2">
              終値 {row.last.toLocaleString()} ・ {row.lastDate} ・{" "}
              {row.market === "jp" ? "東証" : "US"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="type-body-sm shrink-0 rounded-lg border border-line px-3 py-1.5 text-ink-2 hover:bg-panel2 md:px-3.5 md:py-2"
          >
            ✕
          </button>
        </div>

        <div className="type-body-sm mb-4 flex flex-wrap gap-x-5 gap-y-1.5 font-mono md:mb-5 md:gap-x-6">
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
          <div className="mb-4 flex flex-wrap gap-1.5 md:mb-5 md:gap-2">
            {tech.po ? (
              <span className={`${TECH_BADGE} border-up/40 bg-up-soft text-up`}>
                📈 パーフェクトオーダー
              </span>
            ) : null}
            {tech.poBear ? (
              <span className={`${TECH_BADGE} border-down/40 bg-down-soft text-down`}>
                📉 逆PO
              </span>
            ) : null}
            {tech.bbWalk === "up" ? (
              <span className={`${TECH_BADGE} border-up/40 bg-up-soft text-up`}>
                📊 +2σバンドウォーク
              </span>
            ) : null}
            {tech.bbWalk === "down" ? (
              <span className={`${TECH_BADGE} border-down/40 bg-down-soft text-down`}>
                📊 -2σバンドウォーク
              </span>
            ) : null}
            {tech.volSurge === 3 ? (
              <span className={`${TECH_BADGE} border-up/40 bg-up-soft text-up`}>
                🔊 出来高5倍↑
              </span>
            ) : null}
            {tech.volSurge === 2 ? (
              <span className={`${TECH_BADGE} border-up/40 bg-up-soft text-up`}>
                🔊 出来高3倍↑
              </span>
            ) : null}
            {tech.volSurge === 1 ? (
              <span className={`${TECH_BADGE} border-up/40 bg-up-soft text-up`}>
                🔊 出来高2倍↑
              </span>
            ) : null}
            {tech.pullback ? (
              <span className={`${TECH_BADGE} border-up/30 bg-up-soft text-up`}>
                🎯 {tech.pullback}
              </span>
            ) : null}
            {tech.pattern ? (
              <span className={`${TECH_BADGE} border-line bg-panel2 text-ink`}>
                {tech.pattern}
              </span>
            ) : null}
            {tech.signal ? (
              <span className={`${TECH_BADGE} border-copper/40 bg-copper-soft text-copper`}>
                {tech.signal}
              </span>
            ) : null}
            {tech.daytrade ? (
              <span className={`${TECH_BADGE} border-up/30 bg-up-soft text-up`}>
                ⚡ {tech.daytrade}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="type-meta mb-1.5 font-bold md:mb-2">値動きチャート</div>
        <div className="mb-5 md:mb-6">
          <StockPriceChart symbol={symbol} />
        </div>

        <div className="type-meta mb-2 font-bold md:mb-2.5">期間別騰落率</div>
        <div className="mb-5 grid grid-cols-3 gap-2 md:mb-6 md:gap-2.5">
          {TRACKER_PERIODS.map((p) => {
            const v = stockPeriodRet(symbol, p.id as TrackerPeriodId);
            return (
              <div
                key={p.id}
                className="rounded-lg border border-line bg-panel2 px-2 py-2 text-center md:px-3 md:py-2.5"
              >
                <div className="type-meta">{p.label}</div>
                <div className={`type-mono-value mt-0.5 ${pctColor(v)}`}>{fmtPct(v)}</div>
              </div>
            );
          })}
        </div>

        {tech ? <StockTechGrid tech={tech} /> : null}

        {linkHits.length > 0 ? (
          <div className="mb-5 md:mb-6">
            <div className="type-meta mb-2 font-bold md:mb-2.5">
              米国テーマ連動内訳({linkHits.length})
            </div>
            <div className="space-y-2 md:space-y-2.5">
              {linkHits.map((hit) => (
                <div
                  key={hit.theme}
                  className={`rounded-lg border px-3 py-2.5 md:px-4 md:py-3 ${hit.triggered ? "border-up/30 bg-up-soft/40" : "border-line bg-panel2"}`}
                >
                  <div className="type-list-primary font-bold">{hit.sub}</div>
                  <div className="type-meta mt-0.5">{hit.macro}</div>
                  <div className="type-body-sm mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 font-mono md:mt-2 md:gap-x-5">
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
          <div className="mb-5 md:mb-6">
            <div className="type-meta mb-2 font-bold md:mb-2.5">
              属するテーマ/タグ({themes.length + tags.length})
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {themes.map((t) => (
                <span
                  key={t.label}
                  className="type-body-sm rounded-full border border-line bg-panel2 px-2.5 py-0.5 md:px-3 md:py-1"
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
                  className="type-body-sm rounded-full border border-copper/30 bg-copper-soft px-2.5 py-0.5 text-copper md:px-3 md:py-1"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {onNavigate ? (
          <div className="mb-5 md:mb-6">
            <div className="type-meta mb-2 font-bold md:mb-2.5">他のページで見る</div>
            <div className="grid grid-cols-2 gap-2 md:gap-2.5">
              <button
                type="button"
                onClick={() => nav("vol")}
                className="type-body-sm rounded-lg border border-line bg-panel2 px-3 py-2.5 hover:bg-card md:py-3"
              >
                📊 出来高率
              </button>
              <button
                type="button"
                onClick={() => nav("ret")}
                className="type-body-sm rounded-lg border border-line bg-panel2 px-3 py-2.5 hover:bg-card md:py-3"
              >
                📈 騰落率
              </button>
              <button
                type="button"
                onClick={() => nav("link")}
                className="type-body-sm rounded-lg border border-line bg-panel2 px-3 py-2.5 hover:bg-card md:py-3"
              >
                🔗 連動
              </button>
              <button
                type="button"
                onClick={() => nav("theme")}
                className="type-body-sm rounded-lg border border-line bg-panel2 px-3 py-2.5 hover:bg-card md:py-3"
              >
                🗂️ テーマ
              </button>
            </div>
          </div>
        ) : null}

        <div className="type-meta mb-2 font-bold">外部サイト</div>
        <div className="flex flex-wrap gap-2 md:gap-2.5">
          {externalLinks(symbol, row.market).map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="type-body-sm rounded-lg border border-line bg-card px-3 py-1.5 hover:bg-panel2 md:px-4 md:py-2"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="type-meta mt-4 md:mt-5">
          {periodLabel("1M")}などの騰落率は期間始値=0%の累積値です。
        </p>
      </div>
    </div>
  );
}
