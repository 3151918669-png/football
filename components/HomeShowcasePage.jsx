import React from "react";
import { InfoCard } from "./StatisticsPanel";

function HomeShowcasePage({ 
  clubInfo, 
  teamStats, 
  latestTeamMatch, 
  featuredPlayers, 
  ranking, 
  mvp, 
  nextMatch, 
  setView, 
  setSelectedName, 
  setSelectedTeamMatchId 
}) {
  const winRate = teamStats.matches > 0 ? `${((teamStats.wins / teamStats.matches) * 100).toFixed(0)}%` : "-";

  return (
    <section className="home-showcase">
      <div className="home-hero panel">
        <div className="home-hero-copy">
          <span className="home-kicker">{clubInfo.city} Amateur Football Club</span>
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
        </div>
        <div className="home-hero-badge">
          <div className="club-big-badge">{clubInfo.shortName || "FC"}</div>
          <strong>{clubInfo.homeGround}</strong>
          <span>{clubInfo.homeKit}</span>
        </div>
      </div>

      <div className="home-stat-grid">
        <InfoCard title="球员数量" value={teamStats.players} />
        <InfoCard title="整场比赛" value={teamStats.matches} />
        <InfoCard title="总进球" value={teamStats.goals} />
        <InfoCard title="胜率" value={winRate} />
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
              <span>NEXT MATCH</span>
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
              className="latest-score-card"
              onClick={() => {
                setSelectedTeamMatchId(latestTeamMatch.id);
                setView("teamMatches");
              }}
              style={{ cursor: "pointer" }}
            >
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
              style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0 }}
            >
              <strong>{mvp.name}</strong>
              <span>
                {mvp.position}｜场均评分 {mvp.avgRating}
              </span>
              <p>{mvp.role}</p>
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
              onClick={() => {
                setSelectedName(player.name);
                setView("players");
              }}
            >
              <span>#{player.number}</span>
              <strong>{player.name}</strong>
              <small>
                {player.position}｜能力 {player.ability}
              </small>
              <em>{player.role}</em>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HomeShowcasePage;