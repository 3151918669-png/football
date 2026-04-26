import "./styles.css";
import React, { useMemo, useState } from "react";

const initialPlayers = [
  {
    name: "贾玉乐",
    number: 9,
    category: "前场",
    age: 20,
    position: "中锋 ST",
    role: "支点型前锋",
    template: "Romelu Lukaku",
    foot: "右脚",
    height: "未知",
    weight: "未知",
    ability: 72,
    potential: 76,
    personality: "力量型",
    style: "前场支点",
    tags: ["空中支点", "背身中锋", "身体压制"],
    attributes: {
      身体: 18,
      防守: 6,
      阅读比赛: 9,
      机动性: 9,
      出球: 9,
      对抗: 18,
      纪律性: 10,
      创造力: 6,
    },
    strengths: [
      "身体优势明显",
      "能牵制中后卫",
      "适合做前场支点",
      "禁区内存在感强",
    ],
    suggestions: [
      "可以更多留在中路活动，提升禁区内接应效率。",
      "背身拿球后建议减少犹豫，优先完成做墙或回传。",
      "第一脚触球可以继续加强，帮助球队更快推进。",
      "面对包夹时可以更早分球，减少被断球的概率。",
    ],
    summary: "前场支点型球员，适合承担对抗、牵制和中路接应任务。",
    positions: [
      { name: "中锋 ST", stars: 5, x: 82, y: 50 },
      { name: "支点前锋", stars: 5, x: 78, y: 46 },
      { name: "影锋", stars: 3, x: 70, y: 50 },
    ],
    mainDot: { x: 82, y: 50 },
    secondaryDots: [
      { x: 78, y: 46 },
      { x: 70, y: 50 },
    ],
    matches: [],
  },
  {
    name: "吴易纬",
    number: 11,
    category: "前场",
    age: 20,
    position: "边锋 RW / LW",
    role: "爆点型突破手",
    template: "Antony",
    foot: "左脚",
    height: "未知",
    weight: "未知",
    ability: 78,
    potential: 80,
    personality: "个人突破型",
    style: "边路爆点",
    tags: ["单打爆点", "边路突破", "持球推进"],
    attributes: {
      身体: 14,
      防守: 7,
      阅读比赛: 8,
      机动性: 16,
      出球: 9,
      对抗: 10,
      纪律性: 8,
      创造力: 12,
    },
    strengths: [
      "一对一有威胁",
      "边路推进能力强",
      "具备改变局势的能力",
      "适合反击场景",
    ],
    suggestions: [
      "突破后可以更早观察队友位置，提升最后一传质量。",
      "建议减少连续粘球，保持进攻节奏流畅。",
      "防守回追时多做第一步反应，可以提升边路稳定性。",
      "进攻选择可以更丰富，避免被对手提前预判。",
    ],
    summary: "边路爆点型球员，适合在需要突破和提速时发挥作用。",
    positions: [
      { name: "右边锋 RW", stars: 5, x: 76, y: 20 },
      { name: "左边锋 LW", stars: 4, x: 76, y: 80 },
      { name: "边前卫", stars: 4, x: 60, y: 22 },
    ],
    mainDot: { x: 76, y: 20 },
    secondaryDots: [
      { x: 76, y: 80 },
      { x: 60, y: 22 },
    ],
    matches: [],
  },
  {
    name: "张冬晨",
    number: 8,
    category: "前场",
    age: 20,
    position: "前腰 CAM",
    role: "阵地战辅助",
    template: "Mesut Özil 弱化版",
    foot: "右脚",
    height: "未知",
    weight: "未知",
    ability: 74,
    potential: 76,
    personality: "静态处理型",
    style: "阵地战接应",
    tags: ["静态处理", "低节奏球员", "前场接应"],
    attributes: {
      身体: 6,
      防守: 5,
      阅读比赛: 9,
      机动性: 6,
      出球: 10,
      对抗: 5,
      纪律性: 6,
      创造力: 9,
    },
    strengths: ["低节奏下处理球较冷静", "适合阵地战接应", "具备一定传球意识"],
    suggestions: [
      "可以逐步提升跑动参与度，增加无球接应点。",
      "防守阶段建议先做好站位，减少被动局面。",
      "面对快节奏比赛时，可以提前观察并减少持球时间。",
      "身体对抗可以慢慢加强，提升比赛适应性。",
    ],
    summary: "适合低节奏阵地战阶段使用，主要承担接应和简单连接任务。",
    positions: [
      { name: "前腰 CAM", stars: 4, x: 66, y: 50 },
      { name: "中前卫 CM", stars: 3, x: 52, y: 50 },
    ],
    mainDot: { x: 66, y: 50 },
    secondaryDots: [{ x: 52, y: 50 }],
    matches: [],
  },
  {
    name: "麻伟华",
    number: 10,
    category: "中场",
    age: 20,
    position: "组织型中场 CM / Regista",
    role: "进攻发起核心",
    template: "Jorginho",
    foot: "右脚",
    height: "未知",
    weight: "未知",
    ability: 81,
    potential: 84,
    personality: "冷静",
    style: "组织核心",
    tags: ["节拍器", "组织核心", "出球枢纽"],
    attributes: {
      身体: 8,
      防守: 9,
      阅读比赛: 17,
      机动性: 10,
      出球: 18,
      对抗: 8,
      纪律性: 15,
      创造力: 15,
    },
    strengths: ["比赛节奏控制", "短传与控球", "位置感", "团队配合"],
    suggestions: [
      "在身体对抗较强的比赛中，可以更早出球，减少被压迫风险。",
      "适当增加无球跑动，帮助自己获得更好的接球空间。",
      "由守转攻时，可以尝试更果断的向前传球，制造进攻威胁。",
      "继续保持传球稳定性，减少不必要的失误。",
    ],
    summary: "球队进攻节奏的掌控者，擅长通过短传和控球稳定节奏。",
    positions: [
      { name: "组织型中场 CM", stars: 5, x: 50, y: 50 },
      { name: "拖后组织者", stars: 5, x: 42, y: 50 },
      { name: "中前卫", stars: 4, x: 56, y: 50 },
    ],
    mainDot: { x: 50, y: 50 },
    secondaryDots: [
      { x: 42, y: 50 },
      { x: 56, y: 50 },
    ],
    matches: [],
  },
  {
    name: "戴天麒",
    number: 17,
    category: "中场",
    age: 18,
    position: "后腰 CDM",
    role: "扫荡型屏障",
    template: "Casemiro",
    foot: "右脚",
    height: "未知",
    weight: "未知",
    ability: 80,
    potential: 86,
    personality: "努力型",
    style: "防守屏障",
    tags: ["扫荡者", "中场屏障", "高覆盖", "对抗强硬"],
    attributes: {
      身体: 17,
      防守: 16,
      阅读比赛: 13,
      机动性: 15,
      出球: 10,
      对抗: 17,
      纪律性: 12,
      创造力: 6,
    },
    strengths: ["覆盖面积大", "对抗能力强", "防守意识良好", "工作投入高"],
    suggestions: [
      "面对快速反击时，建议更注意纵向位置保护。",
      "出球时可以更耐心选择，避免仓促处理球。",
      "在领先时保持专注，减少情绪影响判断。",
      "可以尝试更多短传配合，减少不必要的长传。",
    ],
    summary: "负责中场防守保护，拦截对手进攻，为球队提供稳定的防守屏障。",
    positions: [
      { name: "后腰 CDM", stars: 5, x: 38, y: 50 },
      { name: "防守型中场 DM", stars: 5, x: 34, y: 50 },
      { name: "中前卫 CM", stars: 3, x: 50, y: 50 },
    ],
    mainDot: { x: 38, y: 50 },
    secondaryDots: [
      { x: 34, y: 50 },
      { x: 50, y: 50 },
    ],
    matches: [],
  },
  {
    name: "陆梓鑫",
    number: 3,
    category: "后卫",
    age: 23,
    position: "左后卫 LB",
    role: "工兵型执行者",
    template: "Lucas Vázquez",
    foot: "左脚",
    height: "173cm",
    weight: "65kg",
    ability: 72,
    potential: 74,
    personality: "团队型",
    style: "边路稳定器",
    tags: ["跑动机器", "战术执行者", "防守稳定器"],
    attributes: {
      身体: 15,
      防守: 13,
      阅读比赛: 12,
      机动性: 15,
      出球: 13,
      对抗: 10,
      纪律性: 16,
      创造力: 8,
    },
    strengths: ["跑动覆盖积极", "纪律性好", "左脚边路资源", "执行力强"],
    suggestions: [
      "前插时可以更果断，帮助左路形成进攻宽度。",
      "在传球选择上，可以适当增加向前传递比例。",
      "面对强力边锋时，注意提前站位，减少身体硬碰硬。",
      "继续保持防守稳定性，同时提升传中质量。",
    ],
    summary: "左路稳定型球员，适合承担防守、补位和边路衔接任务。",
    positions: [
      { name: "左后卫 LB", stars: 5, x: 28, y: 82 },
      { name: "左边中场 LM", stars: 4, x: 54, y: 82 },
      { name: "边路工兵", stars: 4, x: 42, y: 82 },
    ],
    mainDot: { x: 28, y: 82 },
    secondaryDots: [
      { x: 54, y: 82 },
      { x: 42, y: 82 },
    ],
    matches: [],
  },
  {
    name: "赵俊楠",
    number: 25,
    category: "后卫",
    age: 25,
    position: "中后卫 CB",
    role: "防线指挥官 / 清道夫型中卫",
    template: "Virgil van Dijk",
    foot: "右脚",
    height: "未知",
    weight: "未知",
    ability: 84,
    potential: 86,
    personality: "稳定",
    style: "防线核心",
    tags: ["防线统帅", "覆盖型防守", "站位大师", "全能中卫"],
    attributes: {
      身体: 17,
      防守: 18,
      阅读比赛: 18,
      机动性: 14,
      出球: 14,
      对抗: 17,
      纪律性: 16,
      创造力: 8,
    },
    strengths: ["防守稳定", "位置感强", "补位能力好", "防线指挥能力强"],
    suggestions: [
      "高位防线时，可以提醒队友保持保护距离。",
      "面对速度型反击时，建议提前控制身后空间。",
      "出球时可以继续保持稳定，减少不必要冒险。",
      "作为防线核心，可以更多组织队友站位。",
    ],
    summary: "球队后场稳定器，负责防线高度、补位和后场组织。",
    positions: [
      { name: "中后卫 CB", stars: 5, x: 24, y: 50 },
      { name: "清道夫型中卫", stars: 5, x: 20, y: 50 },
      { name: "拖后中卫", stars: 5, x: 18, y: 50 },
    ],
    mainDot: { x: 24, y: 50 },
    secondaryDots: [
      { x: 20, y: 50 },
      { x: 18, y: 50 },
    ],
    matches: [],
  },
  {
    name: "吴俊",
    number: 13,
    category: "后卫",
    age: 20,
    position: "中后卫 CB",
    role: "低位防守者",
    template: "Per Mertesacker 极限降配版",
    foot: "右脚",
    height: "未知",
    weight: "未知",
    ability: 70,
    potential: 71,
    personality: "稳守型",
    style: "低位防守",
    tags: ["区域防守", "低位防守", "站位型"],
    attributes: {
      身体: 8,
      防守: 10,
      阅读比赛: 9,
      机动性: 6,
      出球: 6,
      对抗: 9,
      纪律性: 10,
      创造力: 4,
    },
    strengths: ["适合低位站位", "防守任务明确", "能完成基础防守"],
    suggestions: [
      "适合在低位防守中使用，减少大范围横移任务。",
      "面对身后球时，可以提前后撤保护空间。",
      "出球时优先选择简单传递，保证安全。",
      "可以逐步提升转身和移动速度。",
    ],
    summary: "适合特定低位防守场景，主要承担区域防守和站位任务。",
    positions: [
      { name: "中后卫 CB", stars: 4, x: 22, y: 50 },
      { name: "低位防守者", stars: 4, x: 18, y: 50 },
    ],
    mainDot: { x: 22, y: 50 },
    secondaryDots: [{ x: 18, y: 50 }],
    matches: [],
  },
  {
    name: "何逸凡",
    number: 24,
    category: "中场",
    age: 20,
    position: "待定",
    role: "基础培养球员",
    template: "暂无明确模板",
    foot: "未知",
    height: "未知",
    weight: "未知",
    ability: 68,
    potential: 70,
    personality: "待开发",
    style: "基础培养",
    tags: ["潜力未开发", "基础提升", "位置待定"],
    attributes: {
      身体: 8,
      防守: 6,
      阅读比赛: 6,
      机动性: 7,
      出球: 6,
      对抗: 6,
      纪律性: 6,
      创造力: 5,
    },
    strengths: ["具备基础身体条件", "还有成长空间", "适合从基础训练开始"],
    suggestions: [
      "建议先明确固定位置，减少比赛中的不确定性。",
      "从体能、停传球和站位意识开始逐步提升。",
      "比赛中可以先执行简单任务，建立信心。",
      "多参与基础对抗和小范围传接球训练。",
    ],
    summary: "处于基础培养阶段，适合从明确位置和基本功训练开始提升。",
    positions: [
      { name: "中场培养", stars: 3, x: 50, y: 50 },
      { name: "后场培养", stars: 2, x: 35, y: 50 },
    ],
    mainDot: { x: 50, y: 50 },
    secondaryDots: [{ x: 35, y: 50 }],
    matches: [],
  },
];

