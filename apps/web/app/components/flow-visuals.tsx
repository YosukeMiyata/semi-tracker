/** v1 docs/index.html の stageVisual / icebergViz を React 化 */

export function FlowStageVisual({ kind }: { kind: string | null }) {
  if (kind === "loop") {
    return (
      <div className="fviz floop pixel">
        🔄 洗浄→成膜→露光→エッチング→CMP を
        <br />
        何層も繰り返して回路ビルを建てる
      </div>
    );
  }

  if (kind === "package3") {
    return (
      <div className="fviz fpkg3">
        <div className="p3-label pixel">先端パッケージの4層構造(CoWoS→CoPoS)</div>
        <div className="p3layer p3top">
          <span className="p3chip">GPU</span>
          <span className="p3chip" style={{ background: "rgba(63,167,214,.45)" }}>
            HBM
          </span>
          <span className="p3chip" style={{ background: "rgba(240,89,60,.45)" }}>
            💠CPO
          </span>
          <span className="p3tag pixel">チップ&光の出口</span>
        </div>
        <div className="p3layer p3mid">
          <span className="p3full">◧ インターポーザー(Si / ガラス) ◧</span>
          <span className="p3tag pixel">★歪まない中間層</span>
        </div>
        <div className="p3layer p3bot">
          <span className="p3full">▦ パッケージ基板(ABF/樹脂) ▦</span>
          <span className="p3tag pixel">骨格・密着</span>
        </div>
        <div className="p3layer p3mb">
          <span className="p3full">▩ マザーボード(PCB) ▩</span>
          <span className="p3tag pixel">大地</span>
        </div>
        <div className="p3note pixel">CoPoS=四角いガラスパネル化で面積効率UP</div>
      </div>
    );
  }

  if (kind === "test") {
    return <div className="fviz ftest pixel">✅ 完成チップを全数検査・テストして出荷</div>;
  }

  if (kind === "cpo") {
    return (
      <div className="fviz fcpo">
        <div className="p3-label pixel">光電融合(CPO)の立体構造</div>
        <div className="p3layer p3top">
          <span className="p3chip">GPU</span>
          <span className="p3chip">HBM</span>
          <span className="p3chip" style={{ background: "rgba(110,231,240,.4)" }}>
            💠光エンジン
          </span>
        </div>
        <div className="p3layer p3mid">
          <span className="p3full">シリコンフォトニクス層(光配線)</span>
        </div>
        <div className="p3layer p3bot">
          <span className="p3full">🧵 光ファイバーで外部へ →→→ 🌊海底ケーブルで大陸間へ</span>
        </div>
        <div className="p3note pixel">電気→光変換で低電力・大容量化(NVIDIA Vera Rubin等)</div>
      </div>
    );
  }

  if (kind === "iceberg") {
    return <FlowIcebergVisual />;
  }

  return null;
}

