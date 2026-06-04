import React from "react";

function StarCardEmbedded({ player, clubInfo }) {
  return (
    <div className="star-card-embedded">
      <div className="star-glow">⭐</div>
      <div className="star-number">#{player.number}</div>
      <div className="star-pos">{player.position}</div>
      <div className="star-role">{player.role}</div>
      {player.photo ? (
        <img className="star-card-photo" src={player.photo} alt={player.name} loading="lazy" decoding="async" />
      ) : (
        <div className="star-card-photo" style={{ display: "grid", placeItems: "center", color: "var(--sub)", fontSize: "0.95rem", fontWeight: 900 }}>
          #{player.number}
        </div>
      )}
      <div className="star-club-name">{clubInfo.shortName || "FC"}</div>
      <div className="star-name">{player.name}</div>
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
          <span className="val">{player.matches?.length || 0}</span>
          <span className="lbl">出场</span>
        </div>
        <div className="star-stat-item">
          <span className="val">{player.matches?.length > 0 ? (player.matches.reduce((sum, m) => sum + Number(m.goals || 0), 0)) : 0}</span>
          <span className="lbl">进球</span>
        </div>
      </div>
    </div>
  );
}

export default StarCardEmbedded;