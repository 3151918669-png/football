import React, { useEffect, useState } from "react";
import { PageIntro, FixtureCard, ClubBadge } from "./ClubUI";
import { getMatchStatus } from "../src/matchDay";
import MatchDayCenter from "./MatchDayCenter";
import TeamMatchCard from "./TeamMatchCard";

function TeamMatchesPage({
  clubInfo,
  players,
  teamMatches,
  nextMatch,
  onUpdateMatch,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [month, setMonth] = useState("");
  const [editing, setEditing] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(!teamMatches.length);
  const visibleMatches = teamMatches.filter(
    (m) =>
      (statusFilter === "all" || getMatchStatus(m) === statusFilter) &&
      (!month || String(m.date).startsWith(month)),
  );
  const selectedMatch =
    visibleMatches.find(
      (match) => String(match.id) === String(selectedTeamMatchId),
    ) ||
    visibleMatches[visibleMatches.length - 1] ||
    null;

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
    <div className="match-page match-detail-page club-page-enter">
      <PageIntro
        en="MATCH CENTRE"
        title="比赛日，属于我们的时刻"
        text="从赛前准备，到终场哨响。关注江特FC的每一场比赛。"
      >
        <ClubBadge clubInfo={clubInfo} />
      </PageIntro>
      <div className="match-filter-bar">
        <select
          aria-label="比赛状态"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全部比赛状态</option>
          <option value="scheduled">未开赛</option>
          <option value="live">进行中</option>
          <option value="finished">已完赛</option>
        </select>
        <input
          aria-label="比赛月份"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button
          className="small-ghost-btn"
          onClick={() => {
            setMonth("");
            setStatusFilter("all");
          }}
        >
          重置筛选
        </button>
        <button className="primary-btn" onClick={() => setView("lineup")}>
          球场阵容 ↗
        </button>
      </div>
      <div className="fixture-list-grid">
        {[
          ...(nextMatch?.opponent &&
          !teamMatches.some(
            (m) =>
              m.date === nextMatch.date && m.opponent === nextMatch.opponent,
          )
            ? [{ ...nextMatch, id: "next", status: "scheduled" }]
            : []),
          ...teamMatches,
        ]
          .filter(
            (m) =>
              (statusFilter === "all" || getMatchStatus(m) === statusFilter) &&
              (!month || String(m.date).startsWith(month)),
          )
          .sort((a, b) => String(b.date).localeCompare(String(a.date)))
          .map((m) => (
            <FixtureCard
              key={m.id}
              match={m}
              clubInfo={clubInfo}
              onClick={() =>
                m.id === "next"
                  ? setView("operations")
                  : setSelectedTeamMatchId(m.id)
              }
            />
          ))}
      </div>
      {!teamMatches.some(
        (m) =>
          (statusFilter === "all" || getMatchStatus(m) === statusFilter) &&
          (!month || String(m.date).startsWith(month)),
      ) && <p>暂无符合筛选条件的球队比赛记录。</p>}
      {isAdmin && selectedMatch && (
        <button
          className="small-ghost-btn"
          style={{ marginBottom: 20 }}
          onClick={() => setEditing({ ...selectedMatch })}
        >
          编辑当前比赛资料 / 比分
        </button>
      )}
      {editing && (
        <section className="match-edit-dialog">
          <h3>编辑比赛资料</h3>
          <div className="form-grid">
            {[
              ["date", "日期"],
              ["time", "时间"],
              ["opponent", "对手"],
              ["stadium", "场地"],
              ["competition", "赛事"],
              ["opponentLogo", "对方队徽URL"],
              ["ourScore", "我方比分"],
              ["opponentScore", "对手比分"],
              ["bestPlayer", "MVP"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  type={
                    key.includes("Score")
                      ? "number"
                      : key === "date"
                        ? "date"
                        : key === "time"
                          ? "time"
                          : "text"
                  }
                  min={key.includes("Score") ? 0 : undefined}
                  value={editing[key] ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <label>
            比赛备注
            <textarea
              value={editing.note || ""}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
            />
          </label>
          <button
            className="primary-btn"
            onClick={() => {
              onUpdateMatch(editing);
              setEditing(null);
            }}
          >
            保存修改
          </button>{" "}
          <button className="small-ghost-btn" onClick={() => setEditing(null)}>
            取消
          </button>
        </section>
      )}
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
        <section
          className={`panel match-create-panel ${showCreateForm ? "is-open" : "is-compact"}`}
        >
          <div className="section-head-row match-create-heading">
            <div>
              <small>MATCH SETUP</small>
              <h2>
                {teamMatches.length ? "创建下一场比赛" : "添加整场比赛记录"}
              </h2>
              <p>
                {showCreateForm
                  ? "创建后即可进行报名、名单安排和比赛事件记录。"
                  : "需要录入新赛程时再展开，不遮挡当前比赛。"}
              </p>
            </div>
            <button
              className={showCreateForm ? "small-ghost-btn" : "primary-btn"}
              onClick={() => setShowCreateForm((current) => !current)}
            >
              {showCreateForm ? "收起" : "新增比赛"}
            </button>
          </div>

          {showCreateForm && (
            <div className="match-create-form-body">
              {error && (
                <div
                  className="error-message"
                  style={{
                    color: "var(--red)",
                    marginBottom: "12px",
                    padding: "10px",
                    background: "rgba(255,107,107,0.1)",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="form-grid">
                <input
                  placeholder="日期，例如 2026-05-08"
                  type="date"
                  value={teamMatchForm.date}
                  onChange={(event) => updateForm("date", event.target.value)}
                  disabled={loading}
                />
                <input
                  type="time"
                  value={teamMatchForm.time}
                  onChange={(event) => updateForm("time", event.target.value)}
                  disabled={loading}
                />
                <input
                  placeholder="对手球队"
                  value={teamMatchForm.opponent}
                  onChange={(event) =>
                    updateForm("opponent", event.target.value)
                  }
                  disabled={loading}
                />
                <input
                  placeholder={`球场，默认 ${clubInfo.homeGround}`}
                  value={teamMatchForm.stadium}
                  onChange={(event) =>
                    updateForm("stadium", event.target.value)
                  }
                  disabled={loading}
                />
                <input
                  placeholder="赛事类型，例如 友谊赛"
                  value={teamMatchForm.competition}
                  onChange={(event) =>
                    updateForm("competition", event.target.value)
                  }
                  disabled={loading}
                />
                <input
                  placeholder={`我方球衣，默认 ${clubInfo.homeKit}`}
                  value={teamMatchForm.homeKit}
                  onChange={(event) =>
                    updateForm("homeKit", event.target.value)
                  }
                  disabled={loading}
                />
                <input
                  placeholder="对手球衣，例如 红色队服"
                  value={teamMatchForm.awayKit}
                  onChange={(event) =>
                    updateForm("awayKit", event.target.value)
                  }
                  disabled={loading}
                />
                <input
                  placeholder="我方比分"
                  type="number"
                  value={teamMatchForm.ourScore}
                  onChange={(event) =>
                    updateForm("ourScore", event.target.value)
                  }
                  disabled={loading}
                />
                <input
                  placeholder="对手比分"
                  type="number"
                  value={teamMatchForm.opponentScore}
                  onChange={(event) =>
                    updateForm("opponentScore", event.target.value)
                  }
                  disabled={loading}
                />
                <select
                  value={teamMatchForm.bestPlayer}
                  onChange={(event) =>
                    updateForm("bestPlayer", event.target.value)
                  }
                  disabled={loading}
                >
                  <option value="">本场最佳球员，可不选</option>
                  {players.map((player) => (
                    <option key={player.name} value={player.name}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                placeholder="历史比赛可填写进球队员；新比赛建议在事件时间线记录"
                value={teamMatchForm.scorers}
                onChange={(event) => updateForm("scorers", event.target.value)}
                disabled={loading}
              />
              <input
                placeholder="历史比赛可填写助攻球员；新比赛建议在事件时间线记录"
                value={teamMatchForm.assists}
                onChange={(event) => updateForm("assists", event.target.value)}
                disabled={loading}
              />
              <textarea
                placeholder="比赛备注"
                value={teamMatchForm.note}
                onChange={(event) => updateForm("note", event.target.value)}
                disabled={loading}
              />
              <button
                className="primary-btn"
                onClick={handleAddMatch}
                disabled={loading}
              >
                {loading ? "添加中..." : "创建比赛日"}
              </button>
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

      {isAdmin && teamMatches.length > 0 && (
        <section className="panel">
          <h3>比赛档案维护</h3>
          {teamMatches.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #e0e6f0",
              }}
            >
              <span>
                {m.date} · {m.opponent}
              </span>
              <button
                className="table-delete-btn"
                onClick={() => {
                  if (confirm("删除这场比赛？请先确认已经导出JSON备份。"))
                    deleteTeamMatch(m.id);
                }}
              >
                删除比赛
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default TeamMatchesPage;
