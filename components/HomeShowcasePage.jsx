import PhotoWall from "./PhotoWall";
import React, { useRef } from "react";
import { ClubBadge, SectionHead, FullPlayerCard, FixtureCard } from "./ClubUI";
import { clubBackground } from "../src/clubData";
import { getMatchStatus } from "../src/matchDay";
export default function HomeShowcasePage({
  clubInfo,
  teamStats,
  teamMatches = [],
  featuredPlayers = [],
  nextMatch,
  setView,
  setSelectedName,
  setSelectedTeamMatchId,
  manualAwards = {},
}) {
  const rail = useRef(null);
  const fixtures = [...teamMatches]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 6);
  if (
    nextMatch?.opponent &&
    !fixtures.some(
      (m) => m.date === nextMatch.date && m.opponent === nextMatch.opponent,
    )
  )
    fixtures.unshift({ ...nextMatch, id: "next", status: "scheduled" });
  const upcoming = fixtures.find((m) => getMatchStatus(m) === "scheduled");
  const honors = (clubInfo.honors || []).slice(0, 3);
  const openMatch = (m) => {
    if (m.id !== "next") setSelectedTeamMatchId(m.id);
    setView("teamMatches");
  };
  return (
    <div className="club-home">
      <section className="club-hero">
        <img
          className="hero-background"
          src={clubBackground(clubInfo)}
          alt="江特俱乐部品牌背景"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <ClubBadge clubInfo={clubInfo} className="hero-watermark" />
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <i /> 江特FC · 官方球队网站
          </span>
          <h1>
            为热爱<span>一起上场。</span>
          </h1>
          <p>
            {clubInfo.slogan || "因热爱相聚，为球队而战。"}
            <br />
            {clubInfo.description ||
              "每一次传递，每一声呐喊，都是我们的足球故事。"}
          </p>
          <div className="hero-actions">
            <button className="club-btn" onClick={() => setView("teamMatches")}>
              走进比赛日 <span>↗</span>
            </button>
            <button
              className="club-btn outline"
              onClick={() => setView("playerLibrary")}
            >
              认识我们的球员 <span>→</span>
            </button>
          </div>
          <div className="hero-signature">
            <span>JIANGTE</span> FOOTBALL IS OUR LANGUAGE.
          </div>
        </div>
        <div className="hero-edge">
          <span>ONE TEAM. ONE PASSION.</span>
          <b>01 / 江特FC</b>
        </div>
      </section>
      <section className="club-fixtures content-width">
        <SectionHead
          en="MATCH CENTRE"
          title="每一场，都全力以赴"
          action="全部赛程"
          onClick={() => setView("teamMatches")}
        />
        <div className="fixture-heading">
          <span>
            赛程与赛果 <i> / </i>{" "}
            {fixtures.length ? `${fixtures.length} 场比赛` : "等待下一次哨响"}
          </span>
          <div className="rail-controls">
            <button
              aria-label="上一场比赛"
              onClick={() =>
                rail.current?.scrollBy({
                  left: -400,
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "auto"
                    : "smooth",
                })
              }
            >
              ←
            </button>
            <button
              aria-label="下一场比赛"
              onClick={() =>
                rail.current?.scrollBy({
                  left: 400,
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "auto"
                    : "smooth",
                })
              }
            >
              →
            </button>
          </div>
        </div>
        <div className="fixture-rail" ref={rail}>
          {fixtures.map((m) => (
            <FixtureCard
              key={m.id}
              match={m}
              clubInfo={clubInfo}
              onClick={() => openMatch(m)}
            />
          ))}
          {!upcoming && (
            <div className="fixture-empty">
              <span>NEXT MATCH</span>
              <h3>期待下一次，一起出发。</h3>
              <p>新赛程公布后将在这里展示。</p>
              <button
                className="text-link"
                onClick={() => setView("teamMatches")}
              >
                查看比赛记录 ↗
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="club-squad">
        <div className="content-width">
          <SectionHead
            en="OUR SQUAD"
            title="同一抹蓝，同一个我们"
            action="探索完整阵容"
            onClick={() => setView("playerLibrary")}
          />
          <div className="home-card-grid">
            {featuredPlayers.slice(0, 5).map((p) => (
              <FullPlayerCard
                key={p.name}
                player={p}
                onClick={() => {
                  setSelectedName(p.name);
                  setView("players");
                }}
              />
            ))}
          </div>
        </div>
      </section>
      <PhotoWall photos={clubInfo.gallery || []} />
      <section className="club-story content-width">
        <div className="story-copy">
          <span className="eyebrow">THE CLUB / 我们的球队</span>
          <h2>
            场上并肩，
            <br />
            场下同心。
          </h2>
          <p>
            {clubInfo.description ||
              "我们因足球相聚。用每一场比赛记录成长，用每一次并肩定义球队。这里是江特FC，也是属于每一位队员的主场。"}
          </p>
          <button className="text-link" onClick={() => setView("club")}>
            了解江特FC <span>↗</span>
          </button>
        </div>
        <div className="story-stats">
          {[
            [teamStats.matches, "比赛场次"],
            [
              `${teamStats.wins} / ${teamStats.draws} / ${teamStats.losses}`,
              "胜 / 平 / 负",
            ],
            [teamStats.goals, "总进球"],
            [teamStats.players, "在册球员"],
          ].map(([value, label]) => (
            <div key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
          <small>
            来自已记录的球队比赛 ·{" "}
            {teamStats.matches ? "持续记录球队每一步" : "暂无比赛记录"}
          </small>
        </div>
      </section>
      <section className="club-bottom-features content-width">
        <button className="lineup-feature" onClick={() => setView("lineup")}>
          <div className="mini-pitch" aria-hidden="true">
            <i />
            <b>4 — 3 — 2 — 1</b>
          </div>
          <span className="eyebrow">STARTING XI</span>
          <h2>
            找到我们的
            <br />
            最佳连接。
          </h2>
          <span>探索球队阵容 ↗</span>
        </button>
        <div className="honor-feature">
          <SectionHead
            en="OUR HONOURS"
            title="每份荣誉，都属于我们"
            action="荣誉墙"
            onClick={() => setView("awards")}
          />
          {honors.length ? (
            honors.map((h) => (
              <div className="home-honor" key={h.id}>
                <b>{h.year}</b>
                <strong>{h.name}</strong>
                <span>{h.place}</span>
              </div>
            ))
          ) : (
            <div className="honor-empty">
              <span>☆</span>
              <h3>
                {Object.values(manualAwards).some(Boolean)
                  ? "记录每一位闪光的队员"
                  : "荣誉之路，我们一起书写。"}
              </h3>
              <p>
                {Object.values(manualAwards).some(Boolean)
                  ? "前往荣誉墙查看个人奖项。"
                  : "暂无已录入的球队荣誉。"}
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="club-partners content-width">
        <span className="eyebrow">OUR PARTNERS / 同行伙伴</span>
        {clubInfo.sponsors?.length ? (
          <div className="partner-list">
            {clubInfo.sponsors.map((s, i) => (
              <span key={i}>
                {s.image ? <img src={s.image} alt={s.name} /> : s.name}
              </span>
            ))}
          </div>
        ) : (
          <p>
            携手同行，共赴下一场热爱。<small>合作伙伴信息待公布</small>
          </p>
        )}
      </section>
    </div>
  );
}
