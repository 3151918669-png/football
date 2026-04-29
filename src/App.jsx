import "./styles.css";
import React, { useEffect, useMemo, useState } from "react";
import { initialPlayers } from "./playersData";
import PlayerStarCard from "./PlayerStarCard";

const categories = ["前场", "中场", "后卫"];

function averageRating(matches) {
  if (!matches.length) return "-";
  const total = matches.reduce((sum, m) => sum + Number(m.rating || 0), 0);
  return (total / matches.length).toFixed(1);
}

function totalStat(matches, key) {
  return matches.reduce((sum, m) => sum + Number(m[key] || 0), 0);
}

function getStatus(player) {
  const avg = averageRating(player.matches);
  if (avg === "-") return "暂无数据";
  if (Number(avg) >= 8) return "状态优秀";
  if (Number(avg) >= 7) return "状态稳定";
  if (Number(avg) >= 6) return "需要观察";
  return "建议调整";
}

export default function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("team-v7-data");
    return saved ? JSON.parse(saved) : initialPlayers;
  });

  const [view, setView] = useState("players");
  const [selectedName, setSelectedName] = useState("陆梓鑫");

  const [matchForm, setMatchForm] = useState({
    date: "",
    opponent: "",
    goals: "",
    assists: "",
    rating: "",
    note: "",
  });

  useEffect(() => {
    localStorage.setItem("team-v7-data", JSON.stringify(players));
  }, [players]);

  const selectedPlayer =
    players.find((p) => p.name === selectedName) || players[0];

  const allMatches = players.flatMap((p) => p.matches);

  const teamStats = {
    players: players.length,
    matches: allMatches.length,
    goals: totalStat(allMatches, "goals"),
    assists: totalStat(allMatches, "assists"),
  };

  const ranking = useMemo(() => {
    return [...players]
      .map((p) => ({
        ...p,
        avgRating: averageRating(p.matches),
      }))
      .sort((a, b) => {
        const aScore = a.avgRating === "-" ? 0 : Number(a.avgRating);
        const bScore = b.avgRating === "-" ? 0 : Number(b.avgRating);
        return bScore - aScore || b.ability - a.ability;
      });
  }, [players]);

  const mvp = ranking.find((p) => p.matches.length > 0);

  const bestLineup = {
    前场: [...players].filter((p) => p.category === "前场").sort((a, b) => b.ability - a.ability).slice(0, 3),
    中场: [...players].filter((p) => p.category === "中场").sort((a, b) => b.ability - a.ability).slice(0, 3),
    后卫: [...players].filter((p) => p.category === "后卫").sort((a, b) => b.ability - a.ability).slice(0, 4),
  };

  function addMatchRecord() {
    if (!matchForm.date || !matchForm.opponent || !matchForm.rating) {
      alert("请至少填写日期、对手和评分");
      return;
    }

    const newMatch = {
      date: matchForm.date,
      opponent: matchForm.opponent,
      goals: Number(matchForm.goals || 0),
      assists: Number(matchForm.assists || 0),
      rating: Number(matchForm.rating),
      note: matchForm.note || "暂无备注",
    };

    setPlayers((old) =>
      old.map((p) =>
        p.name === selectedPlayer.name
          ? { ...p, matches: [...p.matches, newMatch] }
          : p
      )
    );

    setMatchForm({
      date: "",
      opponent: "",
      goals: "",
      assists: "",
      rating: "",
      note: "",
    });
  }

  function resetData() {
    const ok = window.confirm("确认清空所有比赛记录并恢复初始数据吗？");
    if (!ok) return;
    localStorage.removeItem("team-v7-data");
    setPlayers(initialPlayers);
  }

  return (
    <div className="fm-shell">
      <aside className="fm-left-nav">
        <div className="club-badge">FC</div>
        <button className={view === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => setView("dashboard")}>主页</button>
        <button className={view === "players" ? "nav-item active" : "nav-item"} onClick={() => setView("players")}>球员</button>
        <button className={view === "matches" ? "nav-item active" : "nav-item"} onClick={() => setView("matches")}>比赛</button>
        <button className={view === "lineup" ? "nav-item active" : "nav-item"} onClick={() => setView("lineup")}>阵容</button>
        <button className={view === "coach" ? "nav-item active" : "nav-item"} onClick={() => setView("coach")}>教练</button>
      </aside>

      <main className="fm-main">
        <header className="fm-topbar">
          <div>
            <h1>球队内部战术中心 V7</h1>
            <p>球星卡 / 比赛记录 / 阵容推荐 / 教练系统</p>
          </div>
          <div className="top-actions">
            <span>本地保存</span>
            <span>职业版</span>
          </div>
        </header>

        {view === "dashboard" && (
          <section className="dashboard-grid">
            <InfoCard title="球员数量" value={teamStats.players} />
            <InfoCard title="比赛记录" value={teamStats.matches} />
            <InfoCard title="总进球" value={teamStats.goals} />
            <InfoCard title="总助攻" value={teamStats.assists} />

            <div className="panel wide">
              <h2>自动 MVP</h2>
              {mvp ? (
                <p>{mvp.name}｜场均评分 {mvp.avgRating}｜{getStatus(mvp)}</p>
              ) : (
                <p>暂无比赛记录，录入评分后自动生成 MVP。</p>
              )}
            </div>
          </section>
        )}

        {view === "players" && (
          <div className="player-layout">
            <aside className="player-list">
              {categories.map((category) => (
                <div key={category} className="player-group">
                  <h3>{category}</h3>
                  {players
                    .filter((p) => p.category === category)
                    .map((p) => (
                      <button
                        key={p.name}
                        className={selectedName === p.name ? "player-row active" : "player-row"}
                        onClick={() => setSelectedName(p.name)}
                      >
                        <span>#{p.number}</span>
                        <strong>{p.name}</strong>
                        <small>{p.position}</small>
                        <small>能力 {p.ability}　潜力 {p.potential}</small>
                      </button>
                    ))}
                </div>
              ))}
            </aside>

            <section className="fm-player-page">
              <div className="v7-player-grid">
                <PlayerStarCard player={selectedPlayer} />

                <div className="v7-detail">
                  <div className="player-hero">
                    <div>
                      <h2>{selectedPlayer.name}</h2>
                      <p>{selectedPlayer.position} / {selectedPlayer.role}</p>
                      <div className="tag-row">
                        {selectedPlayer.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="ability-box">
                      <div><small>能力</small><strong>{selectedPlayer.ability}</strong></div>
                      <div><small>潜力</small><strong>{selectedPlayer.potential}</strong></div>
                    </div>
                  </div>

                  <div className="fm-content-grid">
                    <section className="panel">
                      <h3>球员定位</h3>
                      <p>{selectedPlayer.summary}</p>
                    </section>

                    <section className="panel">
                      <h3>建议方向</h3>
                      <ul>
                        {selectedPlayer.suggestions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="panel wide">
                      <h3>比赛记录</h3>
                      <MatchTable matches={selectedPlayer.matches} />
                    </section>
                  </div>
                </div>
              </div>
            </section>

            <aside className="right-analysis">
              <section className="panel">
                <h3>能力属性</h3>
                {Object.entries(selectedPlayer.attributes).map(([key, value]) => (
                  <div className="attr-row" key={key}>
                    <span>{key}</span>
                    <b className={value >= 75 ? "elite" : value >= 65 ? "good" : "weak"}>{value}</b>
                  </div>
                ))}
              </section>

              <section className="panel">
                <h3>赛季统计</h3>
                <div className="season-row"><span>出场</span><b>{selectedPlayer.matches.length}</b></div>
                <div className="season-row"><span>进球</span><b>{totalStat(selectedPlayer.matches, "goals")}</b></div>
                <div className="season-row"><span>助攻</span><b>{totalStat(selectedPlayer.matches, "assists")}</b></div>
                <div className="season-row"><span>场均评分</span><b>{averageRating(selectedPlayer.matches)}</b></div>
              </section>
            </aside>
          </div>
        )}

        {view === "matches" && (
          <div className="match-page">
            <section className="panel">
              <h2>添加比赛记录</h2>
              <p>当前球员：<strong>{selectedPlayer.name}</strong></p>

              <div className="form-grid">
                <input placeholder="日期，例如 2026-04-26" value={matchForm.date} onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })} />
                <input placeholder="对手" value={matchForm.opponent} onChange={(e) => setMatchForm({ ...matchForm, opponent: e.target.value })} />
                <input placeholder="进球" value={matchForm.goals} onChange={(e) => setMatchForm({ ...matchForm, goals: e.target.value })} />
                <input placeholder="助攻" value={matchForm.assists} onChange={(e) => setMatchForm({ ...matchForm, assists: e.target.value })} />
                <input placeholder="评分，例如 7.5" value={matchForm.rating} onChange={(e) => setMatchForm({ ...matchForm, rating: e.target.value })} />
              </div>

              <textarea placeholder="比赛备注" value={matchForm.note} onChange={(e) => setMatchForm({ ...matchForm, note: e.target.value })} />

              <button className="primary-btn" onClick={addMatchRecord}>添加记录</button>
            </section>

            <section className="panel">
              <h2>{selectedPlayer.name} 的比赛记录</h2>
              <MatchTable matches={selectedPlayer.matches} />
            </section>
          </div>
        )}

        {view === "lineup" && (
          <section className="dashboard-grid">
            <div className="panel wide">
              <h2>自动推荐阵容</h2>
              <p>按当前能力值自动推荐前场、中场、后卫人选。</p>
            </div>

            {["前场", "中场", "后卫"].map((line) => (
              <div className="panel" key={line}>
                <h2>{line}</h2>
                <ul>
                  {bestLineup[line].map((p) => (
                    <li key={p.name}>{p.name}｜{p.position}｜能力 {p.ability}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {view === "coach" && (
          <section className="dashboard-grid">
            <div className="panel wide">
              <h2>评分排行榜</h2>
              <MatchRanking ranking={ranking} />
            </div>

            <div className="panel">
              <h2>数据管理</h2>
              <button className="primary-btn" onClick={resetData}>清空并恢复初始数据</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function MatchTable({ matches }) {
  if (!matches.length) {
    return (
      <div className="empty-match">
        <div className="empty-icon">📄</div>
        <h4>暂无比赛记录</h4>
        <p>可在比赛页面添加赛后数据。</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>对手</th>
            <th>进球</th>
            <th>助攻</th>
            <th>评分</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m, i) => (
            <tr key={`${m.date}-${i}`}>
              <td>{m.date}</td>
              <td>{m.opponent}</td>
              <td>{m.goals}</td>
              <td>{m.assists}</td>
              <td>{m.rating}</td>
              <td>{m.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchRanking({ ranking }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>球员</th>
            <th>位置</th>
            <th>场均评分</th>
            <th>出场</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((p, index) => (
            <tr key={p.name}>
              <td>{index + 1}</td>
              <td>{p.name}</td>
              <td>{p.position}</td>
              <td>{p.avgRating}</td>
              <td>{p.matches.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <section className="panel info-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </section>
  );
}
