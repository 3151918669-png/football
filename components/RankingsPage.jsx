import React, { useMemo, useState } from "react";
import { PageIntro, ClubBadge } from "./ClubUI";
export default function RankingsPage({ players, teamMatches, teamStats }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("goals");
  const [ascending, setAscending] = useState(false);
  const [group, setGroup] = useState("全部");
  const columns = [
    ["appearances", "出场"],
    ["goals", "进球"],
    ["assists", "助攻"],
    ["mvp", "MVP"],
    ["rating", "场均评分"],
    ["saves", "扑救"],
    ["cleanSheets", "零封"],
  ];
  const rows = useMemo(
    () =>
      players
        .map((p) => {
          const records = p.matches || [],
            rated = records.filter((m) => Number(m.rating) > 0);
          const total = (k) =>
            records.some(
              (m) => m[k] !== undefined && m[k] !== null && m[k] !== "",
            )
              ? records.reduce((s, m) => s + Number(m[k] || 0), 0)
              : null;
          return {
            ...p,
            appearances: records.length,
            goals: total("goals"),
            assists: total("assists"),
            saves: total("saves"),
            cleanSheets: records.some((m) => m.cleanSheet !== undefined)
              ? records.filter((m) => m.cleanSheet).length
              : null,
            mvp: teamMatches.filter(
              (m) =>
                m.status !== "scheduled" &&
                m.status !== "live" &&
                ((m.matchAwards || {}).mvp || m.bestPlayer) === p.name,
            ).length,
            rating: rated.length
              ? rated.reduce((s, m) => s + Number(m.rating), 0) / rated.length
              : null,
          };
        })
        .filter(
          (p) =>
            (group === "全部" || p.category === group) &&
            [p.name, p.number, p.position].some((v) =>
              String(v || "").includes(query),
            ),
        )
        .sort(
          (a, b) =>
            ((a[sort] ?? -1) - (b[sort] ?? -1)) * (ascending ? 1 : -1) ||
            a.name.localeCompare(b.name, "zh"),
        ),
    [players, teamMatches, query, sort, ascending, group],
  );
  const hasRecords = players.some((p) => p.matches?.length);
  return (
    <div className="match-page rankings-page club-page-enter">
      <PageIntro
        en="STATISTICS"
        title="用数据，记录每一步"
        text="球队总览来自已完赛比赛；球员排行来自个人比赛记录。选择顶部赛季可查看对应赛季表现。"
      >
        <ClubBadge />
      </PageIntro>
      <div className="stats-overview">
        {[
          [teamStats.matches, "比赛场次"],
          [
            `${teamStats.wins}/${teamStats.draws}/${teamStats.losses}`,
            "胜 / 平 / 负",
          ],
          [teamStats.goals, "进球"],
          [teamStats.conceded, "失球"],
          [
            teamStats.matches
              ? `${Math.round((teamStats.wins / teamStats.matches) * 100)}%`
              : "—",
            "胜率",
          ],
          [players.length, "在册球员"],
        ].map(([value, label]) => (
          <div key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="section-head-row">
          <div>
            <span className="eyebrow">PLAYER LEADERBOARD</span>
            <h2>球员排行榜</h2>
          </div>
          <span className="roster-count">{rows.length} 名球员</span>
        </div>
        <div className="stats-filters">
          <input
            aria-label="搜索球员"
            placeholder="搜索姓名、号码、位置"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            aria-label="筛选位置"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            {["全部", "前场", "中场", "后卫", "守门员"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            aria-label="排行指标"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {columns.map(([key, label]) => (
              <option value={key} key={key}>
                {label}排行
              </option>
            ))}
          </select>
          <button
            className="small-ghost-btn"
            onClick={() => setAscending(!ascending)}
          >
            {ascending ? "升序 ↑" : "降序 ↓"}
          </button>
        </div>
        {!hasRecords && <p>暂无个人比赛记录。</p>}
        <div className="club-table-wrap">
          <table className="club-table">
            <thead>
              <tr>
                <th>#</th>
                <th>球员</th>
                <th>位置</th>
                {columns.map(([key, label]) => (
                  <th key={key}>
                    <button
                      onClick={() => {
                        if (sort === key) setAscending(!ascending);
                        else {
                          setSort(key);
                          setAscending(false);
                        }
                      }}
                    >
                      {label} {sort === key ? (ascending ? "↑" : "↓") : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.name}>
                  <td>{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <strong>{p.name}</strong> <small>#{p.number || "—"}</small>
                  </td>
                  <td>{p.category || "—"}</td>
                  {columns.map(([key]) => (
                    <td key={key}>
                      {key === "rating"
                        ? p.rating === null
                          ? "暂无记录"
                          : p.rating.toFixed(1)
                        : key === "mvp"
                          ? p.mvp || "—"
                          : p.appearances
                            ? (p[key] ?? "—")
                            : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <p className="empty-match">没有符合条件的球员。</p>}
        <p style={{ fontSize: 11, marginTop: 18 }}>
          点击列名排序 · 评分仅统计已填写评分的比赛 · 未记录项目显示“—”
        </p>
      </section>
    </div>
  );
}
