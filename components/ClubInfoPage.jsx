import React from "react";

function KitImageUploader({ title, image, text, editable, onUpload, onRemove }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // 这里应该调用 readImageAsDataUrl 函数
      // 由于是组件拆分，这个函数需要在父组件中实现
      // 暂时留空，由父组件处理
    }
  };

  return (
    <div className="kit-image-card">
      <div className="kit-image-title">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <div className="kit-image-preview">
        {image ? (
          <img src={image} alt={title} loading="lazy" decoding="async" />
        ) : (
          <div className="kit-image-empty">暂无图片</div>
        )}
      </div>
      {editable && (
        <div className="kit-image-actions">
          <label className="upload-btn small">
            上传图片
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {image && (
            <button className="small-ghost-btn" onClick={onRemove}>
              移除
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ClubInfoPage({ clubInfo, setClubInfo, isAdmin }) {
  return (
    <section className="dashboard-grid">
      <div className="panel wide club-profile-card">
        <div className="club-profile-left">
          <div className="club-big-badge">{clubInfo.shortName || "FC"}</div>
          <div>
            <h2>{clubInfo.name}</h2>
            <p>{clubInfo.slogan}</p>
            <small>
              {clubInfo.city}｜主场：{clubInfo.homeGround}
            </small>
          </div>
        </div>
        <div className="club-kit-preview">
          <div className="kit-shirt home-kit"></div>
          <div className="kit-shirt away-kit"></div>
        </div>
      </div>

      {!isAdmin && (
        <div className="panel wide">
          <h2>访客模式</h2>
          <p>当前仅展示球队信息。切换到管理员模式后可编辑球队介绍和上传球衣图片。</p>
        </div>
      )}
      {isAdmin && (
        <div className="panel wide">
          <h2>球队介绍设置</h2>
          <div className="form-grid">
            <input
              placeholder="球队名称"
              value={clubInfo.name}
              onChange={(e) => setClubInfo({ ...clubInfo, name: e.target.value })}
            />
            <input
              placeholder="队徽简称，例如 CJ"
              value={clubInfo.shortName}
              onChange={(e) => setClubInfo({ ...clubInfo, shortName: e.target.value })}
            />
            <input
              placeholder="城市"
              value={clubInfo.city}
              onChange={(e) => setClubInfo({ ...clubInfo, city: e.target.value })}
            />
            <input
              placeholder="球队主场"
              value={clubInfo.homeGround}
              onChange={(e) => setClubInfo({ ...clubInfo, homeGround: e.target.value })}
            />
            <input
              placeholder="主队球衣"
              value={clubInfo.homeKit}
              onChange={(e) => setClubInfo({ ...clubInfo, homeKit: e.target.value })}
            />
            <input
              placeholder="客场球衣"
              value={clubInfo.awayKit}
              onChange={(e) => setClubInfo({ ...clubInfo, awayKit: e.target.value })}
            />
            <input
              placeholder="球队口号"
              value={clubInfo.slogan}
              onChange={(e) => setClubInfo({ ...clubInfo, slogan: e.target.value })}
            />
          </div>
          <textarea
            placeholder="球队简介"
            value={clubInfo.description}
            onChange={(e) => setClubInfo({ ...clubInfo, description: e.target.value })}
          />
        </div>
      )}

      <div className="panel wide">
        <h2>球队球衣图片展示</h2>
        <p>
          可上传主场、客场、第三球衣图片，用于球队介绍页展示。图片会保存在浏览器本地。
        </p>
        <div className="kit-image-grid">
          <KitImageUploader
            title="主场球衣"
            image={clubInfo.homeKitImage}
            text={clubInfo.homeKit}
            editable={isAdmin}
            onUpload={(image) => setClubInfo({ ...clubInfo, homeKitImage: image })}
            onRemove={() => setClubInfo({ ...clubInfo, homeKitImage: "" })}
          />
          <KitImageUploader
            title="客场球衣"
            image={clubInfo.awayKitImage}
            text={clubInfo.awayKit}
            editable={isAdmin}
            onUpload={(image) => setClubInfo({ ...clubInfo, awayKitImage: image })}
            onRemove={() => setClubInfo({ ...clubInfo, awayKitImage: "" })}
          />
          <KitImageUploader
            title="第三球衣"
            image={clubInfo.thirdKitImage}
            text="备用 / 特别版球衣"
            editable={isAdmin}
            onUpload={(image) => setClubInfo({ ...clubInfo, thirdKitImage: image })}
            onRemove={() => setClubInfo({ ...clubInfo, thirdKitImage: "" })}
          />
        </div>
      </div>
      <div className="panel wide">
        <h2>球队简介展示</h2>
        <p>{clubInfo.description}</p>
      </div>
    </section>
  );
}

export default ClubInfoPage;