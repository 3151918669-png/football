import React, { useState } from "react";

function PlayerForm({
  playerForm,
  setPlayerForm,
  onAddPlayer,
  isAdmin,
  loading = false,
  error = null,
  onUploadPhoto,
  onUploadCard,
  onDeletePhoto,
  onDeleteCard,
}) {
  const [formErrors, setFormErrors] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);

  const validateField = (name, value) => {
    const errors = { ...formErrors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          errors.name = "姓名不能为空";
        } else if (value.length > 20) {
          errors.name = "姓名不能超过20个字符";
        } else {
          delete errors.name;
        }
        break;
      case "number":
        if (!value.trim()) {
          errors.number = "号码不能为空";
        } else if (isNaN(value) || parseInt(value) < 1 || parseInt(value) > 99) {
          errors.number = "号码必须是1-99之间的数字";
        } else {
          delete errors.number;
        }
        break;
      case "position":
        if (!value.trim()) {
          errors.position = "位置不能为空";
        } else if (value.length > 20) {
          errors.position = "位置不能超过20个字符";
        } else {
          delete errors.position;
        }
        break;
      case "ability":
        if (value && (isNaN(value) || parseInt(value) < 0 || parseInt(value) > 99)) {
          errors.ability = "能力值必须是0-99之间的数字";
        } else {
          delete errors.ability;
        }
        break;
      case "potential":
        if (value && (isNaN(value) || parseInt(value) < 0 || parseInt(value) > 99)) {
          errors.potential = "潜力值必须是0-99之间的数字";
        } else {
          delete errors.potential;
        }
        break;
      default:
        break;
    }

    setFormErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayerForm({ ...playerForm, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = () => {
    const errors = {};

    if (!playerForm.name.trim()) errors.name = "姓名不能为空";
    if (!playerForm.number.trim()) errors.number = "号码不能为空";
    if (!playerForm.position.trim()) errors.position = "位置不能为空";

    if (
      playerForm.ability &&
      (isNaN(playerForm.ability) ||
        parseInt(playerForm.ability) < 0 ||
        parseInt(playerForm.ability) > 99)
    ) {
      errors.ability = "能力值必须是0-99之间的数字";
    }

    if (
      playerForm.potential &&
      (isNaN(playerForm.potential) ||
        parseInt(playerForm.potential) < 0 ||
        parseInt(playerForm.potential) > 99)
    ) {
      errors.potential = "潜力值必须是0-99之间的数字";
    }

    if (Object.keys(errors).length > 0) {
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

  const handleCardFile = async (file) => {
    if (!file || !onUploadCard) return;

    try {
      setUploadingCard(true);
      await onUploadCard(file);
    } finally {
      setUploadingCard(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="panel visitor-panel">
        <h2>访客展示</h2>
        <p>当前为访客模式，仅展示球队名单。登录管理员后可新增球员、上传证件照和上传球星卡。</p>
      </div>
    );
  }

  return (
    <div className="panel roster-add-panel">
      <h2>新增球员</h2>

      {error && (
        <div
          className="error-message"
          style={{
            color: "var(--red)",
            marginBottom: "12px",
            padding: "10px",
            background: "rgba(255,107,107,0.1)",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      <div className="form-grid">
        <div>
          <input
            placeholder="姓名"
            name="name"
            value={playerForm.name}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.name && (
            <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem" }}>
              {formErrors.name}
            </div>
          )}
        </div>

        <div>
          <input
            placeholder="号码"
            type="number"
            name="number"
            value={playerForm.number}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.number && (
            <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem" }}>
              {formErrors.number}
            </div>
          )}
        </div>

        <div>
          <select
            value={playerForm.category}
            name="category"
            onChange={handleChange}
            disabled={loading}
          >
            <option value="前场">前场</option>
            <option value="中场">中场</option>
            <option value="后卫">后卫</option>
          </select>
        </div>

        <div>
          <input
            placeholder="位置，例如 ST / CM / CB"
            name="position"
            value={playerForm.position}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.position && (
            <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem" }}>
              {formErrors.position}
            </div>
          )}
        </div>

        <div>
          <input
            placeholder="角色，例如 边路爆点"
            name="role"
            value={playerForm.role}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <input
            placeholder="能力值，默认 65"
            type="number"
            name="ability"
            value={playerForm.ability}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.ability && (
            <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem" }}>
              {formErrors.ability}
            </div>
          )}
        </div>

        <div>
          <input
            placeholder="潜力值，默认 70"
            type="number"
            name="potential"
            value={playerForm.potential}
            onChange={handleChange}
            disabled={loading}
          />
          {formErrors.potential && (
            <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem" }}>
              {formErrors.potential}
            </div>
          )}
        </div>

        <div>
          <input
            placeholder="技术标签，用逗号分隔"
            name="tags"
            value={playerForm.tags}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <textarea
        placeholder="球员简介"
        name="summary"
        value={playerForm.summary}
        onChange={handleChange}
        disabled={loading}
      />

      <textarea
        placeholder="发展建议，用逗号分隔"
        name="suggestions"
        value={playerForm.suggestions}
        onChange={handleChange}
        disabled={loading}
      />

      <div className="player-photo-upload-block roster-upload-block">
        <div>
          <h3>证件照 / 半身照</h3>
          <p>上传到 Supabase Storage 的 players 文件夹，用于球队名单和个人详情左侧头像。</p>
        </div>

        <label className="upload-btn">
          {uploadingPhoto ? "上传中..." : "上传证件照"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoFile(file);
              e.target.value = "";
            }}
            disabled={loading || uploadingPhoto}
          />
        </label>
      </div>

      {playerForm.photo && (
        <div className="player-photo-preview portrait-preview roster-form-preview">
          <img src={playerForm.photo} alt="证件照预览" loading="lazy" decoding="async" />
          <button
            className="mark-btn"
            type="button"
            onClick={onDeletePhoto}
            disabled={loading || uploadingPhoto}
            style={{ width: "auto", padding: "8px 12px" }}
          >
            删除证件照
          </button>
        </div>
      )}

      <div className="player-photo-upload-block roster-upload-block">
        <div>
          <h3>球星卡图片</h3>
          <p>上传到 Supabase Storage 的 cards 文件夹，用于球员详情页雷达图左侧的大球星卡。</p>
        </div>

        <label className="upload-btn">
          {uploadingCard ? "上传中..." : "上传球星卡"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCardFile(file);
              e.target.value = "";
            }}
            disabled={loading || uploadingCard}
          />
        </label>
      </div>

      {playerForm.cardImage && (
        <div className="player-photo-preview roster-form-preview">
          <img
            src={playerForm.cardImage}
            alt="球星卡预览"
            loading="lazy"
            decoding="async"
            style={{ objectFit: "contain", background: "rgba(0,0,0,0.28)" }}
          />
          <button
            className="mark-btn"
            type="button"
            onClick={onDeleteCard}
            disabled={loading || uploadingCard}
            style={{ width: "auto", padding: "8px 12px" }}
          >
            删除球星卡
          </button>
        </div>
      )}

      <button
        className="primary-btn"
        onClick={handleSubmit}
        disabled={loading || uploadingPhoto || uploadingCard || Object.keys(formErrors).length > 0}
      >
        {loading ? "添加中..." : "添加球员"}
      </button>
    </div>
  );
}

export default PlayerForm;
