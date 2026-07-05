import { digestWeekLabel, weeklyDigest } from "~/lib/weekly-digest";

export function WeeklyDigest() {
  const paragraphs = weeklyDigest.body.split("\n").filter(Boolean);

  return (
    <section
      className="relative mt-3 overflow-hidden rounded-card border-2 border-copper/45 bg-gradient-to-br from-copper-soft/55 via-card to-panel2 px-4 py-4 shadow-[inset_0_1px_0_rgba(232,176,75,0.2)] md:px-6 md:py-6 lg:px-7 lg:py-7"
      aria-labelledby="weekly-digest-title"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-copper via-copper/60 to-transparent"
        aria-hidden
      />

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-1 md:mb-4">
        <span className="type-badge rounded-md bg-copper px-2.5 py-1 text-paper">今週の解説</span>
        <span className="type-mono-accent">{digestWeekLabel()}</span>
        <span className="type-faint">更新 {weeklyDigest.updated}</span>
      </div>

      <h2 id="weekly-digest-title" className="type-feature-title mb-3 pl-1 md:mb-4">
        {weeklyDigest.title}
      </h2>

      <div className="space-y-2.5 border-copper/25 border-t border-dashed pt-3 pl-1 md:space-y-3 md:pt-4">
        {paragraphs.map((para, i) => (
          <p key={para} className={i === 0 ? "type-body-medium" : "type-body-sm"}>
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
