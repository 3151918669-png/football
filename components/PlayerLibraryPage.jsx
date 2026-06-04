import React from "react";
import PlayerForm from "./PlayerForm";

function PlayerLibraryPage({
  players,
  playerForm,
  setPlayerForm,
  addPlayer,
  setSelectedName,
  setView,
  isAdmin,
  clubInfo,
  loading = false,
  error = null,
  onUploadPhoto,
  onUploadCard,
  onDeletePhoto,
  onDeleteCard,
}) {
  const categories = ["前场", "中场", "后卫", "守门员"];

  const sortedPlayers = [...players].sort(
    (a, b) => Number(a.number || 0) - Number(b.number || 0)
  );

  const groupedPlayers = categories.map((category) => ({
    category,
    players: sortedPlayers.filter((player) => player.category === category),
  }));

  const handleAddPlayer = () => {
    addPlayer();
  };

  const getPhotoUrl = (player) => {
    if (!player) return "";
    if (typeof player.photo === "string" && player.photo.trim()) {
      return player.photo.trim();
    }
    return "";
  };

  const openPlayerDetail = (player) => {
    console.log("准备进入球员详情：", player.name, player);
    setSelectedName(player.name);
    setView("players");
  };

  return (
    <section className="match-page team-roster-page">
      <div className="team-roster-hero panel">
        <div>
          <span className="home-kicker">TEAM ROSTER</span>
          <h2>球队名单</h2>
          <p>
            原 FC26 卡墙已调整为球队名单墙：展示球员证件照、号码、位置、角色和能力值。
            点击球员可进入个人主页查看球星卡、能力雷达图和比赛记录。
          </p>
        </div>

        <button className="primary-btn" type="button" onClick={() => setView("rankings")}>
          查看数据排行榜
        </button>
      </div>

      <PlayerForm
        playerForm={playerForm}
        setPlayerForm={setPlayerForm}
        onAddPlayer={handleAddPlayer}
        isAdmin={isAdmin}
        loading={loading}
        error={error}
        onUploadPhoto={onUploadPhoto}
        onUploadCard={onUploadCard}
        onDeletePhoto={onDeletePhoto}
        onDeleteCard={onDeleteCard}
      />

      <div className="roster-group-list">
        {groupedPlayers.map((group) => (
          <section className="panel roster-group-panel" key={group.category}>
            <div className="section-head-row">
              <h2>{group.category}</h2>
              <span className="roster-count">{group.players.length} 人</span>
            </div>

            <div className="team-roster-grid">
              {group.players.map((player) => {
                const photoUrl = getPhotoUrl(player);

                return (
                  <div
                    key={`${player.name}-${player.number}`}
                    className="team-roster-card"
                    data-position={player.position}
                    role="button"
                    tabIndex={0}
                    onClick={() => openPlayerDetail(player)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPlayerDetail(player);
                      }
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "88px minmax(0, 1fr)",
                      alignItems: "center",
                      gap: "12px",
                      minHeight: "132px",
                      overflow: "visible",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      className="roster-photo-box"
                      style={{
                        width: "88px",
                        height: "110px",
                        minWidth: "88px",
                        minHeight: "110px",
                        borderRadius: "16px",
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))",
                        border: "1px solid rgba(255,255,255,0.1)",
                        flexShrink: 0,
                        pointerEvents: "none",
                      }}
                    >
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={player.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            console.error("名单照片加载失败：", player.name, photoUrl);
                            e.currentTarget.style.display = "none";
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center top",
                            display: "block",
                            opacity: 1,
                            visibility: "visible",
                            padding: 0,
                            margin: 0,
                            border: 0,
                            position: "static",
                            zIndex: 2,
                            pointerEvents: "none",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color: "var(--accent-2)",
                            fontSize: "1.4rem",
                            fontWeight: 950,
                          }}
                        >
                          #{player.number}
                        </span>
                      )}
                    </div>

                    <div
                      className="roster-info-box"
                      style={{
                        minWidth: 0,
                        display: "grid",
                        gap: "5px",
                        textAlign: "left",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        className="roster-number"
                        style={{
                          color: "var(--accent-2)",
                          fontWeight: 950,
                          fontSize: "0.82rem",
                        }}
                      >
                        #{player.number}
                      </div>

                      <strong
                        style={{
                          display: "block",
                          color: "var(--text)",
                          fontSize: "1.12rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {player.name}
                      </strong>

                      <small
                        style={{
                          display: "block",
                          color: "var(--sub)",
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                        }}
                      >
                        {player.position}｜{player.role}
                      </small>

                      <div
                        className="roster-mini-stats"
                        style={{
                          display: "flex",
                          gap: "7px",
                          flexWrap: "wrap",
                          marginTop: "4px",
                        }}
                      >
                        <span
                          style={{
                            borderRadius: "999px",
                            padding: "5px 8px",
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--sub)",
                            fontSize: "0.74rem",
                            fontWeight: 850,
                          }}
                        >
                          能力 {player.ability}
                        </span>

                        <span
                          style={{
                            borderRadius: "999px",
                            padding: "5px 8px",
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--sub)",
                            fontSize: "0.74rem",
                            fontWeight: 850,
                          }}
                        >
                          潜力 {player.potential}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default PlayerLibraryPage;
