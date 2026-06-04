import React, { useMemo, useState } from "react";

function TrainingPage({ players, sessions, setSessions, isAdmin }) {
  const [form, setForm] = useState({ date: "", title: "", location: "", note: "" });
  const latest = sessions[0];
  const ranking = useMemo(() => players.map((player) => {
    const attended = sessions.filter((session) => session.attendance?.[player.name] === "present").length;
    const recorded = sessions.filter((session) => session.attendance?.[player.name]).length;
    return { ...player, attended, recorded, rate: recorded ? Math.round((attended / recorded) * 100) : 0 };
  }).sort((a, b) => b.rate - a.rate || b.attended - a.attended), [players, sessions]);

  const addSession = () => {
    if (!form.date || !form.title) return;
    setSessions((current) => [{ id: Date.now(), ...form, attendance: {} }, ...current]);
    setForm({ date: "", title: "", location: "", note: "" });
  };

  const mark = (sessionId, playerName, status) => {
    setSessions((current) => current.map((session) => session.id === sessionId
      ? { ...session, attendance: { ...session.attendance, [playerName]: status } }
      : session));
  };

  return (
    <div className="match-page training-page">
      <section className="panel training-hero">
        <div>
          <span className="home-kicker">TRAINING CENTER</span>
          <h2>训练与考勤</h2>
          <p>记录训练安排、球员出勤和请假情况，数据自动同步到云端。</p>
        </div>
        <div className="training-hero-number"><strong>{sessions.length}</strong><span>次训练</span></div>
      </section>

      {isAdmin && (
        <section className="panel">
          <h2>创建训练活动</h2>
          <div className="form-grid">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input placeholder="训练主题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input placeholder="训练地点" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <textarea placeholder="训练内容 / 注意事项" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button className="primary-btn" onClick={addSession}>创建训练</button>
        </section>
      )}

      {latest && (
        <section className="panel">
          <div className="section-head-row">
            <div><h2>{latest.title}</h2><p>{latest.date} · {latest.location || "地点待定"}</p></div>
            {isAdmin && <button className="table-delete-btn" onClick={() => setSessions((current) => current.filter((session) => session.id !== latest.id))}>删除本次训练</button>}
          </div>
          <p>{latest.note}</p>
          <div className="attendance-grid">
            {players.map((player) => {
              const status = latest.attendance?.[player.name] || "";
              return (
                <div className="attendance-player" key={player.name}>
                  <strong>#{player.number} {player.name}</strong><small>{player.position}</small>
                  {isAdmin ? (
                    <div className="attendance-actions">
                      <button className={status === "present" ? "active present" : ""} onClick={() => mark(latest.id, player.name, "present")}>出勤</button>
                      <button className={status === "leave" ? "active leave" : ""} onClick={() => mark(latest.id, player.name, "leave")}>请假</button>
                      <button className={status === "absent" ? "active absent" : ""} onClick={() => mark(latest.id, player.name, "absent")}>缺席</button>
                    </div>
                  ) : <span className={`attendance-status ${status}`}>{status === "present" ? "出勤" : status === "leave" ? "请假" : status === "absent" ? "缺席" : "未登记"}</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel">
        <h2>训练出勤排行</h2>
        <div className="table-wrap">
          <table><thead><tr><th>排名</th><th>球员</th><th>位置</th><th>出勤</th><th>登记次数</th><th>出勤率</th></tr></thead>
            <tbody>{ranking.map((player, index) => <tr key={player.name}><td>{index + 1}</td><td><strong>{player.name}</strong></td><td>{player.position}</td><td>{player.attended}</td><td>{player.recorded}</td><td><span className="ability-up">{player.rate}%</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TrainingPage;
