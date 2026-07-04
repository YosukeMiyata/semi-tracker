import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { fmtPct, pctColor } from "~/lib/data";
import { searchByTag, searchStocks } from "~/lib/tracker";

export function StockSearch({
  onPick,
  tagPrefill,
}: {
  onPick: (symbol: string) => void;
  tagPrefill?: string;
}) {
  const [query, setQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => searchStocks(query), [query]);
  const tagHits = useMemo(() => searchByTag(tagQuery), [tagQuery]);

  useEffect(() => {
    if (!tagPrefill) {
      return;
    }
    setTagQuery(tagPrefill);
    tagInputRef.current?.focus();
    tagInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tagPrefill]);

  const pick = (symbol: string) => {
    setQuery("");
    setTagQuery("");
    onPick(symbol);
  };

  const showStock = query.trim().length > 0;
  const showTag = tagQuery.trim().length > 0;

  return (
    <div className="space-y-2">
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
            className="w-full rounded-card border border-line bg-panel2 py-2.5 pr-3 pl-9 text-[13px] text-ink placeholder:text-faint focus-visible:border-copper focus-visible:outline-none"
          />
        </div>
        {showStock && hits.length > 0 ? (
          <SearchDropdown>
            {hits.map((hit) => (
              <SearchRow key={hit.symbol} hit={hit} onPick={pick} />
            ))}
          </SearchDropdown>
        ) : null}
        {showStock && hits.length === 0 ? (
          <SearchDropdown>
            <div className="px-3 py-2.5 text-[12.5px] text-ink-2">該当する銘柄がありません</div>
          </SearchDropdown>
        ) : null}
      </div>

      <div className="relative">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-ink-2">
            🏷️
          </span>
          <input
            ref={tagInputRef}
            type="search"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="タグ(例: 先端パッケージング / MLCC / PCB / テスト)"
            autoComplete="off"
            className="w-full rounded-card border border-line bg-panel2 py-2.5 pr-3 pl-9 text-[13px] text-ink placeholder:text-faint focus-visible:border-copper focus-visible:outline-none"
          />
        </div>
        {showTag && tagHits.length > 0 ? (
          <SearchDropdown>
            {tagHits.map((hit) => (
              <button
                key={hit.symbol}
                type="button"
                onClick={() => pick(hit.symbol)}
                className="flex w-full items-center gap-2 border-line border-b px-3 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-panel2"
              >
                <span
                  className={`min-w-[52px] font-mono font-semibold text-[12px] ${hit.market === "jp" ? "text-copper" : "text-us"}`}
                >
                  {hit.symbol}
                </span>
                <span className="min-w-0 flex-1 truncate">{hit.name}</span>
                <span className="rounded bg-copper-soft px-1.5 py-0.5 text-[10px] text-copper">
                  {hit.matchedTag}
                </span>
                <span className={`font-mono text-[12px] ${pctColor(hit.chgPct)}`}>
                  {fmtPct(hit.chgPct)}
                </span>
              </button>
            ))}
          </SearchDropdown>
        ) : null}
        {showTag && tagHits.length === 0 ? (
          <SearchDropdown>
            <div className="px-3 py-2.5 text-[12.5px] text-ink-2">該当するタグがありません</div>
          </SearchDropdown>
        ) : null}
      </div>
    </div>
  );
}

function SearchDropdown({ children }: { children: ReactNode }) {
  return (
    <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-20 max-h-[280px] overflow-y-auto rounded-card border border-line bg-card shadow-[0_8px_24px_rgba(0,0,0,.5)]">
      {children}
    </div>
  );
}

function SearchRow({
  hit,
  onPick,
}: {
  hit: { symbol: string; name: string; market: "jp" | "us"; chgPct: number | null };
  onPick: (symbol: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(hit.symbol)}
      className="flex w-full items-center gap-2 border-line border-b px-3 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-panel2"
    >
      <span
        className={`min-w-[52px] font-mono font-semibold text-[12px] ${hit.market === "jp" ? "text-copper" : "text-us"}`}
      >
        {hit.symbol}
      </span>
      <span className="min-w-0 flex-1 truncate">{hit.name}</span>
      <span className={`font-mono text-[12px] ${pctColor(hit.chgPct)}`}>{fmtPct(hit.chgPct)}</span>
    </button>
  );
}
