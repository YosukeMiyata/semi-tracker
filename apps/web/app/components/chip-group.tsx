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
  large,
}: {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (id: T) => void;
  accent?: Partial<Record<T, string>>;
  wrap?: boolean;
  large?: boolean;
}) {
  return (
    <div>
      <div className="type-meta mb-1.5 tracking-[0.08em]">{label}</div>
      <div className={`-mx-0.5 flex gap-1.5 pb-0.5 md:gap-2 ${wrap ? "flex-wrap" : "overflow-x-auto"}`}>
        {options.map((opt) => {
          const active = opt.id === value;
          const accentClass = accent?.[opt.id];
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.id)}
              className={`shrink-0 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-1 ${
                large
                  ? "px-4 py-2.5 text-[15px] font-bold md:px-5 md:py-3 md:text-[17px] lg:text-[18px]"
                  : "px-3.5 py-2 text-[12px] md:px-4 md:py-2.5 md:text-[15px] lg:text-[16px]"
              } ${
                active
                  ? (accentClass ?? "border-ink bg-ink font-bold text-paper")
                  : "border-line bg-transparent text-ink-2"
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
      <div className="type-meta mb-1.5 tracking-[0.08em]">{label}</div>
      <div className={`-mx-0.5 flex gap-1.5 pb-0.5 md:gap-2 ${wrap ? "flex-wrap" : "overflow-x-auto"}`}>
        {options.map((opt) => {
          const active = opt.id === "all" ? selected.size === 0 : selected.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(opt.id)}
              className={`shrink-0 rounded-lg border px-3.5 py-2 text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-1 md:px-4 md:py-2.5 md:text-[15px] lg:text-[16px] ${
                active
                  ? "border-ink bg-ink font-bold text-paper"
                  : "border-line bg-transparent text-ink-2"
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
