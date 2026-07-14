import React, { useMemo, useState } from "react";
import PlayerForm from "./PlayerForm";
import PlayerImportPanel from "./PlayerImportPanel";

const GROUPS = ["守门员", "后卫", "中场", "前场", ""];

function PlayerLibraryPage({
  players,
  playerForm,
  setPlayerForm,
  addPlayer,
  importPlayers,
  setSelectedName,
  setView,
  isAdmin,
  loading = false,
  error = null,
  onUploadPhoto,
  onDeletePhoto,
}) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("全部");

  const filteredPlayers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return [...players]
      .filter((player) => activeGroup === "全部" || (activeGroup === "未分组" ? !player.category : player.category === activeGroup))
      .filter((player) => !keyword || [player.name, player.number, player.position, player.hometown].some((value) => String(value || "").toLowerCase().includes(keyword)))
      .sort((a, b) => Number(a.rosterOrder || 999) - Number(b.rosterOrder || 999));
  }, [players, query, activeGroup]);

  const groupedPlayers = GROUPS.map((category) => ({
    category,
    players: filteredPlayers.filter((player) => (player.category || "") === category),
  })).filter((group) => group.players.length);

  const openPlayer = (player) => {
    setSelectedName(player.name);
    setView("players");
  };

  const goalkeeperCount = players.filter((player) => player.category === "守门员").length;
  const filledProfiles = players.filter((player) => player.position && player.hometown && player.age && player.dominantFoot).length;

  return (
    <section className="match-page immersive-roster-page">
      <div className="panel roster-stage-hero">
        <div>
          <span className="home-kicker">JIANGTE FC · SQUAD 2026</span>
          <h2>一线队球员档案</h2>
          <p>真实球队名单、个人资料和比赛记录集中管理，快速查找每一名队员。</p>
        </div>
        <div className="roster-stage-stats">
          <div><strong>{players.length}</strong><span>注册球员</span></div>
          <div><strong>{goalkeeperCount}</strong><span>守门员</span></div>
          <div><strong>{filledProfiles}</strong><span>资料完整</span></div>
        </div>
      </div>

      <div className="roster-control-bar">
        <div className="roster-search-box">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名、号码、位置或籍贯" />
        </div>
        <div className="roster-filter-row">
          {["全部", "守门员", "后卫", "中场", "前场", "未分组"].map((group) => (
            <button key={group} className={activeGroup === group ? "active" : ""} onClick={() => setActiveGroup(group)}>{group}</button>
          ))}
        </div>
      </div>

      {isAdmin && <PlayerImportPanel onImport={importPlayers} disabled={loading} />}

      <PlayerForm
        playerForm={playerForm}
        setPlayerForm={setPlayerForm}
        onAddPlayer={addPlayer}
        isAdmin={isAdmin}
        loading={loading}
        error={error}
        onUploadPhoto={onUploadPhoto}
        onDeletePhoto={onDeletePhoto}
      />

      <div className="immersive-roster-groups">
        {groupedPlayers.map((group) => (
          <section className="panel immersive-roster-group" key={group.category || "ungrouped"}>
            <div className="section-head-row">
              <div>
                <small>POSITION GROUP</small>
                <h2>{group.category || "未分组"}</h2>
              </div>
              <span className="roster-count">{group.players.length} 人</span>
            </div>

            <div className="immersive-roster-grid">
              {group.players.map((player) => (
                <button key={player.name} className="immersive-player-card" data-category={player.category || "未分组"} onClick={() => openPlayer(player)}>
                  <div className="immersive-player-photo">
                    {player.photo ? <img src={player.photo} alt={player.name} loading="lazy" /> : <span>#{player.number}</span>}
                    <i>{player.status || "在册"}</i>
                  </div>
                  <div className="immersive-player-info">
                    <div className="immersive-player-number">#{player.number}</div>
                    <strong>{player.name}</strong>
                    <p>{player.position || "位置待补充"}</p>
                    <div className="player-fact-row">
                      <span>{player.age ? `${player.age} 岁` : "年龄未填"}</span>
                      <span>{player.dominantFoot || "惯用脚未填"}</span>
                      <span>{player.shirtSize ? `${player.shirtSize} 码` : "尺码未填"}</span>
                    </div>
                    <small>{player.hometown || "籍贯待补充"}</small>
                  </div>
                  <b className="player-card-arrow">↗</b>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {!filteredPlayers.length && <div className="panel empty-match"><p>没有找到符合条件的球员。</p></div>}
    </section>
  );
}

export default PlayerLibraryPage;
