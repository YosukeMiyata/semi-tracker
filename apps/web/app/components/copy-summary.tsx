import { useState } from "react";
import { fmtPct, indices, linkageTop, themesPerf } from "~/lib/data";
import { anchorDate, featuredNews, verdictLabel, weeklySentiment } from "~/lib/news";

function buildSummary(): string {
  const weekly = weeklySentiment();
  const lines: string[] = [
    `# 半導体テーマトラッカー 2.0 データサマリー(基準日 ${anchorDate})`,
    "",
    `## 週間センチメント`,
    `スコア: ${weekly.score === null ? "データなし" : weekly.score.toFixed(1)} / ±2.0(${verdictLabel(weekly.score)}、分析ニュース ${weekly.count}本)`,
  ];
  for (const ix of indices) {
    lines.push(
      "",
      `## ${ix.name}(${ix.date})`,
      `終値 ${ix.last} / 前日 ${fmtPct(ix.chg_pct)} / 年初来 ${fmtPct(ix.ytd_pct)}`,
    );
  }
  lines.push("", "## テーマ別 年初来騰落率(構成銘柄の単純平均)");
  for (const t of themesPerf.themes) {
    lines.push(
      `- ${t.name}: ${fmtPct(t.ytd_pct)}${t.vol_ratio !== null ? `(出来高 ${t.vol_ratio.toFixed(2)}×)` : ""}`,
    );
  }
  lines.push("", `## 米国テーマ → 翌日の日本株(${linkageTop.method})`);
  if (linkageTop.rows.length === 0) {
    lines.push("- 直近の営業日に +2% 超で上昇した米国テーマなし");
  }
  for (const r of linkageTop.rows) {
    lines.push(
      `- ${r.theme}(前日 ${fmtPct(r.us_avg)})→ ${r.name}: 陽性率 ${r.rate}% / 平均 ${fmtPct(r.avg, 2)}(n=${r.n})`,
    );
  }
  lines.push("", "## 注目ニュース");
  for (const n of featuredNews()) {
    lines.push(
      `- [${n.date}] ${n.title}(スコア ${n.sentiment > 0 ? "+" : ""}${n.sentiment.toFixed(1)})`,
    );
  }
  lines.push(
    "",
    "---",
    "上記は個人向け半導体株情報サイトの自動生成データです(投資助言ではありません)。",
    "このデータを踏まえて質問に答えてください。",
  );
  return lines.join("\n");
}

export function CopySummary() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // クリップボード非対応環境では何もしない
    }
  };

  return (
    <div className="mt-6 rounded-card border border-line border-dashed bg-card p-4 text-center">
      <button
        type="button"
        onClick={copy}
        className="rounded-full bg-ink px-5 py-2 font-bold text-[13px] text-card focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2"
      >
        {copied ? "コピーしました ✓" : "AI分析用サマリーをコピー"}
      </button>
      <p className="mt-2 text-[11px] text-ink-2">
        本日の全データをテキスト化します。Claude などの AI
        に貼り付けて「このデータで注目すべき点は?」のように質問できます。
      </p>
    </div>
  );
}
