import { themesPerf } from "~/lib/data";
import glossaryJson from "../../../../data/glossary.json";
import newsJson from "../../../../data/news.json";
import themesJson from "../../../../data/themes.json";
import timelineJson from "../../../../data/timeline.json";

export interface RelatedStock {
  code: string;
  name: string;
  direction: "up" | "down" | "flat";
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  sentiment: number;
  tags: string[];
  geo: boolean;
  impact_chain: string[];
  related_stocks: RelatedStock[];
  source_url: string;
}

export interface TimelineItem {
  date: string;
  tone: "pos" | "neg" | "neu";
  title: string;
  body: string;
}

export interface GlossaryTerm {
  en: string;
  jp: string;
  body: string;
  why: string;
}

export const newsItems: NewsItem[] = (newsJson.items as NewsItem[])
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));

export const timelineItems = timelineJson.items as TimelineItem[];
export const glossaryTerms = glossaryJson.terms as GlossaryTerm[];

/** テーマ key → 表示名(v1 の12マクロテーマ) */
export const themeNames = new Map(themesJson.macro.map((m) => [m.key, m.name]));

/**
 * 集計の基準日。ビルド時刻ではなく株価データの基準日に揃えることで、
 * プリレンダーとクライアントで結果が一致する(ハイドレーション安全)。
 */
export const anchorDate = themesPerf.last_updated;

function daysBefore(anchor: string, days: number): string {
  const d = new Date(`${anchor}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** 直近 N 日のニュース(基準日は anchorDate) */
export function recentNews(days: number): NewsItem[] {
  const from = daysBefore(anchorDate, days);
  return newsItems.filter((n) => n.date > from);
}

/** 週間センチメント = 直近7日のニュース sentiment の平均(仕様書 4.2) */
export function weeklySentiment() {
  const weekAgo = daysBefore(anchorDate, 7);
  const twoWeeksAgo = daysBefore(anchorDate, 14);
  const thisWeek = newsItems.filter((n) => n.date > weekAgo);
  const prevWeek = newsItems.filter((n) => n.date > twoWeeksAgo && n.date <= weekAgo);
  const score = average(thisWeek.map((n) => n.sentiment));
  const prev = average(prevWeek.map((n) => n.sentiment));
  return {
    score,
    delta: score !== null && prev !== null ? score - prev : null,
    count: thisWeek.length,
  };
}

export function verdictLabel(score: number | null): string {
  if (score === null) {
    return "今週の分析ニュースなし";
  }
  if (score >= 1.2) {
    return "強気(ポジティブ優勢)";
  }
  if (score >= 0.5) {
    return "やや強気";
  }
  if (score > -0.5) {
    return "中立(強気と警戒が拮抗)";
  }
  if (score > -1.2) {
    return "やや弱気";
  }
  return "弱気(警戒優勢)";
}

/** テーマ別スコア = 直近7日のニュースを tags でグループ化した平均(ウェハーマップ着色用) */
export function themeSentiments(): { key: string; name: string; score: number | null }[] {
  const weekAgo = daysBefore(anchorDate, 7);
  const recent = newsItems.filter((n) => n.date > weekAgo);
  return themesJson.macro.map((m) => {
    const scores = recent.filter((n) => n.tags.includes(m.key)).map((n) => n.sentiment);
    return { key: m.key, name: m.name, score: average(scores) };
  });
}

/** ホームの注目3本: 直近14日からスコア絶対値の大きい順 */
export function featuredNews(count = 3): NewsItem[] {
  const twoWeeksAgo = daysBefore(anchorDate, 14);
  const recent = newsItems.filter((n) => n.date > twoWeeksAgo);
  const pool = recent.length >= count ? recent : newsItems;
  return pool
    .slice()
    .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment) || b.date.localeCompare(a.date))
    .slice(0, count);
}

/** "2026-07-01" → "7/1" */
export function shortDate(date: string): string {
  const [, m, d] = date.split("-");
  if (!m) {
    return date;
  }
  return d ? `${Number(m)}/${Number(d)}` : `${Number(m)}月`;
}
