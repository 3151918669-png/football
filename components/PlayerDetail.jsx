import React from "react";
import ImageDropzone from "./ImageDropzone";
import MatchTable from "./MatchRecord";

function totalStat(matches, key) {
  return (matches || []).reduce((sum, match) => sum + Number(match[key] || 0), 0);
}

function averageRating(matches) {
  const rated = (matches || []).filter((match) => Number(match.rating) > 0);
  if (!rated.length) return "—";
  return (rated.reduce((sum, match) => sum + Number(match.rating), 0) / rated.length).toFixed(1);
}

function ProfileField({ label, value }) {
  return <div className="profile-fact"><span>{label}</span><strong>{value || "—"}</strong></div>;
}

function AdminProfileEditor({ player, onUpdateField, onUploadPhoto, onDeletePhoto }) {
  const updateTags = (value) => onUpdateField?.("tags", value.split(/[,，、]/).map((item) => item.trim()).filter(Boolean));
  return (
    <section className="panel player-profile-editor">
      <div className="section-head-row"><div><small>ADMIN EDIT</small><h3>编辑球员资料</h3></div><span className="roster-count">自动保存</span></div>
      <div className="player-profile-form-grid">
        <label><span>姓名</span><input value={player.name || ""} onChange={(event) => onUpdateField?.("name", event.target.value)} /></label>
        <label><span>球衣号码</span><input value={player.number || ""} onChange={(event) => onUpdateField?.("number", event.target.value)} /></label>
        <label><span>场上位置</span><input value={player.position || ""} onChange={(event) => onUpdateField?.("position", event.target.value)} /></label>
        <label><span>分组</span><select value={player.category || ""} onChange={(event) => onUpdateField?.("category", event.target.value)}><option value="">未分组</option><option value="前场">前场</option><option value="中场">中场</option><option value="后卫">后卫</option><option value="守门员">守门员</option></select></label>
        <label><span>籍贯</span><input value={player.hometown || ""} onChange={(event) => onUpdateField?.("hometown", event.target.value)} /></label>
        <label><span>年龄</span><input value={player.age || ""} onChange={(event) => onUpdateField?.("age", event.target.value)} /></label>
        <label><span>惯用脚</span><input value={player.dominantFoot || ""} onChange={(event) => onUpdateField?.("dominantFoot", event.target.value)} /></label>
        <label><span>球衣尺码</span><input value={player.shirtSize || ""} onChange={(event) => onUpdateField?.("shirtSize", event.target.value)} /></label>
        <label><span>入队日期</span><input type="date" value={player.joinedAt || ""} onChange={(event) => onUpdateField?.("joinedAt", event.target.value)} /></label>
        <label><span>球队状态</span><select value={player.status || ""} onChange={(event) => onUpdateField?.("status", event.target.value)}><option value="">未填写</option><option value="在队">在队</option><option value="伤停">伤停</option><option value="暂离">暂离</option></select></label>
      </div>
      <label className="player-form-wide"><span>场上角色</span><input value={player.role || ""} onChange={(event) => onUpdateField?.("role", event.target.value)} /></label>
      <label className="player-form-wide"><span>标签</span><input value={(player.tags || []).join(",")} onChange={(event) => updateTags(event.target.value)} /></label>
      <label className="player-form-wide"><span>个人简介</span><textarea value={player.summary || ""} onChange={(event) => onUpdateField?.("summary", event.target.value)} /></label>
      <div className="player-photo-form-row"><ImageDropzone title="球员照片" description="建议使用竖版半身照" value={player.photo || ""} onUpload={onUploadPhoto} onDelete={onDeletePhoto} /></div>
    </section>
  );
}

function PlayerDetail({
  player,
  clubInfo,
  onToggleMark,
  onEdit,
  onDelete,
  editable,
  isAdmin,
  onUploadPhoto,
  onDeletePhoto,
  onUpdateField,
}) {
  const matches = player.matches || [];
  const goals = totalStat(matches, "goals");
  const assists = totalStat(matches, "assists");
  const rating = averageRating(matches);

  return (
    <article className="immersive-player-profile">
      <section className="player-profile-hero panel">
        <div className="player-profile-backdrop" aria-hidden="true" />
        <div className="player-profile-portrait">
          {player.photo ? <img src={player.photo} alt={player.name} /> : <span>#{player.number}</span>}
        </div>
        <div className="player-profile-identity">
          <div className="player-profile-eyebrow"><span>{clubInfo?.shortName || "FC"}</span><i>{player.status || "一线队"}</i></div>
          <strong className="player-profile-shirt-number">{player.number || "—"}</strong>
          <h2>{player.name}</h2>
          <p>{player.position || "位置待补充"}{player.role ? ` · ${player.role}` : ""}</p>
          <div className="player-profile-tags">{(player.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
        <div className="player-profile-record">
          <div><strong>{matches.length}</strong><span>出场</span></div>
          <div><strong>{goals}</strong><span>进球</span></div>
          <div><strong>{assists}</strong><span>助攻</span></div>
          <div><strong>{rating}</strong><span>场均评分</span></div>
        </div>
      </section>

      <div className="player-profile-content">
        <section className="panel player-profile-facts">
          <div className="section-head-row"><div><small>PLAYER FILE</small><h3>球员资料</h3></div><span className="roster-count">#{player.number}</span></div>
          <div className="profile-fact-grid">
            <ProfileField label="场上位置" value={player.position} />
            <ProfileField label="籍贯" value={player.hometown} />
            <ProfileField label="年龄" value={player.age ? `${player.age} 岁` : ""} />
            <ProfileField label="惯用脚" value={player.dominantFoot} />
            <ProfileField label="球衣尺码" value={player.shirtSize} />
            <ProfileField label="入队日期" value={player.joinedAt} />
          </div>
        </section>

        <section className="panel player-profile-story">
          <small>PROFILE</small>
          <h3>球员简介</h3>
          <p>{player.summary || "暂无简介"}</p>
        </section>

        {isAdmin && <AdminProfileEditor player={player} onUpdateField={onUpdateField} onUploadPhoto={onUploadPhoto} onDeletePhoto={onDeletePhoto} />}

        <section className="panel player-match-history">
          <div className="section-head-row"><div><small>MATCH LOG</small><h3>比赛记录</h3></div><span className="roster-count">{matches.length} 场</span></div>
          <MatchTable matches={matches} onToggleMark={onToggleMark} onEdit={onEdit} onDelete={onDelete} editable={editable} />
        </section>
      </div>
    </article>
  );
}

export default PlayerDetail;
