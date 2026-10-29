import React from "react";
import { clubLogo, playerCard } from "../src/clubData";
import { getMatchStatus } from "../src/matchDay";
export function ClubBadge({ clubInfo, className = "" }) {
  return (
    <img
      className={`club-logo ${className}`}
      src={clubLogo(clubInfo)}
      alt="江特FC队徽"
    />
  );
}
export function PageIntro({ en, title, text, children }) {
  return (
    <section className="club-page-intro">
      <div>
        <span className="eyebrow">JIANGTE FC / {en}</span>
        <h1>
          {title}
          <i> /</i>
        </h1>
        {text && <p>{text}</p>}
      </div>
      {children}
    </section>
  );
}
export function SectionHead({ en, title, action, onClick }) {
  return (
    <div className="club-section-head">
      <div>
        <span className="eyebrow">{en}</span>
        <h2>
          {title}
          <i> /</i>
        </h2>
      </div>
      {action && (
        <button className="text-link" onClick={onClick}>
          {action}
          <span>↗</span>
        </button>
      )}
    </div>
  );
}
export function FullPlayerCard({ player, onClick }) {
  const src = playerCard(player);
  return (
    <button
      className="club-player-card"
      onClick={onClick}
      aria-label={`查看${player.name}球员详情`}
    >
      <div className="club-card-image">
        {src ? (
          <img
            src={src}
            alt={`${player.name}完整球员卡`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="club-card-placeholder">
            <ClubBadge />
            <b>{player.number ? `#${player.number}` : "FC"}</b>
            <span>球员卡待上传</span>
          </div>
        )}
      </div>
      <div className="club-card-caption">
        <div>
          <small>{player.category || "江特FC"}</small>
          <h3>{player.name}</h3>
        </div>
        <span>#{player.number || "—"} ↗</span>
      </div>
    </button>
  );
}
export function FixtureCard({ match, clubInfo, onClick, label }) {
  const status = getMatchStatus(match);
  return (
    <button className={`fixture-card ${status}`} onClick={onClick}>
      <div className="fixture-meta">
        <span>{label || match.competition || match.type || "比赛"}</span>
        <b>
          {status === "scheduled"
            ? "即将开赛"
            : status === "live"
              ? "进行中"
              : "已完赛"}
        </b>
      </div>
      <div className="fixture-teams">
        <div>
          <ClubBadge clubInfo={clubInfo} />
          <strong>江特FC</strong>
        </div>
        <div className="fixture-score">
          <b>
            {status === "scheduled"
              ? "VS"
              : `${match.ourScore ?? "—"} : ${match.opponentScore ?? "—"}`}
          </b>
          <small>
            {match.date || "日期待定"} {match.time || ""}
          </small>
        </div>
        <div>
          {match.opponentLogo ? (
            <img
              className="club-logo"
              src={match.opponentLogo}
              alt={`${match.opponent}队徽`}
            />
          ) : (
            <span className="opponent-badge" aria-label="对方队徽待补充">
              {String(match.opponent || "?").slice(0, 1)}
            </span>
          )}
          <strong>{match.opponent}</strong>
        </div>
      </div>
      <div className="fixture-ground">
        <span>⌖ {match.stadium || clubInfo.homeGround || "场地待定"}</span>
        <span>比赛详情 ↗</span>
      </div>
    </button>
  );
}
export function ClubFooter({ clubInfo, setView, onAdmin }) {
  return (
    <footer className="club-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <ClubBadge clubInfo={clubInfo} />
          <div>
            <strong>江特FC</strong>
            <span>JIANGTE FOOTBALL CLUB</span>
          </div>
        </div>
        <p>因热爱相聚，为球队而战。</p>
        <div className="footer-links">
          {[
            ["球队介绍", "club"],
            ["球队阵容", "lineup"],
            ["教练团队", "coach"],
            ["训练安排", "training"],
          ].map(([label, key]) => (
            <button key={key} onClick={() => setView(key)}>
              {label} ↗
            </button>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} 江特FC · 每一场，全力以赴。</span>
        <button onClick={onAdmin}>球队管理 ↗</button>
      </div>
    </footer>
  );
}
