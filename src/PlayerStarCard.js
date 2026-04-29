import React from "react";

export default function PlayerStarCard({ player }) {
  const attr = player.attributes || {};

  return (
    <div className="star-card">
      <div className="card-top">
        <div>
          <div className="card-rating">{player.ability}</div>
          <div className="card-position">{player.position}</div>
          <div className="card-foot">
            惯用脚<br />
            <strong>{player.foot}</strong>
          </div>
          <div className="card-number">{player.number}</div>
        </div>

        <div className="card-brand">FC26</div>
      </div>

      <div className="card-avatar">
        <div className="avatar-placeholder">
          {player.name.slice(0, 1)}
        </div>
      </div>

      <div className="card-name">{player.name}</div>

      <div className="card-stats">
        <div>
          <span>速度</span>
          <strong>{attr.速度 || 60}</strong>
        </div>
        <div>
          <span>射门</span>
          <strong>{attr.射门 || 60}</strong>
        </div>
        <div>
          <span>传球</span>
          <strong>{attr.传球 || 60}</strong>
        </div>
        <div>
          <span>盘带</span>
          <strong>{attr.盘带 || 60}</strong>
        </div>
        <div>
          <span>防守</span>
          <strong>{attr.防守 || 60}</strong>
        </div>
        <div>
          <span>身体</span>
          <strong>{attr.身体 || 60}</strong>
        </div>
      </div>

      <div className="card-bottom">
        <div>
          <span>年龄</span>
          <strong>{player.age}</strong>
        </div>
        <div>
          <span>类型</span>
          <strong>{player.cardType}</strong>
        </div>
        <div>
          <span>稀有度</span>
          <strong>{player.rarity}</strong>
        </div>
      </div>
    </div>
  );
}