const categories = ["前场", "中场", "后卫"];

function getStars(count) {
  return Array.from({ length: 5 }, (_, index) =>
    index < count ? "★" : "☆"
  ).join("");
}

function totalStat(matches, key) {
  return matches.reduce((sum, match) => sum + Number(match[key] || 0), 0);
}

function averageRating(matches) {
  if (!matches.length) return "-";
  const total = matches.reduce(
    (sum, match) => sum + Number(match.rating || 0),
    0
  );
  return (total / matches.length).toFixed(1);
}
export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [view, setView] = useState("players");
  const [selectedName, setSelectedName] = useState("戴天麒");

  const [matchForm, setMatchForm] = useState({
    date: "",
    opponent: "",
    goals: "",
    assists: "",
    rating: "",
    note: "",
  });

  const selectedPlayer =
    players.find((player) => player.name === selectedName) || players[0];

  const teamStats = useMemo(() => {
    const allMatches = players.flatMap((player) => player.matches);
    return {
      players: players.length,
      matches: allMatches.length,
      goals: totalStat(allMatches, "goals"),
      assists: totalStat(allMatches, "assists"),
    };
  }, [players]);

  function addMatchRecord() {
    if (!matchForm.date || !matchForm.opponent || !matchForm.rating) {
      alert("请至少填写日期、对手和评分");
      return;
    }

    const newMatch = {
      date: matchForm.date,
      opponent: matchForm.opponent,
      goals: Number(matchForm.goals || 0),
      assists: Number(matchForm.assists || 0),
      rating: Number(matchForm.rating),
      note: matchForm.note || "暂无备注",
    };

    setPlayers((oldPlayers) =>
      oldPlayers.map((player) =>
        player.name === selectedPlayer.name
          ? { ...player, matches: [...player.matches, newMatch] }
          : player
      )
    );

    setMatchForm({
      date: "",
      opponent: "",
      goals: "",
      assists: "",
      rating: "",
      note: "",
    });
  }

  return (
    <div className="fm-shell">
      <aside className="fm-left-nav">
        <div className="club-badge">FC</div>
        <button
          className={view === "dashboard" ? "nav-item active" : "nav-item"}
          onClick={() => setView("dashboard")}
        >
          主页
        </button>
        <button
          className={view === "players" ? "nav-item active" : "nav-item"}
          onClick={() => setView("players")}
        >
          球员
        </button>
        <button
          className={view === "matches" ? "nav-item active" : "nav-item"}
          onClick={() => setView("matches")}
        >
          比赛记录
        </button>
        <button
          className={view === "data" ? "nav-item active" : "nav-item"}
          onClick={() => setView("data")}
        >
          数据统计
        </button>
      </aside>

      <main className="fm-main">
        <header className="fm-topbar">
          <div>
            <h1>球队内部战术中心 V3</h1>
            <p>球员档案 / 评分系统 / 比赛记录 / 阵容方案</p>
          </div>
          <div className="top-actions">
            <span>数据概览</span>
            <span>本地录入</span>
          </div>
        </header>

        {view === "dashboard" && (
          <section className="dashboard-grid">
            <InfoCard title="球员数量" value={teamStats.players} />
            <InfoCard title="比赛记录" value={teamStats.matches} />
            <InfoCard title="总进球" value={teamStats.goals} />
            <InfoCard title="总助攻" value={teamStats.assists} />

            <div className="panel wide">
              <h2>球队当前逻辑</h2>
              <p>
                球员按前场、中场、后卫进行分类，方便所有队员查看自己的定位、特点和发展建议。
              </p>
            </div>

            <div className="panel">
              <h2>推荐基础阵型</h2>
              <div className="formation-big">4-3-3 / 4-2-3-1</div>
              <p>适合通过中场保护、边路推进和后场稳定出球建立比赛节奏。</p>
            </div>
          </section>
        )}

        {view === "players" && (
          <div className="player-layout">
            <aside className="player-list">
              <div className="side-title">球员位置分类</div>
              {categories.map((category) => (
                <div key={category} className="player-group">
                  <h3>{category}</h3>
                  {players
                    .filter((player) => player.category === category)
                    .map((player) => (
                      <button
                        key={player.name}
                        className={
                          selectedName === player.name
                            ? "player-row active"
                            : "player-row"
                        }
                        onClick={() => setSelectedName(player.name)}
                      >
                        <span>#{player.number}</span>
                        <strong>{player.name}</strong>
                        <small>{player.position}</small>
                        <small>
                          能力 {player.ability}　潜力 {player.potential}
                        </small>
                      </button>
                    ))}
                </div>
              ))}
            </aside>

            <section className="fm-player-page">
              <div className="player-hero">
                <div className="number-card">
                  <span>{selectedPlayer.number}</span>
                </div>
                <div className="hero-info">
                  <h2>{selectedPlayer.name}</h2>
                  <p>
                    {selectedPlayer.position} / {selectedPlayer.role}
                  </p>
                  <div className="meta-row">
                    <span>{selectedPlayer.age}岁</span>
                    <span>{selectedPlayer.foot}</span>
                    <span>{selectedPlayer.category}</span>
                    <span>{selectedPlayer.template}</span>
                  </div>
                  <div className="tag-row">
                    {selectedPlayer.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="ability-box">
                  <div>
                    <small>能力</small>
                    <strong>{selectedPlayer.ability}</strong>
                  </div>
                  <div>
                    <small>潜力</small>
                    <strong>{selectedPlayer.potential}</strong>
                  </div>
                </div>
              </div>

              <div className="fm-tabs">
                <span className="active">概况</span>
                <span>属性</span>
                <span>比赛记录</span>
                <span>发展建议</span>
              </div>

              <div className="fm-content-grid">
                <section className="panel">
                  <h3>位置分布</h3>
                  <p className="muted">主要位置：{selectedPlayer.position}</p>
                  <PitchMap player={selectedPlayer} />
                </section>

                <section className="panel">
                  <h3>球员特点</h3>
                  <div className="tag-row vertical">
                    {selectedPlayer.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h3>球员定位</h3>
                  <p>{selectedPlayer.summary}</p>
                </section>

                <section className="panel">
                  <h3>优势</h3>
                  <ul className="positive-list">
                    {selectedPlayer.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="panel wide">
                  <h3>建议方向</h3>
                  <ul>
                    {selectedPlayer.suggestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="panel wide">
                  <h3>比赛记录</h3>
                  <MatchTable matches={selectedPlayer.matches} />
                </section>

                <section className="panel wide">
                  <h3>基础信息</h3>
                  <div className="basic-table">
                    <div>
                      <span>年龄</span>
                      <b>{selectedPlayer.age}岁</b>
                    </div>
                    <div>
                      <span>身高</span>
                      <b>{selectedPlayer.height}</b>
                    </div>
                    <div>
                      <span>体重</span>
                      <b>{selectedPlayer.weight}</b>
                    </div>
                    <div>
                      <span>惯用脚</span>
                      <b>{selectedPlayer.foot}</b>
                    </div>
                    <div>
                      <span>模板</span>
                      <b>{selectedPlayer.template}</b>
                    </div>
                    <div>
                      <span>风格</span>
                      <b>{selectedPlayer.style}</b>
                    </div>
                    <div>
                      <span>当前能力</span>
                      <b>{selectedPlayer.ability}</b>
                    </div>
                    <div>
                      <span>潜力</span>
                      <b>{selectedPlayer.potential}</b>
                    </div>
                  </div>
                </section>
              </div>
            </section>

            <aside className="right-analysis">
              <section className="panel">
                <h3>能力属性</h3>
                {Object.entries(selectedPlayer.attributes).map(
                  ([key, value]) => (
                    <div className="attr-row" key={key}>
                      <span>{key}</span>
                      <b
                        className={
                          value >= 15 ? "elite" : value >= 10 ? "good" : "weak"
                        }
                      >
                        {value}
                      </b>
                    </div>
                  )
                )}
              </section>

              <section className="panel">
                <h3>适合位置</h3>
                <MiniPitch player={selectedPlayer} />
                {selectedPlayer.positions.map((pos) => (
                  <div className="position-row" key={pos.name}>
                    <span>{pos.name}</span>
                    <strong>{getStars(pos.stars)}</strong>
                  </div>
                ))}
              </section>

              <section className="panel">
                <h3>赛季统计</h3>
                <div className="season-row">
                  <span>出场</span>
                  <b>{selectedPlayer.matches.length}</b>
                </div>
                <div className="season-row">
                  <span>进球</span>
                  <b>{totalStat(selectedPlayer.matches, "goals")}</b>
                </div>
                <div className="season-row">
                  <span>助攻</span>
                  <b>{totalStat(selectedPlayer.matches, "assists")}</b>
                </div>
                <div className="season-row">
                  <span>场均评分</span>
                  <b>{averageRating(selectedPlayer.matches)}</b>
                </div>
              </section>
            </aside>
          </div>
        )}

        {view === "matches" && (
          <div className="match-page">
            <section className="panel">
              <h2>添加比赛记录</h2>
              <p>
                当前球员：<strong>{selectedPlayer.name}</strong>
              </p>

              <div className="form-grid">
                <input
                  placeholder="日期，例如 2026-04-26"
                  value={matchForm.date}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, date: e.target.value })
                  }
                />
                <input
                  placeholder="对手"
                  value={matchForm.opponent}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, opponent: e.target.value })
                  }
                />
                <input
                  placeholder="进球"
                  value={matchForm.goals}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, goals: e.target.value })
                  }
                />
                <input
                  placeholder="助攻"
                  value={matchForm.assists}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, assists: e.target.value })
                  }
                />
                <input
                  placeholder="评分，例如 7.5"
                  value={matchForm.rating}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, rating: e.target.value })
                  }
                />
              </div>

              <textarea
                placeholder="比赛备注"
                value={matchForm.note}
                onChange={(e) =>
                  setMatchForm({ ...matchForm, note: e.target.value })
                }
              />

              <button className="primary-btn" onClick={addMatchRecord}>
                添加记录
              </button>
            </section>

            <section className="panel">
              <h2>{selectedPlayer.name} 的比赛记录</h2>
              <MatchTable matches={selectedPlayer.matches} />
            </section>
          </div>
        )}

        {view === "data" && (
          <section className="dashboard-grid">
            <InfoCard
              title="前场人数"
              value={players.filter((p) => p.category === "前场").length}
            />
            <InfoCard
              title="中场人数"
              value={players.filter((p) => p.category === "中场").length}
            />
            <InfoCard
              title="后卫人数"
              value={players.filter((p) => p.category === "后卫").length}
            />
            <InfoCard title="总人数" value={players.length} />
          </section>
        )}
      </main>
    </div>
  );
}

