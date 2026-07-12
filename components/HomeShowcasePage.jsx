import React from "react";
import { InfoCard } from "./StatisticsPanel";

function HomeShowcasePage({ 
  clubInfo, 
  teamStats, 
  latestTeamMatch, 
  recentTeamMatches = [],
  featuredPlayers, 
  ranking, 
  mvp, 
  nextMatch, 
  setView, 
  setSelectedName, 
  setSelectedTeamMatchId 
}) {
  const winRate = teamStats.matches > 0 ? `${((teamStats.wins / teamStats.matches) * 100).toFixed(0)}%` : "-";
  const matchDate = nextMatch?.date ? new Date(`${nextMatch.date}T${nextMatch.time || "00:00"}`) : null;
  const daysToMatch = matchDate && !Number.isNaN(matchDate.getTime())
    ? Math.ceil((matchDate.getTime() - Date.now()) / 86400000)
    : null;
  const countdown = daysToMatch === null
    ? "赛程待公布"
    : daysToMatch > 1
      ? `${daysToMatch} 天后开赛`
      : daysToMatch === 1
        ? "明天开赛"
        : daysToMatch === 0
          ? "今天开赛"
          : "比赛已结束";

  const latestResult = latestTeamMatch
    ? Number(latestTeamMatch.ourScore) > Number(latestTeamMatch.opponentScore)
      ? { key: "win", label: "胜利" }
      : Number(latestTeamMatch.ourScore) < Number(latestTeamMatch.opponentScore)
        ? { key: "loss", label: "失利" }
        : { key: "draw", label: "平局" }
    : null;
  const goalsPerMatch = teamStats.matches > 0 ? (teamStats.goals / teamStats.matches).toFixed(1) : "0.0";
  const recentForm = [...recentTeamMatches].reverse().map((match) => {
    const ourScore = Number(match.ourScore || 0);
    const opponentScore = Number(match.opponentScore || 0);
    if (ourScore > opponentScore) return { key: "win", label: "胜" };
    if (ourScore < opponentScore) return { key: "loss", label: "负" };
    return { key: "draw", label: "平" };
  });

  return (
    <section className="home-showcase">
      <div className="home-hero panel">
        <div className="stadium-scene" aria-hidden="true">
          <div className="stadium-light stadium-light-left" />
          <div className="stadium-light stadium-light-right" />
          <div className="stadium-pitch">
            <i className="pitch-half-line" />
            <i className="pitch-center-circle" />
          </div>
        </div>
        <div className="home-hero-copy">
          <div className="hero-status-row">
            <span className="home-kicker">{clubInfo.city} Amateur Football Club</span>
            <span className="season-live"><i /> 2026 SEASON</span>
          </div>
          <h2>{clubInfo.name}</h2>
          <p>{clubInfo.slogan}</p>
          <small>{clubInfo.description}</small>
          <div className="home-hero-actions">
            <button className="primary-btn" onClick={() => setView("playerLibrary")}>
              查看球员卡墙
            </button>
            <button className="small-ghost-btn" onClick={() => setView("teamMatches")}>
              进入比赛详情
            </button>
          </div>
          <div className="hero-record-line">
            <div><strong>{teamStats.wins}</strong><span>胜</span></div>
            <div><strong>{teamStats.draws}</strong><span>平</span></div>
            <div><strong>{teamStats.losses}</strong><span>负</span></div>
            <div><strong>{goalsPerMatch}</strong><span>场均进球</span></div>
          </div>
        </div>
        <div className="home-hero-badge">
          <span className="identity-label">CLUB IDENTITY</span>
          <div className="club-big-badge">{clubInfo.shortName || "FC"}</div>
          <strong>{clubInfo.homeGround}</strong>
          <span>{clubInfo.homeKit}</span>
          <small>{teamStats.matches} 场比赛 · {teamStats.goals} 粒进球</small>
          <div className="recent-form-row">
            <small>近况</small>
            <div>
              {recentForm.length ? recentForm.map((result, index) => (
                <i key={`${result.key}-${index}`} className={`form-dot ${result.key}`}>{result.label}</i>
              )) : <em>等待比赛数据</em>}
            </div>
          </div>
        </div>
      </div>

      <div className="home-stat-grid">
        <InfoCard index="01" title="球队阵容" value={teamStats.players} meta="注册球员" />
        <InfoCard index="02" title="赛季比赛" value={teamStats.matches} meta={`${teamStats.wins}胜 ${teamStats.draws}平 ${teamStats.losses}负`} />
        <InfoCard index="03" title="进攻表现" value={teamStats.goals} meta={`场均 ${goalsPerMatch} 球`} />
        <InfoCard index="04" title="赛季胜率" value={winRate} meta="持续刷新" />
      </div>

      <div className="home-two-col">
        <section className="panel next-match-panel">
          <div className="section-head-row">
            <h2>下一场比赛</h2>
            <button className="small-ghost-btn" onClick={() => setView("operations")}>
              运营设置
            </button>
          </div>
          {nextMatch?.opponent ? (
            <div className="next-match-card">
              <div className="match-card-kicker">
                <span>NEXT MATCH</span>
                <strong>{countdown}</strong>
              </div>
              <h3>
                {clubInfo.name} vs {nextMatch.opponent}
              </h3>
              <strong>
                {nextMatch.date || "日期待定"} {nextMatch.time || ""}
              </strong>
              <p>
                {nextMatch.stadium || clubInfo.homeGround}｜{nextMatch.type || "友谊赛"}
              </p>
              <small>{nextMatch.note || "暂无赛前备注"}</small>
            </div>
          ) : (
            <div className="empty-match">
              <div className="empty-icon">📅</div>
              <p>暂无下一场比赛</p>
              <small>在运营页录入后，首页会自动展示赛前信息。</small>
            </div>
          )}
        </section>

        <section className="panel latest-match-panel">
          <div className="section-head-row">
            <h2>最新比赛</h2>
            <button className="small-ghost-btn" onClick={() => setView("teamMatches")}>
              全部比赛
            </button>
          </div>
          {latestTeamMatch ? (
            <div
              className={`latest-score-card result-${latestResult.key}`}
              onClick={() => {
                setSelectedTeamMatchId(latestTeamMatch.id);
                setView("teamMatches");
              }}
              style={{ cursor: "pointer" }}
            >
              <b className="match-result-badge">{latestResult.label}</b>
              <span>
                {latestTeamMatch.date}｜{latestTeamMatch.stadium}
              </span>
              <h3>
                {clubInfo.name} vs {latestTeamMatch.opponent}
              </h3>
              <strong>
                {latestTeamMatch.ourScore} : {latestTeamMatch.opponentScore}
              </strong>
              <p>{latestTeamMatch.note}</p>
            </div>
          ) : (
            <div className="empty-match">
              <div className="empty-icon">⚽</div>
              <p>暂无最新比赛</p>
              <small>录入整场比赛后，官网首页会自动展示最新赛果。</small>
            </div>
          )}
        </section>

        <section className="panel mvp-panel">
          <div className="section-head-row">
            <h2>近期核心球员</h2>
            <button className="small-ghost-btn" onClick={() => setView("rankings")}>
              排行榜
            </button>
          </div>
          {mvp ? (
            <button
              className="mvp-show-card"
              onClick={() => {
                setSelectedName(mvp.name);
                setView("players");
              }}
            >
              <div className="mvp-photo">
                {mvp.photo ? <img src={mvp.photo} alt={mvp.name} /> : <span>#{mvp.number}</span>}
              </div>
              <div className="mvp-copy">
                <small>FORM PLAYER</small>
                <strong>{mvp.name}</strong>
                <span>{mvp.position} · 场均评分 {mvp.avgRating}</span>
                <p>{mvp.role}</p>
              </div>
              <b>{mvp.avgRating}</b>
            </button>
          ) : (
            <p>暂无个人评分记录，录入后自动生成近期核心球员。</p>
          )}
        </section>
      </div>

      <section className="panel home-featured-panel">
        <div className="section-head-row">
          <h2>核心球员展示</h2>
          <button className="small-ghost-btn" onClick={() => setView("playerLibrary")}>
            FC26 卡片墙
          </button>
        </div>
        <div className="home-featured-grid">
          {featuredPlayers.map((player) => (
            <button
              key={player.name}
              className="home-featured-player"
              data-position={player.position}
              onClick={() => {
                setSelectedName(player.name);
                setView("players");
              }}
            >
              <div className="featured-player-visual">
                {player.photo ? (
                  <img src={player.photo} alt={player.name} loading="lazy" decoding="async" />
                ) : (
                  <div className="featured-player-placeholder">#{player.number}</div>
                )}
                <b className="featured-position">{player.position}</b>
              </div>
              <div className="featured-player-copy">
                <span>#{player.number}</span>
                <strong>{player.name}</strong>
                <small>能力 {player.ability}</small>
                <em>{player.role}</em>
              </div>
              <b className="featured-ability">{player.ability}</b>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HomeShowcasePage;
