import { playerCard } from "../src/clubData";
import React, { useEffect, useMemo, useRef, useState } from "react";

function buildInitialPositions(bestLineup, players) {
  const lineup = [];
  const fw = bestLineup["前场"];
  if (fw[0]) lineup.push({ ...fw[0], x: 50, y: 12 });
  fw.slice(1, 3).forEach((p, i) =>
    lineup.push({ ...p, x: 32 + i * 36, y: 30 }),
  );
  bestLineup["中场"].forEach((p, i) =>
    lineup.push({ ...p, x: 22 + i * 28, y: 49 }),
  );
  bestLineup["后卫"]
    .slice(0, 4)
    .forEach((p, i) => lineup.push({ ...p, x: 14 + i * 24, y: 69 }));
  const gk = players.find((p) => p.category === "守门员");
  if (gk) lineup.push({ ...gk, x: 50, y: 89 });
  return lineup;
}

function LineupPage({ bestLineup, players, positions, setPositions, isAdmin }) {
  const pitchRef = useRef(null);
  const [draggingName, setDraggingName] = useState("");
  const initialPositions = useMemo(
    () => buildInitialPositions(bestLineup, players),
    [bestLineup, players],
  );
  const validPositions = positions.filter((p) =>
    players.some((player) => player.name === p.name),
  );
  const displayPositions = (
    validPositions.length ? validPositions : initialPositions
  ).map((p) => ({
    ...p,
    ...players.find((item) => item.name === p.name),
    x: p.x,
    y: p.y,
  }));
  useEffect(() => {
    if (isAdmin && !positions.length) setPositions(initialPositions);
  }, [isAdmin, initialPositions]);
  const movePlayer = (event, name) => {
    if (!isAdmin) return;
    const pitch = pitchRef.current;
    if (!pitch) return;
    const rect = pitch.getBoundingClientRect();
    const x = Math.max(
      5,
      Math.min(95, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      5,
      Math.min(95, ((event.clientY - rect.top) / rect.height) * 100),
    );
    setPositions((current) =>
      current.map((player) =>
        player.name === name ? { ...player, x, y } : player,
      ),
    );
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
    ctx.beginPath();
    ctx.moveTo(90, 710);
    ctx.lineTo(990, 710);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(540, 710, 115, 0, Math.PI * 2);
    ctx.stroke();
    displayPositions.forEach((player) => {
      const x = 90 + (player.x / 100) * 900;
      const y = 150 + (player.y / 100) * 1120;
      ctx.beginPath();
      ctx.fillStyle = "#f2d58a";
      ctx.arc(x, y, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(player.number, x, y + 10);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 25px sans-serif";
      ctx.fillText(player.name, x, y + 78);
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
          <h2>球队阵容 · 战术板</h2>
          <p>
            {isAdmin
              ? "按住球员并拖动到目标位置，阵型会自动同步到云端。"
              : validPositions.length
                ? "当前展示球队保存的战术阵容。"
                : "4-3-2-1 阵型参考，按现有名单展示；实际首发以比赛名单为准。"}
          </p>
        </div>
        <div className="tactics-toolbar-actions">
          <button className="primary-btn" onClick={downloadPoster}>
            下载阵容海报
          </button>
          {isAdmin && (
            <button
              className="small-ghost-btn"
              onClick={() => setPositions(initialPositions)}
            >
              重置推荐阵型
            </button>
          )}
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
          {displayPositions.map((player) => (
            <button
              key={player.name}
              className="tactics-player"
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
              onPointerDown={(event) => {
                if (isAdmin) startDragging(event, player.name);
              }}
              aria-label={`拖动 ${player.name}`}
            >
              {playerCard(player) ? (
                <img
                  className="pitch-card"
                  src={playerCard(player)}
                  alt={`${player.name}球员卡`}
                />
              ) : (
                <span>{player.number}</span>
              )}
              <strong>{player.name}</strong>
              <small>{player.position}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="panel wide">
        <h2>替补与其他球员</h2>
        <div className="tactics-bench">
          {players
            .filter(
              (player) =>
                !displayPositions.some(
                  (position) => position.name === player.name,
                ),
            )
            .map((player) => (
              <button
                key={player.name}
                disabled={!isAdmin}
                onClick={() => {
                  if (isAdmin)
                    setPositions((current) => [
                      ...(current.length ? current : initialPositions),
                      { ...player, x: 50, y: 50 },
                    ]);
                }}
              >
                #{player.number} {player.name} · {player.position}
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}

export default LineupPage;
