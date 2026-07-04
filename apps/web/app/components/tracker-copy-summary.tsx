"use client";

import { useState } from "react";
import { analyzeStock } from "~/lib/technical";
import { linkageGroups, trackerLastUpdated } from "~/lib/tracker";
import pricesJson from "../../../../data/prices.json";

function fmtP(v: number | null | undefined): string {
  if (v == null) {
    return "–";
  }
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function buildSummary(): string {
  const quotes = (pricesJson as { quotes: Record<string, { name: string }> }).quotes;
  const qs = Object.entries(quotes)
    .map(([sym, row]) => {
      const tech = analyzeStock(sym);
      if (!tech) {
        return null;
      }
      return { sym, name: row.name, ...tech };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  let txt = "";
  txt +=
    "あなたは半導体株に詳しい投資分析アシスタントです。以下は半導体テーマトラッカーから出力した本日の市場データです。デイトレ候補・スイング候補・連動セクター・過熱警告・資金の流れを分析してください。\n\n";
  txt += `【半導体トラッカー 市場サマリー】データ日付: ${trackerLastUpdated.slice(0, 10)}\n\n`;

  txt += "━━━ デイトレ向き ━━━\n";
  const inflow = qs
    .filter((q) => q.daytrade === "資金流入急増")
    .sort((a, b) => (b.volRatio ?? 0) - (a.volRatio ?? 0))
    .slice(0, 10);
  txt += "\n■ 資金流入急増\n";
  for (const q of inflow) {
    txt += `  ${q.sym} ${q.name}: 前日比${fmtP(q.chgPct)} / 出来高${q.volRatio?.toFixed(1) ?? "–"}×\n`;
  }
  if (!inflow.length) {
    txt += "  該当なし\n";
  }

  const surge = qs
    .filter((q) => q.volSurge >= 2)
    .sort((a, b) => (b.volRatio ?? 0) - (a.volRatio ?? 0))
    .slice(0, 10);
  txt += "\n■ 出来高急増(25日平均3倍↑)\n";
  for (const q of surge) {
    txt += `  ${q.sym} ${q.name}: 出来高${q.volRatio?.toFixed(1) ?? "–"}× / 前日比${fmtP(q.chgPct)}\n`;
  }
  if (!surge.length) {
    txt += "  該当なし\n";
  }

  txt += "\n━━━ スイング向き ━━━\n";
  const poList = qs
    .filter((q) => q.po)
    .sort((a, b) => (b.ret1m ?? 0) - (a.ret1m ?? 0))
    .slice(0, 12);
  txt += "\n■ パーフェクトオーダー\n";
  for (const q of poList) {
    txt += `  ${q.sym} ${q.name}: 1ヶ月${fmtP(q.ret1m)} / RSI${q.rsi ?? "–"}${q.pullback ? ` / ${q.pullback}` : ""}\n`;
  }
  if (!poList.length) {
    txt += "  該当なし\n";
  }

  const overheat = qs.filter((q) => q.signal === "過熱").slice(0, 6);
  txt += "\n■ 過熱気味\n";
  for (const q of overheat) {
    txt += `  ${q.sym} ${q.name}: 25日線乖離${fmtP(q.dev25)} / RSI${q.rsi ?? "–"}\n`;
  }
  if (!overheat.length) {
    txt += "  該当なし\n";
  }

  txt += "\n━━━ 米国株トリガー × 連動 ━━━\n";
  for (const g of linkageGroups().slice(0, 8)) {
    const us = g.us.map((u) => `${u.symbol}${fmtP(u.chgPct)}`).join(", ");
    const top = g.rows
      .slice(0, 3)
      .map((r) => `${r.code} ${r.name}(連動${r.rate}%)`)
      .join(", ");
    txt += `  【${g.sub}】米国: ${us} → 連動上位: ${top}\n`;
  }

  txt += "\n※投資助言ではありません。最終判断は自己責任で。\n";
  return txt;
}

export function TrackerCopySummary() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // クリップボード非対応環境
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="w-full rounded-card border border-line border-dashed bg-[#FBFBFC] px-3 py-2.5 text-[12.5px] font-bold hover:bg-card"
    >
      {copied ? "コピーしました ✓" : "📋 AI分析用サマリーをコピー(Claudeに貼って質問)"}
    </button>
  );
}
