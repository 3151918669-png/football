import React, { useState } from "react";
import MatchTable from "./MatchRecord";

function ResultButtons({ value, onChange }) {
  return (
    <div className="result-block">
      <label>比赛结果：</label>
      <div className="result-btn-group">
        <button
          className={`result-btn ${value === "win" ? "selected-win" : ""}`}
          onClick={() => onChange("win")}
        >
          胜
        </button>
        <button
          className={`result-btn ${value === "draw" ? "selected-draw" : ""}`}
          onClick={() => onChange("draw")}
        >
          平
        </button>
        <button
          className={`result-btn ${value === "loss" ? "selected-loss" : ""}`}
          onClick={() => onChange("loss")}
        >
          负
        </button>
      </div>
    </div>
  );
}

function PersonalMatchPage({
  selectedPlayer,
  matchForm,
  setMatchForm,
  addMatchRecord,
  updatePlayerMatchRecord,
  deletePlayerMatchRecord,
  togglePlayerMatchMark,
  isAdmin,
  loading = false,
  error = null
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const resetPersonalMatchForm = () => {
    setEditingIndex(null);
    setMatchForm({
      date: "",
      opponent: "",
      result: "",
      goals: "",
      assists: "",
      rating: "",
      note: "",
      isMarked: false,
    });
    setFormErrors({});
  };

  const startEditMatch = (match, index) => {
    setEditingIndex(index);
    setMatchForm({
      date: match.date || "",
      opponent: match.opponent || "",
      result: match.result || "",
      goals: String(match.goals ?? ""),
      assists: String(match.assists ?? ""),
      rating: String(match.rating ?? ""),
      note: match.note || "",
      isMarked: Boolean(match.isMarked),
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!matchForm.date.trim()) errors.date = "日期不能为空";
    if (!matchForm.opponent.trim()) errors.opponent = "对手不能为空";
    if (!matchForm.rating.trim()) errors.rating = "评分不能为空";
    if (!matchForm.result) errors.result = "请选择比赛结果";
    
    if (matchForm.rating && (isNaN(matchForm.rating) || parseFloat(matchForm.rating) < 0 || parseFloat(matchForm.rating) > 10)) {
      errors.rating = "评分必须是0-10之间的数字";
    }
    
    if (matchForm.goals && (isNaN(matchForm.goals) || parseInt(matchForm.goals) < 0)) {
      errors.goals = "进球数不能为负数";
    }
    
    if (matchForm.assists && (isNaN(matchForm.assists) || parseInt(matchForm.assists) < 0)) {
      errors.assists = "助攻数不能为负数";
    }
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingIndex === null) {
      addMatchRecord();
    } else {
      updatePlayerMatchRecord(selectedPlayer.name, editingIndex, {
        date: matchForm.date,
        opponent: matchForm.opponent,
        result: matchForm.result,
        goals: Number(matchForm.goals || 0),
        assists: Number(matchForm.assists || 0),
        rating: Number(matchForm.rating),
        note: matchForm.note || "暂无备注",
        isMarked: Boolean(matchForm.isMarked),
      });
      resetPersonalMatchForm();
    }
  };

  return (
    <div className="match-page">
      <section className="panel">
        <h2>{editingIndex === null ? "添加个人比赛记录" : "修改个人比赛记录"}</h2>
        <p>
          当前球员：<strong>{selectedPlayer.name}</strong>
        </p>
        
        {error && <div className="error-message" style={{ color: "var(--red)", marginBottom: "12px", padding: "10px", background: "rgba(255,107,107,0.1)", borderRadius: "8px" }}>{error}</div>}
        
        <div className="form-grid">
          <div>
            <input
              placeholder="日期，例如 2026-05-08"
              value={matchForm.date}
              onChange={(e) => {
                setMatchForm({ ...matchForm, date: e.target.value });
                if (formErrors.date) setFormErrors({ ...formErrors, date: "" });
              }}
              disabled={loading}
            />
            {formErrors.date && <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem", marginTop: "-8px", marginBottom: "8px" }}>{formErrors.date}</div>}
          </div>
          
          <div>
            <input
              placeholder="对手"
              value={matchForm.opponent}
              onChange={(e) => {
                setMatchForm({ ...matchForm, opponent: e.target.value });
                if (formErrors.opponent) setFormErrors({ ...formErrors, opponent: "" });
              }}
              disabled={loading}
            />
            {formErrors.opponent && <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem", marginTop: "-8px", marginBottom: "8px" }}>{formErrors.opponent}</div>}
          </div>
          
          <div>
            <input
              placeholder="进球"
              type="number"
              value={matchForm.goals}
              onChange={(e) => {
                setMatchForm({ ...matchForm, goals: e.target.value });
                if (formErrors.goals) setFormErrors({ ...formErrors, goals: "" });
              }}
              disabled={loading}
            />
            {formErrors.goals && <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem", marginTop: "-8px", marginBottom: "8px" }}>{formErrors.goals}</div>}
          </div>
          
          <div>
            <input
              placeholder="助攻"
              type="number"
              value={matchForm.assists}
              onChange={(e) => {
                setMatchForm({ ...matchForm, assists: e.target.value });
                if (formErrors.assists) setFormErrors({ ...formErrors, assists: "" });
              }}
              disabled={loading}
            />
            {formErrors.assists && <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem", marginTop: "-8px", marginBottom: "8px" }}>{formErrors.assists}</div>}
          </div>
          
          <div>
            <input
              placeholder="评分，例如 7.5"
              type="number"
              step="0.1"
              value={matchForm.rating}
              onChange={(e) => {
                setMatchForm({ ...matchForm, rating: e.target.value });
                if (formErrors.rating) setFormErrors({ ...formErrors, rating: "" });
              }}
              disabled={loading}
            />
            {formErrors.rating && <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem", marginTop: "-8px", marginBottom: "8px" }}>{formErrors.rating}</div>}
          </div>
        </div>
        
        <ResultButtons
          value={matchForm.result}
          onChange={(result) => {
            setMatchForm({ ...matchForm, result });
            if (formErrors.result) setFormErrors({ ...formErrors, result: "" });
          }}
        />
        {formErrors.result && <div className="field-error" style={{ color: "var(--red)", fontSize: "0.8rem", marginTop: "-8px", marginBottom: "8px" }}>{formErrors.result}</div>}
        
        <textarea
          placeholder="比赛备注"
          value={matchForm.note}
          onChange={(e) => setMatchForm({ ...matchForm, note: e.target.value })}
          disabled={loading}
        />
        
        <label className="check-line">
          <input
            type="checkbox"
            checked={matchForm.isMarked}
            onChange={(e) => setMatchForm({ ...matchForm, isMarked: e.target.checked })}
            disabled={loading}
          />
          标记为关键比赛记录
        </label>
        
        <div className="form-action-row">
          {editingIndex === null ? (
            <button className="primary-btn" onClick={handleSave} disabled={loading}>
              {loading ? "添加中..." : "添加记录"}
            </button>
          ) : (
            <>
              <button className="primary-btn" onClick={handleSave} disabled={loading}>
                {loading ? "保存中..." : "保存修改"}
              </button>
              <button className="small-ghost-btn" onClick={resetPersonalMatchForm} disabled={loading}>
                取消修改
              </button>
            </>
          )}
        </div>
      </section>
      
      <section className="panel">
        <h2>{selectedPlayer.name} 的比赛记录</h2>
        <MatchTable
          matches={selectedPlayer.matches}
          onToggleMark={(index) => togglePlayerMatchMark(selectedPlayer.name, index)}
          onEdit={(match, index) => startEditMatch(match, index)}
          onDelete={(index) => {
            deletePlayerMatchRecord(selectedPlayer.name, index);
            if (editingIndex === index) resetPersonalMatchForm();
          }}
          editable={isAdmin}
        />
      </section>
    </div>
  );
}

export default PersonalMatchPage;