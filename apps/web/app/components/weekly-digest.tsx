import { digestWeekLabel, weeklyDigest } from "~/lib/weekly-digest";

export function WeeklyDigest() {
  const paragraphs = weeklyDigest.body.split("\n").filter(Boolean);

  return (
    <section
      className="relative mt-3 overflow-hidden rounded-card border-2 border-copper/45 bg-gradient-to-br from-copper-soft/55 via-card to-panel2 px-4 py-4 shadow-[inset_0_1px_0_rgba(232,176,75,0.2)]"
      aria-labelledby="weekly-digest-title"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-copper via-copper/60 to-transparent"
        aria-hidden
      />

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-1">
        <span className="rounded-md bg-copper px-2.5 py-1 font-bold text-[11px] text-paper tracking-[0.12em]">
          今週の解説
        </span>
        <span className="font-mono text-[12px] text-copper">{digestWeekLabel()}</span>
        <span className="text-[10.5px] text-faint">更新 {weeklyDigest.updated}</span>
      </div>

      <h2
        id="weekly-digest-title"
        className="mb-3 pl-1 font-bold font-serif text-[18px] text-ink leading-[1.5] tracking-[0.02em]"
      >
        {weeklyDigest.title}
      </h2>

      <div className="space-y-2.5 border-copper/25 border-t border-dashed pt-3 pl-1">
        {paragraphs.map((para, i) => (
          <p
            key={para}
            className={`leading-[1.7] ${
              i === 0 ? "font-medium text-[14.5px] text-ink" : "text-[13px] text-ink-2"
            }`}
          >
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
