import React, { useEffect, useState } from "react";
import MatchDayCenter from "./MatchDayCenter";
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
  setView,
  onSetRegistration,
  onSetSquadRole,
  onUpdateSquadMeta,
  onImportTactics,
  onAddEvent,
  onDeleteEvent,
  onSetMatchStatus,
  loading = false,
  error = null,
}) {
  const [showCreateForm, setShowCreateForm] = useState(!teamMatches.length);
  const selectedMatch = teamMatches.find((match) => String(match.id) === String(selectedTeamMatchId)) || teamMatches[teamMatches.length - 1] || null;

  useEffect(() => {
    if (!teamMatches.length) setShowCreateForm(true);
  }, [teamMatches.length]);

  const updateForm = (key, value) => {
    setTeamMatchForm((current) => ({ ...current, [key]: value }));
  };

  const handleAddMatch = () => {
    if (addTeamMatch()) setShowCreateForm(false);
  };

  return (
    <div className="match-page match-detail-page">
      {selectedMatch && (
        <MatchDayCenter
          match={selectedMatch}
          players={players}
          clubInfo={clubInfo}
          isAdmin={isAdmin}
          onSetRegistration={onSetRegistration}
          onSetSquadRole={onSetSquadRole}
          onUpdateSquadMeta={onUpdateSquadMeta}
          onImportTactics={onImportTactics}
          onOpenTactics={() => setView("lineup")}
          onAddEvent={onAddEvent}
          onDeleteEvent={onDeleteEvent}
          onSetStatus={onSetMatchStatus}
        />
      )}

      {isAdmin && (
        <section className={`panel match-create-panel ${showCreateForm ? "is-open" : "is-compact"}`}>
          <div className="section-head-row match-create-heading">
            <div>
              <small>MATCH SETUP</small>
              <h2>{teamMatches.length ? "创建下一场比赛" : "添加整场比赛记录"}</h2>
              <p>{showCreateForm ? "创建后即可进行报名、名单安排和比赛事件记录。" : "需要录入新赛程时再展开，不遮挡当前比赛。"}</p>
            </div>
            <button className={showCreateForm ? "small-ghost-btn" : "primary-btn"} onClick={() => setShowCreateForm((current) => !current)}>
              {showCreateForm ? "收起" : "新增比赛"}
            </button>
          </div>

          {showCreateForm && (
            <div className="match-create-form-body">
              {error && <div className="error-message" style={{ color: "var(--red)", marginBottom: "12px", padding: "10px", background: "rgba(255,107,107,0.1)", borderRadius: "8px" }}>{error}</div>}

              <div className="form-grid">
                <input placeholder="日期，例如 2026-05-08" type="date" value={teamMatchForm.date} onChange={(event) => updateForm("date", event.target.value)} disabled={loading} />
                <input type="time" value={teamMatchForm.time} onChange={(event) => updateForm("time", event.target.value)} disabled={loading} />
                <input placeholder="对手球队" value={teamMatchForm.opponent} onChange={(event) => updateForm("opponent", event.target.value)} disabled={loading} />
                <input placeholder={`球场，默认 ${clubInfo.homeGround}`} value={teamMatchForm.stadium} onChange={(event) => updateForm("stadium", event.target.value)} disabled={loading} />
                <input placeholder="赛事类型，例如 友谊赛" value={teamMatchForm.competition} onChange={(event) => updateForm("competition", event.target.value)} disabled={loading} />
                <input placeholder={`我方球衣，默认 ${clubInfo.homeKit}`} value={teamMatchForm.homeKit} onChange={(event) => updateForm("homeKit", event.target.value)} disabled={loading} />
                <input placeholder="对手球衣，例如 红色队服" value={teamMatchForm.awayKit} onChange={(event) => updateForm("awayKit", event.target.value)} disabled={loading} />
                <input placeholder="我方比分" type="number" value={teamMatchForm.ourScore} onChange={(event) => updateForm("ourScore", event.target.value)} disabled={loading} />
                <input placeholder="对手比分" type="number" value={teamMatchForm.opponentScore} onChange={(event) => updateForm("opponentScore", event.target.value)} disabled={loading} />
                <select value={teamMatchForm.bestPlayer} onChange={(event) => updateForm("bestPlayer", event.target.value)} disabled={loading}>
                  <option value="">本场最佳球员，可不选</option>
                  {players.map((player) => <option key={player.name} value={player.name}>{player.name}</option>)}
                </select>
              </div>
              <input placeholder="历史比赛可填写进球队员；新比赛建议在事件时间线记录" value={teamMatchForm.scorers} onChange={(event) => updateForm("scorers", event.target.value)} disabled={loading} />
              <input placeholder="历史比赛可填写助攻球员；新比赛建议在事件时间线记录" value={teamMatchForm.assists} onChange={(event) => updateForm("assists", event.target.value)} disabled={loading} />
              <textarea placeholder="比赛备注" value={teamMatchForm.note} onChange={(event) => updateForm("note", event.target.value)} disabled={loading} />
              <button className="primary-btn" onClick={handleAddMatch} disabled={loading}>{loading ? "添加中..." : "创建比赛日"}</button>
            </div>
          )}
        </section>
      )}

      {!isAdmin && !teamMatches.length && (
        <section className="panel">
          <h2>比赛详情中心</h2>
          <p>访客模式可查看比赛详情，管理员登录后可新增比赛。</p>
        </section>
      )}

      {!teamMatches.length ? (
        <section className="panel">
          <div className="empty-match">
            <div className="empty-icon">⚽</div>
            <p>暂无整场比赛记录</p>
            <small>创建比赛后即可开始报名、排兵布阵和记录事件。</small>
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="section-head-row">
            <div><small>MATCH ARCHIVE</small><h2>历史比赛</h2></div>
            <span className="roster-count">{teamMatches.length} 场</span>
          </div>
          <div className="team-match-list compact-match-list">
            {[...teamMatches].reverse().map((match) => (
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
      )}
    </div>
  );
}

export default TeamMatchesPage;
