import React from "react";

function countResults(matches) {
  return matches.reduce(
    (record, m) => {
      if (m.result === "win") record.wins++;
      if (m.result === "draw") record.draws++;
      if (m.result === "loss") record.losses++;
      return record;
    },
    { wins: 0, draws: 0, losses: 0 }
  );
}

function averageRating(matches) {
  if (!matches?.length) return "-";
  const total = matches.reduce((sum, m) => sum + Number(m.rating || 0), 0);
  return (total / matches.length).toFixed(1);
}

function CoachMatchTable({ matches = [], onToggleMark }) {
  if (!matches.length) return <p>暂无执教记录，请添加比赛。</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>标记</th>
            <th>日期</th>
            <th>对手</th>
            <th>结果</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m, i) => {
            const resultLabel =
              m.result === "win" ? "胜" : m.result === "draw" ? "平" : "负";
            return (
              <tr key={`${m.date}-${i}`} className={m.isMarked ? "marked-row" : ""}>
                <td>
                  <button
                    className={m.isMarked ? "mark-btn active" : "mark-btn"}
                    onClick={() => onToggleMark?.(i)}
                  >
                    {m.isMarked ? "★" : "☆"}
                  </button>
                </td>
                <td>{m.date}</td>
                <td>{m.opponent}</td>
                <td>
                  <span className={`result-badge ${m.result}`}>
                    {resultLabel}
                  </span>
                </td>
                <td>{m.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CoachPage({
  coaches,
  selectedCoach,
  selectedCoachName,
  setSelectedCoachName,
  coachMatchForm,
  setCoachMatchForm,
  addCoachMatchRecord,
  toggleCoachMatchMark,
  ranking,
  resetData,
  isAdmin,
}) {
  const record = countResults(selectedCoach?.matches || []);
  const totalMatches = (selectedCoach?.matches || []).length;
  const winRate =
    totalMatches > 0
      ? ((record.wins / totalMatches) * 100).toFixed(0) + "%"
      : "-";

  return (
    <div className="match-page coach-page">
      {/* 教练列表 */}
      <section className="panel">
        <h2>教练组</h2>
        <div className="coach-grid">
          {coaches.map((coach) => (
            <button
              key={coach.name}
              className={`coach-card ${coach.name === selectedCoachName ? "active" : ""}`}
              onClick={() => setSelectedCoachName(coach.name)}
            >
              <div className="coach-avatar">{coach.initials}</div>
              <strong>{coach.name}</strong>
              <span>{coach.role}</span>
              <small>{coach.focus}</small>
            </button>
          ))}
        </div>
      </section>

      {/* 教练详情 */}
      {selectedCoach && (
        <>
          <section className="panel">
            <h2>{selectedCoach.name} · 执教信息</h2>
            <div className="home-stat-grid" style={{ gridTemplateColumns: "repeat(4, minmax(140px, 1fr))" }}>
              <div className="panel info-card">
                <span>总场次</span>
                <strong>{totalMatches}</strong>
              </div>
              <div className="panel info-card">
                <span>胜</span>
                <strong>{record.wins}</strong>
              </div>
              <div className="panel info-card">
                <span>平</span>
                <strong>{record.draws}</strong>
              </div>
              <div className="panel info-card">
                <span>胜率</span>
                <strong>{winRate}</strong>
              </div>
            </div>
            <p>{selectedCoach.desc}</p>
          </section>

          {isAdmin && (
            <section className="panel">
              <h2>添加执教记录</h2>
              <div className="form-grid">
                <input
                  placeholder="日期"
                  value={coachMatchForm.date}
                  onChange={(e) =>
                    setCoachMatchForm({ ...coachMatchForm, date: e.target.value })
                  }
                />
                <input
                  placeholder="对手"
                  value={coachMatchForm.opponent}
                  onChange={(e) =>
                    setCoachMatchForm({ ...coachMatchForm, opponent: e.target.value })
                  }
                />
              </div>
              <div className="result-block">
                <label>比赛结果：</label>
                <div className="result-btn-group">
                  <button
                    className={`result-btn ${coachMatchForm.result === "win" ? "selected-win" : ""}`}
                    onClick={() => setCoachMatchForm({ ...coachMatchForm, result: "win" })}
                  >
                    胜
                  </button>
                  <button
                    className={`result-btn ${coachMatchForm.result === "draw" ? "selected-draw" : ""}`}
                    onClick={() => setCoachMatchForm({ ...coachMatchForm, result: "draw" })}
                  >
                    平
                  </button>
                  <button
                    className={`result-btn ${coachMatchForm.result === "loss" ? "selected-loss" : ""}`}
                    onClick={() => setCoachMatchForm({ ...coachMatchForm, result: "loss" })}
                  >
                    负
                  </button>
                </div>
              </div>
              <textarea
                placeholder="备注"
                value={coachMatchForm.note}
                onChange={(e) =>
                  setCoachMatchForm({ ...coachMatchForm, note: e.target.value })
                }
              />
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={coachMatchForm.isMarked}
                  onChange={(e) =>
                    setCoachMatchForm({ ...coachMatchForm, isMarked: e.target.checked })
                  }
                />
                标记为关键比赛记录
              </label>
              <button className="primary-btn" onClick={addCoachMatchRecord}>
                添加记录
              </button>
            </section>
          )}

          <section className="panel">
            <h2>{selectedCoach.name} 执教记录</h2>
            <CoachMatchTable
              matches={selectedCoach.matches || []}
              onToggleMark={(index) =>
                toggleCoachMatchMark(selectedCoachName, index)
              }
            />
          </section>
        </>
      )}

      {/* 评分排行榜 */}
      <section className="panel">
        <h2>球员评分排行榜</h2>
        {ranking.length === 0 ? (
          <p>暂无评分记录。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>球员</th>
                  <th>位置</th>
                  <th>场均评分</th>
                  <th>出场</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((p, index) => (
                  <tr key={p.name}>
                    <td>{index + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.position}</td>
                    <td>{p.avgRating}</td>
                    <td>{p.matches?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 重置数据 */}
      {isAdmin && (
        <section className="panel">
          <h2>重置数据</h2>
          <p>将所有数据恢复到初始状态，此操作不可撤销。</p>
          <button className="primary-btn" onClick={resetData} style={{ background: "rgba(255,107,107,0.8)" }}>
            重置全部数据
          </button>
        </section>
      )}
    </div>
  );
}

export default CoachPage;