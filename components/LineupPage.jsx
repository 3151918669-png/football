import React from "react";

function FMPitch({ bestLineup, players }) {
  const gk = players.find((p) => p.position === "GK") || null;
  const allPositions = [];
  bestLineup["前场"].forEach((p, i) => allPositions.push({ ...p, x: 25 + i * 25, y: 18, cls: "forward" }));
  bestLineup["中场"].forEach((p, i) => allPositions.push({ ...p, x: 30 + i * 20, y: 42, cls: "midfield" }));
  bestLineup["后卫"].filter((p) => p.position !== "GK").slice(0, 4).forEach((p, i) => allPositions.push({ ...p, x: 20 + i * 20, y: 72, cls: "defender" }));
  if (gk) allPositions.push({ ...gk, x: 50, y: 90, cls: "gk" });

  return (
    <div className="fm-pitch-container">
      <div className="fm-pitch">
        <div className="pitch-area-top"></div>
        <div className="pitch-area-bottom"></div>
        <div className="pitch-goal-top"></div>
        <div className="pitch-goal-bottom"></div>
        <div className="pitch-center-dot"></div>
        {allPositions.map((p) => (
          <div
            key={p.name}
            className={`pitch-player ${p.cls}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            title={`${p.name} | ${p.position} | 能力${p.ability}`}
          >
            {p.number}
          </div>
        ))}
      </div>
    </div>
  );
}

function LineupPage({ bestLineup, players }) {
  return (
    <section className="dashboard-grid">
      <div className="panel wide">
        <div className="section-head-row">
          <h2>最佳阵容推荐</h2>
          <span className="roster-count">基于当前球员能力自动生成</span>
        </div>
        <p>系统根据各位置能力值自动生成最佳11人阵容。如需调整，请修改对应球员的能力属性。</p>
      </div>

      <div className="panel wide">
        <h2>阵容布置</h2>
        <FMPitch bestLineup={bestLineup} players={players} />
      </div>

      <div className="panel wide">
        <h2>阵容详情</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>位置</th>
                <th>号码</th>
                <th>姓名</th>
                <th>位置</th>
                <th>能力</th>
                <th>角色</th>
              </tr>
            </thead>
            <tbody>
              {["前场", "中场", "后卫"].map((group) =>
                bestLineup[group].map((player) => (
                  <tr key={player.name}>
                    <td><span className="result-badge win">{group}</span></td>
                    <td>{player.number}</td>
                    <td><strong>{player.name}</strong></td>
                    <td>{player.position}</td>
                    <td><span className="ability-up">{player.ability}</span></td>
                    <td>{player.role}</td>
                  </tr>
                ))
              )}
              {players.find((p) => p.position === "GK") && (
                <tr key={players.find((p) => p.position === "GK").name}>
                  <td><span className="result-badge win">门将</span></td>
                  <td>{players.find((p) => p.position === "GK").number}</td>
                  <td><strong>{players.find((p) => p.position === "GK").name}</strong></td>
                  <td>GK</td>
                  <td><span className="ability-up">{players.find((p) => p.position === "GK").ability}</span></td>
                  <td>{players.find((p) => p.position === "GK").role}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default LineupPage;