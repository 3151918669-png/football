import React from "react";
import StarCardEmbedded from "./PlayerCard";
import PlayerAwardBadges from "./PlayerAwardBadges";
import PlayerFullCardShow from "./PlayerFullCardShow";
import AbilityRadarCard from "./AbilityRadarCard";
import MatchTable from "./MatchRecord";
import PlayerPhotoCard from "./PlayerPhotoCard";

function PlayerDetail({ 
  player, 
  clubInfo, 
  awardStats, 
  onToggleMark, 
  onEdit, 
  onDelete, 
  editable,
  onAttributeUpdate,
  onCoreUpdate,
  onUploadPhoto,
  onRemovePhoto,
  onUploadCard,
  onRemoveCard,
  isAdmin
}) {
  return (
    <div className="v7-player-grid">
      <div className="player-profile-side">
        <StarCardEmbedded player={player} clubInfo={clubInfo} />
        <PlayerPhotoCard
          player={player}
          clubInfo={clubInfo}
          editable={editable}
          onUpload={onUploadPhoto}
          onRemove={onRemovePhoto}
          onUploadCard={onUploadCard}
          onRemoveCard={onRemoveCard}
        />
      </div>
      <div className="v7-detail">
        <div className="player-hero">
          <div>
            <h2>{player.name}</h2>
            <p>{player.position} / {player.role}</p>
            <div className="tag-row">
              {player.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="ability-box">
            <div>
              <small>能力</small>
              <strong>{player.ability}</strong>
            </div>
            <div>
              <small>潜力</small>
              <strong>{player.potential}</strong>
            </div>
          </div>
        </div>
        <div className="fm-content-grid">
          <section className="panel">
            <h3>球员定位</h3>
            <p>{player.summary}</p>
          </section>
          <section className="panel">
            <h3>建议方向</h3>
            <ul>
              {player.suggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="panel wide">
            <h3>个人奖项</h3>
            <PlayerAwardBadges player={player} awardStats={awardStats} />
          </section>
          <section className="panel wide player-star-radar-section">
            <div className="section-head-row">
              <h3>球星卡 & 能力雷达图</h3>
              <span className="roster-count">能力 {player.ability}</span>
            </div>
            <div className="player-star-radar-grid">
              <PlayerFullCardShow player={player} />
              <AbilityRadarCard player={player} />
            </div>
          </section>
          <section className="panel wide">
            <h3>比赛记录</h3>
            <MatchTable
              matches={player.matches}
              onToggleMark={onToggleMark}
              onEdit={onEdit}
              onDelete={onDelete}
              editable={editable}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default PlayerDetail;
