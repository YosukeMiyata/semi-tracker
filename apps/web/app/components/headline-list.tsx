import { Card } from "~/components/section";
import { type HeadlineItem, shortDate } from "~/lib/headlines";

const SOURCE_STYLE: Record<string, string> = {
  日経: "border-[#E8D4C8] bg-[#FBF6F2] text-[#8B5A3C]",
  日経xTECH: "border-[#E8D4C8] bg-[#FBF6F2] text-[#8B5A3C]",
  Bloomberg: "border-[#F0DCC8] bg-[#FFF8F0] text-[#9A5C1A]",
  Reuters: "border-[#D4DCE8] bg-[#F2F6FB] text-[#3A5A8C]",
  CNBC: "border-[#D4E0F0] bg-[#F0F5FC] text-[#2E5080]",
  WSJ: "border-[#D8D4E8] bg-[#F4F2FA] text-[#4A3A6B]",
  ITmedia: "border-[#D8E8D4] bg-[#F4FAF2] text-[#3A6B3A]",
  "EE Times Japan": "border-[#E0D4E8] bg-[#F7F3FA] text-[#5A3A7A]",
  DigiTimes: "border-[#D4E8E8] bg-[#F0FAFA] text-[#2A6060]",
  日刊工業: "border-[#E4DDD4] bg-[#FAF8F5] text-[#6B5344]",
  東洋経済: "border-[#D4D8E8] bg-[#F2F4FA] text-[#3A4570]",
  SemiEngineering: "border-[#E0E4D4] bg-[#F7FAF2] text-[#4A5A3A]",
  "Tom's Hardware": "border-[#D8E0E8] bg-[#F0F4F8] text-[#3A5060]",
};

function sourceBadgeClass(source: string): string {
  return SOURCE_STYLE[source] ?? "border-line bg-card text-ink-2";
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
