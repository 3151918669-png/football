import React from "react";

function MatchAwardBadges({ match, compact = false }) {
  const awards = {
    mvp: match.matchAwards?.mvp || match.bestPlayer || "",
    bestDefender: match.matchAwards?.bestDefender || "",
    bestAttacker: match.matchAwards?.bestAttacker || "",
    pressingKing: match.matchAwards?.pressingKing || "",
    keyMan: match.matchAwards?.keyMan || "",
    risingStar: match.matchAwards?.risingStar || "",
  };

  const items = [
    ["⭐", "MVP", awards.mvp],
    ["🛡️", "防守", awards.bestDefender],
    ["🔥", "进攻", awards.bestAttacker],
    ["💪", "拼抢", awards.pressingKing],
    ["⚡", "关键", awards.keyMan],
    ["📈", "进步", awards.risingStar],
  ].filter(([, , name]) => Boolean(name));

  if (!items.length) return compact ? <div className="match-award-badges empty">暂无奖项</div> : null;

  return (
    <div className={compact ? "match-award-badges compact" : "match-award-badges"}>
      {items.map(([icon, label, name]) => (
        <span key={`${label}-${name}`}>
          {icon} {label}：{name}
        </span>
      ))}
    </div>
  );
}

export default MatchAwardBadges;