import React, { useState } from "react";
import { ClubBadge } from "./ClubUI";
export default function Navbar({ view, setView, clubInfo, isAdmin, onAdmin }) {
  const [open, setOpen] = useState(false);
  const nav = [
    ["dashboard", "球队首页"],
    ["teamMatches", "比赛"],
    ["playerLibrary", "球员"],
    ["rankings", "数据"],
    ["awards", "奖杯/奖项"],
  ];
  const go = (key) => {
    setView(key);
    setOpen(false);
  };
  return (
    <header className="club-header">
      <div className="club-utility">
        <span>JIANGTE FOOTBALL CLUB</span>
        <span>因热爱相聚 · 为球队而战</span>
        <button onClick={onAdmin}>{isAdmin ? "管理中心" : "球队管理"} ↗</button>
      </div>
      <div className="club-nav">
        <button className="brand" onClick={() => go("dashboard")}>
          <ClubBadge clubInfo={clubInfo} />
          <span>
            <strong>江特FC</strong>
            <small>JIANGTE FC</small>
          </span>
        </button>
        <nav aria-label="主导航" className={open ? "open" : ""}>
          {nav.map(([key, label]) => (
            <button
              key={key}
              className={
                view === key || (key === "playerLibrary" && view === "players")
                  ? "active"
                  : ""
              }
              onClick={() => go(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button className="nav-club-link" onClick={() => go("club")}>
          我们的俱乐部 ↗
        </button>
        <button
          className="menu-toggle"
          aria-label="展开导航"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
