import "./styles.css";
import React, { useEffect, useMemo, useState, useCallback } from "react";

const initialPlayers = [
  {
    name: "陆梓鑫",
    number: 3,
    category: "后卫",
    position: "LB",
    role: "边路稳定器",
    ability: 74,
    potential: 82,
    tags: ["跑动", "执行力", "左路稳定"],
    summary: "左路稳定型球员，适合承担防守、补位和边路衔接任务。",
    suggestions: ["前插时可以更果断。", "传球选择可增加向前比例。", "继续提升传中质量。"],
    attributes: {
      速度: 74,
      射门: 52,
      盘带: 72,
      传球: 69,
      防守: 73,
      体能: 76,
      力量: 70,
      意识: 72,
    },
    matches: [],
  },
  {
    name: "戴天麒",
    number: 17,
    category: "中场",
    position: "CDM / RB",
    role: "防守屏障",
    ability: 80,
    potential: 86,
    tags: ["扫荡", "拦截", "高覆盖"],
    summary: "负责中场保护，拦截对手进攻，为球队提供稳定屏障。",
    suggestions: ["注意纵向保护。", "出球时更耐心。", "领先时保持专注。"],
    attributes: {
      速度: 72,
      射门: 48,
      盘带: 63,
      传球: 65,
      防守: 82,
      体能: 84,
      力量: 84,
      意识: 74,
    },
    matches: [],
  },
  {
    name: "吴易纬",
    number: 11,
    category: "前场",
    position: "LW / RW / CAM",
    role: "前场多面手",
    ability: 78,
    potential: 80,
    tags: ["突破", "创造", "多位置"],
    summary: "可承担多个前场角色，适合制造进攻变化。",
    suggestions: ["增加无球跑动。", "突破后选择更果断。", "提升最后一传稳定性。"],
    attributes: {
      速度: 82,
      射门: 70,
      盘带: 82,
      传球: 74,
      防守: 50,
      体能: 72,
      力量: 68,
      意识: 70,
    },
    matches: [],
  },
  {
    name: "贾玉乐",
    number: 9,
    category: "前场",
    position: "LW / ST",
    role: "前场冲击点",
    ability: 72,
    potential: 74,
    tags: ["身体", "支点", "冲击"],
    summary: "前场力量型球员，适合承担支点和牵制任务。",
    suggestions: ["多利用身体保护球权。", "提前观察中路队友。", "背身拿球减少停顿。"],
    attributes: {
      速度: 68,
      射门: 70,
      盘带: 66,
      传球: 58,
      防守: 42,
      体能: 70,
      力量: 82,
      意识: 66,
    },
    matches: [],
  },
  {
    name: "张冬晨",
    number: 8,
    category: "前场",
    position: "CAM",
    role: "前场连接点",
    ability: 73,
    potential: 74,
    tags: ["接应", "传球", "组织"],
    summary: "适合阵地战中提供接应和短传连接。",
    suggestions: ["增加跑动参与度。", "加快处理球节奏。", "提升对抗稳定性。"],
    attributes: {
      速度: 62,
      射门: 64,
      盘带: 71,
      传球: 73,
      防守: 55,
      体能: 66,
      力量: 60,
      意识: 70,
    },
    matches: [],
  },
  {
    name: "麻伟华",
    number: 10,
    category: "中场",
    position: "CM",
    role: "组织核心",
    ability: 82,
    potential: 84,
    tags: ["节拍器", "组织", "出球"],
    summary: "球队进攻节奏掌控者，擅长短传和控球。",
    suggestions: ["对抗强时更早出球。", "增加无球接应。", "尝试更果断向前传球。"],
    attributes: {
      速度: 58,
      射门: 60,
      盘带: 76,
      传球: 86,
      防守: 62,
      体能: 70,
      力量: 58,
      意识: 82,
    },
    matches: [],
  },
  {
    name: "赵俊楠",
    number: 25,
    category: "后卫",
    position: "CB",
    role: "防线核心",
    ability: 84,
    potential: 86,
    tags: ["防线统帅", "站位", "补位"],
    summary: "球队后场稳定器，负责防线高度、补位和后场组织。",
    suggestions: ["高位防线时提醒队友保护距离。", "提前控制身后空间。", "更多组织队友站位。"],
    attributes: {
      速度: 72,
      射门: 45,
      盘带: 66,
      传球: 70,
      防守: 86,
      体能: 80,
      力量: 84,
      意识: 84,
    },
    matches: [],
  },
  {
    name: "吴俊",
    number: 13,
    category: "后卫",
    position: "RB / CB / GK",
    role: "多功能防守补充",
    ability: 70,
    potential: 73,
    tags: ["多位置", "补位", "防守"],
    summary: "可在 RB、CB、GK 特殊场景中补充使用。",
    suggestions: ["位置切换时多沟通。", "防守站位更紧凑。", "门将位置可作为备用。"],
    attributes: {
      速度: 60,
      射门: 40,
      盘带: 55,
      传球: 58,
      防守: 70,
      体能: 66,
      力量: 68,
      意识: 64,
    },
    matches: [],
  },
];

