import React from "react";
import MatchAwardBadges from "./MatchAwardBadges";
import TeamMatchCard from "./TeamMatchCard";

function TeamMatchesPage({
  clubInfo,
  players,
  teamMatches,
  teamMatchForm,
  setTeamMatchForm,
  addTeamMatch,
  deleteTeamMatch,
  isAdmin,
  selectedTeamMatchId,
  setSelectedTeamMatchId,
  setSelectedName,
  setView,
  loading = false,
  error = null
}) {
  const selectedMatch = teamMatches.find((match) => String(match.id) === String(selectedTeamMatchId)) || teamMatches[0] || null;

  const getTeamMatchResult = (match) => {
    const our = Number(match.ourScore || 0);
    const opponent = Number(match.opponentScore || 0);
    if (our > opponent) return "win";
    if (our === opponent) return "draw";
    return "loss";
  };

  const handleAddMatch = () => {
    addTeamMatch();
  };

  return (
    <div className="match-page match-detail-page">
      {isAdmin ? (
        <section className="panel">
          <h2>添加整场比赛记录</h2>
          <p>用于生成比赛详情页：比分牌、关键球员、进球助攻、单场奖项和赛后总结。</p>
          {error && <div className="error-message" style={{ color: "var(--red)", marginBottom: "12px", padding: "10px", background: "rgba(255,107,107,0.1)", borderRadius: "8px" }}>{error}</div>}
          
          <div className="form-grid">
            <input
              placeholder="日期，例如 2026-05-08"
              value={teamMatchForm.date}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, date: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder="对手球队"
              value={teamMatchForm.opponent}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, opponent: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder={`球场，默认 ${clubInfo.homeGround}`}
              value={teamMatchForm.stadium}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, stadium: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder={`我方球衣，默认 ${clubInfo.homeKit}`}
              value={teamMatchForm.homeKit}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, homeKit: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder="对手球衣，例如 红色队服"
              value={teamMatchForm.awayKit}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, awayKit: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder="我方比分"
              type="number"
              value={teamMatchForm.ourScore}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, ourScore: e.target.value })}
              disabled={loading}
            />
            <input
              placeholder="对手比分"
              type="number"
              value={teamMatchForm.opponentScore}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, opponentScore: e.target.value })}
              disabled={loading}
            />
            <select
              value={teamMatchForm.bestPlayer}
              onChange={(e) => setTeamMatchForm({ ...teamMatchForm, bestPlayer: e.target.value })}
              disabled={loading}
            >
              <option value="">本场最佳球员，可不选</option>
              {players.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="我方进球队员，用逗号分隔"
            value={teamMatchForm.scorers}
            onChange={(e) => setTeamMatchForm({ ...teamMatchForm, scorers: e.target.value })}
            disabled={loading}
          />
          <input
            placeholder="助攻球员，用逗号分隔"
            value={teamMatchForm.assists}
            onChange={(e) => setTeamMatchForm({ ...teamMatchForm, assists: e.target.value })}
            disabled={loading}
          />
          <textarea
            placeholder="比赛备注"
            value={teamMatchForm.note}
            onChange={(e) => setTeamMatchForm({ ...teamMatchForm, note: e.target.value })}
            disabled={loading}
          />
          <button className="primary-btn" onClick={handleAddMatch} disabled={loading}>
            {loading ? "添加中..." : "添加整场比赛"}
          </button>
        </section>
      ) : (
        <section className="panel">
          <h2>比赛详情中心</h2>
          <p>访客模式可查看比赛详情，管理员登录后可新增或删除比赛。</p>
        </section>
      )}

      {!teamMatches.length ? (
        <section className="panel">
          <div className="empty-match">
            <div className="empty-icon">⚽</div>
            <p>暂无整场比赛记录</p>
            <small>添加后会以比赛详情页形式展示。</small>
          </div>
        </section>
      ) : (
        <>
          <section className="panel match-detail-hero">
            <div className="match-detail-main">
              <span>
                {selectedMatch.date}｜{selectedMatch.stadium}
              </span>
              <h2>
                {clubInfo.name} vs {selectedMatch.opponent}
              </h2>
              <strong>
                {selectedMatch.ourScore} : {selectedMatch.opponentScore}
              </strong>
              <div className="match-detail-result">
                <span className={`result-badge ${getTeamMatchResult(selectedMatch)}`}>
                  {getTeamMatchResult(selectedMatch) === "win"
                    ? "胜"
                    : getTeamMatchResult(selectedMatch) === "draw"
                    ? "平"
                    : "负"}
                </span>
              </div>
            </div>
            <div className="match-detail-side">
              <div>
                <h4>本场最佳</h4>
                <p>{selectedMatch.bestPlayer || selectedMatch.matchAwards?.mvp || "暂无"}</p>
              </div>
              <div>
                <h4>我方球衣</h4>
                <p>{selectedMatch.homeKit || clubInfo.homeKit}</p>
              </div>
              <div>
                <h4>对手球衣</h4>
                <p>{selectedMatch.awayKit || "暂无"}</p>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>比赛详情</h2>
            <div className="match-info-grid">
              <div>
                <h4>进球队员</h4>
                <p>{selectedMatch.scorers?.length ? selectedMatch.scorers.join("、") : "暂无"}</p>
              </div>
              <div>
                <h4>助攻球员</h4>
                <p>{selectedMatch.assists?.length ? selectedMatch.assists.join("、") : "暂无"}</p>
              </div>
              <div>
                <h4>单场奖项</h4>
                <MatchAwardBadges match={selectedMatch} />
              </div>
            </div>
            <div className="match-note">
              <h4>赛后总结</h4>
              <p>{selectedMatch.note}</p>
            </div>
          </section>

          <section className="panel">
            <h2>历史比赛</h2>
            <div className="team-match-list compact-match-list">
              {teamMatches.map((match) => (
                <TeamMatchCard
                  key={match.id}
                  match={match}
                  clubInfo={clubInfo}
                  onClick={() => setSelectedTeamMatchId(match.id)}
                  onDelete={isAdmin ? () => deleteTeamMatch(match.id) : null}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default TeamMatchesPage;