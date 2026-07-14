import React from "react";

function MatchTable({ matches, onToggleMark, onEdit, onDelete, editable }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="empty-match">
        <div className="empty-icon">📊</div>
        <p>暂无个人比赛记录</p>
        <small>添加后会以表格形式展示，支持标记关键比赛、修改和删除。</small>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>对手</th>
            <th>结果</th>
            <th>进球</th>
            <th>助攻</th>
            <th>评分</th>
            <th>门将数据</th>
            {editable && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={index} className={match.isMarked ? "marked-row" : ""}>
              <td>{match.date}</td>
              <td>{match.opponent}</td>
              <td>
                <span className={`result-badge ${match.result}`}>
                  {match.result === "win" ? "胜" : match.result === "draw" ? "平" : "负"}
                </span>
              </td>
              <td>{match.goals || 0}</td>
              <td>{match.assists || 0}</td>
              <td>{match.rating || "-"}</td>
              <td>{match.saves || match.conceded || match.cleanSheet ? `${match.saves || 0} 扑救 / ${match.conceded || 0} 失球${match.cleanSheet ? " / 零封" : ""}` : "-"}</td>
              {editable && (
                <td>
                  <div className="table-action-group">
                    <button
                      className={`mark-btn ${match.isMarked ? "active" : ""}`}
                      onClick={() => onToggleMark(index)}
                      title={match.isMarked ? "取消标记关键比赛" : "标记为关键比赛"}
                    >
                      {match.isMarked ? "★" : "☆"}
                    </button>
                    <button
                      className="table-edit-btn"
                      onClick={() => onEdit(match, index)}
                      title="修改记录"
                    >
                      修改
                    </button>
                    <button
                      className="table-delete-btn"
                      onClick={() => onDelete(index)}
                      title="删除记录"
                    >
                      删除
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MatchTable;
