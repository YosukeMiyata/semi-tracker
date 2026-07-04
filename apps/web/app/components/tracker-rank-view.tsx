"use client";

import { useMemo, useState } from "react";
import { ChipGroup, MultiChipGroup } from "~/components/chip-group";
import { fmtPct, pctColor } from "~/lib/data";
import { highlightRowClass } from "~/lib/highlight";
import { analyzeStock, BULL_PATTERNS } from "~/lib/technical";
import {
  allStockRows,
  macroSectorOptions,
  type StockRow,
  sectorSymbolSet,
  speProcessSymbolSet,
  subSymbolSet,
} from "~/lib/tracker";
import themesMaster from "../../../../data/themes.json";

type RankMarket = "all" | "jp" | "us";

const MARKET_OPTS = [
  { id: "all" as const, label: "両方" },
  { id: "jp" as const, label: "日本" },
  { id: "us" as const, label: "米国" },
];

const PATTERN_OPTS = [
  { id: "all", label: "すべて" },
  { id: "直近高値ブレイク", label: "直近高値ブレイク" },
  { id: "直近高値ブレイクリーチ", label: "直近高値ブレイクリーチ" },
  { id: "52週高値更新", label: "52週高値" },
  { id: "三角ブレイク", label: "三角ブレイク" },
  { id: "三角ブレイクリーチ", label: "三角ブレイクリーチ" },
  { id: "CWH押し目/抜け", label: "CWH押し目/抜け" },
  { id: "CWH形成中", label: "CWH形成中" },
  { id: "フラッグブレイク", label: "フラッグ" },
  { id: "逆三尊・底打ち", label: "逆三尊" },
  { id: "三尊・天井注意", label: "三尊" },
  { id: "ダブルボトム", label: "ダブル底(W)" },
  { id: "ダブルトップ", label: "ダブル天井(M)" },
  { id: "トリプルボトム", label: "トリプル底" },
  { id: "トリプルトップ", label: "トリプル天井" },
  { id: "52週安値圏", label: "安値圏" },
];

const SIGNAL_OPTS = [
  { id: "all", label: "すべて" },
  { id: "po", label: "📈パーフェクトオーダー" },
  { id: "bbwalk", label: "📊+2σバンドウォーク" },
  { id: "vol2", label: "🔊出来高2倍↑" },
  { id: "vol3", label: "🔊出来高3倍↑" },
  { id: "vol5", label: "🔊出来高5倍↑" },
  { id: "pullback", label: "🎯押し目(全部)" },
  { id: "pb5", label: "5日線押し目" },
  { id: "pb25", label: "25日線押し目" },
  { id: "pb50", label: "50日線押し目" },
  { id: "pb75", label: "75日線押し目" },
  { id: "inflow", label: "資金流入急増" },
  { id: "overheat", label: "過熱注意" },
];

const macros = (
  themesMaster as { macro: { key: string; name: string; subs: { name: string }[] }[] }
).macro;

function matchSignals(
  tech: NonNullable<ReturnType<typeof analyzeStock>>,
  signals: Set<string>,
): boolean {
  for (const sig of signals) {
    if (sig === "po" && !tech.po) {
      return false;
    }
    if (sig === "pullback" && !tech.pullback) {
      return false;
    }
    if (sig === "bbwalk" && tech.bbWalk !== "up") {
      return false;
    }
    if (sig === "vol2" && tech.volSurge < 1) {
      return false;
    }
    if (sig === "vol3" && tech.volSurge < 2) {
      return false;
    }
    if (sig === "vol5" && tech.volSurge < 3) {
      return false;
    }
    if (sig === "pb5" && tech.pullbackMa !== 5) {
      return false;
    }
    if (sig === "pb25" && tech.pullbackMa !== 25) {
      return false;
    }
    if (sig === "pb50" && tech.pullbackMa !== 50) {
      return false;
    }
    if (sig === "pb75" && tech.pullbackMa !== 75) {
      return false;
    }
    if (sig === "inflow" && tech.daytrade !== "資金流入急増") {
      return false;
    }
    if (sig === "overheat" && tech.signal !== "過熱") {
      return false;
    }
  }
  return true;
}

