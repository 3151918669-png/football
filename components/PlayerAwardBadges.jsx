import React from "react";

function PlayerAwardBadges({ player, awardStats }) {
  const totalStat = (matches, key) => {
    return matches.reduce((sum, m) => sum + Number(m[key] || 0), 0);
  };

  const isTopScorer = awardStats.topScorer?.name === player.name;
  const isAssistKing = awardStats.assistKing?.name === player.name;
  const isBestDefender = awardStats.bestDefender?.name === player.name;

  const awards = [];
  if (isTopScorer) {
    awards.push({
      icon: "⚽",
      title: "射手王",
      value: `${totalStat(player.matches || [], "goals")} 球`,
      desc: "赛季进球最多",
    });
  }
  if (isAssistKing) {
    awards.push({
      icon: "🎯",
      title: "助攻王",
      value: `${totalStat(player.matches || [], "assists")} 助攻`,
      desc: "赛季助攻最多",
    });
  }
  if (isBestDefender) {
    awards.push({
      icon: "🛡️",
      title: "最佳防守",
      value: `防守 ${player.attributes?.防守 || "-"}`,
      desc: "赛季最佳防守球员",
    });
  }

  if (awards.length === 0) {
    return <p>暂无个人奖项</p>;
  }

  return (
    <div className="player-awards">
      {awards.map((award, index) => (
        <div key={index} className="player-award-badge">
          <span>{award.icon}</span>
          <strong>{award.title}</strong>
          <div>{award.value}</div>
          <small>{award.desc}</small>
        </div>
      ))}
    </div>
  );
}

export default PlayerAwardBadges;