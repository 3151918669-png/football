/**
 * 高级统计分析组件
 * 说明：本版本不再使用张三/李四等模拟数据，直接读取 App 传入的真实 players 数据。
 * 可读取字段：player.name / number / position / attributes / ability / potential / matches。
 * 如果某些高级字段没有录入，例如 shots、passes、successfulPasses，会显示“暂无数据”，不会用假数据顶替。
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

const ATTR_KEYS = ["速度", "射门", "传球", "盘带", "防守", "体能"];
const ATTR_KEY_MAP = {
  速度: "speed",
  射门: "shooting",
  传球: "passing",
  盘带: "dribbling",
  防守: "defending",
  体能: "physical",
};
const ATTR_LABELS = ["速度", "射门", "传球", "盘带", "防守", "体能"];
const ATTR_EN_KEYS = ["speed", "shooting", "passing", "dribbling", "defending", "physical"];

const FIELD_POSITIONS = {
  GK: { x: 8, y: 50, label: "门将" },
  LB: { x: 24, y: 22, label: "左后卫" },
  LWB: { x: 34, y: 18, label: "左翼卫" },
  CB: { x: 24, y: 50, label: "中后卫" },
  RB: { x: 24, y: 78, label: "右后卫" },
  RWB: { x: 34, y: 82, label: "右翼卫" },
  CDM: { x: 42, y: 50, label: "后腰" },
  CM: { x: 52, y: 50, label: "中场" },
  CAM: { x: 64, y: 50, label: "前腰" },
  LM: { x: 56, y: 20, label: "左中场" },
  RM: { x: 56, y: 80, label: "右中场" },
  LW: { x: 76, y: 18, label: "左边锋" },
  RW: { x: 76, y: 82, label: "右边锋" },
  ST: { x: 86, y: 50, label: "前锋" },
  CF: { x: 78, y: 50, label: "中锋" },
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, toNumber(value, 0)));
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(digits);
}

function formatPercent(value, digits = 1) {
  if (!Number.isFinite(value)) return "暂无";
  return `${(value * 100).toFixed(digits)}%`;
}

function getPrimaryPosition(position = "") {
  const text = String(position || "").toUpperCase();
  const parts = text.split(/[\/、,，\s]+/).filter(Boolean);
  const known = parts.find((part) => FIELD_POSITIONS[part]);
  return known || parts[0] || "CM";
}

function getPlayerKey(player, index) {
  return player?.id || player?.name || `${player?.number || "player"}-${index}`;
}

function getMatchMinutes(match) {
  const explicit = toNumber(match?.minutes ?? match?.minute ?? match?.playMinutes ?? match?.duration, NaN);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  return 90;
}

function normalizeResult(result) {
  const value = String(result || "").toLowerCase();
  if (["win", "胜", "w"].includes(value) || value.includes("胜")) return "win";
  if (["draw", "平", "d"].includes(value) || value.includes("平")) return "draw";
  if (["loss", "负", "lose", "l"].includes(value) || value.includes("负")) return "loss";
  return "";
}

function sumMatches(matches, key) {
  return matches.reduce((sum, match) => sum + toNumber(match?.[key], 0), 0);
}

function average(values) {
  const nums = values.map((v) => toNumber(v, NaN)).filter((v) => Number.isFinite(v));
  if (!nums.length) return NaN;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

function getRadarFromPlayer(player) {
  const attrs = player?.attributes || {};
  return {
    speed: clamp(attrs["速度"] ?? player?.speed ?? player?.ability ?? 60, 0, 99),
    shooting: clamp(attrs["射门"] ?? player?.shooting ?? player?.ability ?? 60, 0, 99),
    passing: clamp(attrs["传球"] ?? player?.passing ?? player?.ability ?? 60, 0, 99),
    dribbling: clamp(attrs["盘带"] ?? player?.dribbling ?? player?.ability ?? 60, 0, 99),
    defending: clamp(attrs["防守"] ?? player?.defending ?? player?.ability ?? 60, 0, 99),
    physical: clamp(attrs["体能"] ?? player?.physical ?? player?.potential ?? player?.ability ?? 60, 0, 99),
  };
}

function getTrendFromMatches(player) {
  const matches = Array.isArray(player?.matches) ? player.matches : [];
  return matches
    .map((match, index) => ({
      label: match?.date || `第${index + 1}场`,
      rating: toNumber(match?.rating, NaN),
      opponent: match?.opponent || match?.team || "-",
      result: normalizeResult(match?.result),
    }))
    .filter((item) => Number.isFinite(item.rating));
}

function getHeatmapCenter(player) {
  const primary = getPrimaryPosition(player?.position);
  const base = FIELD_POSITIONS[primary] || FIELD_POSITIONS.CM;
  return base;
}

function generateHeatmapData(player) {
  const center = getHeatmapCenter(player);
  const stamina = clamp(player?.attributes?.["体能"] ?? player?.ability ?? 65, 0, 99);
  const spread = 18 + (stamina / 99) * 16;
  const cells = [];

  for (let row = 0; row < 10; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      const x = (col / 15) * 100;
      const y = (row / 9) * 100;
      const dx = x - center.x;
      const dy = y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const intensity = Math.max(0, Math.exp(-(distance * distance) / (2 * spread * spread)));
      cells.push({ row, col, x, y, intensity });
    }
  }

  return cells;
}

function normalizePlayers(rawPlayers = []) {
  return rawPlayers.map((player, index) => {
    const matches = Array.isArray(player?.matches) ? player.matches : [];
    const games = matches.length;
    const minutesPlayed = matches.reduce((sum, match) => sum + getMatchMinutes(match), 0);
    const goals = sumMatches(matches, "goals");
    const assists = sumMatches(matches, "assists");
    const shots = sumMatches(matches, "shots");
    const shotsOnTarget = sumMatches(matches, "shotsOnTarget");
    const passes = sumMatches(matches, "passes");
    const successfulPasses = sumMatches(matches, "successfulPasses") || sumMatches(matches, "passSuccess");
    const tackles = sumMatches(matches, "tackles");
    const interceptions = sumMatches(matches, "interceptions");
    const ratings = matches.map((match) => toNumber(match?.rating, NaN)).filter((v) => Number.isFinite(v));
    const averageRating = ratings.length ? average(ratings) : NaN;
    const mvpCount = matches.filter((match) => match?.marked || match?.mvp || match?.isMvp).length;
    const wins = matches.filter((match) => normalizeResult(match?.result) === "win").length;
    const draws = matches.filter((match) => normalizeResult(match?.result) === "draw").length;
    const losses = matches.filter((match) => normalizeResult(match?.result) === "loss").length;
    const minutesForRate = minutesPlayed > 0 ? minutesPlayed : games * 90;

    const efficiency = {
      goalsPer90: minutesForRate > 0 ? (goals / minutesForRate) * 90 : 0,
      assistsPer90: minutesForRate > 0 ? (assists / minutesForRate) * 90 : 0,
      goalContributionPer90: minutesForRate > 0 ? ((goals + assists) / minutesForRate) * 90 : 0,
      shotConversion: shots > 0 ? goals / shots : NaN,
      passSuccess: passes > 0 ? successfulPasses / passes : NaN,
      averageRating,
    };

    const radar = getRadarFromPlayer(player);
    const primaryPosition = getPrimaryPosition(player?.position);

    return {
      id: getPlayerKey(player, index),
      raw: player,
      name: player?.name || `球员${index + 1}`,
      number: player?.number || "-",
      position: player?.position || "-",
      primaryPosition,
      category: player?.category || "-",
      ability: toNumber(player?.ability, 0),
      potential: toNumber(player?.potential, 0),
      matches,
      trend: getTrendFromMatches(player),
      heatmapData: generateHeatmapData(player),
      radar,
      stats: {
        games,
        minutesPlayed,
        goals,
        assists,
        shots,
        shotsOnTarget,
        passes,
        successfulPasses,
        tackles,
        interceptions,
        averageRating,
        mvpCount,
        wins,
        draws,
        losses,
      },
      efficiency,
    };
  });
}

const EmptyStats = ({ title = "暂无数据", desc = "请先录入球员或比赛记录。" }) => (
  <div className="stats-empty" style={{ padding: "28px", textAlign: "center", color: "var(--sub)" }}>
    <h3 style={{ color: "var(--text)", marginBottom: 8 }}>{title}</h3>
    <p>{desc}</p>
  </div>
);

const EfficiencyPanel = ({ players }) => {
  const [sortKey, setSortKey] = useState("goalContributionPer90");
  const [sortDir, setSortDir] = useState("desc");

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aVal = a.efficiency?.[sortKey];
      const bVal = b.efficiency?.[sortKey];
      const safeA = Number.isFinite(aVal) ? aVal : -1;
      const safeB = Number.isFinite(bVal) ? bVal : -1;
      return sortDir === "desc" ? safeB - safeA : safeA - safeB;
    });
  }, [players, sortKey, sortDir]);

  const maxGoalsPer90 = Math.max(0.2, ...players.map((p) => p.efficiency.goalsPer90));
  const maxAssistsPer90 = Math.max(0.2, ...players.map((p) => p.efficiency.assistsPer90));

  const columns = [
    { key: "name", label: "球员" },
    { key: "position", label: "位置" },
    { key: "games", label: "出场" },
    { key: "goals", label: "进球" },
    { key: "assists", label: "助攻" },
    { key: "goalsPer90", label: "每90分钟进球", sortable: true, format: (p) => formatNumber(p.efficiency.goalsPer90, 2) },
    { key: "assistsPer90", label: "每90分钟助攻", sortable: true, format: (p) => formatNumber(p.efficiency.assistsPer90, 2) },
    { key: "goalContributionPer90", label: "每90分钟参与进球", sortable: true, format: (p) => formatNumber(p.efficiency.goalContributionPer90, 2) },
    { key: "shotConversion", label: "射门转化率", sortable: true, format: (p) => formatPercent(p.efficiency.shotConversion) },
    { key: "passSuccess", label: "传球成功率", sortable: true, format: (p) => formatPercent(p.efficiency.passSuccess) },
    { key: "averageRating", label: "平均评分", sortable: true, format: (p) => Number.isFinite(p.efficiency.averageRating) ? p.efficiency.averageRating.toFixed(1) : "暂无" },
  ];

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (!players.length) return <EmptyStats />;

  return (
    <div className="stats-panel efficiency-panel">
      <h3 className="stats-panel-title">⚡ 球员效率分析</h3>
      <p className="stats-panel-desc">读取球员个人比赛记录自动计算：进球、助攻、每90分钟效率、平均评分。</p>

      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={col.key === sortKey ? "sorted" : ""}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  {col.label}
                  {col.key === sortKey ? <span className="sort-arrow">{sortDir === "desc" ? " ▼" : " ▲"}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <tr key={player.id}>
                {columns.map((col) => {
                  let value = "";
                  if (col.key === "name") value = player.name;
                  else if (col.key === "position") value = player.position;
                  else if (col.key === "games") value = player.stats.games;
                  else if (col.key === "goals") value = player.stats.goals;
                  else if (col.key === "assists") value = player.stats.assists;
                  else if (col.format) value = col.format(player);
                  return <td key={col.key}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-chart">
        <h4>每90分钟进球/助攻对比</h4>
        <div className="bar-chart">
          {players.map((player) => (
            <div key={player.id} className="bar-chart-group">
              <div className="bar-label" title={player.name}>{player.name.slice(0, 2)}</div>
              <div className="bar-wrapper">
                <div
                  className="bar goals-bar"
                  style={{ width: `${Math.min(100, (player.efficiency.goalsPer90 / maxGoalsPer90) * 100)}%` }}
                  title={`${player.name} 进球/90: ${player.efficiency.goalsPer90.toFixed(2)}`}
                />
                <div
                  className="bar assists-bar"
                  style={{ width: `${Math.min(100, (player.efficiency.assistsPer90 / maxAssistsPer90) * 100)}%` }}
                  title={`${player.name} 助攻/90: ${player.efficiency.assistsPer90.toFixed(2)}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-color goals-color" /> 进球/90分钟</span>
          <span className="legend-item"><span className="legend-color assists-color" /> 助攻/90分钟</span>
        </div>
      </div>
    </div>
  );
};

const TrendChart = ({ players }) => {
  const playersWithTrend = useMemo(() => players.filter((p) => p.trend.length > 0), [players]);
  const [selectedPlayer, setSelectedPlayer] = useState(playersWithTrend[0]?.id || "");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!playersWithTrend.length) {
      setSelectedPlayer("");
      return;
    }
    if (!playersWithTrend.some((p) => p.id === selectedPlayer)) {
      setSelectedPlayer(playersWithTrend[0].id);
    }
  }, [playersWithTrend, selectedPlayer]);

  const player = useMemo(() => playersWithTrend.find((p) => p.id === selectedPlayer), [playersWithTrend, selectedPlayer]);
  const maxLength = Math.max(1, ...(showAll ? playersWithTrend.map((p) => p.trend.length) : [player?.trend.length || 1]));
  const chartWidth = 600;
  const chartHeight = 300;
  const left = 50;
  const right = 550;
  const top = 18;
  const bottom = 270;
  const xStep = maxLength > 1 ? (right - left) / (maxLength - 1) : 0;

  const getY = (rating) => bottom - ((rating - 0) / 10) * (bottom - top);
  const getPoints = (trend) => trend.map((item, i) => `${left + i * xStep},${getY(item.rating)}`).join(" ");
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#d7b56d", "#c084fc", "#fb923c"];

  if (!playersWithTrend.length) {
    return <EmptyStats title="暂无评分趋势" desc="请先在球员个人记录中录入比赛评分，系统会自动生成趋势图。" />;
  }

  return (
    <div className="stats-panel trend-panel">
      <h3 className="stats-panel-title">📈 状态趋势分析</h3>
      <p className="stats-panel-desc">基于球员个人比赛记录中的评分自动生成。</p>

      <div className="player-selector">
        {playersWithTrend.map((p, index) => (
          <button
            key={p.id}
            className={`player-chip ${selectedPlayer === p.id ? "active" : ""}`}
            style={{ "--chip-color": colors[index % colors.length] }}
            onClick={() => setSelectedPlayer(p.id)}
          >
            {p.name}
          </button>
        ))}
        <button className={`player-chip ${showAll ? "active" : ""}`} onClick={() => setShowAll(!showAll)}>
          {showAll ? "隐藏对比" : "全部对比"}
        </button>
      </div>

      <div className="trend-chart">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="trend-svg">
          {[0, 2, 4, 6, 8, 10].map((val) => {
            const y = getY(val);
            return (
              <g key={`grid-${val}`}>
                <line x1={45} y1={y} x2={555} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4,4" />
                <text x={40} y={y + 5} fill="rgba(255,255,255,0.55)" fontSize="10" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {showAll && playersWithTrend.map((p, index) => (
            <polyline
              key={`all-${p.id}`}
              points={getPoints(p.trend)}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth={p.id === selectedPlayer ? "3" : "1.5"}
              opacity={p.id === selectedPlayer ? 1 : 0.55}
              strokeDasharray={p.id === selectedPlayer ? "" : "5,3"}
            />
          ))}

          {!showAll && player ? (
            <polyline points={getPoints(player.trend)} fill="none" stroke="#d7b56d" strokeWidth="3" strokeLinejoin="round" />
          ) : null}

          {player?.trend.map((item, i) => {
            const x = left + i * xStep;
            const y = getY(item.rating);
            return (
              <g key={`${player.id}-${i}`}>
                <circle cx={x} cy={y} r="5" fill="#d7b56d" />
                <text x={x} y={y - 12} fill="rgba(255,255,255,0.85)" fontSize="11" textAnchor="middle">{item.rating.toFixed(1)}</text>
                <text x={x} y="292" fill="rgba(255,255,255,0.55)" fontSize="9" textAnchor="middle">{i + 1}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {player ? (
        <div className="trend-insight">
          <h4>{player.name} 趋势解读</h4>
          <div className="insight-stats">
            <div className="insight-stat"><span className="insight-label">最高评分</span><span className="insight-value">{Math.max(...player.trend.map((t) => t.rating)).toFixed(1)}</span></div>
            <div className="insight-stat"><span className="insight-label">最低评分</span><span className="insight-value">{Math.min(...player.trend.map((t) => t.rating)).toFixed(1)}</span></div>
            <div className="insight-stat"><span className="insight-label">平均评分</span><span className="insight-value">{average(player.trend.map((t) => t.rating)).toFixed(1)}</span></div>
            <div className="insight-stat">
              <span className="insight-label">趋势方向</span>
              <span className={`insight-value ${player.trend.at(-1)?.rating >= player.trend[0]?.rating ? "positive" : "negative"}`}>
                {player.trend.at(-1)?.rating >= player.trend[0]?.rating ? "↗ 上升" : "↘ 下降"}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const RadarCompare = ({ players }) => {
  const [playerA, setPlayerA] = useState(players[0]?.id || "");
  const [playerB, setPlayerB] = useState(players[1]?.id || players[0]?.id || "");

  useEffect(() => {
    if (!players.length) {
      setPlayerA("");
      setPlayerB("");
      return;
    }
    if (!players.some((p) => p.id === playerA)) setPlayerA(players[0].id);
    if (!players.some((p) => p.id === playerB)) setPlayerB(players[1]?.id || players[0].id);
  }, [players, playerA, playerB]);

  const p1 = useMemo(() => players.find((p) => p.id === playerA), [players, playerA]);
  const p2 = useMemo(() => players.find((p) => p.id === playerB), [players, playerB]);

  const calcPoints = (radar) => {
    const cx = 300;
    const cy = 300;
    const maxR = 210;
    return ATTR_EN_KEYS.map((key, i) => {
      const angle = (Math.PI * 2 * i) / ATTR_EN_KEYS.length - Math.PI / 2;
      const r = (clamp(radar?.[key], 0, 99) / 99) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  };

  const gridPolygons = Array.from({ length: 5 }, (_, level) => {
    const r = (210 * (level + 1)) / 5;
    return ATTR_EN_KEYS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / ATTR_EN_KEYS.length - Math.PI / 2;
      return `${300 + r * Math.cos(angle)},${300 + r * Math.sin(angle)}`;
    }).join(" ");
  });

  const p1Points = p1 ? calcPoints(p1.radar).map((pt) => `${pt.x},${pt.y}`).join(" ") : "";
  const p2Points = p2 ? calcPoints(p2.radar).map((pt) => `${pt.x},${pt.y}`).join(" ") : "";

  if (!players.length) return <EmptyStats />;

  return (
    <div className="stats-panel radar-panel">
      <h3 className="stats-panel-title">🔍 球员雷达图对比</h3>
      <p className="stats-panel-desc">基于球员六维能力值自动生成。</p>

      <div className="compare-selectors">
        <div className="compare-selector">
          <label>球员 A</label>
          <select value={playerA} onChange={(e) => setPlayerA(e.target.value)}>
            {players.map((p) => <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>)}
          </select>
        </div>
        <div className="vs-divider">VS</div>
        <div className="compare-selector">
          <label>球员 B</label>
          <select value={playerB} onChange={(e) => setPlayerB(e.target.value)}>
            {players.map((p) => <option key={p.id} value={p.id}>{p.name} (#{p.number})</option>)}
          </select>
        </div>
      </div>

      <div className="radar-chart">
        <svg viewBox="0 0 600 600" className="radar-svg">
          {gridPolygons.map((points, i) => <polygon key={`grid-${i}`} points={points} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />)}
          {ATTR_EN_KEYS.map((_, i) => {
            const angle = (Math.PI * 2 * i) / ATTR_EN_KEYS.length - Math.PI / 2;
            const x = 300 + 210 * Math.cos(angle);
            const y = 300 + 210 * Math.sin(angle);
            const lx = 300 + 245 * Math.cos(angle);
            const ly = 300 + 245 * Math.sin(angle);
            return (
              <g key={`axis-${i}`}>
                <line x1="300" y1="300" x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x={lx} y={ly} fill="rgba(255,255,255,0.75)" fontSize="14" textAnchor="middle" dominantBaseline="middle">{ATTR_LABELS[i]}</text>
              </g>
            );
          })}
          {p1 ? <polygon points={p1Points} fill="rgba(255,107,107,0.25)" stroke="#FF6B6B" strokeWidth="3" /> : null}
          {p2 ? <polygon points={p2Points} fill="rgba(78,205,196,0.25)" stroke="#4ECDC4" strokeWidth="3" /> : null}
        </svg>
      </div>

      <div className="compare-summary">
        {[p1, p2].filter(Boolean).map((p, index) => (
          <div key={p.id} className="compare-player-summary">
            <h4 style={{ color: index === 0 ? "#FF6B6B" : "#4ECDC4" }}>{p.name}</h4>
            <p>能力 {p.ability || "-"}｜潜力 {p.potential || "-"}｜{p.position}</p>
            <div className="compare-attrs">
              {ATTR_KEYS.map((label) => (
                <span key={label}>{label} {p.radar[ATTR_KEY_MAP[label]]}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeatmapView = ({ players }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id || "");

  useEffect(() => {
    if (!players.length) {
      setSelectedPlayer("");
      return;
    }
    if (!players.some((p) => p.id === selectedPlayer)) setSelectedPlayer(players[0].id);
  }, [players, selectedPlayer]);

  const player = useMemo(() => players.find((p) => p.id === selectedPlayer), [players, selectedPlayer]);
  const center = player ? getHeatmapCenter(player) : null;

  if (!players.length) return <EmptyStats />;

  return (
    <div className="stats-panel heatmap-panel">
      <h3 className="stats-panel-title">🔥 位置活动热图</h3>
      <p className="stats-panel-desc">根据球员位置和体能能力生成位置覆盖示意图。真实跑动热图需要额外录入 GPS 或区域数据。</p>

      <div className="player-selector">
        {players.map((p) => (
          <button key={p.id} className={`player-chip ${selectedPlayer === p.id ? "active" : ""}`} onClick={() => setSelectedPlayer(p.id)}>{p.name}</button>
        ))}
      </div>

      {player ? (
        <div className="heatmap-container">
          <div className="football-field-heatmap">
            <div className="field-lines">
              <div className="center-line" />
              <div className="center-circle" />
              <div className="penalty-box left" />
              <div className="penalty-box right" />
            </div>
            <div className="heatmap-grid">
              {player.heatmapData.map((cell) => (
                <div
                  key={`${cell.row}-${cell.col}`}
                  className="heatmap-cell"
                  style={{
                    gridColumn: cell.col + 1,
                    gridRow: cell.row + 1,
                    opacity: Math.max(0.06, cell.intensity),
                    background: `rgba(215, 181, 109, ${Math.max(0.04, cell.intensity * 0.8)})`,
                  }}
                />
              ))}
            </div>
            {center ? (
              <div className="position-marker" style={{ left: `${center.x}%`, top: `${center.y}%` }}>
                {center.label}
              </div>
            ) : null}
          </div>

          <div className="heatmap-stats">
            <div className="heatmap-stat"><span className="stat-label">球员</span><span className="stat-value">{player.name}</span></div>
            <div className="heatmap-stat"><span className="stat-label">主要位置</span><span className="stat-value">{center?.label || player.position}</span></div>
            <div className="heatmap-stat"><span className="stat-label">体能值</span><span className="stat-value">{player.radar.physical}</span></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ExportTools = ({ players }) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportData = useCallback(() => {
    try {
      if (exportFormat === "json") exportJSON(players);
      else exportCSV(players, exportFormat === "excel");
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败: " + (error.message || "未知错误"));
    }
  }, [players, exportFormat]);

  return (
    <div className="export-tools">
      <div className="export-controls">
        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="export-format-select">
          <option value="csv">导出 CSV</option>
          <option value="excel">导出 Excel</option>
          <option value="json">导出 JSON</option>
        </select>
        <button className="export-btn" onClick={exportData}>📥 导出数据</button>
        {exportSuccess ? <span className="export-success">✅ 导出成功!</span> : null}
      </div>
    </div>
  );
};

function exportCSV(players, excel = false) {
  const separator = excel ? "\t" : ",";
  const filename = excel ? "球员统计数据.xls" : "球员统计数据.csv";
  const mime = excel ? "application/vnd.ms-excel;charset=utf-8" : "text/csv;charset=utf-8";
  const headers = [
    "姓名", "号码", "位置", "出场", "进球", "助攻", "平均评分", "每90分钟进球", "每90分钟助攻", "每90分钟参与进球",
    "射门", "射门转化率", "传球", "成功传球", "传球成功率", "速度", "射门能力", "传球能力", "盘带", "防守", "体能",
  ];
  const rows = players.map((p) => [
    p.name, p.number, p.position, p.stats.games, p.stats.goals, p.stats.assists,
    Number.isFinite(p.efficiency.averageRating) ? p.efficiency.averageRating.toFixed(1) : "",
    p.efficiency.goalsPer90.toFixed(2), p.efficiency.assistsPer90.toFixed(2), p.efficiency.goalContributionPer90.toFixed(2),
    p.stats.shots || "", Number.isFinite(p.efficiency.shotConversion) ? `${(p.efficiency.shotConversion * 100).toFixed(1)}%` : "",
    p.stats.passes || "", p.stats.successfulPasses || "", Number.isFinite(p.efficiency.passSuccess) ? `${(p.efficiency.passSuccess * 100).toFixed(1)}%` : "",
    p.radar.speed, p.radar.shooting, p.radar.passing, p.radar.dribbling, p.radar.defending, p.radar.physical,
  ]);
  const content = [headers, ...rows].map((row) => row.map((cell) => String(cell).replaceAll(separator, " ")).join(separator)).join("\n");
  downloadFile("\uFEFF" + content, filename, mime);
}

function exportJSON(players) {
  const data = players.map((p) => ({
    name: p.name,
    number: p.number,
    position: p.position,
    stats: p.stats,
    efficiency: p.efficiency,
    radar: p.radar,
    trend: p.trend,
  }));
  downloadFile(JSON.stringify(data, null, 2), "球员统计数据.json", "application/json;charset=utf-8");
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const AdvancedStats = ({ players: playersProp, customPlayers, teamMatches, coaches, clubInfo, onExport }) => {
  const [activeTab, setActiveTab] = useState("efficiency");
  const sourcePlayers = customPlayers || playersProp || [];
  const players = useMemo(() => normalizePlayers(sourcePlayers), [sourcePlayers]);

  const teamSummary = useMemo(() => {
    const games = players.reduce((sum, p) => sum + p.stats.games, 0);
    const goals = players.reduce((sum, p) => sum + p.stats.goals, 0);
    const assists = players.reduce((sum, p) => sum + p.stats.assists, 0);
    const ratings = players.flatMap((p) => p.trend.map((t) => t.rating));
    return {
      playerCount: players.length,
      recordCount: games,
      goals,
      assists,
      averageRating: ratings.length ? average(ratings).toFixed(1) : "暂无",
    };
  }, [players]);

  const tabs = [
    { key: "efficiency", label: "⚡ 效率分析" },
    { key: "trend", label: "📈 趋势图表" },
    { key: "compare", label: "🔍 对比分析" },
    { key: "heatmap", label: "🔥 活动热图" },
  ];

  return (
    <div className="advanced-stats">
      <div className="stats-header">
        <h2 className="stats-title">📊 高级统计分析</h2>
        <p className="stats-subtitle">已切换为真实球队数据：{clubInfo?.name || "球队"} · {teamSummary.playerCount} 名球员 · {teamSummary.recordCount} 条个人比赛记录</p>
      </div>

      <div className="stats-overview" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        <div className="stats-mini-card"><span>总进球</span><strong>{teamSummary.goals}</strong></div>
        <div className="stats-mini-card"><span>总助攻</span><strong>{teamSummary.assists}</strong></div>
        <div className="stats-mini-card"><span>平均评分</span><strong>{teamSummary.averageRating}</strong></div>
        <div className="stats-mini-card"><span>球员数量</span><strong>{teamSummary.playerCount}</strong></div>
      </div>

      <div className="stats-tabs">
        {tabs.map((tab) => (
          <button key={tab.key} className={`stats-tab ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="stats-content">
        {activeTab === "efficiency" ? <EfficiencyPanel players={players} /> : null}
        {activeTab === "trend" ? <TrendChart players={players} /> : null}
        {activeTab === "compare" ? <RadarCompare players={players} /> : null}
        {activeTab === "heatmap" ? <HeatmapView players={players} /> : null}
      </div>

      <ExportTools players={players} />
    </div>
  );
};

export default AdvancedStats;
