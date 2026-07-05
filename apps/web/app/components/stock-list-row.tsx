import type { ReactNode } from "react";
import { fmtPct, pctColor } from "~/lib/data";
import { highlightRowClass } from "~/lib/highlight";

const CODE_W = "w-[54px]";
const RANK_W = "w-7";
const PCT_W = "min-w-[4.75rem]";

/** v1: ネイビー矩形なし。上線＋行区切りのみ */
export function StockListShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`border-line border-t ${className}`}>{children}</div>;
}

export function StockListGroupLabel({ children }: { children: ReactNode }) {
  return <div className="type-meta mb-1 md:mb-1.5">{children}</div>;
}

export function StockSymbol({ symbol, market }: { symbol: string; market: "jp" | "us" }) {
  return (
    <span
      className={`${CODE_W} type-mono-code shrink-0 ${market === "jp" ? "text-copper" : "text-us"}`}
    >
      {symbol}
    </span>
  );
}

const rowBase =
  "flex w-full items-center gap-2.5 border-line border-b py-3 text-left last:border-b-0 hover:bg-panel2/35 md:gap-3 md:py-4";

/** v1 踏襲: 順位 | コード | 名称 | 騰落率 */
export function StockRankListRow({
  rank,
  symbol,
  name,
  market,
  pct,
  onClick,
  highlightSymbol = null,
  trailing,
}: {
  rank: number;
  symbol: string;
  name: string;
  market: "jp" | "us";
  pct: number | null;
  onClick: () => void;
  highlightSymbol?: string | null;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      data-symbol={symbol}
      onClick={onClick}
      className={`${rowBase} ${highlightRowClass(symbol, highlightSymbol)}`}
    >
      <span
        className={`${RANK_W} shrink-0 font-mono font-semibold text-[12px] text-copper md:text-[13px]`}
      >
        {rank}
      </span>
      <StockSymbol symbol={symbol} market={market} />
      <span className="type-list-primary min-w-0 flex-1 truncate">
        {name}
        {trailing}
      </span>
      <span className={`${PCT_W} type-mono-value shrink-0 text-right ${pctColor(pct)}`}>
        {fmtPct(pct)}
      </span>
    </button>
  );
}

/** v1 踏襲: テーマ展開内の銘柄行(日本株は note 列あり) */
export function StockThemeListRow({
  symbol,
  name,
  market,
  pct,
  note,
  onClick,
}: {
  symbol: string;
  name: string;
  market: "jp" | "us";
  pct: number | null;
  note?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-symbol={symbol}
      onClick={onClick}
      className={`${rowBase} py-2 focus-visible:outline-2 focus-visible:outline-copper focus-visible:-outline-offset-2`}
    >
      <StockSymbol symbol={symbol} market={market} />
      <span className="type-list-primary min-w-0 shrink">{name}</span>
      {note ? (
        <span className="type-body-sm min-w-0 flex-1 truncate">{note}</span>
      ) : (
        <span className="flex-1" aria-hidden />
      )}
      <span className={`${PCT_W} type-mono-value shrink-0 text-right ${pctColor(pct)}`}>
        {fmtPct(pct)}
      </span>
    </button>
  );
}

export const stockListVolGridClass =
  "grid w-full grid-cols-[28px_54px_minmax(0,1fr)_auto_auto] items-center gap-x-2.5 border-line border-b py-3 text-left last:border-b-0 hover:bg-panel2/35 md:gap-x-3 md:py-3.5";

export const stockListVolHeaderClass =
  "type-meta grid grid-cols-[28px_54px_minmax(0,1fr)_auto_auto] gap-x-2.5 border-line border-b py-2 md:py-2.5";

/** 検索ドロップダウン用(v1 行レイアウト) */
export function StockSearchListRow({
  symbol,
  name,
  market,
  pct,
  badge,
  onClick,
}: {
  symbol: string;
  name: string;
  market: "jp" | "us";
  pct: number | null;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${rowBase} px-3 focus-visible:outline-2 focus-visible:outline-copper focus-visible:-outline-offset-2`}
    >
      <StockSymbol symbol={symbol} market={market} />
      <span className="type-list-primary min-w-0 flex-1 truncate">{name}</span>
      {badge ? (
        <span className="type-meta shrink-0 rounded bg-copper-soft px-1.5 py-0.5 text-copper">
          {badge}
        </span>
      ) : null}
      <span className={`${PCT_W} type-mono-value shrink-0 text-right ${pctColor(pct)}`}>
        {fmtPct(pct)}
      </span>
    </button>
  );
}
