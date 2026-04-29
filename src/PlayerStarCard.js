import React from "react";

export default function PlayerStarCard({ player }) {
  const attr = player.attributes || {};

  return (
    <div className="star-card">
      <div className="card-rating">{player.ability}</div>
      <div className="card-position">{player.position}</div>

      <div className="card-avatar">
        {player.name ? player.name[0] : "?"}
      </div>

      <div className="card-name">{player.name}</div>

      <div className="card-stats">
        <div>速度：{attr.速度 || 60}</div>
        <div>射门：{attr.射门 || 60}</div>
        <div>传球：{attr.传球 || 60}</div>
        <div>盘带：{attr.盘带 || 60}</div>
        <div>防守：{attr.防守 || 60}</div>
        <div>身体：{attr.身体 || 60}</div>
      </div>

      <div className="card-bottom">
        <div>年龄：{player.age || "-"}</div>
        <div>类型：{player.cardType || player.role || "-"}</div>
        <div>稀有度：{player.rarity || "普通"}</div>
      </div>
    </div>
  );
}
