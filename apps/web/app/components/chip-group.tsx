export interface ChipOption<T extends string> {
  id: T;
  label: string;
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  accent,
  wrap,
}: {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (id: T) => void;
  accent?: Partial<Record<T, string>>;
  wrap?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] text-ink-2 tracking-[0.08em]">{label}</div>
      <div className={`-mx-0.5 flex gap-1.5 pb-0.5 ${wrap ? "flex-wrap" : "overflow-x-auto"}`}>
        {options.map((opt) => {
          const active = opt.id === value;
          const accentClass = accent?.[opt.id];
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.id)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-1 ${
                active
                  ? (accentClass ?? "border-ink bg-ink font-bold text-card")
                  : "border-line bg-card text-ink-2"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MultiChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
  wrap,
}: {
  label: string;
  options: ChipOption<T>[];
  selected: Set<T>;
  onToggle: (id: T) => void;
  wrap?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] text-ink-2 tracking-[0.08em]">{label}</div>
      <div className={`-mx-0.5 flex gap-1.5 pb-0.5 ${wrap ? "flex-wrap" : "overflow-x-auto"}`}>
        {options.map((opt) => {
          const active = opt.id === "all" ? selected.size === 0 : selected.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(opt.id)}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-1 ${
                active ? "border-ink bg-ink font-bold text-card" : "border-line bg-card text-ink-2"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
