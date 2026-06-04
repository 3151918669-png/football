import React, { useEffect, useMemo, useRef, useState } from "react";

function buildInitialPositions(bestLineup, players) {
  const lineup = [];
  bestLineup["前场"].forEach((p, i) => lineup.push({ ...p, x: 25 + i * 25, y: 18 }));
  bestLineup["中场"].forEach((p, i) => lineup.push({ ...p, x: 30 + i * 20, y: 43 }));
  bestLineup["后卫"].filter((p) => p.position !== "GK").slice(0, 4).forEach((p, i) => lineup.push({ ...p, x: 20 + i * 20, y: 72 }));
  const gk = players.find((p) => p.position === "GK");
  if (gk) lineup.push({ ...gk, x: 50, y: 90 });
  return lineup;
}

function LineupPage({ bestLineup, players, positions, setPositions, isAdmin }) {
  const pitchRef = useRef(null);
  const [draggingName, setDraggingName] = useState("");
  const initialPositions = useMemo(() => buildInitialPositions(bestLineup, players), [bestLineup, players]);
  useEffect(() => {
    if (!positions.length) {
      setPositions(initialPositions);
      return;
    }
    const currentNames = new Set(positions.map((player) => player.name));
    const missing = initialPositions.filter((player) => !currentNames.has(player.name));
    if (missing.length) setPositions((current) => [...current, ...missing]);
  }, [initialPositions]);

  const movePlayer = (event, name) => {
    if (!isAdmin) return;
    const pitch = pitchRef.current;
    if (!pitch) return;
    const rect = pitch.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((event.clientY - rect.top) / rect.height) * 100));
    setPositions((current) => current.map((player) => player.name === name ? { ...player, x, y } : player));
  };

  const startDragging = (event, name) => {
    if (!isAdmin) return;
    event.preventDefault();
    event.stopPropagation();
    pitchRef.current?.setPointerCapture(event.pointerId);
    setDraggingName(name);
    movePlayer(event, name);
  };

  const downloadPoster = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#07111f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d7b56d";
    ctx.font = "bold 54px sans-serif";
    ctx.fillText("江特FC · 首发阵容", 70, 90);
    ctx.fillStyle = "#116a43";
    ctx.fillRect(90, 150, 900, 1120);
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 5;
    ctx.strokeRect(90, 150, 900, 1120);
    ctx.beginPath(); ctx.moveTo(90, 710); ctx.lineTo(990, 710); ctx.stroke();
    ctx.beginPath(); ctx.arc(540, 710, 115, 0, Math.PI * 2); ctx.stroke();
    positions.forEach((player) => {
      const x = 90 + player.x / 100 * 900;
      const y = 150 + player.y / 100 * 1120;
      ctx.beginPath(); ctx.fillStyle = "#f2d58a"; ctx.arc(x, y, 45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111"; ctx.textAlign = "center"; ctx.font = "bold 28px sans-serif"; ctx.fillText(player.number, x, y + 10);
      ctx.fillStyle = "#fff"; ctx.font = "bold 25px sans-serif"; ctx.fillText(player.name, x, y + 78);
    });
    const link = document.createElement("a");
    link.download = `江特FC-阵容海报-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="dashboard-grid tactics-page">
      <div className="panel wide tactics-toolbar">
        <div>
          <span className="home-kicker">TACTICS BOARD</span>
          <h2>简易战术板</h2>
          <p>{isAdmin ? "按住球员并拖动到目标位置，阵型会自动同步到云端。" : "访客可以查看当前战术阵型。"}</p>
        </div>
        <div className="tactics-toolbar-actions">
          <button className="primary-btn" onClick={downloadPoster}>下载阵容海报</button>
          {isAdmin && <button className="small-ghost-btn" onClick={() => setPositions(initialPositions)}>重置推荐阵型</button>}
        </div>
      </div>

      <div className="panel wide">
        <div
          ref={pitchRef}
          className={`tactics-pitch ${draggingName ? "is-dragging" : ""}`}
          onPointerMove={(event) => {
            if (draggingName) movePlayer(event, draggingName);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            setDraggingName("");
          }}
          onPointerCancel={() => setDraggingName("")}
          onPointerLeave={(event) => {
            if (draggingName && event.buttons === 0) setDraggingName("");
          }}
        >
          <div className="tactics-half-line" />
          <div className="tactics-center-circle" />
          <div className="tactics-box top" />
          <div className="tactics-box bottom" />
          {positions.map((player) => (
            <button
              key={player.name}
              className="tactics-player"
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
              onPointerDown={(event) => {
                if (isAdmin) startDragging(event, player.name);
              }}
              aria-label={`拖动 ${player.name}`}
            >
              <span>{player.number}</span>
              <strong>{player.name}</strong>
              <small>{player.position}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="panel wide">
        <h2>替补与其他球员</h2>
        <div className="tactics-bench">
          {players.filter((player) => !positions.some((position) => position.name === player.name)).map((player) => (
            <button key={player.name} onClick={() => setPositions((current) => [...current, { ...player, x: 50, y: 50 }])}>
              #{player.number} {player.name} · {player.position}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LineupPage;