const categories = ["前场", "中场", "后卫"];

const coachData = [
  {
    name: "章兮兮",
    role: "主教练",
    roleKey: "head",
    desc: "负责整体战术、首发选择、临场调整与比赛决策。",
    initials: "章",
    focus: "整体战术 / 首发安排 / 比赛指挥",
  },
  {
    name: "陆梓鑫",
    role: "助理教练",
    roleKey: "assistant-player",
    desc: "负责训练组织、球员沟通、边路战术执行反馈。",
    initials: "陆",
    focus: "训练组织 / 球员沟通 / 执行反馈",
  },
  {
    name: "杨寒",
    role: "助理教练",
    roleKey: "assistant",
    desc: "负责数据记录、赛后复盘、阵容建议与战术辅助。",
    initials: "杨",
    focus: "数据分析 / 赛后复盘 / 战术辅助",
  },
];

function averageRating(matches) {
  if (!matches.length) return "-";
  const total = matches.reduce((sum, m) => sum + Number(m.rating || 0), 0);
  return (total / matches.length).toFixed(1);
}

function totalStat(matches, key) {
  return matches.reduce((sum, m) => sum + Number(m[key] || 0), 0);
}

function getNumberValue(value) {
  if (value === "-" || value === undefined || value === null) return 0;
  return Number(value);
}

function getStatus(player) {
  const avg = averageRating(player.matches);
  if (avg === "-") return "暂无数据";
  if (Number(avg) >= 8) return "状态优秀 🔥";
  if (Number(avg) >= 7) return "状态稳定";
  if (Number(avg) >= 6) return "需要观察";
  return "建议调整";
}

function countResults(matches) {
  let wins = 0;
  let draws = 0;
  let losses = 0;

  matches.forEach((m) => {
    if (m.result === "win") wins += 1;
    if (m.result === "draw") draws += 1;
    if (m.result === "loss") losses += 1;
  });

  return { wins, draws, losses };
}

function getUniqueTeamMatches(players) {
  const map = new Map();

  players.forEach((player) => {
    player.matches.forEach((match) => {
      const key = `${match.date}-${match.opponent}`;
      if (!map.has(key)) {
        map.set(key, match);
      }
    });
  });

  return Array.from(map.values());
}

