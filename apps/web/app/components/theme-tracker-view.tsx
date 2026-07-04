"use client";

import { useEffect, useMemo, useState } from "react";
import { ChipGroup } from "~/components/chip-group";
import { Sparkline } from "~/components/sparkline";
import { StockSearch } from "~/components/stock-search";
import { StockSheet } from "~/components/stock-sheet";
import { TrackerChart, TrackerChartLegend } from "~/components/tracker-chart";
import { TrackerCopySummary } from "~/components/tracker-copy-summary";
import { FlowView } from "~/components/tracker-flow-view";
import { LinkView } from "~/components/tracker-link-view";
import { ProcView } from "~/components/tracker-proc-view";
import { RankView } from "~/components/tracker-rank-view";
import { RetView } from "~/components/tracker-ret-view";
import { VolView } from "~/components/tracker-vol-view";
import { fmtPct, pctColor, volTier } from "~/lib/data";
import {
  periodLabel,
  rankedThemes,
  sparkFromSeries,
  stockPeriodRet,
  stockRowLabel,
  stockVolRatio,
  subAvg,
  TRACKER_MARKETS,
  TRACKER_PERIODS,
  TRACKER_VIEWS,
  type TrackerMarket,
  type TrackerPeriodId,
  type TrackerView,
  trackerLastUpdated,
} from "~/lib/tracker";

function StockChip({
  code,
  name,
  period,
  onPick,
}: {
  code: string;
  name: string;
  period: TrackerPeriodId;
  onPick: (symbol: string) => void;
}) {
  const ret = stockPeriodRet(code, period);
  const vol = stockVolRatio(code);
  const tier = volTier(vol);

  return (
    <button
      type="button"
      data-symbol={code}
      title={`${name}(${code}) ${periodLabel(period)} ${fmtPct(ret)} / 出来高 ${vol ?? "—"}×`}
      onClick={() => onPick(code)}
      className={`mt-0.5 mr-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] ${
        ret !== null && ret < 0 ? "border-[#BFD3EA] bg-down-soft" : "border-[#EBC3BF] bg-up-soft"
      }`}
    >
      {name}
      <span className={`font-mono font-semibold ${pctColor(ret)}`}>{fmtPct(ret, 0)}</span>
      {tier !== null ? (
        <span className="rounded bg-copper-soft px-1 font-bold text-[9.5px] text-copper">
          出来高{tier}×
        </span>
      ) : null}
    </button>
  );
}

function SubBlock({
  sub,
  period,
  market,
  onPick,
}: {
  sub: import("~/lib/tracker").RankedTheme["subs"][number];
  period: TrackerPeriodId;
  market: TrackerMarket;
  onPick: (symbol: string) => void;
}) {
  const avg = subAvg(sub, period, market);
  const showUs = market !== "jp";
  const showJp = market !== "us";

  return (
    <div className="border-line border-b py-2 last:border-b-0">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-bold text-[12.5px]">{sub.name}</span>
        <span className={`font-mono font-semibold text-[12px] ${pctColor(avg)}`}>
          {fmtPct(avg)}
        </span>
      </div>
      {showUs && sub.us.length > 0 ? (
        <>
          <div className="mb-0.5 text-[10.5px] text-ink-2">米国株</div>
          {sub.us.map((row) => {
            const s = stockRowLabel(row, "us");
            return (
              <StockChip key={s.code} code={s.code} name={s.name} period={period} onPick={onPick} />
            );
          })}
        </>
      ) : null}
      {showJp && sub.jp.length > 0 ? (
        <>
          <div className="mb-0.5 text-[10.5px] text-ink-2">連動日本株</div>
          {sub.jp.map((row) => {
            const s = stockRowLabel(row, "jp");
            return (
              <StockChip key={s.code} code={s.code} name={s.name} period={period} onPick={onPick} />
            );
          })}
        </>
      ) : null}
      {showJp && sub.solo.length > 0 ? (
        <>
          <div className="mb-0.5 text-[10.5px] text-ink-2">日本単独テーマ</div>
          {sub.solo.map((row) => {
            const s = stockRowLabel(row, "jp");
            return (
              <StockChip key={s.code} code={s.code} name={s.name} period={period} onPick={onPick} />
            );
          })}
        </>
      ) : null}
    </div>
  );
}

