import { useMemo, useState } from "react";
import { ChipGroup } from "~/components/chip-group";
import {
  StockListShell,
  StockSymbol,
  stockListVolGridClass,
  stockListVolHeaderClass,
} from "~/components/stock-list-row";
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

      <StockListShell>
        <div className={stockListVolHeaderClass}>
          <span>#</span>
          <span>コード</span>
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
              className={`${stockListVolGridClass} ${highlightRowClass(r.symbol, highlightSymbol)}`}
            >
              <span className="font-mono font-semibold text-[12px] text-copper">{i + 1}</span>
              <StockSymbol symbol={r.symbol} market={r.market} />
              <span className="min-w-0 truncate text-[13.5px] font-medium">{r.name}</span>
              <span className={`font-mono font-bold text-[13.5px] ${pctColor(r.chgPct)}`}>
                {fmtPct(r.chgPct)}
              </span>
              <span
                className={`min-w-[3.5rem] text-right font-mono text-[13.5px] ${hot ? "font-bold text-up" : ""}`}
              >
                {r.volRatio !== null ? `${r.volRatio.toFixed(1)}×` : "—"}
              </span>
            </button>
          );
        })}
      </StockListShell>
    </>
  );
}
