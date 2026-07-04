import { shortDate } from "~/lib/news";
import headlinesJson from "../../../../data/headlines.json";

export interface HeadlineItem {
  id: string;
  date: string;
  title: string;
  url: string;
  source: string;
  published_at?: string | null;
}

export const headlineItems: HeadlineItem[] = (headlinesJson.items as HeadlineItem[])
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

export const headlinesFetchedAt = headlinesJson.fetched_at as string;
export const headlineSources = headlinesJson.sources as string[];

/** 直近 N 日のヘッドライン(日付文字列比較) */
export function recentHeadlines(days: number, count?: number): HeadlineItem[] {
  const anchor = headlineItems[0]?.date ?? new Date().toISOString().slice(0, 10);
  const from = daysBefore(anchor, days);
  const filtered = headlineItems.filter((h) => h.date > from);
  return count ? filtered.slice(0, count) : filtered;
}

function daysBefore(anchor: string, days: number): string {
  const d = new Date(`${anchor}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export { shortDate };