export function RankView({
  onPickStock,
  highlightSymbol = null,
}: {
  onPickStock: (symbol: string) => void;
  highlightSymbol?: string | null;
}) {
  const [sector, setSector] = useState("all");
  const [sub, setSub] = useState("all");
  const [market, setMarket] = useState<RankMarket>("all");
  const [patterns, setPatterns] = useState<Set<string>>(new Set());
  const [signals, setSignals] = useState<Set<string>>(new Set());

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
        const tech = analyzeStock(r.symbol);
        if (!tech) {
          return [];
        }
        if (patterns.size > 0 && (!tech.pattern || !patterns.has(tech.pattern))) {
          return [];
        }
        if (signals.size > 0 && !matchSignals(tech, signals)) {
          return [];
        }
        return [{ ...r, tech }];
      })
      .sort((a, b) => (b.tech.chgPct ?? -999) - (a.tech.chgPct ?? -999));
  }, [sector, sub, market, patterns, signals]);

  const togglePattern = (id: string) => {
    if (id === "all") {
      setPatterns(new Set());
      return;
    }
    setPatterns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSignal = (id: string) => {
    if (id === "all") {
      setSignals(new Set());
      return;
    }
    setSignals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <p className="text-[12px] text-ink-2 leading-[1.55]">
        パターン・シグナルで銘柄を絞り込み。並び順は前日比の大きい順。※チャートパターンは各銘柄の直近の値動きから固定判定(騰落率の期間とは無関係)。
      </p>

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

      <MultiChipGroup
        label="チャートパターンで絞る"
        options={PATTERN_OPTS}
        selected={patterns}
        onToggle={togglePattern}
        wrap
      />

      <MultiChipGroup
        label="注目シグナルで絞る(複数タップでAND検索)"
        options={SIGNAL_OPTS}
        selected={signals}
        onToggle={toggleSignal}
        wrap
      />

      <div className="overflow-hidden rounded-card border border-line bg-card">
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-[12.5px] text-ink-2">該当する銘柄がありません</p>
        ) : (
          rows.map((r, i) => (
            <RankRow
              key={r.symbol}
              row={r}
              rank={i + 1}
              onPick={onPickStock}
              showTags={patterns.size > 0 || signals.size > 0}
              highlightSymbol={highlightSymbol}
            />
          ))
        )}
      </div>
    </>
  );
}

function RankRow({
  row,
  rank,
  onPick,
  showTags,
  highlightSymbol,
}: {
  row: StockRow & { tech: NonNullable<ReturnType<typeof analyzeStock>> };
  rank: number;
  onPick: (symbol: string) => void;
  showTags: boolean;
  highlightSymbol: string | null;
}) {
  const { tech } = row;
  const pat = tech.pattern;
  const bull = pat ? BULL_PATTERNS.has(pat) : false;

  return (
    <button
      type="button"
      data-symbol={row.symbol}
      onClick={() => onPick(row.symbol)}
      className={`flex w-full items-center gap-2 border-line border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-panel2 ${highlightRowClass(row.symbol, highlightSymbol)}`}
    >
      <span className="w-6 font-mono text-[11px] text-ink-2">{rank}</span>
      <span
        className={`w-[52px] shrink-0 font-mono font-bold text-[12px] ${row.market === "jp" ? "text-copper" : "text-us"}`}
      >
        {row.symbol}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px]">
        {row.name}
        {showTags && pat ? (
          <span
            className={`ml-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] ${bull ? "bg-up-soft text-up" : "bg-down-soft text-down"}`}
          >
            {pat}
          </span>
        ) : null}
        {showTags && tech.po ? (
          <span className="ml-1 inline-block rounded bg-copper-soft px-1.5 py-0.5 text-[10px] text-copper">
            PO
          </span>
        ) : null}
      </span>
      <span className={`font-mono font-semibold text-[13px] ${pctColor(tech.chgPct)}`}>
        {fmtPct(tech.chgPct)}
      </span>
    </button>
  );
}
