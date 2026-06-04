import React from "react";
import ImageDropzone from "./ImageDropzone";

const SUPABASE_URL = "https://viwfabtfdhoaoyqmkyxi.supabase.co";
const BUCKET = "player-photos";

const CARD_FILE_BY_NAME = {
  "戴天麒": "daitianqi.jpg",
  "贾玉乐": "jiayule.jpg",
  "陆梓鑫": "luxinxin.jpg",
  "潘均毅": "panjunyi.jpg",
  "吴易纬": "wuyiwei.jpg",
  "徐嘉浩": "xujiahao.jpg",
  "张冬晨": "zhangdongchen.jpg",
  "章兮兮": "zhangxixi.jpg",
  "赵俊楠": "zhaojunnan.jpg",
};

function normalizePlayer(player) {
  return {
    name: player?.name || "未命名球员",
    number: player?.number || "-",
    category: player?.category || "-",
    position: player?.position || "-",
    role: player?.role || "-",
    ability: player?.ability ?? "-",
    potential: player?.potential ?? "-",
    photo: typeof player?.photo === "string" ? player.photo : "",
    cardImage: typeof player?.cardImage === "string" ? player.cardImage : "",
    summary: player?.summary || "暂无简介",
    tags: Array.isArray(player?.tags) ? player.tags : [],
    suggestions: Array.isArray(player?.suggestions) ? player.suggestions : [],
    matches: Array.isArray(player?.matches) ? player.matches : [],
    attributes: {
      速度: 60,
      射门: 60,
      盘带: 60,
      传球: 60,
      防守: 60,
      体能: 60,
      ...(player?.attributes || {}),
    },
  };
}

function clamp(value) {
  return Math.max(0, Math.min(99, Number(value) || 0));
}

