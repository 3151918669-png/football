import React from "react";
import { playerCard } from "../src/clubData";
export default function MatchPitch({ squad, players }) {
  const starters = (squad.starters || [])
    .map((name) => players.find((p) => p.name === name))
    .filter(Boolean);
  if (!starters.length)
    return (
      <div className="empty-match">
        <p>暂无已确认首发阵容</p>
        <small>实际首发名单录入后将在球场展示。</small>
      </div>
    );
  const goalkeeper =
    starters.find((p) => p.name === squad.goalkeeper) ||
    starters.find((p) => p.category === "守门员");
  const outfield = starters
    .filter((p) => p !== goalkeeper)
    .sort(
      (a, b) =>
        ["后卫", "中场", "前场"].indexOf(a.category) -
        ["后卫", "中场", "前场"].indexOf(b.category),
    );
  const rows = String(squad.formation || "4-3-2-1")
    .split("-")
    .map(Number)
    .filter((n) => n > 0 && n < 6);
  const lines = rows.reduce((s, n) => s + n, 0) === 10 ? rows : [4, 3, 2, 1];
  const placements = goalkeeper ? [{ ...goalkeeper, x: 50, y: 89 }] : [];
  let cursor = 0;
  lines.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      const player = outfield[cursor++];
      if (player)
        placements.push({
          ...player,
          x: ((i + 1) * 100) / (count + 1),
          y: 69 - row * (54 / Math.max(1, lines.length - 1)),
        });
    }
  });
  return (
    <div
      className="tactics-pitch match-squad-pitch"
      aria-label={`${squad.formation || "4-3-2-1"}首发阵容`}
    >
      <div className="tactics-midline" />
      <div className="tactics-circle" />
      <div className="tactics-box top" />
      <div className="tactics-box bottom" />
      {placements.map((p) => (
        <div
          className="tactics-player"
          style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%` }}
          key={p.name}
        >
          {playerCard(p) ? (
            <img
              className="pitch-card"
              src={playerCard(p)}
              alt={`${p.name}球员卡`}
            />
          ) : (
            <span>#{p.number || "—"}</span>
          )}
          <strong>
            {p.name}
            {p.name === squad.captain ? " ©" : ""}
          </strong>
        </div>
      ))}
    </div>
  );
}
