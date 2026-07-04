import { Card } from "~/components/section";
import { type HeadlineItem, shortDate } from "~/lib/headlines";

/* v1 風: ダークUI上で半透明の色分けバッジ */
const SOURCE_STYLE: Record<string, string> = {
  日経: "border-copper/40 bg-copper/10 text-copper",
  日経xTECH: "border-copper/40 bg-copper/10 text-copper",
  Bloomberg: "border-copper/30 bg-copper/8 text-copper",
  Reuters: "border-down/40 bg-down/10 text-down",
  CNBC: "border-down/30 bg-down/8 text-down",
  WSJ: "border-us/40 bg-us/10 text-us",
  ITmedia: "border-[#3E9B62]/40 bg-[#3E9B62]/10 text-[#3E9B62]",
  "EE Times Japan": "border-us/30 bg-us/8 text-us",
  DigiTimes: "border-cyan/40 bg-cyan/10 text-cyan",
  日刊工業: "border-copper/25 bg-copper/8 text-ink-2",
  東洋経済: "border-down/25 bg-down/8 text-ink-2",
  SemiEngineering: "border-[#3E9B62]/30 bg-[#3E9B62]/8 text-[#3E9B62]",
  "Tom's Hardware": "border-cyan/30 bg-cyan/8 text-cyan",
};

function sourceBadgeClass(source: string): string {
  return SOURCE_STYLE[source] ?? "border-line bg-panel2 text-ink-2";
}

export function HeadlineList({
  items,
  compact = false,
}: {
  items: HeadlineItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <Card className="text-[12.5px] text-ink-2">ヘッドラインはまだありません。</Card>;
  }

  return (
    <Card className={compact ? "p-0" : ""}>
      <ul className={compact ? "divide-y divide-line" : "space-y-0"}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={
              compact
                ? "px-4 py-2.5"
                : `border-line border-b py-3 last:border-b-0 ${index === 0 ? "pt-0" : ""}`
            }
          >
            <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-2">
              <span
                className={`rounded-full border px-2 py-0.5 font-medium ${sourceBadgeClass(item.source)}`}
              >
                {item.source}
              </span>
              <span className="font-mono">{shortDate(item.date)}</span>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-medium text-[13.5px] text-ink leading-[1.45] hover:text-copper"
            >
              {item.title}
              <span className="ml-1 text-[11px] text-copper">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