function getCardUrl(player) {
  if (typeof player?.cardImage === "string" && player.cardImage.trim()) {
    return player.cardImage.trim();
  }

  const fileName = CARD_FILE_BY_NAME[player?.name];

  if (fileName) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/cards/${fileName}`;
  }

  return "";
}

function AttributeBar({ label, value }) {
  const safeValue = clamp(value);

  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "var(--sub)",
          fontSize: "0.86rem",
          fontWeight: 800,
        }}
      >
        <span>{label}</span>
        <strong style={{ color: "var(--accent-2)" }}>{safeValue}</strong>
      </div>

      <div
        style={{
          height: "9px",
          borderRadius: "999px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: `${safeValue}%`,
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
          }}
        />
      </div>
    </div>
  );
}

function SafeRadarChart({ attributes }) {
  const data = [
    ["速度", clamp(attributes?.速度)],
    ["射门", clamp(attributes?.射门)],
    ["盘带", clamp(attributes?.盘带)],
    ["传球", clamp(attributes?.传球)],
    ["防守", clamp(attributes?.防守)],
    ["体能", clamp(attributes?.体能)],
  ];

  const size = 320;
  const center = size / 2;
  const maxRadius = 112;
  const levels = [20, 40, 60, 80, 100];

  const getPoint = (index, value) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / data.length;
    const radius = (value / 100) * maxRadius;

    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  const getLevelPoints = (level) => {
    return data
      .map((_, index) => {
        const point = getPoint(index, level);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  };

  const radarPoints = data
    .map(([, value], index) => {
      const point = getPoint(index, value);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <div
      style={{
        width: "100%",
        minHeight: "920px",
        borderRadius: "20px",
        background:
          "radial-gradient(circle at center, rgba(215,181,109,0.12), transparent 58%), rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "grid",
        placeItems: "center",
        padding: "16px",
      }}
    >
      <svg
        width="100%"
        height="460"
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible", maxWidth: "460px" }}
      >
        {levels.map((level) => (
          <polygon
            key={level}
            points={getLevelPoints(level)}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        ))}

        {data.map((_, index) => {
          const point = getPoint(index, 100);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={radarPoints}
          fill="rgba(215,181,109,0.34)"
          stroke="var(--accent-2)"
          strokeWidth="3"
        />

        {data.map(([label, value], index) => {
          const point = getPoint(index, value);
          return (
            <circle
              key={`${label}-dot`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="var(--accent-2)"
              stroke="#111"
              strokeWidth="2"
            />
          );
        })}

        {data.map(([label, value], index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / data.length;
          const labelRadius = maxRadius + 28;
          const x = center + Math.cos(angle) * labelRadius;
          const y = center + Math.sin(angle) * labelRadius;

          return (
            <g key={`${label}-label`}>
              <text
                x={x}
                y={y - 6}
                textAnchor="middle"
                fill="var(--text)"
                fontSize="13"
                fontWeight="900"
              >
                {label}
              </text>
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                fill="var(--accent-2)"
                fontSize="12"
                fontWeight="900"
              >
                {value}
              </text>
            </g>
          );
        })}

        <circle cx={center} cy={center} r="3" fill="rgba(255,255,255,0.45)" />
      </svg>
    </div>
  );
}

function SafeFullCardShow({ player, clubInfo }) {
  const cardUrl = getCardUrl(player);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "920px",
        borderRadius: "24px",
        border: "1px solid rgba(215,181,109,0.34)",
        background:
          "radial-gradient(circle at top, rgba(242,213,138,0.20), transparent 38%), linear-gradient(160deg, #2b2412 0%, #151f32 45%, #08111e 100%)",
        boxShadow: "0 18px 42px rgba(0,0,0,0.34)",
        overflow: "hidden",
        padding: "14px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "10px",
          borderRadius: "18px",
          border: "1px solid rgba(255,230,160,0.18)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              fontSize: "2.3rem",
              lineHeight: 1,
              color: "var(--accent-2)",
            }}
          >
            {player.ability}
          </strong>
          <span style={{ color: "var(--text)", fontWeight: 950 }}>
            {player.position}
          </span>
        </div>

        <em
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontStyle: "normal",
            color: "#111",
            background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
            fontWeight: 950,
          }}
        >
          {clubInfo?.shortName || "FC"}
        </em>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "810px",
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.35)",
          backgroundImage: cardUrl ? `url("${cardUrl}")` : "none",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {!cardUrl ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "var(--sub)",
              fontWeight: 850,
              lineHeight: 1.6,
            }}
          >
            <div
              style={{
                color: "var(--accent-2)",
                fontSize: "2.6rem",
                fontWeight: 950,
                marginBottom: "10px",
              }}
            >
              #{player.number}
            </div>
            <div>暂无球星卡</div>
            <small>请检查 cards 文件名或球员姓名映射</small>
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          color: "var(--accent-2)",
          fontSize: "1.25rem",
          fontWeight: 950,
          marginTop: "12px",
        }}
      >
        {player.name}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          color: "var(--sub)",
          fontSize: "0.84rem",
          marginTop: "4px",
        }}
      >
        #{player.number}｜{player.role}
      </div>
    </div>
  );
}

function AdminEditPanel({
  player,
  onUpdateField,
  onUpdateAttributes,
  onUploadPhoto,
  onUploadCard,
  onDeletePhoto,
  onDeleteCard,
}) {
  const attributes = player.attributes || {};

  const updateAttr = (key, value) => {
    onUpdateAttributes?.({ [key]: clamp(value) });
  };

  return (
    <section className="panel wide">
      <div className="section-head-row">
        <h3>管理员编辑</h3>
        <span className="roster-count">修改后会自动同步</span>
      </div>

      <div className="form-grid">
        <input placeholder="姓名" value={player.name} onChange={(e) => onUpdateField?.("name", e.target.value)} />
        <input placeholder="号码" value={player.number} onChange={(e) => onUpdateField?.("number", e.target.value)} />
        <select value={player.category} onChange={(e) => onUpdateField?.("category", e.target.value)}>
          <option value="前场">前场</option>
          <option value="中场">中场</option>
          <option value="后卫">后卫</option>
        </select>
        <input placeholder="位置" value={player.position} onChange={(e) => onUpdateField?.("position", e.target.value)} />
        <input placeholder="角色" value={player.role} onChange={(e) => onUpdateField?.("role", e.target.value)} />
        <input type="number" placeholder="能力" value={player.ability} onChange={(e) => onUpdateField?.("ability", clamp(e.target.value))} />
        <input type="number" placeholder="潜力" value={player.potential} onChange={(e) => onUpdateField?.("potential", clamp(e.target.value))} />
      </div>

      <textarea
        placeholder="球员简介"
        value={player.summary}
        onChange={(e) => onUpdateField?.("summary", e.target.value)}
      />

      <textarea
        placeholder="技术标签，用逗号分隔"
        value={player.tags.join(",")}
        onChange={(e) =>
          onUpdateField?.(
            "tags",
            e.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
      />

      <textarea
        placeholder="发展建议，用逗号分隔"
        value={player.suggestions.join(",")}
        onChange={(e) =>
          onUpdateField?.(
            "suggestions",
            e.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
      />

      <h4 style={{ color: "var(--accent-2)" }}>能力值</h4>
      <div className="form-grid">
        {["速度", "射门", "盘带", "传球", "防守", "体能"].map((key) => (
          <input
            key={key}
            type="number"
            placeholder={key}
            value={attributes[key] ?? 60}
            onChange={(e) => updateAttr(key, e.target.value)}
          />
        ))}
      </div>

      <div className="image-upload-grid">
        <ImageDropzone title="证件照" description="点击选择或拖入图片即可替换" value={player.photo} onUpload={onUploadPhoto} onDelete={onDeletePhoto} />
        <ImageDropzone title="球星卡" description="点击选择或拖入竖版球星卡" value={player.cardImage} onUpload={onUploadCard} onDelete={onDeleteCard} fit="contain" />
      </div>
    </section>
  );
}

function PlayerDetail({
  player,
  clubInfo,
  awardStats,
  onToggleMark,
  onEdit,
  onDelete,
  editable,
  onAttributeUpdate,
  onCoreUpdate,
  isAdmin,
  onUploadPhoto,
  onUploadCard,
  onDeletePhoto,
  onDeleteCard,
  onUpdateField,
  onUpdateAttributes,
}) {
  const p = normalizePlayer(player);
  const attrEntries = Object.entries(p.attributes);

  return (
    <div
      className="v7-player-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "16px",
        alignItems: "start",
      }}
    >
      <aside
        className="panel"
        style={{
          position: "sticky",
          top: "112px",
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                fontSize: "2.4rem",
                lineHeight: 1,
                color: "var(--accent-2)",
              }}
            >
              {p.ability}
            </strong>
            <span style={{ color: "var(--sub)", fontWeight: 900 }}>
              {p.position}
            </span>
          </div>

          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: "#111",
              background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
              fontWeight: 950,
            }}
          >
            {clubInfo?.shortName || "FC"}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "300px",
            borderRadius: "20px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "grid",
            placeItems: "center",
            marginBottom: "14px",
          }}
        >
          {p.photo ? (
            <img
              src={p.photo}
              alt={p.name}
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.error("详情页头像加载失败：", p.name, p.photo);
                e.currentTarget.style.display = "none";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
          ) : (
            <span
              style={{
                color: "var(--accent-2)",
                fontSize: "2.6rem",
                fontWeight: 950,
              }}
            >
              #{p.number}
            </span>
          )}
        </div>

        <h2
          style={{
            textAlign: "center",
            color: "var(--accent-2)",
            marginBottom: "6px",
          }}
        >
          {p.name}
        </h2>

        <p style={{ textAlign: "center", marginBottom: "12px" }}>
          #{p.number}｜{p.role}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          {attrEntries.map(([key, value]) => (
            <div
              key={key}
              style={{
                borderRadius: "12px",
                padding: "8px",
                background: "rgba(255,255,255,0.06)",
                textAlign: "center",
                fontWeight: 900,
              }}
            >
              <span style={{ color: "var(--sub)" }}>{key}</span>{" "}
              <strong style={{ color: "var(--accent-2)" }}>{value}</strong>
            </div>
          ))}
        </div>
      </aside>

      <div className="v7-detail">
        <div className="player-hero">
          <div>
            <h2>{p.name}</h2>
            <p>
              {p.position} / {p.role}
            </p>

            <div className="tag-row">
              {p.tags.length > 0 ? (
                p.tags.map((tag) => <span key={tag}>{tag}</span>)
              ) : (
                <span>暂无标签</span>
              )}
            </div>
          </div>

          <div className="ability-box">
            <div>
              <small>能力</small>
              <strong>{p.ability}</strong>
            </div>
            <div>
              <small>潜力</small>
              <strong>{p.potential}</strong>
            </div>
          </div>
        </div>

        <div className="fm-content-grid">
          {isAdmin && (
            <AdminEditPanel
              player={p}
              onUpdateField={onUpdateField}
              onUpdateAttributes={onUpdateAttributes}
              onUploadPhoto={onUploadPhoto}
              onUploadCard={onUploadCard}
              onDeletePhoto={onDeletePhoto}
              onDeleteCard={onDeleteCard}
            />
          )}

          <section className="panel">
            <h3>球员定位</h3>
            <p>{p.summary}</p>
          </section>

          <section className="panel">
            <h3>建议方向</h3>
            {p.suggestions.length > 0 ? (
              <ul>
                {p.suggestions.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>暂无建议</p>
            )}
          </section>

          <section className="panel wide">
            <div className="section-head-row">
              <h3>球星卡 & 能力雷达图</h3>
              <span className="roster-count">能力 {p.ability}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(460px, 1fr) minmax(360px, 1fr)",
                gap: "16px",
                alignItems: "stretch",
              }}
            >
              <SafeFullCardShow player={p} clubInfo={clubInfo} />
              <SafeRadarChart attributes={p.attributes} />
            </div>
          </section>

          <section className="panel wide">
            <div className="section-head-row">
              <h3>能力明细</h3>
              <span className="roster-count">潜力 {p.potential}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "14px",
              }}
            >
              {attrEntries.map(([key, value]) => (
                <AttributeBar key={key} label={key} value={value} />
              ))}
            </div>
          </section>

          <section className="panel wide">
            <h3>比赛记录</h3>

            {p.matches.length > 0 ? (
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
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.matches.map((match, index) => (
                      <tr key={`${match.date || "date"}-${index}`}>
                        <td>{match.date || "-"}</td>
                        <td>{match.opponent || "-"}</td>
                        <td>{match.result || "-"}</td>
                        <td>{match.goals ?? 0}</td>
                        <td>{match.assists ?? 0}</td>
                        <td>{match.rating ?? "-"}</td>
                        <td>{match.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-match">
                <div className="empty-icon">📊</div>
                <h3>暂无比赛记录</h3>
                <p>该球员目前还没有录入个人比赛数据。</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default PlayerDetail;
