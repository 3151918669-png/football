import React, { useState } from "react";
import ImageDropzone from "./ImageDropzone";

function PlayerForm({
  playerForm,
  setPlayerForm,
  onAddPlayer,
  isAdmin,
  loading = false,
  error = null,
  onUploadPhoto,
  onDeletePhoto,
}) {
  const [formErrors, setFormErrors] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPlayerForm((current) => ({ ...current, [name]: value }));
    if (value.trim()) setFormErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = () => {
    const errors = {};
    if (!playerForm.name.trim()) errors.name = "姓名不能为空";
    if (!playerForm.number.trim()) errors.number = "号码不能为空";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    onAddPlayer();
  };

  const handlePhotoFile = async (file) => {
    if (!file || !onUploadPhoto) return;
    try {
      setUploadingPhoto(true);
      await onUploadPhoto(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <section className="panel roster-add-panel player-form-v2">
      <div className="section-head-row">
        <div>
          <span className="home-kicker">NEW MEMBER</span>
          <h2>新增单个球员</h2>
        </div>
        <span className="roster-count">缺失信息可以留空</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="player-profile-form-grid">
        <label>
          <span>姓名 *</span>
          <input name="name" value={playerForm.name} onChange={handleChange} disabled={loading} />
          {formErrors.name && <small className="field-error">{formErrors.name}</small>}
        </label>
        <label>
          <span>球衣号码 *</span>
          <input name="number" value={playerForm.number} onChange={handleChange} disabled={loading} inputMode="numeric" />
          {formErrors.number && <small className="field-error">{formErrors.number}</small>}
        </label>
        <label><span>场上位置</span><input name="position" value={playerForm.position} onChange={handleChange} placeholder="例如 后卫/LB" /></label>
        <label><span>分组</span><select name="category" value={playerForm.category} onChange={handleChange}><option value="">未分组</option><option value="前场">前场</option><option value="中场">中场</option><option value="后卫">后卫</option><option value="守门员">守门员</option></select></label>
        <label><span>籍贯</span><input name="hometown" value={playerForm.hometown} onChange={handleChange} /></label>
        <label><span>年龄</span><input name="age" value={playerForm.age} onChange={handleChange} inputMode="numeric" /></label>
        <label><span>惯用脚</span><input name="dominantFoot" value={playerForm.dominantFoot} onChange={handleChange} placeholder="左脚 / 右脚 / 左右脚" /></label>
        <label><span>球衣尺码</span><input name="shirtSize" value={playerForm.shirtSize} onChange={handleChange} /></label>
        <label><span>入队日期</span><input type="date" name="joinedAt" value={playerForm.joinedAt} onChange={handleChange} /></label>
        <label><span>球队状态</span><select name="status" value={playerForm.status} onChange={handleChange}><option value="">未填写</option><option value="在队">在队</option><option value="伤停">伤停</option><option value="暂离">暂离</option></select></label>
      </div>

      <label className="player-form-wide"><span>场上角色</span><input name="role" value={playerForm.role} onChange={handleChange} placeholder="例如 队长、门将、组织核心" /></label>
      <label className="player-form-wide"><span>标签</span><input name="tags" value={playerForm.tags} onChange={handleChange} placeholder="多个标签用逗号分隔" /></label>
      <label className="player-form-wide"><span>球员简介</span><textarea name="summary" value={playerForm.summary} onChange={handleChange} /></label>

      <div className="player-photo-form-row">
        <ImageDropzone title="球员照片" description="手机相册或电脑拖入，建议使用竖版半身照" value={playerForm.photo} onUpload={handlePhotoFile} onDelete={onDeletePhoto} uploading={uploadingPhoto} />
      </div>

      <button className="primary-btn" type="button" onClick={handleSubmit} disabled={loading || uploadingPhoto}>
        {loading ? "添加中..." : "添加到球队名单"}
      </button>
    </section>
  );
}

export default PlayerForm;
