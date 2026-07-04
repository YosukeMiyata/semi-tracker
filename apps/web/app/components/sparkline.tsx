export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <svg className="h-[26px] w-[70px] shrink-0" viewBox="0 0 70 26" aria-hidden="true" />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map(
      (v, i) =>
        `${((i / (values.length - 1)) * 70).toFixed(1)},${(24 - ((v - min) / range) * 22).toFixed(1)}`,
    )
    .join(" ");
  const last = values[values.length - 1];
  const color =
    last > 1 ? "var(--color-up)" : last < -1 ? "var(--color-down)" : "var(--color-neutral)";
  return (
    <svg className="h-[26px] w-[70px] shrink-0" viewBox="0 0 70 26" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}
