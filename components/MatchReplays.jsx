import React from "react";
import { externalUrl } from "../src/clubData";
export default function MatchReplays({ matches, isAdmin, onManage }) {
  const available = matches.filter((m) => externalUrl(m.replayUrl));
  return (
    <section className="panel replay-section">
      <div className="section-head-row">
        <div>
          <span className="eyebrow">MATCH REPLAYS</span>
          <h2>重温每一次并肩</h2>
        </div>
        <span className="roster-count">{available.length} 场回放</span>
      </div>
      <p>打开每场比赛的网盘链接观看完整回放。</p>
      {available.length ? (
        <div className="replay-grid">
          {available.map((m) => (
            <article key={m.id}>
              <span className="replay-icon">▷</span>
              <small>
                {m.date} · {m.competition || "球队比赛"}
              </small>
              <h3>江特FC vs {m.opponent}</h3>
              {m.replayCode && (
                <p>
                  网盘提取码：<strong>{m.replayCode}</strong>
                </p>
              )}
              <a
                className="club-btn"
                href={externalUrl(m.replayUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                观看视频回放 ↗
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="photo-wall-empty">
          <span>▷</span>
          <h3>暂无比赛视频回放</h3>
          <p>录入比赛并添加网盘链接后，将在这里展示。</p>
        </div>
      )}
      {isAdmin && (
        <button className="primary-btn" onClick={onManage}>
          前往比赛管理 · 添加网盘链接
        </button>
      )}
    </section>
  );
}
