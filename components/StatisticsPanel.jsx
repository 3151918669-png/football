import React from "react";

function SeasonStats({ player }) {
  const totalStat = (matches, key) => {
    return matches.reduce((sum, m) => sum + Number(m[key] || 0), 0);
  };

  const averageRating = (matches) => {
    if (!matches.length) return "-";
    const total = matches.reduce((sum, m) => sum + Number(m.rating || 0), 0);
    return (total / matches.length).toFixed(1);
  };

  const last = player.matches?.[player.matches.length - 1];

  return (
    <div className="panel">
      <h3>赛季统计</h3>
      <div className="season-row">
        <span>出场</span>
        <b>{player.matches?.length || 0}</b>
      </div>
      <div className="season-row">
        <span>进球</span>
        <b>{totalStat(player.matches || [], "goals")}</b>
      </div>
      <div className="season-row">
        <span>助攻</span>
        <b>{totalStat(player.matches || [], "assists")}</b>
      </div>
      <div className="season-row">
        <span>场均评分</span>
        <b>{averageRating(player.matches || [])}</b>
      </div>
      <div className="season-row">
        <span>最近能力变化</span>
        <b>
          {last
            ? Number(last.abilityChange) > 0
              ? `+${last.abilityChange}`
              : last.abilityChange
            : "-"}
        </b>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="panel info-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RankingTable({ title, rows, empty, suffix }) {
  return (
    <div className="panel wide">
      <h2>{title}</h2>
      {!rows.length ? (
        <p>{empty}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>姓名</th>
                <th>数据</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${row.name}`}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    <strong>{row.value}</strong> {suffix}
                  </td>
                  <td>{row.meta || (index === 0 ? "当前领先" : "继续追赶")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { SeasonStats, InfoCard, RankingTable };