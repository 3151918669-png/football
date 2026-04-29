import "./styles.css";
import React, { useEffect, useMemo, useState } from "react";

const defaultPlayers = [
  {
    name: "陆梓鑫",
    number: 3,
    category: "后卫",
    position: "LB",
    role: "边路稳定器",
    ability: 74,
    potential: 82,
    foot: "左脚",
    age: 23,
    rarity: "银卡稀有",
    cardType: "工兵型执行者",
    attributes: { 速度: 74, 射门: 52, 传球: 69, 盘带: 72, 防守: 73, 身体: 70 },
    tags: ["跑动", "执行力", "左路稳定"],
    summary: "左路稳定型球员，适合承担防守、补位和边路衔接任务。",
    suggestions: ["前插时可以更果断。", "传球选择可增加向前比例。", "继续提升传中质量。"],
    matches: [],
  },
  {
    name: "戴天麒",
    number: 17,
    category: "中场",
    position: "CDM / RB",
    role: "防守屏障",
    ability: 80,
    potential: 86,
    foot: "右脚",
    age: 17,
    rarity: "金卡稀有",
    cardType: "扫荡型屏障",
    attributes: { 速度: 72, 射门: 48, 传球: 65, 盘带: 63, 防守: 82, 身体: 84 },
    tags: ["扫荡者", "拦截", "高覆盖"],
    summary: "负责中场保护，拦截对手进攻，为球队提供稳定屏障。",
    suggestions: ["注意纵向保护。", "出球时更耐心。", "领先时保持专注。"],
    matches: [],
  },
  {
    name: "吴易纬",
    number: 11,
    category: "前场",
    position: "LW / RW / CAM",
    role: "前场多面手",
    ability: 78,
    potential: 80,
    foot: "右脚",
    age: 20,
    rarity: "金卡普通",
    cardType: "前场推进点",
    attributes: { 速度: 82, 射门: 70, 传球: 74, 盘带: 82, 防守: 50, 身体: 68 },
    tags: ["突破", "创造", "多位置"],
    summary: "可承担多个前场角色，适合制造进攻变化。",
    suggestions: ["增加无球跑动。", "突破后选择更果断。", "提升最后一传稳定性。"],
    matches: [],
  },
  {
    name: "贾玉乐",
    number: 9,
    category: "前场",
    position: "LW / ST",
    role: "前场冲击点",
    ability: 72,
    potential: 74,
    foot: "右脚",
    age: 20,
    rarity: "银卡普通",
    cardType: "前场支点",
    attributes: { 速度: 68, 射门: 70, 传球: 58, 盘带: 66, 防守: 42, 身体: 82 },
    tags: ["身体", "支点", "冲击"],
    summary: "前场力量型球员，适合承担支点和牵制任务。",
    suggestions: ["多利用身体保护球权。", "提前观察中路队友。", "背身拿球减少停顿。"],
    matches: [],
  },
  {
    name: "张冬晨",
    number: 8,
    category: "前场",
    position: "CAM",
    role: "前场连接点",
    ability: 73,
    potential: 74,
    foot: "右脚",
    age: 20,
    rarity: "银卡稀有",
    cardType: "连接型前腰",
    attributes: { 速度: 62, 射门: 64, 传球: 73, 盘带: 71, 防守: 55, 身体: 60 },
    tags: ["接应", "传球", "组织"],
    summary: "适合阵地战中提供接应和短传连接。",
    suggestions: ["增加跑动参与度。", "加快处理球节奏。", "提升对抗稳定性。"],
    matches: [],
  },
  {
    name: "麻伟华",
    number: 10,
    category: "中场",
    position: "CM",
    role: "组织核心",
    ability: 82,
    potential: 84,
    foot: "右脚",
    age: 20,
    rarity: "金卡稀有",
    cardType: "组织核心",
    attributes: { 速度: 58, 射门: 60, 传球: 86, 盘带: 76, 防守: 62, 身体: 58 },
    tags: ["节拍器", "组织", "出球"],
    summary: "球队进攻节奏掌控者，擅长短传和控球。",
    suggestions: ["对抗强时更早出球。", "增加无球接应。", "尝试更果断向前传球。"],
    matches: [],
  },
  {
    name: "赵俊楠",
    number: 25,
    category: "后卫",
    position: "CB",
    role: "防线核心",
    ability: 84,
    potential: 86,
    foot: "右脚",
    age: 25,
    rarity: "金卡稀有",
    cardType: "防线指挥官",
    attributes: { 速度: 72, 射门: 45, 传球: 70, 盘带: 66, 防守: 86, 身体: 84 },
    tags: ["防线统帅", "站位", "补位"],
    summary: "球队后场稳定器，负责防线高度、补位和后场组织。",
    suggestions: ["高位防线时提醒队友保护距离。", "提前控制身后空间。", "更多组织队友站位。"],
    matches: [],
  },
  {
    name: "吴俊",
    number: 13,
    category: "后卫",
    position: "RB / CB / GK",
    role: "多功能防守补充",
    ability: 70,
    potential: 73,
    foot: "右脚",
    age: 20,
    rarity: "银卡普通",
    cardType: "多功能防守",
    attributes: { 速度: 60, 射门: 40, 传球: 58, 盘带: 55, 防守: 70, 身体: 68 },
    tags: ["多位置", "补位", "防守"],
    summary: "可在 RB、CB、GK 特殊场景中补充使用。",
    suggestions: ["位置切换时多沟通。", "防守站位更紧凑。", "门将位置可作为备用。"],
    matches: [],
  },
];