export function ThemeTrackerView() {
  const [view, setView] = useState<TrackerView>("theme");
  const [period, setPeriod] = useState<TrackerPeriodId>("1M");
  const [market, setMarket] = useState<TrackerMarket>("both");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [sheetSymbol, setSheetSymbol] = useState<string | null>(null);
  const [highlightSymbol, setHighlightSymbol] = useState<string | null>(null);
  const [tagPrefill, setTagPrefill] = useState<string | undefined>();

  const rows = useMemo(() => rankedThemes(period, market), [period, market]);
  const plabel = periodLabel(period);
  const pickStock = (symbol: string) => setSheetSymbol(symbol);

  const gotoView = (v: TrackerView, sym: string) => {
    setSheetSymbol(null);
    setView(v);
    setHighlightSymbol(sym);
  };

  useEffect(() => {
    if (!highlightSymbol) {
      return;
    }
    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-symbol="${highlightSymbol}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    const clear = window.setTimeout(() => setHighlightSymbol(null), 2500);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clear);
    };
  }, [highlightSymbol]);

  const viewAccent: Partial<Record<TrackerView, string>> = {
    theme: "border-[#6EE7F0] bg-[#6EE7F0] font-bold text-ink",
    rank: "border-copper bg-copper font-bold text-card",
    vol: "border-[#3E9B62] bg-[#3E9B62] font-bold text-card",
    ret: "border-[#E0A458] bg-[#E0A458] font-bold text-card",
    link: "border-up bg-up font-bold text-card",
    flow: "border-[#9D7CF0] bg-[#9D7CF0] font-bold text-card",
    proc: "border-[#D98A3E] bg-[#D98A3E] font-bold text-card",
  };

  return (
    <>
      <p className="mb-4 text-[12.5px] text-ink-2 leading-[1.55]">
        累積騰落率で、どのテーマに資金が来てどこから抜けたかを一望。タップでサブテーマ・連動日本株へ。
      </p>

      <StockSearch onPick={pickStock} tagPrefill={tagPrefill} />

      <div className="mt-3 space-y-3">
        <ChipGroup
          label="表示"
          options={TRACKER_VIEWS}
          value={view}
          onChange={setView}
          accent={viewAccent}
        />

        {view === "theme" ? (
          <>
            <ChipGroup label="期間" options={TRACKER_PERIODS} value={period} onChange={setPeriod} />
            <ChipGroup
              label="平均の対象"
              options={TRACKER_MARKETS}
              value={market}
              onChange={setMarket}
            />

            <div className="rounded-card border border-line bg-card px-3 pt-3 pb-2">
              <div className="mb-2 font-bold text-[13px]">{plabel} 累積騰落率(%) — テーマ平均</div>
              <TrackerChart themes={rows} />
              <TrackerChartLegend themes={rows} />
              <div className="mt-2 text-right font-mono text-[10.5px] text-ink-2">
                データ {trackerLastUpdated} 時点
              </div>
            </div>

            <div className="space-y-1.5">
              {rows.map((t, rank) => (
                <details
                  key={t.key}
                  open={openKey === t.key}
                  className="group"
                  onToggle={(e) => setOpenKey(e.currentTarget.open ? t.key : null)}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-card border border-line bg-card px-4 py-[11px] [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono font-bold text-[11px] text-card"
                      style={{ backgroundColor: t.color }}
                    >
                      {rank + 1}
                    </span>
                    <div className="min-w-0 flex-1 font-bold text-[13.5px]">
                      {t.name}
                      <small className="block font-normal text-[11px] text-ink-2">
                        サブテーマ {t.subs.length} 件
                      </small>
                    </div>
                    <Sparkline values={sparkFromSeries(t.series)} />
                    <div
                      className={`min-w-[64px] text-right font-mono font-semibold text-[14px] ${pctColor(t.avg)}`}
                    >
                      {fmtPct(t.avg)}
                    </div>
                  </summary>
                  <div className="mx-1 mt-[-8px] rounded-b-card border border-line border-t-0 bg-[#FBFBFC] px-3.5 pt-4 pb-2">
                    {t.subs.map((sub) => (
                      <SubBlock
                        key={sub.name}
                        sub={sub}
                        period={period}
                        market={market}
                        onPick={pickStock}
                      />
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <p className="text-[11px] text-ink-2 leading-[1.65]">
              出典: Stooq 日足(終値ベース)。{plabel}の累積騰落率=構成銘柄の単純平均。
              平均の対象で米国株のみ/日本株のみに切替可能です。
            </p>
          </>
        ) : null}

        {view === "rank" ? (
          <>
            <RankView onPickStock={pickStock} highlightSymbol={highlightSymbol} />
            <TrackerCopySummary />
          </>
        ) : null}
        {view === "vol" ? (
          <VolView onPickStock={pickStock} highlightSymbol={highlightSymbol} />
        ) : null}
        {view === "ret" ? (
          <RetView onPickStock={pickStock} highlightSymbol={highlightSymbol} />
        ) : null}
        {view === "link" ? (
          <LinkView onPickStock={pickStock} highlightSymbol={highlightSymbol} />
        ) : null}

        {view === "flow" ? <FlowView onPickStock={pickStock} /> : null}

        {view === "proc" ? <ProcView onPickStock={pickStock} /> : null}
      </div>

      {sheetSymbol ? (
        <StockSheet
          symbol={sheetSymbol}
          onClose={() => setSheetSymbol(null)}
          onNavigate={gotoView}
          onSearchTag={(tag) => {
            setTagPrefill(tag);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : null}
    </>
  );
}
