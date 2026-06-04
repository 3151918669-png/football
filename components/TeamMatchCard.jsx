import React from "react";

function TeamMatchCard({ match, clubInfo, onClick, onDelete }) {
  const getTeamMatchResult = (match) => {
    const our = Number(match.ourScore || 0);
    const opponent = Number(match.opponentScore || 0);
    if (our > opponent) return "win";
    if (our === opponent) return "draw";
    return "loss";
  };

  const result = getTeamMatchResult(match);

  return (
    <div className={`team-match-card ${result}`} onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="match-top">
        <span>{match.date}</span>
        <strong>{match.stadium || clubInfo.homeGround}</strong>
      </div>
      <div className="match-vs-area">
        <div className="kit-box">
          <div className="kit-shirt home-kit"></div>
          <h3>{clubInfo.name}</h3>
          <p>{match.homeKit || clubInfo.homeKit}</p>
        </div>
        <div className="score-box">
          <strong>
            {match.ourScore} : {match.opponentScore}
          </strong>
          <span className={`result-badge ${result}`}>
            {result === "win" ? "胜" : result === "draw" ? "平" : "负"}
          </span>
        </div>
        <div className="kit-box">
          <div className="kit-shirt away-kit"></div>
          <h3>{match.opponent}</h3>
          <p>{match.awayKit || "暂无"}</p>
        </div>
      </div>
      <div className="match-info-grid">
        <div>
          <h4>进球队员</h4>
          <p>{match.scorers?.length ? match.scorers.join("、") : "暂无"}</p>
        </div>
        <div>
          <h4>助攻球员</h4>
          <p>{match.assists?.length ? match.assists.join("、") : "暂无"}</p>
        </div>
        <div>
          <h4>本场最佳</h4>
          <p>{match.bestPlayer || "暂无"}</p>
        </div>
      </div>
      {onDelete && (
        <button
          className="table-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("确认删除这场比赛吗？")) onDelete();
          }}
          style={{ position: "absolute", top: "10px", right: "10px" }}
        >
          删除
        </button>
      )}
    </div>
  );
}

export default TeamMatchCard;