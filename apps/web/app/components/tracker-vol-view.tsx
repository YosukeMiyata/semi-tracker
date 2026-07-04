import { useMemo, useState } from "react";
import { ChipGroup } from "~/components/chip-group";
import { fmtPct, pctColor } from "~/lib/data";
import { highlightRowClass } from "~/lib/highlight";
import { allStockRows, type StockRow } from "~/lib/tracker";

type VolMarket = "all" | "jp" | "us";
type VolSort = "chg" | "volRatio";
type VolDir = "desc" | "asc";

const MARKET_OPTS = [
  { id: "all" as const, label: "すべて" },
  { id: "jp" as const, label: "日本" },
  { id: "us" as const, label: "米国" },
];

const SORT_OPTS = [
  { id: "chg" as const, label: "前日比" },
  { id: "volRatio" as const, label: "出来高率" },
];

const DIR_OPTS = [
  { id: "desc" as const, label: "多い順 ↓" },
  { id: "asc" as const, label: "少ない順 ↑" },
];

function sortRows(rows: StockRow[], sort: VolSort, dir: VolDir): StockRow[] {
  return [...rows]
    .filter((r) => (sort === "chg" ? r.chgPct : r.volRatio) !== null)
    .sort((a, b) => {
      const av = (sort === "chg" ? a.chgPct : a.volRatio) ?? 0;
      const bv = (sort === "chg" ? b.chgPct : b.volRatio) ?? 0;
      return dir === "desc" ? bv - av : av - bv;
    });
}

export function VolView({
  onPickStock,
  highlightSymbol = null,
}: {
  onPickStock: (symbol: string) => void;
  highlightSymbol?: string | null;
}) {
  const [market, setMarket] = useState<VolMarket>("all");
  const [sort, setSort] = useState<VolSort>("volRatio");
  const [dir, setDir] = useState<VolDir>("desc");

  const rows = useMemo(() => {
    let list = allStockRows();
    if (market !== "all") {
      list = list.filter((r) => r.market === market);
    }
    return sortRows(list, sort, dir);
  }, [market, sort, dir]);

  return (
    <>
      <p className="text-[12px] text-ink-2 leading-[1.55]">
        出来高率=本日出来高÷20日平均(相対)。2倍超=資金流入の兆し。発行株数に依存しない正確な指標。
      </p>
      <ChipGroup label="市場" options={MARKET_OPTS} value={market} onChange={setMarket} />
      <ChipGroup label="並び替え" options={SORT_OPTS} value={sort} onChange={setSort} />
      <ChipGroup label="順序" options={DIR_OPTS} value={dir} onChange={setDir} />

      <div className="overflow-hidden rounded-card border border-line bg-card">
        <div className="grid grid-cols-[28px_1fr_auto_auto] gap-2 border-line border-b px-3 py-2 text-[10.5px] text-ink-2">
          <span>#</span>
          <span>銘柄</span>
          <span className="text-right">前日比</span>
          <span className="text-right">出来高率</span>
        </div>
        {rows.map((r, i) => {
          const hot = r.volRatio !== null && r.volRatio >= 2;
          return (
            <button
              key={r.symbol}
              type="button"
              data-symbol={r.symbol}
              onClick={() => onPickStock(r.symbol)}
              className={`grid w-full grid-cols-[28px_1fr_auto_auto] items-center gap-2 border-line border-b px-3 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-[#FBFBFC] ${highlightRowClass(r.symbol, highlightSymbol)}`}
            >
              <span className="font-mono text-[11px] text-ink-2">{i + 1}</span>
              <span className="min-w-0 truncate">
                <span
                  className={`font-mono font-bold text-[12px] ${r.market === "jp" ? "text-copper" : "text-[#7A52E0]"}`}
                >
                  {r.symbol}
                </span>{" "}
                <span className="text-[12px]">{r.name}</span>
              </span>
              <span className={`font-mono text-[12px] ${pctColor(r.chgPct)}`}>
                {fmtPct(r.chgPct)}
              </span>
              <span className={`font-mono text-[12px] ${hot ? "font-bold text-up" : ""}`}>
                {r.volRatio !== null ? `${r.volRatio.toFixed(1)}×` : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