const coaches = [
  { name: "章兮兮", role: "主教练", duty: "负责整体战术、首发选择与比赛决策。" },
  { name: "陆梓鑫", role: "助理教练", duty: "负责训练组织、球员沟通与执行反馈。" },
  { name: "杨寒", role: "助理教练", duty: "负责数据记录、赛后复盘与战术辅助。" },
];

const categories = ["前场", "中场", "后卫"];

function averageRating(matches) {
  if (!matches.length) return "-";
  return (matches.reduce((s, m) => s + Number(m.rating || 0), 0) / matches.length).toFixed(1);
}

function total(matches, key) {
  return matches.reduce((s, m) => s + Number(m[key] || 0), 0);
}

export default function App() {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("team-v8-data");
    return saved ? JSON.parse(saved) : defaultPlayers;
  });
  const [view, setView] = useState("players");
  const [selectedName, setSelectedName] = useState("陆梓鑫");
  const [form, setForm] = useState({ date: "", opponent: "", goals: "", assists: "", rating: "", note: "" });

  useEffect(() => {
    localStorage.setItem("team-v8-data", JSON.stringify(players));
  }, [players]);

  const selected = players.find((p) => p.name === selectedName) || players[0];
  const allMatches = players.flatMap((p) => p.matches);
  const ranking = useMemo(() => {
    return [...players]
      .map((p) => ({ ...p, avg: averageRating(p.matches) }))
      .sort((a, b) => {
        const av = a.avg === "-" ? 0 : Number(a.avg);
        const bv = b.avg === "-" ? 0 : Number(b.avg);
        return bv - av || b.ability - a.ability;
      });
  }, [players]);

  const mvp = ranking.find((p) => p.matches.length > 0);

  function addMatch() {
    if (!form.date || !form.opponent || !form.rating) {
      alert("请至少填写日期、对手和评分");
      return;
    }

    const newMatch = {
      ...form,
      goals: Number(form.goals || 0),
      assists: Number(form.assists || 0),
      rating: Number(form.rating),
      note: form.note || "暂无备注",
    };

    setPlayers((old) =>
      old.map((p) =>
        p.name === selected.name ? { ...p, matches: [...p.matches, newMatch] } : p
      )
    );

    setForm({ date: "", opponent: "", goals: "", assists: "", rating: "", note: "" });
  }

  function resetData() {
    if (!window.confirm("确认恢复初始数据吗？")) return;
    localStorage.removeItem("team-v8-data");
    setPlayers(defaultPlayers);
  }

  return (
    <div className="fm-shell">
      <aside className="fm-left-nav">
        <div className="club-badge">FC</div>
        <button className={view === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => setView("dashboard")}>主页</button>
        <button className={view === "players" ? "nav-item active" : "nav-item"} onClick={() => setView("players")}>球员</button>
        <button className={view === "matches" ? "nav-item active" : "nav-item"} onClick={() => setView("matches")}>比赛</button>
        <button className={view === "lineup" ? "nav-item active" : "nav-item"} onClick={() => setView("lineup")}>阵容</button>
        <button className={view === "coach" ? "nav-item active" : "nav-item"} onClick={() => setView("coach")}>教练组</button>
      </aside>

      <main className="fm-main">
        <header className="fm-topbar">
          <div>
            <h1>球队内部战术中心 V8</h1>
            <p>职业 UI / 球星卡 / 比赛记录 / 阵容推荐 / 教练组</p>
          </div>
          <div className="top-actions">
            <span>本地保存</span>
            <span>职业版</span>
          </div>
        </header>

        {view === "dashboard" && (
          <section className="dashboard-grid">
            <InfoCard title="球员数量" value={players.length} />
            <InfoCard title="比赛记录" value={allMatches.length} />
            <InfoCard title="总进球" value={total(allMatches, "goals")} />
            <InfoCard title="总助攻" value={total(allMatches, "assists")} />
            <div className="panel wide">
              <h2>自动 MVP</h2>
              <p>{mvp ? `${mvp.name}｜场均评分 ${mvp.avg}` : "暂无比赛数据，录入后自动生成。"}</p>
            </div>
          </section>
        )}

        {view === "players" && (
          <div className="player-layout">
            <aside className="player-list">
              {categories.map((cat) => (
                <div className="player-group" key={cat}>
                  <h3>{cat}</h3>
                  {players.filter((p) => p.category === cat).map((p) => (
                    <button
                      key={p.name}
                      className={selectedName === p.name ? "player-row active" : "player-row"}
                      onClick={() => setSelectedName(p.name)}
                    >
                      <span>#{p.number}</span>
                      <strong>{p.name}</strong>
                      <small>{p.position}</small>
                      <small>能力 {p.ability}｜潜力 {p.potential}</small>
                    </button>
                  ))}
                </div>
              ))}
            </aside>

            <section className="fm-player-page">
              <div className="v8-grid">
                <StarCard player={selected} />

                <div className="v8-detail">
                  <div className="player-hero">
                    <div>
                      <h2>{selected.name}</h2>
                      <p>{selected.position} / {selected.role}</p>
                      <div className="tag-row">
                        {selected.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    </div>
                    <div className="ability-box">
                      <div><small>能力</small><strong>{selected.ability}</strong></div>
                      <div><small>潜力</small><strong>{selected.potential}</strong></div>
                    </div>
                  </div>

                  <div className="fm-content-grid">
                    <section className="panel">
                      <h3>球员定位</h3>
                      <p>{selected.summary}</p>
                    </section>
                    <section className="panel">
                      <h3>建议方向</h3>
                      <ul>{selected.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
                    </section>
                    <section className="panel wide">
                      <h3>比赛记录</h3>
                      <MatchTable matches={selected.matches} />
                    </section>
                  </div>
                </div>
              </div>
            </section>

            <aside className="right-analysis">
              <section className="panel">
                <h3>能力属性</h3>
                {Object.entries(selected.attributes).map(([k, v]) => (
                  <div className="attr-row" key={k}>
                    <span>{k}</span>
                    <b className={v >= 75 ? "elite" : v >= 65 ? "good" : "weak"}>{v}</b>
                  </div>
                ))}
              </section>
              <section className="panel">
                <h3>赛季统计</h3>
                <div className="season-row"><span>出场</span><b>{selected.matches.length}</b></div>
                <div className="season-row"><span>进球</span><b>{total(selected.matches, "goals")}</b></div>
                <div className="season-row"><span>助攻</span><b>{total(selected.matches, "assists")}</b></div>
                <div className="season-row"><span>场均评分</span><b>{averageRating(selected.matches)}</b></div>
              </section>
            </aside>
          </div>
        )}

        {view === "matches" && (
          <div className="match-page">
            <section className="panel">
              <h2>添加比赛记录</h2>
              <p>当前球员：<strong>{selected.name}</strong></p>
              <div className="form-grid">
                {["date", "opponent", "goals", "assists", "rating"].map((key) => (
                  <input
                    key={key}
                    placeholder={{ date: "日期", opponent: "对手", goals: "进球", assists: "助攻", rating: "评分" }[key]}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                ))}
              </div>
              <textarea placeholder="比赛备注" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              <button className="primary-btn" onClick={addMatch}>添加记录</button>
            </section>
            <section className="panel">
              <h2>{selected.name} 的比赛记录</h2>
              <MatchTable matches={selected.matches} />
            </section>
          </div>
        )}

        {view === "lineup" && (
          <section className="dashboard-grid">
            {categories.map((cat) => (
              <div className="panel" key={cat}>
                <h2>{cat}</h2>
                <ul>
                  {[...players].filter((p) => p.category === cat).sort((a, b) => b.ability - a.ability).slice(0, 3).map((p) => (
                    <li key={p.name}>{p.name}｜{p.position}｜能力 {p.ability}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {view === "coach" && (
          <section className="dashboard-grid">
            {coaches.map((c) => (
              <div className="panel coach-card" key={c.name}>
                <h2>{c.name}</h2>
                <h3>{c.role}</h3>
                <p>{c.duty}</p>
              </div>
            ))}
            <div className="panel wide">
              <h2>评分排行榜</h2>
              <MatchRanking ranking={ranking} />
            </div>
            <div className="panel">
              <h2>数据管理</h2>
              <button className="primary-btn" onClick={resetData}>恢复初始数据</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StarCard({ player }) {
  const a = player.attributes;
  return (
    <div className="star-card">
      <div className="card-brand">FC26</div>
      <div className="card-topline">
        <div>
          <div className="card-rating">{player.ability}</div>
          <div className="card-position">{player.position}</div>
          <div className="card-foot">惯用脚<br /><strong>{player.foot}</strong></div>
          <div className="card-number">#{player.number}</div>
        </div>
      </div>
      <div className="card-avatar">{player.name[0]}</div>
      <div className="card-name">{player.name}</div>
      <div className="card-stats">
        <div><span>速度</span><b>{a.速度}</b></div>
        <div><span>射门</span><b>{a.射门}</b></div>
        <div><span>传球</span><b>{a.传球}</b></div>
        <div><span>盘带</span><b>{a.盘带}</b></div>
        <div><span>防守</span><b>{a.防守}</b></div>
        <div><span>身体</span><b>{a.身体}</b></div>
      </div>
      <div className="card-bottom">
        <div><span>年龄</span><b>{player.age}</b></div>
        <div><span>类型</span><b>{player.cardType}</b></div>
        <div><span>稀有度</span><b>{player.rarity}</b></div>
      </div>
    </div>
  );
}

function MatchTable({ matches }) {
  if (!matches.length) return <div className="empty-match">暂无比赛记录</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>日期</th><th>对手</th><th>进球</th><th>助攻</th><th>评分</th><th>备注</th></tr></thead>
        <tbody>
          {matches.map((m, i) => (
            <tr key={i}><td>{m.date}</td><td>{m.opponent}</td><td>{m.goals}</td><td>{m.assists}</td><td>{m.rating}</td><td>{m.note}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchRanking({ ranking }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>排名</th><th>球员</th><th>位置</th><th>场均评分</th><th>出场</th></tr></thead>
        <tbody>
          {ranking.map((p, i) => (
            <tr key={p.name}><td>{i + 1}</td><td>{p.name}</td><td>{p.position}</td><td>{p.avg}</td><td>{p.matches.length}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <section className="panel info-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </section>
  );
}
