/** ホーム画面のアンカーナビ（モバイルハンバーガーメニュー用） */
export const HOME_SECTIONS = [
  { id: "weekly-digest", label: "今週の解説" },
  { id: "theme-summary", label: "テーマ騰落サマリー" },
  { id: "events", label: "今後2週間のイベント" },
  { id: "linkage", label: "米日連動トリガー" },
  { id: "indices", label: "SOX指数" },
  { id: "macro", label: "マクロ指標" },
  { id: "sentiment", label: "今週のセンチメント" },
  { id: "featured-news", label: "今週の注目3本" },
  { id: "headlines", label: "最新ヘッドライン" },
] as const;

export const HOME_SECTION_SCROLL_MT = "scroll-mt-[5.5rem]";
