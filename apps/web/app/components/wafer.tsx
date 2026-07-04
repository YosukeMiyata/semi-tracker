/**
 * ウェハーマップ: ダイ1つ=1テーマ、感情スコア(-2〜+2)で着色。
 * プロトタイプの描画ロジック(8×8グリッドを円内にクリップ、テーマを順繰り割当)を移植。
 */

const CX = 75;
const CY = 75;
const R = 70;
const SIZE = 15;
const GAP = 3;

/** スコア→色(プロトタイプの col() を移植)。null(ニュースなし)は中立色 */
function dieColor(s: number | null): string {
  if (s === null) {
    return "#8B94A8";
  }
  if (s >= 1.5) {
    return "#F0593C";
  }
  if (s >= 0.8) {
    return "#E8785A";
  }
  if (s >= 0.3) {
    return "#C97A68";
  }
  if (s > -0.3) {
    return "#8B94A8";
  }
  if (s > -0.8) {
    return "#6AADD4";
  }
  if (s > -1.5) {
    return "#4A9BC8";
  }
  return "#3FA7D6";
}

export interface WaferTheme {
  key: string;
  name: string;
  score: number | null;
}

export function Wafer({ themes }: { themes: WaferTheme[] }) {
  const dies: { x: number; y: number; theme: WaferTheme }[] = [];
  let idx = 0;
  for (let gy = 0; gy < 8; gy++) {
    for (let gx = 0; gx < 8; gx++) {
      const x = CX - 4 * (SIZE + GAP) + GAP / 2 + gx * (SIZE + GAP);
      const y = CY - 4 * (SIZE + GAP) + GAP / 2 + gy * (SIZE + GAP);
      const dist = Math.hypot(x + SIZE / 2 - CX, y + SIZE / 2 - CY);
      if (dist > R - 9) {
        continue;
      }
      dies.push({ x, y, theme: themes[idx % themes.length] });
      idx++;
    }
  }
  return (
    <svg viewBox="0 0 150 150" role="img" aria-label="テーマ別センチメントのウェハーマップ">
      <circle cx={CX} cy={CY} r={R} fill="#1B2231" stroke="rgba(38,48,65,.8)" strokeWidth="1.5" />
      {dies.map((d, i) => (
        <rect
          key={`${d.theme.key}-${d.x}-${d.y}`}
          className="die"
          style={{ animationDelay: `${i * 35}ms` }}
          x={d.x}
          y={d.y}
          width={SIZE}
          height={SIZE}
          rx={2.5}
          fill={dieColor(d.theme.score)}
        >
          <title>
            {d.theme.name}(
            {d.theme.score === null
              ? "今週のニュースなし"
              : `${d.theme.score > 0 ? "+" : ""}${d.theme.score.toFixed(1)}`}
            )
          </title>
        </rect>
      ))}
      <circle cx={CX} cy={CY + R} r={4} fill="var(--color-paper)" />
    </svg>
  );
}
