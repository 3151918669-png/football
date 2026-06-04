import React from "react";

function Navbar({ view, setView, clubInfo }) {
  const navItems = [
    { key: "dashboard", label: "首页", icon: "⌂" },
    { key: "teamMatches", label: "比赛", icon: "⚽" },
    { key: "playerLibrary", label: "球员", icon: "♟" },
    { key: "rankings", label: "数据", icon: "▥" },
    { key: "lineup", label: "阵容", icon: "◆" },
    { key: "club", label: "球队", icon: "◉" },
    { key: "awards", label: "奖项", icon: "★" },
    { key: "coach", label: "教练", icon: "♜" },
    { key: "operations", label: "运营", icon: "⚙" },
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
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </aside>
  );
}

export default Navbar;
