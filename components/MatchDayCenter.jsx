import React, { useEffect, useMemo, useState } from "react";
import {
  MATCH_EVENT_OPTIONS,
  getMatchEventLabel,
  getMatchStatus,
  getMatchStatusLabel,
  sortMatchEvents,
} from "../src/matchDay";

const REGISTRATION_OPTIONS = [
  { value: "attending", label: "参加" },
  { value: "maybe", label: "待定" },
  { value: "absent", label: "请假" },
];

const TAB_OPTIONS = [
  { value: "overview", label: "比赛概览" },
  { value: "registration", label: "报名名单" },
  { value: "squad", label: "比赛名单" },
  { value: "timeline", label: "事件时间线" },
];

const EMPTY_EVENT_FORM = {
  minute: "",
  type: "goal",
  player: "",
  relatedPlayer: "",
  note: "",
};

function playerSort(left, right) {
  return Number(left.rosterOrder || 999) - Number(right.rosterOrder || 999);
}

function getEventDescription(event) {
  if (event.type === "goal") {
    return event.player
      ? `${event.player}${event.relatedPlayer ? ` · ${event.relatedPlayer}助攻` : ""}`
      : "我方进球";
  }
  if (event.type === "opponent_goal") return "对方取得进球";
  if (event.type === "substitution") return `${event.player || "待补充"} 换下 · ${event.relatedPlayer || "待补充"} 换上`;
  return [event.player, event.note].filter(Boolean).join(" · ") || getMatchEventLabel(event.type);
}

