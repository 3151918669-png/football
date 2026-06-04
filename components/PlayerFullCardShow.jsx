import React from "react";

function PlayerFullCardShow({ player }) {
  const fullCardImage = player.cardImage || "";

  return (
    <div className="full-card-show-card">
      <div className="full-card-show-head">
        <div>
          <span>FC26 PLAYER CARD</span>
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
            <small>管理员可在右侧"个人主页照片 / 球星卡图"上传完整卡图</small>
          </div>
        )}
      </div>
      <div className="full-card-show-tip">此区域只读取完整球星卡图，不使用证件照。</div>
    </div>
  );
}

export default PlayerFullCardShow;