import React, { useMemo, useState } from "react";
import { PageIntro, ClubBadge, FullPlayerCard } from "./ClubUI";
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
  onUploadCard,
  onDeleteCard,
}) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("全部");

  const filteredPlayers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return [...players]
      .filter(
        (player) =>
          activeGroup === "全部" ||
          (activeGroup === "未分组"
            ? !player.category
            : player.category === activeGroup),
      )
      .filter(
        (player) =>
          !keyword ||
          [player.name, player.number, player.position, player.hometown].some(
            (value) =>
              String(value || "")
                .toLowerCase()
                .includes(keyword),
          ),
      )
      .sort(
        (a, b) => Number(a.rosterOrder || 999) - Number(b.rosterOrder || 999),
      );
  }, [players, query, activeGroup]);

  const groupedPlayers = GROUPS.map((category) => ({
    category,
    players: filteredPlayers.filter(
      (player) => (player.category || "") === category,
    ),
  })).filter((group) => group.players.length);

  const openPlayer = (player) => {
    setSelectedName(player.name);
    setView("players");
  };

  const goalkeeperCount = players.filter(
    (player) => player.category === "守门员",
  ).length;
  const filledProfiles = players.filter(
    (player) =>
      player.position && player.hometown && player.age && player.dominantFoot,
  ).length;

  return (
    <section className="match-page immersive-roster-page">
      <PageIntro
        en="OUR SQUAD"
        title="同一抹蓝，同一个我们"
        text={`认识江特FC的每一位队员 · 当前在册 ${players.length} 人`}
      >
        <ClubBadge />
      </PageIntro>
      <div className="roster-control-bar">
        <div className="roster-search-box">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索姓名、号码、位置或籍贯"
          />
        </div>
        <div className="roster-filter-row">
          {["全部", "守门员", "后卫", "中场", "前场", "未分组"].map((group) => (
            <button
              key={group}
              className={activeGroup === group ? "active" : ""}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {isAdmin && (
        <PlayerImportPanel
          players={players}
          onImport={importPlayers}
          disabled={loading}
        />
      )}

      <PlayerForm
        playerForm={playerForm}
        setPlayerForm={setPlayerForm}
        onAddPlayer={addPlayer}
        isAdmin={isAdmin}
        loading={loading}
        error={error}
        onUploadPhoto={onUploadPhoto}
        onDeletePhoto={onDeletePhoto}
        onUploadCard={onUploadCard}
        onDeleteCard={onDeleteCard}
      />

      <div className="immersive-roster-groups">
        {groupedPlayers.map((group) => (
          <section
            className="panel immersive-roster-group"
            key={group.category || "ungrouped"}
          >
            <div className="section-head-row">
              <div>
                <small>POSITION GROUP</small>
                <h2>{group.category || "未分组"}</h2>
              </div>
              <span className="roster-count">{group.players.length} 人</span>
            </div>

            <div className="immersive-roster-grid">
              {group.players.map((player) => (
                <FullPlayerCard
                  key={player.name}
                  player={player}
                  onClick={() => openPlayer(player)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {!filteredPlayers.length && (
        <div className="panel empty-match">
          <p>没有找到符合条件的球员。</p>
        </div>
      )}
    </section>
  );
}

export default PlayerLibraryPage;