function MatchDayCenter({
  match,
  players,
  clubInfo,
  isAdmin,
  onSetRegistration,
  onSetSquadRole,
  onUpdateSquadMeta,
  onImportTactics,
  onOpenTactics,
  onAddEvent,
  onDeleteEvent,
  onSetStatus,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [eventError, setEventError] = useState("");

  useEffect(() => {
    setActiveTab("overview");
    setEventForm(EMPTY_EVENT_FORM);
    setEventError("");
  }, [match.id]);

  const orderedPlayers = useMemo(() => [...players].sort(playerSort), [players]);
  const registrations = match.registrations || {};
  const squad = match.squad || { starters: [], substitutes: [], formation: "4-3-3", captain: "", goalkeeper: "" };
  const starters = Array.isArray(squad.starters) ? squad.starters : [];
  const substitutes = Array.isArray(squad.substitutes) ? squad.substitutes : [];
  const events = sortMatchEvents(match.events || []);
  const status = getMatchStatus(match);
  const registrationCounts = REGISTRATION_OPTIONS.reduce((counts, option) => {
    counts[option.value] = orderedPlayers.filter((player) => registrations[player.name]?.status === option.value).length;
    return counts;
  }, {});
  const unansweredCount = Math.max(0, orderedPlayers.length - Object.keys(registrations).filter((name) => registrations[name]?.status).length);
  const selectedEventType = MATCH_EVENT_OPTIONS.find((option) => option.value === eventForm.type) || MATCH_EVENT_OPTIONS[0];

  const submitEvent = () => {
    if (!eventForm.minute && eventForm.minute !== 0) {
      setEventError("请填写事件发生分钟");
      return;
    }
    if (selectedEventType.playerLabel && eventForm.type !== "key_moment" && !eventForm.player) {
      setEventError(`请选择${selectedEventType.playerLabel}`);
      return;
    }
    if (eventForm.type === "substitution" && !eventForm.relatedPlayer) {
      setEventError("请选择换上球员");
      return;
    }
    if (eventForm.type === "substitution" && eventForm.player === eventForm.relatedPlayer) {
      setEventError("换下和换上不能是同一名球员");
      return;
    }

    onAddEvent(match.id, eventForm);
    setEventForm(EMPTY_EVENT_FORM);
    setEventError("");
  };

  return (
    <div className="matchday-center">
      <section className={`matchday-hero matchday-status-${status}`}>
        <div className="matchday-hero-topline">
          <span className={`matchday-status-pill ${status}`}>
            <i /> {getMatchStatusLabel(match)}
          </span>
          <span>{match.competition || "球队比赛"} · {match.date}{match.time ? ` ${match.time}` : ""}</span>
        </div>

        <div className="matchday-scoreboard">
          <div className="matchday-team home">
            <span className="matchday-team-mark">{clubInfo.shortName || "FC"}</span>
            <strong>{clubInfo.name}</strong>
            <small>HOME</small>
          </div>
          <div className="matchday-score">
            <span>{match.ourScore ?? 0}</span>
            <b>:</b>
            <span>{match.opponentScore ?? 0}</span>
          </div>
          <div className="matchday-team away">
            <span className="matchday-team-mark away">VS</span>
            <strong>{match.opponent}</strong>
            <small>AWAY</small>
          </div>
        </div>

        <div className="matchday-meta-row">
          <span>{match.stadium || clubInfo.homeGround || "场地待定"}</span>
          <span>{starters.length} 人首发</span>
          <span>{events.length} 个比赛事件</span>
        </div>

        {isAdmin && (
          <div className="matchday-status-actions">
            {status === "scheduled" && <button className="primary-btn" onClick={() => onSetStatus(match.id, "live")}>开始比赛</button>}
            {status === "live" && <button className="primary-btn" onClick={() => onSetStatus(match.id, "finished")}>结束比赛并同步数据</button>}
            {status === "finished" && <button className="small-ghost-btn" onClick={() => onSetStatus(match.id, "live")}>重新打开比赛</button>}
          </div>
        )}
      </section>

      <nav className="matchday-tabs" aria-label="比赛日功能">
        {TAB_OPTIONS.map((tab) => (
          <button key={tab.value} className={activeTab === tab.value ? "active" : ""} onClick={() => setActiveTab(tab.value)}>
            {tab.label}
            {tab.value === "registration" && <span>{registrationCounts.attending || 0}</span>}
            {tab.value === "squad" && <span>{starters.length}</span>}
            {tab.value === "timeline" && <span>{events.length}</span>}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <div className="matchday-overview-grid">
          <section className="panel matchday-summary-panel">
            <div className="section-head-row">
              <div>
                <small>MATCH SNAPSHOT</small>
                <h2>比赛状态</h2>
              </div>
            </div>
            <div className="matchday-kpi-grid">
              <div><strong>{registrationCounts.attending || 0}</strong><span>确认参加</span></div>
              <div><strong>{starters.length}</strong><span>首发球员</span></div>
              <div><strong>{substitutes.length}</strong><span>替补球员</span></div>
              <div><strong>{events.length}</strong><span>比赛事件</span></div>
            </div>
          </section>

          <section className="panel matchday-detail-panel">
            <div className="section-head-row">
              <div>
                <small>MATCH NOTES</small>
                <h2>比赛信息</h2>
              </div>
            </div>
            <div className="matchday-info-list">
              <div><span>阵型</span><strong>{squad.formation || "待设置"}</strong></div>
              <div><span>队长</span><strong>{squad.captain || "待设置"}</strong></div>
              <div><span>守门员</span><strong>{squad.goalkeeper || "待设置"}</strong></div>
              <div><span>本场最佳</span><strong>{match.bestPlayer || match.matchAwards?.mvp || "待评选"}</strong></div>
            </div>
          </section>

          <section className="panel matchday-wide-panel">
            <div className="match-info-grid">
              <div><h4>进球队员</h4><p>{match.scorers?.length ? match.scorers.join("、") : "暂无"}</p></div>
              <div><h4>助攻球员</h4><p>{match.assists?.length ? match.assists.join("、") : "暂无"}</p></div>
              <div><h4>赛后总结</h4><p>{match.note || "暂无比赛备注"}</p></div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "registration" && (
        <section className="panel matchday-work-panel">
          <div className="section-head-row matchday-section-heading">
            <div>
              <small>AVAILABILITY</small>
              <h2>比赛报名</h2>
              <p>{isAdmin ? "快速登记参加、待定和请假状态，名单会自动保存到云端。" : "查看本场比赛的球员报名状态。"}</p>
            </div>
            <div className="registration-summary">
              <span className="attending">参加 {registrationCounts.attending || 0}</span>
              <span className="maybe">待定 {registrationCounts.maybe || 0}</span>
              <span className="absent">请假 {registrationCounts.absent || 0}</span>
              <span>未回复 {unansweredCount}</span>
            </div>
          </div>

          <div className="registration-player-grid">
            {orderedPlayers.map((player) => {
              const currentStatus = registrations[player.name]?.status || "";
              return (
                <article className={`registration-player-card ${currentStatus || "unanswered"}`} key={player.name}>
                  <div className="matchday-player-identity">
                    <span>{player.photo ? <img src={player.photo} alt="" loading="lazy" /> : `#${player.number}`}</span>
                    <div><strong>{player.name}</strong><small>{player.position || player.category || "位置待补充"}</small></div>
                  </div>
                  {isAdmin ? (
                    <div className="registration-actions">
                      {REGISTRATION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={currentStatus === option.value ? `active ${option.value}` : ""}
                          onClick={() => onSetRegistration(match.id, player.name, currentStatus === option.value ? "" : option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className={`registration-view-status ${currentStatus || "unanswered"}`}>
                      {REGISTRATION_OPTIONS.find((option) => option.value === currentStatus)?.label || "未回复"}
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "squad" && (
        <section className="panel matchday-work-panel">
          <div className="section-head-row matchday-section-heading">
            <div>
              <small>MATCH SQUAD</small>
              <h2>首发与替补名单</h2>
              <p>首发最多 11 人，结束比赛后首发和实际换上球员会计入个人出场记录。</p>
            </div>
            {isAdmin && (
              <div className="matchday-toolbar-actions">
                <button className="small-ghost-btn" onClick={() => onImportTactics(match.id)}>导入当前战术板</button>
                <button className="small-ghost-btn" onClick={onOpenTactics}>打开战术板</button>
              </div>
            )}
          </div>

          <div className="matchday-squad-settings">
            <label>
              <span>阵型</span>
              <select value={squad.formation || "4-3-3"} onChange={(event) => onUpdateSquadMeta(match.id, "formation", event.target.value)} disabled={!isAdmin}>
                {["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3", "自定义"].map((formation) => <option key={formation}>{formation}</option>)}
              </select>
            </label>
            <label>
              <span>队长</span>
              <select value={squad.captain || ""} onChange={(event) => onUpdateSquadMeta(match.id, "captain", event.target.value)} disabled={!isAdmin}>
                <option value="">待设置</option>
                {starters.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label>
              <span>守门员</span>
              <select value={squad.goalkeeper || ""} onChange={(event) => onUpdateSquadMeta(match.id, "goalkeeper", event.target.value)} disabled={!isAdmin}>
                <option value="">待设置</option>
                {starters.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <div className="squad-count-box"><strong>{starters.length}<small>/11</small></strong><span>首发人数</span></div>
          </div>

          <div className="squad-player-list">
            {orderedPlayers.map((player) => {
              const role = starters.includes(player.name) ? "starter" : substitutes.includes(player.name) ? "substitute" : "";
              const registrationStatus = registrations[player.name]?.status || "";
              return (
                <article className={`squad-player-row ${role}`} key={player.name}>
                  <div className="matchday-player-identity">
                    <span>{player.photo ? <img src={player.photo} alt="" loading="lazy" /> : `#${player.number}`}</span>
                    <div>
                      <strong>{player.name}</strong>
                      <small>{player.position || player.category || "位置待补充"}</small>
                    </div>
                  </div>
                  <span className={`squad-registration-dot ${registrationStatus}`} title="报名状态" />
                  {isAdmin ? (
                    <div className="squad-role-actions">
                      <button className={role === "starter" ? "active starter" : ""} onClick={() => onSetSquadRole(match.id, player.name, role === "starter" ? "" : "starter")}>首发</button>
                      <button className={role === "substitute" ? "active substitute" : ""} onClick={() => onSetSquadRole(match.id, player.name, role === "substitute" ? "" : "substitute")}>替补</button>
                    </div>
                  ) : <strong className="squad-role-label">{role === "starter" ? "首发" : role === "substitute" ? "替补" : "未入选"}</strong>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "timeline" && (
        <section className="panel matchday-work-panel">
          <div className="section-head-row matchday-section-heading">
            <div>
              <small>LIVE TIMELINE</small>
              <h2>比赛事件</h2>
              <p>进球事件会自动更新比分、进球队员和助攻数据。</p>
            </div>
          </div>

          {isAdmin && (
            <div className="match-event-form">
              <label className="event-minute-field"><span>分钟</span><input type="number" min="0" max="130" placeholder="0" value={eventForm.minute} onChange={(event) => setEventForm({ ...eventForm, minute: event.target.value })} /></label>
              <label><span>事件类型</span><select value={eventForm.type} onChange={(event) => setEventForm({ ...EMPTY_EVENT_FORM, minute: eventForm.minute, type: event.target.value })}>{MATCH_EVENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              {selectedEventType.playerLabel && (
                <label><span>{selectedEventType.playerLabel}</span><select value={eventForm.player} onChange={(event) => setEventForm({ ...eventForm, player: event.target.value })}><option value="">请选择</option>{orderedPlayers.map((player) => <option key={player.name}>{player.name}</option>)}</select></label>
              )}
              {selectedEventType.relatedLabel && (
                <label><span>{selectedEventType.relatedLabel}</span><select value={eventForm.relatedPlayer} onChange={(event) => setEventForm({ ...eventForm, relatedPlayer: event.target.value })}><option value="">请选择</option>{orderedPlayers.map((player) => <option key={player.name}>{player.name}</option>)}</select></label>
              )}
              <label className="event-note-field"><span>补充说明</span><input placeholder="可选" value={eventForm.note} onChange={(event) => setEventForm({ ...eventForm, note: event.target.value })} /></label>
              <button className="primary-btn" onClick={submitEvent}>添加事件</button>
              {eventError && <div className="match-event-error">{eventError}</div>}
            </div>
          )}

          {!events.length ? (
            <div className="matchday-empty-timeline"><strong>比赛尚未产生事件</strong><span>开始记录后，这里会形成完整的比赛时间线。</span></div>
          ) : (
            <div className="match-event-timeline">
              {events.map((event) => (
                <article className={`match-event-item ${event.type}`} key={event.id}>
                  <div className="match-event-minute">{event.minute}'</div>
                  <div className="match-event-marker"><i /></div>
                  <div className="match-event-content">
                    <small>{getMatchEventLabel(event.type)}</small>
                    <strong>{getEventDescription(event)}</strong>
                    {event.note && event.type !== "key_moment" && <span>{event.note}</span>}
                  </div>
                  {isAdmin && <button className="match-event-delete" onClick={() => onDeleteEvent(match.id, event.id)}>删除</button>}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default MatchDayCenter;
