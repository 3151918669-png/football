import React from "react";

function OperationsPage({
  clubInfo,
  nextMatch,
  updateNextMatch,
  teamMatches,
  players,
  isAdmin,
  exportBackup,
  importText,
  setImportText,
  importBackup,
  restoreLocalBackup,
  backupMessage,
  setSelectedTeamMatchId,
  setView,
}) {
  return (
    <div className="match-page operations-page">
      {/* 下一场比赛 */}
      {isAdmin && (
        <section className="panel next-match-panel">
          <h2>下一场比赛设置</h2>
          <p>设置后，主页将展示本场比赛的赛前信息。</p>
          <div className="form-grid">
            <input
              placeholder="对手"
              value={nextMatch.opponent}
              onChange={(e) => updateNextMatch("opponent", e.target.value)}
            />
            <input
              placeholder="比赛日期，如 2026-06-01"
              value={nextMatch.date}
              onChange={(e) => updateNextMatch("date", e.target.value)}
            />
            <input
              placeholder="比赛时间，如 16:00"
              value={nextMatch.time}
              onChange={(e) => updateNextMatch("time", e.target.value)}
            />
            <input
              placeholder={`球场，默认 ${clubInfo.homeGround}`}
              value={nextMatch.stadium}
              onChange={(e) => updateNextMatch("stadium", e.target.value)}
            />
            <input
              placeholder="比赛类型，如 友谊赛"
              value={nextMatch.type}
              onChange={(e) => updateNextMatch("type", e.target.value)}
            />
          </div>
          <textarea
            placeholder="赛前备注 / 注意事项"
            value={nextMatch.note}
            onChange={(e) => updateNextMatch("note", e.target.value)}
          />
          {nextMatch.opponent && (
            <div className="next-match-preview" style={{ marginTop: "14px" }}>
              <span>PREVIEW</span>
              <strong>
                {clubInfo.name} vs {nextMatch.opponent}
              </strong>
              <p>
                {nextMatch.date || "日期待定"} {nextMatch.time} |{" "}
                {nextMatch.stadium || clubInfo.homeGround} |{" "}
                {nextMatch.type || "友谊赛"}
              </p>
              <small>{nextMatch.note || "暂无赛前备注"}</small>
            </div>
          )}
        </section>
      )}

      {!isAdmin && (
        <section className="panel">
          <h2>运营中心</h2>
          <p>访客模式仅可查看基本赛程信息。登录后可进行运营管理和数据备份。</p>
          {nextMatch.opponent && (
            <div className="next-match-preview" style={{ marginTop: "14px" }}>
              <span>下一场比赛</span>
              <strong>
                {clubInfo.name} vs {nextMatch.opponent}
              </strong>
              <p>
                {nextMatch.date || "日期待定"} {nextMatch.time} |{" "}
                {nextMatch.stadium || clubInfo.homeGround}
              </p>
              <small>{nextMatch.note || "暂无赛前备注"}</small>
            </div>
          )}
        </section>
      )}

      {/* 数据备份 */}
      {isAdmin && (
        <section className="panel report-generator">
          <div className="section-head-row">
            <h2>数据备份与恢复</h2>
            <button className="primary-btn" onClick={exportBackup}>
              导出备份
            </button>
          </div>
          <p>备份包含：球员数据、教练数据、俱乐部信息、比赛记录、奖项和赛程。建议定期备份。</p>

          {backupMessage && (
            <div
              className="backup-message"
              style={{
                color: backupMessage.includes("失败")
                  ? "var(--red)"
                  : "var(--green)",
                borderColor: backupMessage.includes("失败")
                  ? "rgba(255,107,107,0.28)"
                  : "rgba(71,209,140,0.28)",
                background: backupMessage.includes("失败")
                  ? "rgba(255,107,107,0.08)"
                  : "rgba(71,209,140,0.08)",
              }}
            >
              {backupMessage}
            </div>
          )}

          <div style={{ marginTop: "16px" }}>
            <h3>从备份恢复</h3>
            <textarea
              placeholder="粘贴导出的备份 JSON 内容..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
            />
            <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="primary-btn" onClick={importBackup}>
                导入备份
              </button>
              <button className="small-ghost-btn" onClick={restoreLocalBackup}>
                从本地缓存恢复
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 运营提示 */}
      <section className="panel wide">
        <h2>运营建议</h2>
        <div className="ops-tip-grid">
          <div>
            <strong>赛前发布</strong>
            <p>在"下一场比赛设置"中填写对手、时间和地点，主页会自动展示。</p>
          </div>
          <div>
            <strong>赛后总结</strong>
            <p>在"比赛详情"中添加比赛，填入比分、进球和奖项，系统自动更新排行榜。</p>
          </div>
          <div>
            <strong>赛季管理</strong>
            <p>使用赛季筛选器按赛季查看数据，方便对比不同时期的表现。</p>
          </div>
          <div>
            <strong>数据备份</strong>
            <p>定期导出备份文件保存到本地，可在数据丢失时快速恢复。</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OperationsPage;