function FlowIcebergVisual() {
  const C = 13;
  const COLS = 24;
  const ROWS = 22;
  const W = COLS * C + 150;
  const H = ROWS * C + 30;

  const rows: [number, number][] = [
    [11, 12],
    [10, 13],
    [10, 14],
    [9, 14],
    [8, 15],
    [8, 16],
    [7, 17],
    [6, 17],
    [6, 18],
    [5, 18],
    [5, 19],
    [4, 19],
    [4, 20],
    [3, 20],
    [3, 21],
    [2, 21],
    [2, 22],
    [1, 22],
    [1, 22],
    [2, 21],
    [3, 20],
    [5, 18],
  ];

  const strata = [
    { from: 0, to: 5, color: "#EAF6FF", edge: "#FFFFFF" },
    { from: 6, to: 9, color: "#7FD8E8", edge: "#A5E8F2" },
    { from: 10, to: 13, color: "#4FB3D9", edge: "#6EC5E4" },
    { from: 14, to: 17, color: "#2E86C1", edge: "#4A9DD1" },
    { from: 18, to: 21, color: "#1B4F8A", edge: "#2E6BA8" },
  ];

  const WATER_Y = 6 * C + 15;
  const stars: [number, number][] = [
    [20, 18],
    [50, 40],
    [95, 12],
    [160, 30],
    [230, 20],
    [280, 45],
    [330, 15],
    [370, 35],
    [300, 60],
    [130, 55],
  ];

  const labels: [number, string, string, string][] = [
    [2.5, "第1層 GPUサーバー", "見える部分", "#EAF6FF"],
    [7.5, "第2層 ストレージ", "食材倉庫", "#7FD8E8"],
    [11.5, "第3層 ネットワーク", "神経網", "#4FB3D9"],
    [15.5, "第4層 電源設備", "心臓部", "#5FA8DC"],
    [19.5, "第5層 冷却設備", "生命維持装置", "#7FB8E8"],
  ];

  const LX = rows[17][1] * C + 8 + C + 6;
  const gx = 11 * C + 8;
  const gy = 15 - 10;

  return (
    <div className="fviz fice">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <title>データセンター氷山ビジュアル</title>
        <rect x="0" y="0" width={W} height={WATER_Y} fill="#070A12" />
        <rect x="0" y={WATER_Y} width={W} height={H - WATER_Y} fill="#0A1626" />
        {stars.map(([sx, sy]) => (
          <rect key={`${sx}-${sy}`} x={sx} y={sy} width="3" height="3" fill="#FFF" opacity="0.8" />
        ))}
        {rows.map((ext, rowIdx) => {
          const st = strata.find((s) => rowIdx >= s.from && rowIdx <= s.to);
          if (!st) {
            return null;
          }
          const y = rowIdx * C + 15;
          return (
            <g key={`${ext[0]}-${ext[1]}-${y}`}>
              {Array.from({ length: ext[1] - ext[0] + 1 }, (_, i) => {
                const col = ext[0] + i;
                const x = col * C + 8;
                const isEdge = col === ext[0] || col === ext[1];
                return (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={C}
                    height={C}
                    fill={isEdge ? st.edge : st.color}
                    shapeRendering="crispEdges"
                  />
                );
              })}
            </g>
          );
        })}
        <rect
          x={gx - 6}
          y={gy}
          width="38"
          height="12"
          fill="#F0593C"
          stroke="#FFF"
          strokeWidth="2"
          shapeRendering="crispEdges"
        />
        <text
          x={gx + 13}
          y={gy + 9}
          fill="#FFF"
          fontSize="8"
          fontFamily="DotGothic16, monospace"
          textAnchor="middle"
        >
          GPU
        </text>
        {Array.from({ length: Math.ceil(W / 16) }, (_, i) => {
          const x = i * 16;
          return (
            <g key={`wave-${x}`}>
              <rect
                x={x}
                y={WATER_Y - 2}
                width="8"
                height="3"
                fill="#FFF"
                opacity="0.9"
                shapeRendering="crispEdges"
              />
              <rect
                x={x + 8}
                y={WATER_Y + 2}
                width="8"
                height="2"
                fill="#6EC5E4"
                opacity="0.5"
                shapeRendering="crispEdges"
              />
            </g>
          );
        })}
        <text
          x={W - 6}
          y={WATER_Y - 8}
          fill="#8B94A8"
          fontSize="9"
          fontFamily="DotGothic16, monospace"
          textAnchor="end"
        >
          ▲ 海面(みんなが見てる線)
        </text>
        {labels.map(([r, t1, t2, colr]) => {
          const y = r * C + 15;
          return (
            <g key={t1}>
              <rect
                x={LX}
                y={y - 1}
                width="10"
                height="3"
                fill={colr}
                shapeRendering="crispEdges"
              />
              <text
                x={LX + 14}
                y={y + 3}
                fill={colr}
                fontSize="10"
                fontFamily="DotGothic16, monospace"
              >
                {t1}
              </text>
              <text
                x={LX + 14}
                y={y + 15}
                fill="#8B94A8"
                fontSize="8.5"
                fontFamily="DotGothic16, monospace"
              >
                ＝{t2}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="ice-talk pixel">
        <span className="ice-heart">♥</span>* どれか1つ かけても AIは とまる。
      </div>
    </div>
  );
}
