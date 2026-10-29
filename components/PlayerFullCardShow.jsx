import React from "react";
import {playerCard} from "../src/clubData";

function PlayerFullCardShow({ player }) {
  const fullCardImage = playerCard(player);

  return (
    <div className="full-card-show-card">
      <div className="full-card-show-head">
        <div>
          <span>JIANGTE FC / PLAYER CARD</span>
          <h4>{player.name}</h4>
        </div>
        <strong>{player.ability}</strong>
      </div>
      <div className="full-card-show-image">
        {fullCardImage ? (
          <img src={fullCardImage} alt={`${player.name}完整球星卡`} loading="lazy" decoding="async" />
        ) : (
          <div className="full-card-show-empty">
            <b>暂无完整球星卡</b>
            <small>等待上传这名队员的球员卡</small>
          </div>
        )}
      </div>
      <div className="full-card-show-tip">江特FC · 每一位队员，都是球队的一部分。</div>
    </div>
  );
}

export default PlayerFullCardShow;