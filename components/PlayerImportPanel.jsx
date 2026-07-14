import React, { useMemo, useRef, useState } from "react";

const TEMPLATE_HEADERS = ["序号", "姓名", "号码", "场上位置", "籍贯", "年龄", "惯用脚", "球衣尺码", "入队日期", "状态", "标签", "简介"];
const TEMPLATE_ROW = ["1", "张三", "10", "前腰/CAM", "江阴市", "22", "右脚", "L", "2026-07-01", "在队", "队长,定位球", "负责中场组织"];

const HEADER_ALIASES = {
  序号: "rosterOrder", order: "rosterOrder",
  姓名: "name", 名字: "name", 球员: "name", name: "name",
  号码: "number", 球衣号码: "number", number: "number",
  位置: "position", 场上位置: "position", position: "position",
  分组: "category", 类别: "category", category: "category",
  场上角色: "role", 角色: "role", role: "role",
  惯用脚: "dominantFoot", dominantfoot: "dominantFoot", foot: "dominantFoot",
  籍贯: "hometown", hometown: "hometown",
  年龄: "age", age: "age",
  球衣尺码: "shirtSize", 尺码: "shirtSize", shirtsize: "shirtSize",
  身高: "height", 身高cm: "height", height: "height",
  体重: "weight", 体重kg: "weight", weight: "weight",
  入队日期: "joinedAt", 入队时间: "joinedAt", joinedat: "joinedAt",
  状态: "status", status: "status",
  标签: "tags", tags: "tags",
  简介: "summary", 备注: "summary", summary: "summary",
};

function parseTable(raw, delimiter) {
  const rows = [];
  let cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === '"') {
      if (quoted && raw[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      cells.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && raw[index + 1] === "\n") index += 1;
      cells.push(value.trim());
      if (cells.some((cell) => cell)) rows.push(cells);
      cells = [];
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value.trim());
  if (cells.some((cell) => cell)) rows.push(cells);
  return rows;
}

function inferCategory(position, provided) {
  if (provided) return provided;
  const normalized = String(position || "").toUpperCase();
  if (!normalized) return "";
  if (normalized === "GK" || normalized.includes("门将")) return "守门员";
  if (normalized.startsWith("后卫")) return "后卫";
  if (normalized.startsWith("前锋") || normalized.startsWith("边锋") || normalized.startsWith("中锋")) return "前场";
  if (normalized.startsWith("中场") || normalized.startsWith("后腰") || normalized.startsWith("前卫") || normalized.startsWith("前腰")) return "中场";
  if (normalized.includes("中场") || normalized.includes("后腰") || normalized.includes("前卫") || normalized.includes("前腰")) return "中场";
  if (normalized.includes("前锋") || normalized.includes("边锋") || normalized.includes("中锋")) return "前场";
  if (["CB", "LB", "RB", "LWB", "RWB"].includes(normalized)) return "后卫";
  if (["CM", "CAM", "CDM", "LM", "RM"].includes(normalized)) return "中场";
  return "前场";
}

function parsePlayers(raw) {
  const cleanRaw = raw.replace(/^\uFEFF/, "");
  const firstLine = cleanRaw.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.includes("\t") ? "\t" : ",";
  const rows = parseTable(cleanRaw, delimiter);
  if (rows.length < 2) return { players: [], error: "请粘贴包含表头和至少一名球员的数据。" };
  const headers = rows[0].map((header) => {
    const normalized = String(header || "").trim().toLowerCase().replace(/\s+/g, "");
    return HEADER_ALIASES[normalized] || HEADER_ALIASES[String(header || "").trim()];
  });
  if (!headers.includes("name") || !headers.includes("number")) {
    return { players: [], error: "表格必须包含姓名和号码两列。" };
  }

  const players = rows.slice(1).map((values) => {
    const player = {};
    headers.forEach((key, index) => {
      if (key) player[key] = values[index] || "";
    });
    const hasField = (key) => Object.prototype.hasOwnProperty.call(player, key);
    player.name = String(player.name || "").trim();
    player.number = String(player.number || "").trim();
    if (hasField("position")) player.position = String(player.position || "").trim().toUpperCase();
    if (hasField("category") || hasField("position")) player.category = inferCategory(player.position, player.category);
    if (hasField("tags")) player.tags = String(player.tags || "").split(/[,，、]/).map((item) => item.trim()).filter(Boolean);
    return player;
  }).filter((player) => player.name && player.number);

  return players.length
    ? { players, error: "" }
    : { players: [], error: "没有识别到有效球员，请检查姓名和号码。" };
}

function PlayerImportPanel({ onImport, disabled }) {
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);
  const parsed = useMemo(() => parsePlayers(raw), [raw]);

  const downloadTemplate = () => {
    const csv = [TEMPLATE_HEADERS, TEMPLATE_ROW].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "江特FC-球员导入模板.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result || ""));
      setMessage("");
    };
    reader.readAsText(file, "utf-8");
  };

  const handleImport = () => {
    if (parsed.error) {
      setMessage(parsed.error);
      return;
    }
    const result = onImport?.(parsed.players);
    setMessage(result || `已导入 ${parsed.players.length} 名球员`);
    setRaw("");
  };

  return (
    <section className="panel player-import-panel">
      <div className="player-import-head">
        <div>
          <span className="home-kicker">QUICK IMPORT</span>
          <h2>批量导入球员</h2>
          <p>可以从 Excel 直接复制整张表粘贴，也可以下载模板填写后上传 CSV。</p>
        </div>
        <div className="player-import-actions">
          <button className="small-ghost-btn" type="button" onClick={downloadTemplate}>下载 Excel 模板</button>
          <button className="small-ghost-btn" type="button" onClick={() => fileRef.current?.click()}>上传 CSV</button>
          <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={(event) => readFile(event.target.files?.[0])} />
        </div>
      </div>

      <textarea
        className="player-import-textarea"
        value={raw}
        onChange={(event) => { setRaw(event.target.value); setMessage(""); }}
        placeholder={TEMPLATE_HEADERS.join("\t") + "\n" + TEMPLATE_ROW.join("\t")}
      />

      {raw && (
        <div className="player-import-preview">
          <span>{parsed.error || `已识别 ${parsed.players.length} 名球员`}</span>
          {!parsed.error && parsed.players.slice(0, 5).map((player) => (
            <b key={`${player.name}-${player.number}`}>#{player.number} {player.name} · {player.position}</b>
          ))}
        </div>
      )}

      <div className="player-import-footer">
        <small>同名球员会更新资料，同时保留原照片和比赛记录。</small>
        <button className="primary-btn" type="button" onClick={handleImport} disabled={disabled || !raw || Boolean(parsed.error)}>
          导入到球队名单
        </button>
      </div>
      {message && <div className="import-result-message">{message}</div>}
    </section>
  );
}

export default PlayerImportPanel;
export { parsePlayers };
