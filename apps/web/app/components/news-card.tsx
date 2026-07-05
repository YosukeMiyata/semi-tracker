import { type NewsItem, shortDate, themeNames } from "~/lib/news";

function tone(sentiment: number): "pos" | "neg" | "neu" {
  if (sentiment > 0) {
    return "pos";
  }
  if (sentiment < 0) {
    return "neg";
  }
  return "neu";
}

const BORDER = {
  pos: "border-l-up",
  neg: "border-l-down",
  neu: "border-l-neutral",
} as const;

const BADGE = {
  pos: "bg-up-soft text-up",
  neg: "bg-down-soft text-down",
  neu: "bg-panel2 text-neutral",
} as const;

const STOCK_CHIP = {
  up: "border-up/30 bg-up-soft text-up",
  down: "border-down/30 bg-down-soft text-down",
  flat: "border-line bg-panel2 text-ink-2",
} as const;

const ARROW = { up: "▲", down: "▼", flat: "―" } as const;

export function NewsCard({ item }: { item: NewsItem }) {
  const t = tone(item.sentiment);
  const score = `${item.sentiment > 0 ? "+" : item.sentiment < 0 ? "−" : ""}${Math.abs(
    item.sentiment,
  ).toFixed(1)}`;
  return (
    <div className={`card-surface mb-3 border-l-[3px] ${BORDER[t]}`}>
      <div className="type-meta mb-1.5 flex flex-wrap items-center gap-2">
        <span className={`type-mono-code rounded-md px-2 py-0.5 font-semibold ${BADGE[t]}`}>
          {score}
        </span>
        <span>{shortDate(item.date)}</span>
        {item.geo ? <span>地政学</span> : null}
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="type-meta rounded-full border border-cyan/40 bg-cyan/10 px-2 py-0.5 font-medium text-cyan"
          >
            {themeNames.get(tag) ?? tag}
          </span>
        ))}
        {item.source_url ? (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-copper underline"
          >
            出典 ↗
          </a>
        ) : null}
      </div>
      <h3 className="type-card-title mb-1.5">{item.title}</h3>
      <p className="type-body-sm mb-2">{item.summary}</p>
      {item.impact_chain.length > 0 ? (
        <div className="type-body-sm mb-2 rounded-[10px] border border-copper/30 border-dashed bg-panel2 px-3 py-2.5 md:px-4 md:py-3">
          <div className="type-badge mb-1 text-copper tracking-[0.1em]">影響の連鎖</div>
          <div className="flex flex-wrap items-center gap-1 font-medium text-ink">
            {item.impact_chain.map((step, i) => (
              <span key={step} className="inline-flex items-center gap-1">
                {i > 0 ? <span className="font-mono text-copper">→</span> : null}
                {step}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {item.related_stocks.map((s) => (
        <span
          key={s.code}
          className={`type-meta mt-0.5 mr-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-medium ${STOCK_CHIP[s.direction]}`}
        >
          {s.name} {ARROW[s.direction]}
        </span>
      ))}
    </div>
  );
}
