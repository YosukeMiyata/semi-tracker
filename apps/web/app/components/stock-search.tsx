import { useMemo, useState } from "react";
import { fmtPct, pctColor } from "~/lib/data";
import { searchStocks } from "~/lib/tracker";

export function StockSearch({ onPick }: { onPick: (symbol: string) => void }) {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => searchStocks(query), [query]);

  const pick = (symbol: string) => {
    setQuery("");
    onPick(symbol);
  };

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-ink-2">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="銘柄コード・名前で検索(例: 6146 / ディスコ / レーザー)"
          autoComplete="off"
          className="w-full rounded-card border border-line bg-card py-2.5 pr-3 pl-9 text-[13px] text-ink placeholder:text-ink-2 focus-visible:border-copper focus-visible:outline-none"
        />
      </div>
      {query.trim() && hits.length > 0 ? (
        <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-20 max-h-[280px] overflow-y-auto rounded-card border border-line bg-card shadow-[0_8px_24px_rgba(23,28,38,.12)]">
          {hits.map((hit) => (
            <button
              key={hit.symbol}
              type="button"
              onClick={() => pick(hit.symbol)}
              className="flex w-full items-center gap-2 border-line border-b px-3 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-[#FBFBFC]"
            >
              <span
                className={`min-w-[52px] font-mono font-semibold text-[12px] ${hit.market === "jp" ? "text-copper" : "text-[#7A52E0]"}`}
              >
                {hit.symbol}
              </span>
              <span className="min-w-0 flex-1 truncate">{hit.name}</span>
              <span className={`font-mono text-[12px] ${pctColor(hit.chgPct)}`}>
                {fmtPct(hit.chgPct)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {query.trim() && hits.length === 0 ? (
        <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-20 rounded-card border border-line bg-card px-3 py-2.5 text-[12.5px] text-ink-2 shadow-[0_8px_24px_rgba(23,28,38,.12)]">
          該当する銘柄がありません
        </div>
      ) : null}
    </div>
  );
}