export default function App() {
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem("team-v8-data");
      return saved ? JSON.parse(saved) : initialPlayers;
    } catch {
      return initialPlayers;
    }
  });

  const [view, setView] = useState("players");
  const [selectedName, setSelectedName] = useState("陆梓鑫");

  const [matchForm, setMatchForm] = useState({
    date: "",
    opponent: "",
    result: "",
    goals: "",
    assists: "",
    rating: "",
    note: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem("team-v8-data", JSON.stringify(players));
    } catch {
      // ignore localStorage errors
    }
  }, [players]);

  const selectedPlayer = players.find((p) => p.name === selectedName) || players[0];

  const allMatches = players.flatMap((p) => p.matches);
  const resultsCount = countResults(allMatches);

  const teamStats = {
    players: players.length,
    matches: allMatches.length,
    goals: totalStat(allMatches, "goals"),
    assists: totalStat(allMatches, "assists"),
    wins: resultsCount.wins,
    draws: resultsCount.draws,
    losses: resultsCount.losses,
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

  const awardStats = useMemo(() => {
    const playerStats = players.map((player) => {
      const goals = totalStat(player.matches, "goals");
      const assists = totalStat(player.matches, "assists");
      const avgRating = averageRating(player.matches);
      const ratingScore = getNumberValue(avgRating);

      return {
        ...player,
        goals,
        assists,
        avgRating,
        ratingScore,
      };
    });

    const topScorer = [...playerStats].sort(
      (a, b) => b.goals - a.goals || b.ratingScore - a.ratingScore || b.ability - a.ability
    )[0];

    const assistKing = [...playerStats].sort(
      (a, b) => b.assists - a.assists || b.ratingScore - a.ratingScore || b.ability - a.ability
    )[0];

    const bestDefender = [...playerStats]
      .filter((player) => player.category === "后卫")
      .map((player) => {
        const defense = player.attributes?.防守 || 0;
        const body = player.attributes?.力量 || player.attributes?.身体 || 0;
        const awareness = player.attributes?.意识 || 0;

        return {
          ...player,
          defenseScore: defense * 0.45 + body * 0.2 + awareness * 0.2 + player.ability * 0.15,
        };
      })
      .sort((a, b) => b.defenseScore - a.defenseScore)[0];

    const teamMatches = getUniqueTeamMatches(players);
    const teamResult = countResults(teamMatches);
    const coachMatches = teamMatches.length;
    const coachWinRate =
      coachMatches > 0 ? `${((teamResult.wins / coachMatches) * 100).toFixed(0)}%` : "-";

    return {
      playerStats,
      topScorer,
      assistKing,
      bestDefender,
      coachMatches,
      coachWinRate,
      teamResult,
      bestCoach: coachData[0],
    };
  }, [players]);

  const bestLineup = {
    前场: [...players]
      .filter((p) => p.category === "前场")
      .sort((a, b) => b.ability - a.ability)
      .slice(0, 3),
    中场: [...players]
      .filter((p) => p.category === "中场")
      .sort((a, b) => b.ability - a.ability)
      .slice(0, 3),
    后卫: [...players]
      .filter((p) => p.category === "后卫")
      .sort((a, b) => b.ability - a.ability)
      .slice(0, 4),
  };

  const addMatchRecord = useCallback(() => {
    if (!matchForm.date || !matchForm.opponent || !matchForm.rating) {
      alert("请至少填写日期、对手和评分");
      return;
    }

    if (!matchForm.result) {
      alert("请选择比赛结果（胜 / 平 / 负）");
      return;
    }

    const newMatch = {
      date: matchForm.date,
      opponent: matchForm.opponent,
      result: matchForm.result,
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
      result: "",
      goals: "",
      assists: "",
      rating: "",
      note: "",
    });
  }, [matchForm, selectedPlayer.name]);

  const resetData = useCallback(() => {
    const ok = window.confirm("确认清空所有比赛记录并恢复初始数据吗？");
    if (!ok) return;

    localStorage.removeItem("team-v8-data");
    setPlayers(initialPlayers);
  }, []);

  const navItems = [
    { key: "dashboard", label: "主页" },
    { key: "players", label: "球员" },
    { key: "matches", label: "比赛" },
    { key: "lineup", label: "阵容" },
    { key: "awards", label: "奖项" },
    { key: "coach", label: "教练组" },
  ];

  return (
    <div className="fm-shell">
      <aside className="fm-left-nav">
        <div className="club-badge">FC</div>
        {navItems.map((item) => (
          <button
            key={item.key}
            className={view === item.key ? "nav-item active" : "nav-item"}
            onClick={() => setView(item.key)}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <main className="fm-main">
        <header className="fm-topbar">
          <div>
            <h1>球队内部战术中心 V8 🔥</h1>
            <p>球星卡 / 比赛记录 / 阵容推荐 / 教练系统 / 奖项系统</p>
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
            <InfoCard title="胜利" value={teamStats.wins} className="result-win" />
            <InfoCard title="平局" value={teamStats.draws} className="result-draw" />
            <InfoCard title="失败" value={teamStats.losses} className="result-loss" />
            <InfoCard
              title="胜率"
              value={
                teamStats.matches > 0
                  ? `${((teamStats.wins / teamStats.matches) * 100).toFixed(0)}%`
                  : "-"
              }
            />

            <div className="panel wide">
              <h2>自动 MVP</h2>
              {mvp ? (
                <p>
                  {mvp.name}｜场均评分 {mvp.avgRating}｜{getStatus(mvp)}
                </p>
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
                        <small>
                          能力 {p.ability}　潜力 {p.potential}
                        </small>
                      </button>
                    ))}
                </div>
              ))}
            </aside>

            <section className="fm-player-page">
              <div className="v7-player-grid">
                <StarCardEmbedded player={selectedPlayer} />

                <div className="v7-detail">
                  <div className="player-hero">
                    <div>
                      <h2>{selectedPlayer.name}</h2>
                      <p>
                        {selectedPlayer.position} / {selectedPlayer.role}
                      </p>
                      <div className="tag-row">
                        {selectedPlayer.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="ability-box">
                      <div>
                        <small>能力</small>
                        <strong>{selectedPlayer.ability}</strong>
                      </div>
                      <div>
                        <small>潜力</small>
                        <strong>{selectedPlayer.potential}</strong>
                      </div>
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
                      <h3>个人奖项</h3>
                      <PlayerAwardBadges player={selectedPlayer} awardStats={awardStats} />
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
                    <b className={value >= 75 ? "elite" : value >= 65 ? "good" : "weak"}>
                      {value}
                    </b>
                  </div>
                ))}
              </section>

              <section className="panel">
                <h3>赛季统计</h3>
                <div className="season-row">
                  <span>出场</span>
                  <b>{selectedPlayer.matches.length}</b>
                </div>
                <div className="season-row">
                  <span>进球</span>
                  <b>{totalStat(selectedPlayer.matches, "goals")}</b>
                </div>
                <div className="season-row">
                  <span>助攻</span>
                  <b>{totalStat(selectedPlayer.matches, "assists")}</b>
                </div>
                <div className="season-row">
                  <span>场均评分</span>
                  <b>{averageRating(selectedPlayer.matches)}</b>
                </div>
              </section>
            </aside>
          </div>
        )}

        {view === "matches" && (
          <div
            className="match-page"
            style={{
              padding: "20px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <section className="panel">
              <h2>添加比赛记录</h2>
              <p style={{ marginBottom: "12px", color: "var(--sub)" }}>
                当前球员：<strong style={{ color: "#fff" }}>{selectedPlayer.name}</strong>
              </p>

              <div className="form-grid">
                <input
                  placeholder="日期，例如 2026-04-26"
                  value={matchForm.date}
                  onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                />
                <input
                  placeholder="对手"
                  value={matchForm.opponent}
                  onChange={(e) => setMatchForm({ ...matchForm, opponent: e.target.value })}
                />
                <input
                  placeholder="进球"
                  type="number"
                  value={matchForm.goals}
                  onChange={(e) => setMatchForm({ ...matchForm, goals: e.target.value })}
                />
                <input
                  placeholder="助攻"
                  type="number"
                  value={matchForm.assists}
                  onChange={(e) => setMatchForm({ ...matchForm, assists: e.target.value })}
                />
                <input
                  placeholder="评分，例如 7.5"
                  type="number"
                  step="0.1"
                  value={matchForm.rating}
                  onChange={(e) => setMatchForm({ ...matchForm, rating: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--sub)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  比赛结果：
                </label>
                <div className="result-btn-group">
                  <button
                    className={`result-btn ${matchForm.result === "win" ? "selected-win" : ""}`}
                    onClick={() => setMatchForm({ ...matchForm, result: "win" })}
                  >
                    胜
                  </button>
                  <button
                    className={`result-btn ${matchForm.result === "draw" ? "selected-draw" : ""}`}
                    onClick={() => setMatchForm({ ...matchForm, result: "draw" })}
                  >
                    平
                  </button>
                  <button
                    className={`result-btn ${matchForm.result === "loss" ? "selected-loss" : ""}`}
                    onClick={() => setMatchForm({ ...matchForm, result: "loss" })}
                  >
                    负
                  </button>
                </div>
              </div>

              <textarea
                placeholder="比赛备注"
                value={matchForm.note}
                onChange={(e) => setMatchForm({ ...matchForm, note: e.target.value })}
              />

              <button className="primary-btn" onClick={addMatchRecord}>
                添加记录
              </button>
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

            <div className="panel wide">
              <h2>FM战术图</h2>
              <FMPitch bestLineup={bestLineup} allPlayers={players} />
            </div>

            {categories.map((line) => (
              <div className="panel" key={line}>
                <h2>{line}</h2>
                <ul>
                  {bestLineup[line].map((p) => (
                    <li key={p.name}>
                      {p.name}｜{p.position}｜能力 {p.ability}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {view === "awards" && (
          <section className="dashboard-grid">
            <div className="panel wide">
              <h2>球队赛季奖项</h2>
              <p>根据当前比赛记录和球员能力数据自动生成，后续也可以改成人工评选。</p>
            </div>

            <AwardCard
              title="射手王"
              icon="⚽"
              name={awardStats.topScorer?.name || "-"}
              value={`${awardStats.topScorer?.goals || 0} 球`}
              desc="按进球数自动评选"
            />

            <AwardCard
              title="助攻王"
              icon="🎯"
              name={awardStats.assistKing?.name || "-"}
              value={`${awardStats.assistKing?.assists || 0} 助攻`}
              desc="按助攻数自动评选"
            />

            <AwardCard
              title="最佳防守队员"
              icon="🛡️"
              name={awardStats.bestDefender?.name || "-"}
              value={`防守评分 ${awardStats.bestDefender?.attributes?.防守 || "-"}`}
              desc="综合防守、力量、意识和能力值评选"
            />

            <AwardCard
              title="最佳主教练"
              icon="👑"
              name={awardStats.bestCoach?.name || "-"}
              value={`执教 ${awardStats.coachMatches} 场`}
              desc={`胜率 ${awardStats.coachWinRate}`}
            />
          </section>
        )}

        {view === "coach" && (
          <section className="dashboard-grid">
            <div className="panel wide">
              <h2>教练组</h2>
              <div className="coach-grid">
                {coachData.map((coach) => (
                  <div
                    key={coach.name}
                    className={coach.roleKey === "head" ? "coach-card head-coach" : "coach-card"}
                  >
                    {coach.roleKey === "head" && <div className="coach-badge-head">👑</div>}
                    <div className="coach-avatar">{coach.initials}</div>
                    <div className="coach-name">{coach.name}</div>
                    <div className="coach-role">{coach.role}</div>
                    <div className="coach-desc">{coach.desc}</div>

                    <div className="coach-record">
                      <span>职责</span>
                      <strong>{coach.focus}</strong>
                    </div>

                    <div className="coach-record">
                      <span>执教场次</span>
                      <strong>{awardStats.coachMatches}</strong>
                    </div>

                    <div className="coach-record">
                      <span>当前胜率</span>
                      <strong>{awardStats.coachWinRate}</strong>
                    </div>

                    {coach.roleKey === "head" && <div className="coach-award">👑 最佳主教练候选</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel wide">
              <h2>评分排行榜</h2>
              <MatchRanking ranking={ranking} />
            </div>

            <div className="panel">
              <h2>数据管理</h2>
              <button className="primary-btn danger" onClick={resetData}>
                恢复初始数据
              </button>
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
            <th>结果</th>
            <th>进球</th>
            <th>助攻</th>
            <th>评分</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m, i) => {
            let resultLabel = "-";
            let resultClass = "";

            if (m.result === "win") {
              resultLabel = "胜";
              resultClass = "win";
            }

            if (m.result === "draw") {
              resultLabel = "平";
              resultClass = "draw";
            }

            if (m.result === "loss") {
              resultLabel = "负";
              resultClass = "loss";
            }

            return (
              <tr key={`${m.date}-${i}`}>
                <td>{m.date}</td>
                <td>{m.opponent}</td>
                <td>
                  <span className={`result-badge ${resultClass}`}>{resultLabel}</span>
                </td>
                <td>{m.goals}</td>
                <td>{m.assists}</td>
                <td>{m.rating}</td>
                <td>{m.note}</td>
              </tr>
            );
          })}
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

function InfoCard({ title, value, className = "" }) {
  return (
    <section className={`panel info-card ${className}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </section>
  );
}

function StarCardEmbedded({ player }) {
  const avg = averageRating(player.matches);
  const statusEmoji =
    avg === "-"
      ? "🔄"
      : Number(avg) >= 8
        ? "🔥"
        : Number(avg) >= 7
          ? "⭐"
          : Number(avg) >= 6
            ? "👀"
            : "⚠️";

  return (
    <div className="star-card-embedded">
      <div className="star-glow">{statusEmoji}</div>
      <div className="star-number">{player.number}</div>
      <div className="star-pos">{player.position}</div>
      <div className="star-name">{player.name}</div>
      <div
        style={{
          color: "var(--sub)",
          fontSize: "0.8rem",
          marginTop: "2px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {player.role}
      </div>

      <div className="star-stats-mini">
        <div className="star-stat-item">
          <span className="val">{player.ability}</span>
          <span className="lbl">能力</span>
        </div>
        <div className="star-stat-item">
          <span className="val">{player.potential}</span>
          <span className="lbl">潜力</span>
        </div>
        <div className="star-stat-item">
          <span className="val">{avg}</span>
          <span className="lbl">场均评分</span>
        </div>
        <div className="star-stat-item">
          <span className="val">{totalStat(player.matches, "goals")}</span>
          <span className="lbl">进球</span>
        </div>
      </div>
    </div>
  );
}

function FMPitch({ bestLineup, allPlayers }) {
  const gk =
    allPlayers.find((p) => p.position === "GK") ||
    bestLineup["后卫"]?.find((p) => p.position === "GK") ||
    null;

  const defenders = bestLineup["后卫"]?.filter((p) => p.position !== "GK").slice(0, 4) || [];
  const midfielders = bestLineup["中场"]?.slice(0, 3) || [];
  const forwards = bestLineup["前场"]?.slice(0, 3) || [];

  const allPositions = [];

  forwards.forEach((p, i) => {
    const x = 25 + i * 25;
    allPositions.push({ ...p, x, y: 18, cls: "forward" });
  });

  midfielders.forEach((p, i) => {
    const x = 30 + i * 20;
    allPositions.push({ ...p, x, y: 42, cls: "midfield" });
  });

  defenders.forEach((p, i) => {
    const x = 20 + i * 20;
    allPositions.push({ ...p, x, y: 72, cls: "defender" });
  });

  if (gk) {
    allPositions.push({ ...gk, x: 50, y: 90, cls: "gk" });
  }

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

function AwardCard({ title, icon, name, value, desc }) {
  return (
    <div className="panel award-card">
      <div className="award-icon">{icon}</div>
      <h2>{title}</h2>
      <div className="award-name">{name}</div>
      <div className="award-value">{value}</div>
      <p>{desc}</p>
    </div>
  );
}

function PlayerAwardBadges({ player, awardStats }) {
  const awards = [];

  if (awardStats.topScorer?.name === player.name && awardStats.topScorer.goals > 0) {
    awards.push({
      icon: "⚽",
      title: "射手王",
      desc: `${awardStats.topScorer.goals} 球`,
    });
  }

  if (awardStats.assistKing?.name === player.name && awardStats.assistKing.assists > 0) {
    awards.push({
      icon: "🎯",
      title: "助攻王",
      desc: `${awardStats.assistKing.assists} 助攻`,
    });
  }

  if (awardStats.bestDefender?.name === player.name) {
    awards.push({
      icon: "🛡️",
      title: "最佳防守队员",
      desc: "防守综合评分最高",
    });
  }

  if (!awards.length) {
    return <p style={{ color: "var(--sub)" }}>暂无个人奖项，继续通过比赛表现争取奖项。</p>;
  }

  return (
    <div className="player-awards">
      {awards.map((award) => (
        <div className="player-award-badge" key={award.title}>
          <span>{award.icon}</span>
          <strong>{award.title}</strong>
          <small>{award.desc}</small>
        </div>
      ))}
    </div>
  );
}
