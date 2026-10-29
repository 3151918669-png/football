import React from "react";
export const abilityLabels = ["速度", "射门", "盘带", "传球", "防守", "体能"];
export default function AbilityRadarCard({ player }) {
  const attributes = player.attributes || {};
  const valid = abilityLabels.some(
    (label) => attributes[label] !== undefined && attributes[label] !== "",
  );
  const point = (i, value, r = 95) => {
    const angle = ((-90 + i * 60) * Math.PI) / 180;
    return `${150 + Math.cos(angle) * r * value},${145 + Math.sin(angle) * r * value}`;
  };
  return (
    <section className="panel">
      <span className="eyebrow">PLAYER ABILITY</span>
      <h3 style={{ marginTop: 12 }}>能力雷达</h3>
      {valid ? (
        <svg
          className="radar-svg"
          viewBox="0 0 300 300"
          role="img"
          aria-label={abilityLabels
            .map((l) => `${l} ${attributes[l] ?? "暂无记录"}`)
            .join("，")}
        >
          {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
            <polygon
              key={r}
              points={abilityLabels.map((_, i) => point(i, r)).join(" ")}
              fill="none"
              stroke="#cbd8e9"
            />
          ))}
          {abilityLabels.map((_, i) => (
            <line
              key={i}
              x1="150"
              y1="145"
              x2={point(i, 1).split(",")[0]}
              y2={point(i, 1).split(",")[1]}
              stroke="#d7e2ef"
            />
          ))}
          <polygon
            points={abilityLabels
              .map((l, i) =>
                point(
                  i,
                  Math.min(100, Math.max(0, Number(attributes[l]) || 0)) / 100,
                ),
              )
              .join(" ")}
            fill="#2875cf40"
            stroke="#2875cf"
            strokeWidth="2"
          />
          {abilityLabels.map((l, i) => {
            const [x, y] = point(i, 1, 125).split(",");
            return (
              <text
                key={l}
                x={x}
                y={y}
                textAnchor="middle"
                fill="#47658a"
                fontSize="11"
              >
                {l}
                <tspan x={x} dy="15">
                  {attributes[l] ?? "—"}
                </tspan>
              </text>
            );
          })}
        </svg>
      ) : (
        <div className="ability-empty">
          暂无能力值记录
          <br />
          <small>管理员录入后将显示雷达图。</small>
        </div>
      )}
    </section>
  );
}
