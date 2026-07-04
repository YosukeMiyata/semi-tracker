"use client";

import { useMemo, useState } from "react";
import { ChipGroup } from "~/components/chip-group";
import { fmtPct, pctColor } from "~/lib/data";
import { highlightRowClass } from "~/lib/highlight";
import {
  allStockRows,
  macroSectorOptions,
  sectorSymbolSet,
  speProcessSymbolSet,
  stockPeriodRet,
  subSymbolSet,
  TRACKER_PERIODS,
  type TrackerPeriodId,
} from "~/lib/tracker";
import themesMaster from "../../../../data/themes.json";

type RetMarket = "all" | "jp" | "us";

const MARKET_OPTS = [
  { id: "all" as const, label: "両方" },
  { id: "jp" as const, label: "日本" },
  { id: "us" as const, label: "米国" },
];

const macros = (
  themesMaster as { macro: { key: string; name: string; subs: { name: string }[] }[] }
).macro;

export function RetView({
  onPickStock,
  highlightSymbol = null,
}: {
  onPickStock: (symbol: string) => void;
  highlightSymbol?: string | null;
}) {
  const [period, setPeriod] = useState<TrackerPeriodId>("3M");
  const [sector, setSector] = useState("all");
  const [sub, setSub] = useState("all");
  const [market, setMarket] = useState<RetMarket>("all");

  const subOptions = useMemo(() => {
    if (sector === "all") {
      return [];
    }
    const m = macros.find((x) => x.key === sector);
    if (!m) {
      return [];
    }
    if (sector === "spe") {
      return [
        { id: "all", label: "▼ 製造装置・全部" },
        { id: "proc:front", label: "前工程" },
        { id: "proc:middle", label: "中工程・先端パッケージング" },
        { id: "proc:back", label: "後工程" },
        ...m.subs.map((s) => ({ id: s.name, label: s.name })),
      ];
    }
    return [
      { id: "all", label: `▼ ${m.name}・全部` },
      ...m.subs.map((s) => ({ id: s.name, label: s.name })),
    ];
  }, [sector]);

  const rows = useMemo(() => {
    let secSet: Set<string> | null = sector === "all" ? null : sectorSymbolSet(sector);
    if (sector !== "all" && sub !== "all") {
      if (sub.startsWith("proc:")) {
        const pk = sub.slice(5) as "front" | "middle" | "back";
        secSet = speProcessSymbolSet(pk) ?? secSet;
      } else {
        secSet = subSymbolSet(sector, sub) ?? secSet;
      }
    }

    return allStockRows()
      .flatMap((r) => {
        if (market !== "all" && r.market !== market) {
          return [];
        }
        if (secSet && !secSet.has(r.symbol)) {
          return [];
        }
        const ret = stockPeriodRet(r.symbol, period);
        if (ret === null) {
          return [];
        }
        return [{ ...r, ret }];
      })
      .sort((a, b) => b.ret - a.ret);
  }, [period, sector, sub, market]);

  const plabel = TRACKER_PERIODS.find((p) => p.id === period)?.label ?? period;
  const n = rows.length;
  const leadCut = Math.ceil(n * 0.2);
  const lagCut = Math.floor(n * 0.8);

  return (
    <>
      <p className="text-[12px] text-ink-2 leading-[1.55]">
        選んだ期間の騰落率ランキング。同セクターで絞れば「誰が先行・誰が出遅れ」が分かる。
      </p>

      <ChipGroup
        label="期間(この期間の騰落率で並べ替え)"
        options={TRACKER_PERIODS}
        value={period}
        onChange={setPeriod}
      />

      <ChipGroup
        label="セクター(マクロ)で絞る"
        options={macroSectorOptions()}
        value={sector}
        onChange={(id) => {
          setSector(id);
          setSub("all");
        }}
        wrap
      />

      {subOptions.length > 0 ? (
        <ChipGroup
          label="サブテーマ / 工程"
          options={subOptions}
          value={sub}
          onChange={setSub}
          wrap
        />
      ) : null}

      <ChipGroup label="市場" options={MARKET_OPTS} value={market} onChange={setMarket} />

      <div className="overflow-hidden rounded-card border border-line bg-card">
        <div className="border-line border-b px-3 py-2 font-bold text-[12.5px]">
          {plabel} 騰落率ランキング
        </div>
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-[12.5px] text-ink-2">該当する銘柄がありません</p>
        ) : (
          rows.map((r, i) => {
            let tag: string | null = null;
            if (i < leadCut) {
              tag = "先行";
            } else if (i >= lagCut) {
              tag = "出遅れ";
            }
            return (
              <button
                key={r.symbol}
                type="button"
                data-symbol={r.symbol}
                onClick={() => onPickStock(r.symbol)}
                className={`flex w-full items-center gap-2 border-line border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-[#FBFBFC] ${highlightRowClass(r.symbol, highlightSymbol)}`}
              >
                <span className="w-6 font-mono text-[11px] text-ink-2">{i + 1}</span>
                <span
                  className={`w-[52px] shrink-0 font-mono font-bold text-[12px] ${r.market === "jp" ? "text-copper" : "text-[#7A52E0]"}`}
                >
                  {r.symbol}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px]">
                  {r.name}
                  {tag ? (
                    <span
                      className={`ml-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] ${tag === "先行" ? "bg-up-soft text-up" : "bg-down-soft text-down"}`}
                    >
                      {tag}
                    </span>
                  ) : null}
                </span>
                <span className={`font-mono font-semibold text-[13px] ${pctColor(r.ret)}`}>
                  {fmtPct(r.ret)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
