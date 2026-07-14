import React, { useState } from "react";
import AwardCard from "./AwardCard";

function totalStat(matches, key) {
  return matches?.reduce((sum, m) => sum + Number(m[key] || 0), 0) || 0;
}

function getAwardWinnerFromCounts(counts, fallback) {
  if (!counts || Object.keys(counts).length === 0) return fallback;
  let maxCount = 0;
  let winner = fallback;
  Object.entries(counts).forEach(([name, count]) => {
    if (Number(count) > maxCount) {
      maxCount = Number(count);
      winner = name;
    }
  });
  return winner;
}

function getSeasonKey(date) {
  if (!date) return "未知赛季";
  const year = parseInt(date.slice(0, 4), 10);
  return isNaN(year) ? "未知赛季" : `${year}-${year + 1}`;
}

function AwardsPage({
  players,
  coaches,
  teamMatches,
  setTeamMatches,
  manualAwards,
  setManualAwards,
  awardStats,
  isAdmin,
}) {
  const topScorer =
    manualAwards.topScorer || awardStats.topScorer?.name || "暂无";
  const assistKing =
    manualAwards.assistKing || awardStats.assistKing?.name || "暂无";
  const bestDefender =
    manualAwards.bestDefender || awardStats.bestDefender?.name || "暂无";
  const bestCoach =
    manualAwards.bestCoach ||
    awardStats.coachRanking?.[0]?.name ||
    "暂无";

  const setAward = (key, value) => {
    setManualAwards((prev) => ({ ...prev, [key]: value }));
  };

  const updateMatchAward = (matchId, awardKey, value) => {
    if (!isAdmin) return;
    setTeamMatches((old) =>
      old.map((match) => {
        if (String(match.id) !== String(matchId)) return match;
        const matchAwards = { ...(match.matchAwards || {}) };
        if (value) {
          matchAwards[awardKey] = value;
        } else {
          delete matchAwards[awardKey];
        }
        return { ...match, matchAwards: Object.keys(matchAwards).length > 0 ? matchAwards : {} };
      })
    );
  };

  // 计算赛季奖项 (基于当前赛季数据)
  const seasonMatches = teamMatches;
  const topScorerAuto =
    awardStats.topScorer?.name &&
    totalStat(awardStats.topScorer.matches || [], "goals") > 0
      ? `${awardStats.topScorer?.name} (${totalStat(awardStats.topScorer?.matches || [], "goals")} 球)`
      : "暂无";

  const assistKingAuto =
    awardStats.assistKing?.name &&
    totalStat(awardStats.assistKing.matches || [], "assists") > 0
      ? `${awardStats.assistKing?.name} (${totalStat(awardStats.assistKing?.matches || [], "assists")} 助攻)`
      : "暂无";

  const bestDefenderAuto = awardStats.bestDefender?.name || "暂无";

  return (
    <div className="match-page awards-v13-page">
      {/* 赛季奖项 */}
      <div className="panel awards-hero-panel">
        <div className="section-head-row">
          <h2>赛季奖项</h2>
          <span className="roster-count">基于当前赛季数据计算</span>
        </div>
        <p>
          根据所有个人比赛记录自动统计，也可以手动指定奖项归属。赛季奖项分为射手王、助攻王、最佳防守球员和最佳教练四个维度。
        </p>
      </div>

      <div className="home-stat-grid" style={{ gridTemplateColumns: "repeat(4, minmax(160px, 1fr))" }}>
        <AwardCard
          title="射手王"
          icon="⚽"
          name={topScorer}
          value={awardStats.topScorer ? `${totalStat(awardStats.topScorer?.matches || [], "goals")} 球` : "-"}
          desc="赛季总进球最多"
        />
        <AwardCard
          title="助攻王"
          icon="🎯"
          name={assistKing}
          value={awardStats.assistKing ? `${totalStat(awardStats.assistKing?.matches || [], "assists")} 助攻` : "-"}
          desc="赛季总助攻最多"
        />
        <AwardCard
          title="最佳防守"
          icon="🛡️"
          name={bestDefender}
          value={awardStats.bestDefender ? `${awardStats.bestDefender?.matches?.length || 0} 场` : "-"}
          desc="后卫出勤表现"
        />
        <AwardCard
          title="最佳教练"
          icon="📋"
          name={bestCoach}
          value={awardStats.coachRanking?.[0]?.winRateText || "-"}
          desc="执教表现最佳"
        />
      </div>

      {/* 手动调整奖项 */}
      {isAdmin && (
        <div className="panel wide">
          <h2>手动调整奖项归属</h2>
          <p>如自动推荐不合适，可手动指定获奖人。选择"使用自动推荐"将恢复系统推荐。</p>
          <div className="match-award-grid">
            <div className="award-field">
              <span>射手王</span>
              <p>自动推荐：{topScorerAuto}</p>
              <select value={manualAwards.topScorer} onChange={(e) => setAward("topScorer", e.target.value)}>
                <option value="">使用自动推荐</option>
                {players.map((p) => (
                  <option key={`ts-${p.name}`} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="award-field">
              <span>助攻王</span>
              <p>自动推荐：{assistKingAuto}</p>
              <select value={manualAwards.assistKing} onChange={(e) => setAward("assistKing", e.target.value)}>
                <option value="">使用自动推荐</option>
                {players.map((p) => (
                  <option key={`ak-${p.name}`} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="award-field">
              <span>最佳防守</span>
              <p>自动推荐：{bestDefenderAuto}</p>
              <select value={manualAwards.bestDefender} onChange={(e) => setAward("bestDefender", e.target.value)}>
                <option value="">使用自动推荐</option>
                {players.map((p) => (
                  <option key={`bd-${p.name}`} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="award-field">
              <span>最佳教练</span>
              <select value={manualAwards.bestCoach} onChange={(e) => setAward("bestCoach", e.target.value)}>
                <option value="">使用自动推荐</option>
                {coaches.map((c) => (
                  <option key={`bc-${c.name}`} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 每场奖项 */}
      <div className="panel wide">
        <div className="section-head-row awards-section-title">
          <h2>每场奖项</h2>
          <span className="roster-count">{teamMatches.length} 场比赛</span>
        </div>
        <p>为每场比赛单独设置进攻、防守、关键球员等奖项归属。</p>

        {teamMatches.length === 0 ? (
          <p>暂无比赛记录，添加整场比赛后可设置单场奖项。</p>
        ) : (
          <div className="match-awards-board">
            {teamMatches.map((match) => (
              <div className="match-award-editor" key={match.id}>
                <div className="match-award-head">
                  <div>
                    <strong>{match.date} | {match.opponent}</strong>
                    <span>
                      {match.ourScore} : {match.opponentScore} | {match.stadium}
                    </span>
                  </div>
                </div>
                <div className="match-award-grid">
                  <div className="award-field">
                    <span>MVP</span>
                    <select value={(match.matchAwards || {}).mvp || match.bestPlayer || ""} onChange={(e) => updateMatchAward(match.id, "mvp", e.target.value)} disabled={!isAdmin}>
                      <option value="">使用自动推荐</option>
                      {players.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                  <div className="award-field">
                    <span>最佳防守</span>
                    <select value={(match.matchAwards || {}).bestDefender || ""} onChange={(e) => updateMatchAward(match.id, "bestDefender", e.target.value)} disabled={!isAdmin}>
                      <option value="">暂无</option>
                      {players.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                  <div className="award-field">
                    <span>最佳进攻</span>
                    <select value={(match.matchAwards || {}).bestAttacker || ""} onChange={(e) => updateMatchAward(match.id, "bestAttacker", e.target.value)} disabled={!isAdmin}>
                      <option value="">暂无</option>
                      {players.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                  <div className="award-field">
                    <span>拼抢之王</span>
                    <select value={(match.matchAwards || {}).pressingKing || ""} onChange={(e) => updateMatchAward(match.id, "pressingKing", e.target.value)} disabled={!isAdmin}>
                      <option value="">暂无</option>
                      {players.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                  <div className="award-field">
                    <span>关键先生</span>
                    <select value={(match.matchAwards || {}).keyMan || ""} onChange={(e) => updateMatchAward(match.id, "keyMan", e.target.value)} disabled={!isAdmin}>
                      <option value="">暂无</option>
                      {players.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                  <div className="award-field">
                    <span>进步之星</span>
                    <select value={(match.matchAwards || {}).risingStar || ""} onChange={(e) => updateMatchAward(match.id, "risingStar", e.target.value)} disabled={!isAdmin}>
                      <option value="">暂无</option>
                      {players.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AwardsPage;
