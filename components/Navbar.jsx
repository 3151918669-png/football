import React from "react";

function Navbar({ view, setView, clubInfo }) {
  const navItems = [
    { key: "dashboard", label: "官网首页" },
    { key: "club", label: "球队介绍" },
    { key: "playerLibrary", label: "球队名单" },
    { key: "players", label: "球员详情" },
    { key: "teamMatches", label: "比赛详情" },
    { key: "matches", label: "个人记录" },
    { key: "lineup", label: "阵容" },
    { key: "rankings", label: "排行榜" },
    { key: "operations", label: "运营" },
    { key: "awards", label: "奖项" },
    { key: "coach", label: "教练组" },
  ];

  return (
    <aside className="fm-left-nav">
      <div className="club-badge">{clubInfo.shortName || "FC"}</div>
      {navItems.map((item) => (
        <button
          key={item.key}
          className={view === item.key ? "nav-item active" : "nav-item"}
          onClick={() => setView(item.key)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}

export default Navbar;