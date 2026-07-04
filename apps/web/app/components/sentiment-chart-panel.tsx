"use client";

import { useMemo, useState } from "react";
import { SentimentChart } from "~/components/sentiment-chart";
import { weeklyThemeSentimentSeries } from "~/lib/news";
import themesJson from "../../../../data/themes.json";

const THEMES = themesJson.macro.map((m) => ({ key: m.key, name: m.name, color: m.color }));

export function SentimentChartPanel() {
  const [themeKey, setThemeKey] = useState<string | null>(null);
  const series = useMemo(() => weeklyThemeSentimentSeries(themeKey, 12), [themeKey]);
  const activeName = themeKey ? (THEMES.find((t) => t.key === themeKey)?.name ?? themeKey) : "全体";

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setThemeKey(null)}
          className={`rounded-full border px-2.5 py-1 text-[11px] focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2 ${
            themeKey === null
              ? "border-ink bg-ink text-paper"
              : "border-line bg-transparent text-ink-2"
          }`}
        >
          全体
        </button>
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setThemeKey(t.key)}
            className={`rounded-full border px-2.5 py-1 text-[11px] focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2 ${
              themeKey === t.key
                ? "border-ink bg-ink text-paper"
                : "border-line bg-transparent text-ink-2"
            }`}
          >
            <i
              className="mr-1 inline-block h-2 w-2 rounded-[1px] align-[-1px]"
              style={{ backgroundColor: t.color }}
              aria-hidden
            />
            {t.name.replace(/\(.*\)/, "").slice(0, 8)}
          </button>
        ))}
      </div>
      <SentimentChart series={series} label={`${activeName}の週次センチメント`} />
      <p className="mt-1 text-[10.5px] text-ink-2">
        {activeName} · 週次平均(月曜起点)。ニュースが無い週は空欄。
      </p>
    </div>
  );
}
