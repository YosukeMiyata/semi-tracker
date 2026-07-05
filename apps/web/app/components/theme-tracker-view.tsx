"use client";

import { useEffect, useMemo, useState } from "react";
import { ChipGroup } from "~/components/chip-group";
import { Sparkline } from "~/components/sparkline";
import {
  StockListGroupLabel,
  StockListShell,
  StockThemeListRow,
} from "~/components/stock-list-row";
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
import { fmtPct, pctColor } from "~/lib/data";
import {
  periodLabel,
  rankedThemes,
  sparkFromSeries,
  stockPeriodRet,
  stockRowLabel,
  subAvg,
  TRACKER_MARKETS,
  TRACKER_PERIODS,
  TRACKER_VIEWS,
  type TrackerMarket,
  type TrackerPeriodId,
  type TrackerView,
  trackerLastUpdated,
} from "~/lib/tracker";

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
    <div className="border-line border-b py-3 last:border-b-0">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-bold text-[13.5px] md:text-[15px]">{sub.name}</span>
        <span className={`font-mono font-bold text-[13.5px] md:text-[15px] ${pctColor(avg)}`}>
          {fmtPct(avg)}
        </span>
      </div>
      {showUs && sub.us.length > 0 ? (
        <>
          <StockListGroupLabel>米国株</StockListGroupLabel>
          {sub.us.map((row) => {
            const s = stockRowLabel(row, "us");
            return (
              <StockThemeListRow
                key={s.code}
                symbol={s.code}
                name={s.name}
                market="us"
                pct={stockPeriodRet(s.code, period)}
                onClick={() => onPick(s.code)}
              />
            );
          })}
        </>
      ) : null}
      {showJp && sub.jp.length > 0 ? (
        <>
          <StockListGroupLabel>連動日本株</StockListGroupLabel>
          {sub.jp.map((row) => {
            const s = stockRowLabel(row, "jp");
            return (
              <StockThemeListRow
                key={s.code}
                symbol={s.code}
                name={s.name}
                market="jp"
                note={row.note}
                pct={stockPeriodRet(s.code, period)}
                onClick={() => onPick(s.code)}
              />
            );
          })}
        </>
      ) : null}
      {showJp && sub.solo.length > 0 ? (
        <>
          <StockListGroupLabel>日本単独テーマ</StockListGroupLabel>
          {sub.solo.map((row) => {
            const s = stockRowLabel(row, "jp");
            return (
              <StockThemeListRow
                key={s.code}
                symbol={s.code}
                name={s.name}
                market="jp"
                note={row.note}
                pct={stockPeriodRet(s.code, period)}
                onClick={() => onPick(s.code)}
              />
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
    theme: "border-cyan bg-cyan font-bold text-paper",
    rank: "border-copper bg-copper font-bold text-paper",
    vol: "border-[#3E9B62] bg-[#3E9B62] font-bold text-white",
    ret: "border-[#D98A3E] bg-[#D98A3E] font-bold text-white",
    link: "border-up bg-up font-bold text-white",
    flow: "border-us bg-us font-bold text-white",
    proc: "border-[#D98A3E] bg-[#D98A3E] font-bold text-white",
  };

  return (
    <>
      <p className="type-body-sm mb-4 md:mb-6">
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
          large
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

            <div className="border-line border-t pt-4 pb-2 md:pt-5">
              <div className="type-list-primary mb-3 font-bold md:mb-4">
                {plabel} 累積騰落率(%) — テーマ平均
              </div>
              <TrackerChart themes={rows} />
              <TrackerChartLegend themes={rows} />
              <div className="type-meta mt-2 text-right font-mono md:mt-3">
                データ {trackerLastUpdated} 時点
              </div>
            </div>

            <StockListShell>
              {rows.map((t, rank) => (
                <details
                  key={t.key}
                  open={openKey === t.key}
                  className="group"
                  onToggle={(e) => setOpenKey(e.currentTarget.open ? t.key : null)}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-2.5 border-line border-b py-3 [&::-webkit-details-marker]:hidden hover:bg-panel2/35 focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2 md:gap-3 md:py-4">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono font-bold text-[12px] text-paper md:h-8 md:w-8 md:text-[13px]"
                      style={{ backgroundColor: t.color }}
                    >
                      {rank + 1}
                    </span>
                    <div className="type-list-primary min-w-0 flex-1 font-bold">
                      {t.name}
                      <small className="type-meta mt-0.5 block font-normal">
                        {t.subs.length}サブテーマ
                      </small>
                    </div>
                    <Sparkline values={sparkFromSeries(t.series)} />
                    <div
                      className={`type-mono-value min-w-[4.75rem] text-right ${pctColor(t.avg)}`}
                    >
                      {fmtPct(t.avg)}
                    </div>
                  </summary>
                  <div className="border-line border-b px-0 pt-3 pb-1 last:border-b-0">
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
            </StockListShell>

            <p className="type-meta leading-[1.65] md:leading-[1.7]">
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
