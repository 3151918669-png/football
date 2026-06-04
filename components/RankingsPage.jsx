import React from "react";

function totalStat(matches, key) {
  return matches?.reduce((sum, m) => sum + Number(m[key] || 0), 0) || 0;
}

function averageRating(matches) {
  if (!matches?.length) return "-";
  const total = matches.reduce((sum, m) => sum + Number(m.rating || 0), 0);
  return (total / matches.length).toFixed(1);
}

function RankingsPage({ players, teamMatches, ranking, teamStats }) {
  const winRate = teamStats.matches > 0 ? ((teamStats.wins / teamStats.matches) * 100).toFixed(0) + "%" : "-";
  const sortedByGoals = [...players].sort((a, b) => totalStat(b.matches || [], "goals") - totalStat(a.matches || [], "goals"));
  const sortedByAssists = [...players].sort((a, b) => totalStat(b.matches || [], "assists") - totalStat(a.matches || [], "assists"));
  const sortedByAppearance = [...players]
    .map((p) => ({ ...p, count: p.matches?.length || 0 }))
    .sort((a, b) => b.count - a.count);
  const goalkeeperRanking = players
    .filter((p) => p.position === "GK" || p.category === "守门员")
    .map((p) => ({
      ...p,
      saves: totalStat(p.matches || [], "saves"),
      conceded: totalStat(p.matches || [], "conceded"),
      cleanSheets: (p.matches || []).filter((match) => match.cleanSheet).length,
    }))
    .sort((a, b) => b.cleanSheets - a.cleanSheets || b.saves - a.saves);

  return (
    <div className="match-page rankings-page">
      <div className="panel rankings-hero">
        <div>
          <span className="home-kicker">RANKINGS</span>
          <h2>数据排行榜</h2>
          <p>根据个人比赛记录自动算出的排行榜，支持场均评分、进球、助攻、出勤等维度。</p>
        </div>
        <div className="home-hero-badge" style={{ minHeight: "auto", padding: "20px" }}>
          <strong>胜率</strong>
          <span>{winRate}</span>
        </div>
      </div>

      {/* 场均评分排行 */}
      <section className="panel wide">
        <div className="section-head-row">
          <h2>场均评分排行</h2>
          <span className="roster-count">{ranking.length} 人上榜</span>
        </div>
        {ranking.length === 0 ? (
          <p>暂无评分记录，录入个人比赛后将自动生成排行。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>姓名</th>
                  <th>位置</th>
                  <th>场均评分</th>
                  <th>出场</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((p, index) => (
                  <tr key={p.name}>
                    <td>{index + 1}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.position}</td>
                    <td><span className="ability-up">{p.avgRating}</span></td>
                    <td>{p.matches?.length || 0}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 射手榜 */}
      <section className="panel wide">
        <h2>射手榜</h2>
        {sortedByGoals.length === 0 ? (
          <p>暂无进球记录。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>姓名</th>
                  <th>位置</th>
                  <th>总进球</th>
                  <th>出场</th>
                </tr>
              </thead>
              <tbody>
                {sortedByGoals.map((p, index) => (
                  <tr key={`goals-${p.name}`}>
                    <td>{index + 1}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.position}</td>
                    <td><span className="ability-up">{totalStat(p.matches || [], "goals")}</span></td>
                    <td>{p.matches?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 助攻榜 */}
      <section className="panel wide">
        <h2>助攻榜</h2>
        {sortedByAssists.length === 0 ? (
          <p>暂无助攻记录。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>姓名</th>
                  <th>位置</th>
                  <th>总助攻</th>
                  <th>出场</th>
                </tr>
              </thead>
              <tbody>
                {sortedByAssists.map((p, index) => (
                  <tr key={`assists-${p.name}`}>
                    <td>{index + 1}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.position}</td>
                    <td><span className="ability-up">{totalStat(p.matches || [], "assists")}</span></td>
                    <td>{p.matches?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 出勤榜 */}
      <section className="panel wide">
        <h2>出勤榜</h2>
        {sortedByAppearance.length === 0 ? (
          <p>暂无出场记录。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>姓名</th>
                  <th>位置</th>
                  <th>出场次数</th>
                  <th>能力</th>
                </tr>
              </thead>
              <tbody>
                {sortedByAppearance.map((p, index) => (
                  <tr key={`app-${p.name}`}>
                    <td>{index + 1}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.position}</td>
                    <td><span className="ability-up">{p.count}</span></td>
                    <td>{p.ability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {goalkeeperRanking.length > 0 && (
        <section className="panel wide">
          <h2>守门员排行榜</h2>
          <div className="table-wrap">
            <table><thead><tr><th>排名</th><th>门将</th><th>出场</th><th>扑救</th><th>失球</th><th>零封</th></tr></thead>
              <tbody>{goalkeeperRanking.map((p, index) => <tr key={`gk-${p.name}`}><td>{index + 1}</td><td><strong>{p.name}</strong></td><td>{p.matches?.length || 0}</td><td>{p.saves}</td><td>{p.conceded}</td><td><span className="ability-up">{p.cleanSheets}</span></td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default RankingsPage;