function PitchMap({ player }) {
  return (
    <div className="pitch-map large">
      <div className="pitch-line half"></div>
      <div className="pitch-circle"></div>
      <div className="box left"></div>
      <div className="box right"></div>
      {[20, 35, 50, 65, 80].map((x, index) => (
        <span
          key={`bg-${index}`}
          className="pitch-dot dark"
          style={{ left: `${x}%`, top: `${25 + (index % 3) * 25}%` }}
        />
      ))}
      {player.secondaryDots.map((dot, index) => (
        <span
          key={index}
          className="pitch-dot secondary"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
        />
      ))}
      <span
        className="pitch-dot main"
        style={{ left: `${player.mainDot.x}%`, top: `${player.mainDot.y}%` }}
      />
    </div>
  );
}

function MiniPitch({ player }) {
  return (
    <div className="pitch-map mini">
      <div className="pitch-line half"></div>
      <div className="pitch-circle"></div>
      <div className="box left"></div>
      <div className="box right"></div>
      {player.secondaryDots.map((dot, index) => (
        <span
          key={index}
          className="pitch-dot secondary"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
        />
      ))}
      <span
        className="pitch-dot main"
        style={{ left: `${player.mainDot.x}%`, top: `${player.mainDot.y}%` }}
      />
    </div>
  );
}

function MatchTable({ matches }) {
  if (!matches.length) {
    return (
      <div className="empty-match">
        <div className="empty-icon">📄</div>
        <h4>暂无比赛记录</h4>
        <p>可在比赛记录页面添加赛后数据。</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>对手</th>
            <th>进球</th>
            <th>助攻</th>
            <th>评分</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={`${match.date}-${index}`}>
              <td>{match.date}</td>
              <td>{match.opponent}</td>
              <td>{match.goals}</td>
              <td>{match.assists}</td>
              <td>{match.rating}</td>
              <td>{match.note}</td>
            </tr>
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
