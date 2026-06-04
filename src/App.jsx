import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import HomeShowcasePage from "../components/HomeShowcasePage";
import ClubInfoPage from "../components/ClubInfoPage";
import PlayerLibraryPage from "../components/PlayerLibraryPage";
import PlayerDetail from "../components/PlayerDetail";
import TeamMatchesPage from "../components/TeamMatchesPage";
import PersonalMatchPage from "../components/PersonalMatchPage";
import LineupPage from "../components/LineupPage";
import RankingsPage from "../components/RankingsPage";
import OperationsPage from "../components/OperationsPage";
import AwardsPage from "../components/AwardsPage";
import CoachPage from "../components/CoachPage";
import PlayerPhotoCard from "../components/PlayerPhotoCard";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../components/LoadingSpinner";
import { supabaseClient } from "./supabaseClient";
import WechatShare from "../components/WechatShare";
import AdvancedStats from "../components/AdvancedStats";
import AIAnalysis from "../components/AIAnalysis";
import ContentEditor from "../components/ContentEditor";

/* ===== 工具函数 ===== */
function averageRating(matches) {
  if (!matches?.length) return "-";
  const total = matches.reduce((sum, m) => sum + Number(m.rating || 0), 0);
  return (total / matches.length).toFixed(1);
}

function totalStat(matches, key) {
  return matches?.reduce((sum, m) => sum + Number(m[key] || 0), 0) || 0;
}

function getSeasonKey(date) {
  if (!date) return "未知赛季";
  const year = parseInt(date.slice(0, 4), 10);
  return isNaN(year) ? "未知赛季" : `${year}-${year + 1}`;
}

function clampAbility(value) {
  return Math.max(0, Math.min(99, Number(value) || 0));
}

function calculateAbilityChange(match, player) {
  const base = Number(match.rating || 0);
  const goals = Number(match.goals || 0);
  const assists = Number(match.assists || 0);
  if (!base) return 0;
  let change = base >= 8.5 ? 3 : base >= 7.5 ? 2 : base >= 6.5 ? 1 : base >= 5.5 ? 0 : base >= 4.5 ? -1 : -2;
  if (match.result === "win") change += 1;
  if (match.result === "loss") change -= 1;
  change += goals;
  if (assists >= 2) change += 1;
  return change;
}

function recalculatePlayerAfterMatches(player) {
  const matches = player.matches || [];
  let ability = Number(player.baseAbility || player.ability || 0);
  const recalculated = matches.map((m) => {
    const change = calculateAbilityChange(m, player);
    ability = clampAbility(ability + change);
    return { ...m, abilityChange: change, abilityAfterMatch: ability };
  });
  return { ...player, matches: recalculated, ability: clampAbility(ability) };
}

function getStatus(rating) {
  if (rating === "-") return "-";
  const r = Number(rating);
  return r >= 7.5 ? "状态火热" : r >= 6.5 ? "状态稳定" : r >= 5.5 ? "状态一般" : "状态低迷";
}

function getTeamMatchResult(match) {
  const our = Number(match.ourScore || 0);
  const opponent = Number(match.opponentScore || 0);
  if (our > opponent) return "win";
  if (our === opponent) return "draw";
  return "loss";
}

function findPlayerByName(players, name) {
  return players.find((p) => p.name === name) || null;
}

function countResults(matches) {
  return matches.reduce(
    (record, m) => {
      if (m.result === "win") record.wins++;
      if (m.result === "draw") record.draws++;
      if (m.result === "loss") record.losses++;
      return record;
    },
    { wins: 0, draws: 0, losses: 0 }
  );
}

function readImageAsDataUrl(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxW = 800;
      const maxH = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}


const SUPABASE_BUCKET = "player-photos";

function slugifyName(name) {
  return String(name || "player")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");
}

async function uploadPlayerImage(file, folder, playerName) {
  if (!file) throw new Error("没有选择文件");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = slugifyName(playerName || Date.now());
  const filePath = `${folder}/${safeName}-${Date.now()}.${ext}`;

  const { error } = await supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

function getStoragePathFromPublicUrl(url) {
  if (!url || typeof url !== "string") return "";

  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) return "";

  return decodeURIComponent(url.slice(index + marker.length));
}

async function deletePlayerImageByUrl(url) {
  const path = getStoragePathFromPublicUrl(url);
  if (!path) return;

  const { error } = await supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .remove([path]);

  if (error) throw error;
}

function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage 写入失败:", e);
  }
}

function safeGetLocalStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/* ===== 初始数据 ===== */
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "football2026";

const initialPlayers = [
  { name: "陈杰", number: "7", category: "前场", position: "ST", role: "锋线杀手", ability: 78, potential: 85, attributes: { 速度: 82, 射门: 80, 盘带: 75, 传球: 68, 防守: 42, 体能: 74 }, tags: ["速度型", "射手"], summary: "球队进攻核心，擅长突破和射门。", suggestions: ["加强盘带练习", "提升传球视野"], photo: "", cardImage: "", matches: [] },
  { name: "李明", number: "10", category: "中场", position: "CAM", role: "组织核心", ability: 76, potential: 82, attributes: { 速度: 68, 射门: 72, 盘带: 80, 传球: 82, 防守: 55, 体能: 70 }, tags: ["技术型", "传球大师"], summary: "中场发动机，负责组织进攻和最后一传。", suggestions: ["提升射门精度", "加强体能训练"], photo: "", cardImage: "", matches: [] },
  { name: "王强", number: "4", category: "后卫", position: "CB", role: "铁血后卫", ability: 74, potential: 78, attributes: { 速度: 62, 射门: 40, 盘带: 55, 传球: 60, 防守: 82, 体能: 75 }, tags: ["防守型", "头球好"], summary: "后防中坚，擅长高空球和一对一防守。", suggestions: ["提升出球能力", "加强速度训练"], photo: "", cardImage: "", matches: [] },
  { name: "赵磊", number: "9", category: "前场", position: "LW", role: "边路爆点", ability: 72, potential: 80, attributes: { 速度: 84, 射门: 68, 盘带: 78, 传球: 65, 防守: 35, 体能: 72 }, tags: ["速度型", "突破好手"], summary: "边路快马，利用速度撕开防线。", suggestions: ["加强射门训练", "提升传中质量"], photo: "", cardImage: "", matches: [] },
  { name: "张鹏", number: "8", category: "中场", position: "CM", role: "全能中场", ability: 70, potential: 76, attributes: { 速度: 65, 射门: 62, 盘带: 68, 传球: 70, 防守: 66, 体能: 78 }, tags: ["均衡型", "跑动覆盖"], summary: "B2B中场，攻防两端都能发挥作用。", suggestions: ["强化专项训练", "提升传球精准度"], photo: "", cardImage: "", matches: [] },
  { name: "刘洋", number: "11", category: "前场", position: "RW", role: "边锋", ability: 68, potential: 77, attributes: { 速度: 76, 射门: 65, 盘带: 72, 传球: 62, 防守: 38, 体能: 68 }, tags: ["速度型", "内切好手"], summary: "右边锋，擅长内切射门和底线传中。", suggestions: ["提升对抗能力", "加强左脚训练"], photo: "", cardImage: "", matches: [] },
  { name: "周涛", number: "5", category: "后卫", position: "CB", role: "稳健中卫", ability: 66, potential: 74, attributes: { 速度: 58, 射门: 38, 盘带: 50, 传球: 55, 防守: 76, 体能: 70 }, tags: ["防守型", "位置感好"], summary: "经验丰富的中后卫，选位出色。", suggestions: ["提升速度", "加强长传训练"], photo: "", cardImage: "", matches: [] },
  { name: "吴浩", number: "6", category: "中场", position: "CDM", role: "防守型中场", ability: 65, potential: 73, attributes: { 速度: 60, 射门: 45, 盘带: 58, 传球: 62, 防守: 74, 体能: 72 }, tags: ["防守型", "拦截好"], summary: "中场屏障，负责拦截和扫荡。", suggestions: ["提升出球能力", "加强体能储备"], photo: "", cardImage: "", matches: [] },
  { name: "郑超", number: "3", category: "后卫", position: "LB", role: "进攻型边卫", ability: 64, potential: 72, attributes: { 速度: 72, 射门: 48, 盘带: 62, 传球: 60, 防守: 64, 体能: 70 }, tags: ["速度型", "助攻能力强"], summary: "左路飞翼，攻守兼备。", suggestions: ["提升防守意识", "加强传中训练"], photo: "", cardImage: "", matches: [] },
];

const initialCoachData = [
  { name: "陈教练", role: "主教练", roleKey: "head", focus: "战术体系搭建", desc: "执教10年，擅长4-3-3和3-5-2阵型。", initials: "陈教", matches: [] },
  { name: "王助教", role: "助理教练", roleKey: "assistant", focus: "体能和恢复训练", desc: "负责每日训练计划和球员体能管理。", initials: "王助", matches: [] },
  { name: "张指导", role: "技术顾问", roleKey: "advisor", focus: "技术动作指导", desc: "前职业球员，专注个人技术打磨。", initials: "张指", matches: [] },
];

const initialClubInfo = {
  name: "城市猎人 FC",
  shortName: "CH",
  city: "深圳",
  homeGround: "深圳湾体育中心",
  homeKit: "蓝白条纹",
  awayKit: "纯白",
  slogan: "猎心不改，城就未来！",
  description: "城市猎人 FC 成立于 2020 年，是一支深圳业余足球俱乐部，活跃于深圳各大业余联赛。我们追求快乐足球与竞技水平的平衡，欢迎热爱足球的你加入！",
  homeKitImage: "",
  awayKitImage: "",
  thirdKitImage: "",
};

const categories = ["前场", "中场", "后卫"];

/* ===== App 主组件 ===== */
function App() {
  // --- 数据状态 ---
  const [players, setPlayers] = useState(() => safeGetLocalStorage("fm_players", initialPlayers));
  const [coaches, setCoaches] = useState(() => safeGetLocalStorage("fm_coaches", initialCoachData));
  const [clubInfo, setClubInfo] = useState(() => safeGetLocalStorage("fm_clubInfo", initialClubInfo));
  const [teamMatches, setTeamMatches] = useState(() => safeGetLocalStorage("fm_teamMatches", []));
  const [manualAwards, setManualAwards] = useState(() => safeGetLocalStorage("fm_manualAwards", { topScorer: "", assistKing: "", bestDefender: "", bestCoach: "" }));
  const [nextMatch, setNextMatch] = useState(() => safeGetLocalStorage("fm_nextMatch", { opponent: "", date: "", time: "", stadium: "", type: "友谊赛", lineup: "", note: "" }));
  const [contentEdits, setContentEdits] = useState(() => safeGetLocalStorage("fm_contentEdits", {}));

  // --- 云端状态 ---
  const [cloudStatus, setCloudStatus] = useState("未连接");
  const [cloudError, setCloudError] = useState("");
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);

  // --- UI 状态 ---
  const [view, setView] = useState("dashboard");
  const [selectedName, setSelectedName] = useState("");
  const [selectedTeamMatchId, setSelectedTeamMatchId] = useState("");
  const [selectedCoachName, setSelectedCoachName] = useState(coaches[0]?.name || "");
  const [isAdmin, setIsAdmin] = useState(() => safeGetLocalStorage("fm_isAdmin", false));
  const [showLogin, setShowLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- 高级功能状态 ---
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showWechatShare, setShowWechatShare] = useState(false);
  const [contentEditMode, setContentEditMode] = useState(false);

  // --- 表单状态 ---
  const [playerForm, setPlayerForm] = useState({
    name: "",
    number: "",
    category: "前场",
    position: "",
    role: "",
    ability: "65",
    potential: "70",
    tags: "",
    summary: "",
    suggestions: "",
    photo: "",
    cardImage: "",
  });
  const [matchForm, setMatchForm] = useState({ date: "", opponent: "", result: "", goals: "", assists: "", rating: "", note: "", isMarked: false });
  const [teamMatchForm, setTeamMatchForm] = useState({ date: "", opponent: "", stadium: "", homeKit: "", awayKit: "", ourScore: "", opponentScore: "", scorers: "", assists: "", bestPlayer: "", note: "" });
  const [coachMatchForm, setCoachMatchForm] = useState({ date: "", opponent: "", result: "", note: "", isMarked: false });

  // --- 导入导出状态 ---
  const [importText, setImportText] = useState("");
  const [backupMessage, setBackupMessage] = useState("");

  // --- 加载和错误状态 ---
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  /* ===== localStorage 持久化 ===== */
  useEffect(() => { safeSetLocalStorage("fm_players", players); }, [players]);
  useEffect(() => { safeSetLocalStorage("fm_coaches", coaches); }, [coaches]);
  useEffect(() => { safeSetLocalStorage("fm_clubInfo", clubInfo); }, [clubInfo]);
  useEffect(() => { safeSetLocalStorage("fm_teamMatches", teamMatches); }, [teamMatches]);
  useEffect(() => { safeSetLocalStorage("fm_manualAwards", manualAwards); }, [manualAwards]);
  useEffect(() => { safeSetLocalStorage("fm_nextMatch", nextMatch); }, [nextMatch]);
  useEffect(() => { safeSetLocalStorage("fm_contentEdits", contentEdits); }, [contentEdits]);
  useEffect(() => { safeSetLocalStorage("fm_isAdmin", isAdmin); }, [isAdmin]);

  /* ===== 云端：构建/应用数据载荷 ===== */
  const buildTeamPayload = () => {
    return { players, coaches, clubInfo, teamMatches, manualAwards, nextMatch, contentEdits, savedAt: new Date().toISOString() };
  };

  const applyTeamPayload = (payload) => {
    try {
      if (payload.players) setPlayers(payload.players);
      if (payload.coaches) setCoaches(payload.coaches);
      if (payload.clubInfo) setClubInfo(payload.clubInfo);
      if (payload.teamMatches) setTeamMatches(payload.teamMatches);
      if (payload.manualAwards) setManualAwards(payload.manualAwards);
      if (payload.nextMatch) setNextMatch(payload.nextMatch);
      if (payload.contentEdits) setContentEdits(payload.contentEdits);
      return true;
    } catch (e) {
      console.error("应用数据失败:", e);
      return false;
    }
  };

  const upsertCloudData = async () => {
    try {
      setCloudLoading(true);
      const payload = buildTeamPayload();
      const { error } = await supabaseClient.from("team_state").upsert(
        { id: "main", data: payload, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
      if (error) throw error;
      setCloudStatus("已同步");
      setCloudError("");
    } catch (e) {
      setCloudStatus("同步失败");
      setCloudError(e.message || "未知错误");
    } finally {
      setCloudLoading(false);
    }
  };

  const loadCloudData = async () => {
    try {
      setCloudLoading(true);
      setPageLoading(true);
      const { data, error } = await supabaseClient.from("team_state").select("data").eq("id", "main").single();
      if (error) throw error;
      if (data?.data) {
        applyTeamPayload(data.data);
        setCloudStatus("已加载");
        setCloudError("");
      }
    } catch (e) {
      setCloudStatus("加载失败");
      setCloudError(e.message || "未知错误");
    } finally {
      setCloudLoading(false);
      setPageLoading(false);
      setCloudReady(true);
    }
  };

  /* ===== 启动和跨设备刷新时加载云端最新数据 ===== */
  useEffect(() => {
    loadCloudData();
  }, []);

  useEffect(() => {
    const refreshForVisitor = () => {
      if (!isAdmin && document.visibilityState === "visible") {
        loadCloudData();
      }
    };

    document.addEventListener("visibilitychange", refreshForVisitor);
    return () => document.removeEventListener("visibilitychange", refreshForVisitor);
  }, [isAdmin]);

  /* ===== 云端自动保存 (900ms 防抖) ===== */
  useEffect(() => {
    if (!isAdmin || !cloudReady) return;
    const timer = setTimeout(() => {
      upsertCloudData();
    }, 900);
    return () => clearTimeout(timer);
  }, [players, coaches, clubInfo, teamMatches, manualAwards, nextMatch, contentEdits, isAdmin, cloudReady]);

  /* ===== computed 数据 ===== */
  const seasonOptions = useMemo(() => {
    const seasons = new Set();
    teamMatches.forEach((m) => { if (m.date) seasons.add(getSeasonKey(m.date)); });
    players.forEach((p) => {
      (p.matches || []).forEach((m) => { if (m.date) seasons.add(getSeasonKey(m.date)); });
    });
    return Array.from(seasons).sort().reverse();
  }, [teamMatches, players]);

  const [selectedSeason, setSelectedSeason] = useState("全部赛季");

  const filteredTeamMatches = useMemo(() => {
    if (selectedSeason === "全部赛季") return teamMatches;
    return teamMatches.filter((m) => getSeasonKey(m.date) === selectedSeason);
  }, [teamMatches, selectedSeason]);

  const filteredPlayers = useMemo(() => {
    if (selectedSeason === "全部赛季") return players;
    return players.map((p) => {
      const filteredMatches = (p.matches || []).filter((m) => getSeasonKey(m.date) === selectedSeason);
      return { ...p, matches: filteredMatches };
    });
  }, [players, selectedSeason]);

  const teamStats = useMemo(() => {
    return filteredTeamMatches.reduce(
      (stats, m) => {
        stats.matches++;
        if (getTeamMatchResult(m) === "win") stats.wins++;
        if (getTeamMatchResult(m) === "draw") stats.draws++;
        if (getTeamMatchResult(m) === "loss") stats.losses++;
        stats.goals += Number(m.ourScore || 0);
        return stats;
      },
      { matches: 0, wins: 0, draws: 0, losses: 0, goals: 0, players: players.length, playerRecords: players.reduce((sum, p) => sum + (p.matches?.length || 0), 0) }
    );
  }, [filteredTeamMatches, players]);

  const ranking = useMemo(() => {
    return players
      .map((p) => ({ ...p, avgRating: averageRating(p.matches || []), status: getStatus(averageRating(p.matches || [])) }))
      .filter((p) => p.avgRating !== "-")
      .sort((a, b) => Number(b.avgRating) - Number(a.avgRating) || b.ability - a.ability);
  }, [players]);

  const mvp = useMemo(() => {
    const qualified = ranking.filter((p) => (p.matches?.length || 0) >= 2);
    return qualified.length ? qualified[0] : ranking[0] || null;
  }, [ranking]);

  const featuredPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.ability - a.ability).slice(0, 4);
  }, [players]);

  const awardStats = useMemo(() => {
    const topScorer = [...players].sort((a, b) => totalStat(b.matches || [], "goals") - totalStat(a.matches || [], "goals"));
    const assistKing = [...players].sort((a, b) => totalStat(b.matches || [], "assists") - totalStat(a.matches || [], "assists"));
    const bestDefender = [...players].sort((a, b) => (b.attributes?.防守 || 0) - (a.attributes?.防守 || 0));
    const coachRanking = coaches
      .map((c) => {
        const totalMatches = (c.matches || []).length;
        const record = countResults(c.matches || []);
        const winRate = totalMatches > 0 ? ((record.wins / totalMatches) * 100).toFixed(0) + "%" : "-";
        return { ...c, totalMatches, winRateText: winRate };
      })
      .sort((a, b) => b.totalMatches - a.totalMatches);

    return {
      topScorer: topScorer.length && totalStat(topScorer[0].matches || [], "goals") > 0 ? topScorer[0] : null,
      assistKing: assistKing.length && totalStat(assistKing[0].matches || [], "assists") > 0 ? assistKing[0] : null,
      bestDefender: bestDefender.length ? bestDefender[0] : null,
      coachRanking,
    };
  }, [players, coaches]);

  const bestLineup = useMemo(() => {
    const fw = [...players.filter((p) => p.category === "前场")].sort((a, b) => b.ability - a.ability).slice(0, 3);
    const mf = [...players.filter((p) => p.category === "中场")].sort((a, b) => b.ability - a.ability).slice(0, 3);
    const df = [...players.filter((p) => p.category === "后卫")].sort((a, b) => b.ability - a.ability).slice(0, 4);
    return { 前场: fw, 中场: mf, 后卫: df };
  }, [players]);

  const latestTeamMatch = useMemo(() => {
    return filteredTeamMatches.length ? filteredTeamMatches[filteredTeamMatches.length - 1] : null;
  }, [filteredTeamMatches]);

  const selectedPlayer = useMemo(() => findPlayerByName(players, selectedName), [players, selectedName]);
  const selectedCoach = useMemo(() => coaches.find((c) => c.name === selectedCoachName) || coaches[0], [coaches, selectedCoachName]);

  /* ===== 权限检查 ===== */
  const requireAdmin = () => {
    if (!isAdmin) {
      setPageError("当前为访客模式，需要管理员权限才能操作。请先登录。");
      return false;
    }
    setPageError("");
    return true;
  };

  const updatePlayerByName = (playerName, updater) => {
    setPlayers((old) =>
      old.map((player) =>
        player.name === playerName
          ? typeof updater === "function"
            ? updater(player)
            : { ...player, ...updater }
          : player
      )
    );
  };

  const handleUploadPlayerFormPhoto = async (file) => {
    if (!requireAdmin()) return;

    try {
      setPageLoading(true);
      const url = await uploadPlayerImage(file, "players", playerForm.name || "new-player");
      setPlayerForm((prev) => ({ ...prev, photo: url }));
      setPageError("");
    } catch (e) {
      setPageError("上传证件照失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleUploadPlayerFormCard = async (file) => {
    if (!requireAdmin()) return;

    try {
      setPageLoading(true);
      const url = await uploadPlayerImage(file, "cards", playerForm.name || "new-player");
      setPlayerForm((prev) => ({ ...prev, cardImage: url }));
      setPageError("");
    } catch (e) {
      setPageError("上传球星卡失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleDeletePlayerFormPhoto = async () => {
    if (!requireAdmin()) return;

    try {
      setPageLoading(true);
      if (playerForm.photo) await deletePlayerImageByUrl(playerForm.photo);
      setPlayerForm((prev) => ({ ...prev, photo: "" }));
      setPageError("");
    } catch (e) {
      setPageError("删除证件照失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleDeletePlayerFormCard = async () => {
    if (!requireAdmin()) return;

    try {
      setPageLoading(true);
      if (playerForm.cardImage) await deletePlayerImageByUrl(playerForm.cardImage);
      setPlayerForm((prev) => ({ ...prev, cardImage: "" }));
      setPageError("");
    } catch (e) {
      setPageError("删除球星卡失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleUploadSelectedPlayerPhoto = async (file) => {
    if (!requireAdmin() || !selectedPlayer) return;

    try {
      setPageLoading(true);
      const url = await uploadPlayerImage(file, "players", selectedPlayer.name);
      updatePlayerByName(selectedPlayer.name, { photo: url });
      setPageError("");
    } catch (e) {
      setPageError("更新证件照失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleUploadSelectedPlayerCard = async (file) => {
    if (!requireAdmin() || !selectedPlayer) return;

    try {
      setPageLoading(true);
      const url = await uploadPlayerImage(file, "cards", selectedPlayer.name);
      updatePlayerByName(selectedPlayer.name, { cardImage: url });
      setPageError("");
    } catch (e) {
      setPageError("更新球星卡失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleDeleteSelectedPlayerPhoto = async () => {
    if (!requireAdmin() || !selectedPlayer) return;

    try {
      setPageLoading(true);
      if (selectedPlayer.photo) await deletePlayerImageByUrl(selectedPlayer.photo);
      updatePlayerByName(selectedPlayer.name, { photo: "" });
      setPageError("");
    } catch (e) {
      setPageError("删除证件照失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleDeleteSelectedPlayerCard = async () => {
    if (!requireAdmin() || !selectedPlayer) return;

    try {
      setPageLoading(true);
      if (selectedPlayer.cardImage) await deletePlayerImageByUrl(selectedPlayer.cardImage);
      updatePlayerByName(selectedPlayer.name, { cardImage: "" });
      setPageError("");
    } catch (e) {
      setPageError("删除球星卡失败：" + (e.message || "未知错误"));
    } finally {
      setPageLoading(false);
    }
  };

  const handleUpdateSelectedPlayerField = (key, value) => {
    if (!requireAdmin() || !selectedPlayer) return;
    updatePlayerByName(selectedPlayer.name, { [key]: value });
  };

  const handleUpdateSelectedPlayerAttributes = (nextAttributes) => {
    if (!requireAdmin() || !selectedPlayer) return;
    updatePlayerByName(selectedPlayer.name, {
      attributes: {
        ...(selectedPlayer.attributes || {}),
        ...nextAttributes,
      },
    });
  };

  /* ===== 球员操作 ===== */
  const updateSelectedPlayerAttribute = (key, value) => {
    if (!requireAdmin()) return;
    setPlayers((old) =>
      old.map((player) =>
        player.name === selectedName
          ? { ...player, attributes: { ...player.attributes, [key]: clampAbility(value) } }
          : player
      )
    );
  };

  const updateSelectedPlayerCore = (key, value) => {
    if (!requireAdmin()) return;
    setPlayers((old) =>
      old.map((player) =>
        player.name === selectedName ? { ...player, [key]: clampAbility(value) } : player
      )
    );
  };

  const addPlayer = () => {
    if (!requireAdmin()) return;
    try {
      if (!playerForm.name.trim()) {
        setPageError("请填写球员姓名");
        return;
      }
      if (!playerForm.number.trim()) {
        setPageError("请填写球员号码");
        return;
      }
      if (!playerForm.position.trim()) {
        setPageError("请填写球员位置");
        return;
      }
      const existing = players.find((p) => p.name === playerForm.name.trim());
      if (existing) {
        setPageError("该球员已存在");
        return;
      }

      const newPlayer = {
        name: playerForm.name.trim(),
        number: playerForm.number.trim(),
        category: playerForm.category,
        position: playerForm.position.trim(),
        role: playerForm.role.trim() || "未分配",
        ability: clampAbility(playerForm.ability || 65),
        potential: clampAbility(playerForm.potential || 70),
        attributes: {
          速度: 60,
          射门: 60,
          盘带: 60,
          传球: 60,
          防守: 60,
          体能: 60,
        },
        tags: playerForm.tags ? playerForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        summary: playerForm.summary || "暂无简介",
        suggestions: playerForm.suggestions ? playerForm.suggestions.split(",").map((t) => t.trim()).filter(Boolean) : [],
        photo: playerForm.photo || "",
        cardImage: playerForm.cardImage || "",
        matches: [],
      };

      setPlayers((old) => [...old, newPlayer]);
      setPlayerForm({
        name: "",
        number: "",
        category: "前场",
        position: "",
        role: "",
        ability: "65",
        potential: "70",
        tags: "",
        summary: "",
        suggestions: "",
        photo: "",
        cardImage: "",
      });
      setPageError("");
    } catch (e) {
      setPageError("添加球员失败：" + (e.message || "未知错误"));
    }
  };

  const addMatchRecord = () => {
    if (!requireAdmin()) return;
    try {
      if (!matchForm.date || !matchForm.opponent || !matchForm.rating) {
        setPageError("请至少填写日期、对手和评分");
        return;
      }
      if (!matchForm.result) {
        setPageError("请选择比赛结果");
        return;
      }

      const newMatch = {
        date: matchForm.date,
        opponent: matchForm.opponent,
        result: matchForm.result,
        goals: Number(matchForm.goals || 0),
        assists: Number(matchForm.assists || 0),
        rating: Number(matchForm.rating),
        note: matchForm.note || "暂无备注",
        isMarked: Boolean(matchForm.isMarked),
        abilityChange: 0,
        abilityAfterMatch: 0,
      };

      setPlayers((old) =>
        old.map((player) => {
          if (player.name !== selectedName) return player;
          const updated = { ...player, matches: [...(player.matches || []), newMatch] };
          return recalculatePlayerAfterMatches(updated);
        })
      );

      setMatchForm({ date: "", opponent: "", result: "", goals: "", assists: "", rating: "", note: "", isMarked: false });
      setPageError("");
    } catch (e) {
      setPageError("添加比赛记录失败：" + (e.message || "未知错误"));
    }
  };

  const addTeamMatch = () => {
    if (!requireAdmin()) return;
    try {
      if (!teamMatchForm.date || !teamMatchForm.opponent) {
        setPageError("请至少填写日期和对手");
        return;
      }

      const newMatch = {
        id: Date.now(),
        date: teamMatchForm.date,
        opponent: teamMatchForm.opponent,
        stadium: teamMatchForm.stadium || clubInfo.homeGround,
        homeKit: teamMatchForm.homeKit || clubInfo.homeKit,
        awayKit: teamMatchForm.awayKit || "",
        ourScore: Number(teamMatchForm.ourScore || 0),
        opponentScore: Number(teamMatchForm.opponentScore || 0),
        scorers: teamMatchForm.scorers ? teamMatchForm.scorers.split(",").map((s) => s.trim()).filter(Boolean) : [],
        assists: teamMatchForm.assists ? teamMatchForm.assists.split(",").map((s) => s.trim()).filter(Boolean) : [],
        bestPlayer: teamMatchForm.bestPlayer || "",
        note: teamMatchForm.note || "",
        matchAwards: {},
      };

      setTeamMatches((old) => [...old, newMatch]);
      setTeamMatchForm({ date: "", opponent: "", stadium: "", homeKit: "", awayKit: "", ourScore: "", opponentScore: "", scorers: "", assists: "", bestPlayer: "", note: "" });
      setPageError("");
    } catch (e) {
      setPageError("添加比赛失败：" + (e.message || "未知错误"));
    }
  };

  const updatePlayerMatchRecord = (playerName, index, updatedMatch) => {
    if (!requireAdmin()) return;
    setPlayers((old) =>
      old.map((player) => {
        if (player.name !== playerName) return player;
        const newMatches = [...(player.matches || [])];
        newMatches[index] = updatedMatch;
        const updated = { ...player, matches: newMatches };
        return recalculatePlayerAfterMatches(updated);
      })
    );
  };

  const deletePlayerMatchRecord = (playerName, index) => {
    if (!requireAdmin()) return;
    setPlayers((old) =>
      old.map((player) => {
        if (player.name !== playerName) return player;
        const newMatches = (player.matches || []).filter((_, i) => i !== index);
        const updated = { ...player, matches: newMatches };
        return recalculatePlayerAfterMatches(updated);
      })
    );
  };

  const togglePlayerMatchMark = (playerName, index) => {
    if (!requireAdmin()) return;
    setPlayers((old) =>
      old.map((player) => {
        if (player.name !== playerName) return player;
        const newMatches = [...(player.matches || [])];
        newMatches[index] = { ...newMatches[index], isMarked: !newMatches[index].isMarked };
        return { ...player, matches: newMatches };
      })
    );
  };

  const addCoachMatchRecord = () => {
    if (!requireAdmin()) return;
    try {
      if (!coachMatchForm.date || !coachMatchForm.opponent || !coachMatchForm.result) {
        setPageError("请填写日期、对手和比赛结果");
        return;
      }
      const newMatch = {
        date: coachMatchForm.date,
        opponent: coachMatchForm.opponent,
        result: coachMatchForm.result,
        note: coachMatchForm.note || "",
        isMarked: Boolean(coachMatchForm.isMarked),
      };
      setCoaches((old) =>
        old.map((c) => (c.name === selectedCoachName ? { ...c, matches: [...(c.matches || []), newMatch] } : c))
      );
      setCoachMatchForm({ date: "", opponent: "", result: "", note: "", isMarked: false });
      setPageError("");
    } catch (e) {
      setPageError("添加执教记录失败：" + (e.message || "未知错误"));
    }
  };

  const toggleCoachMatchMark = (coachName, index) => {
    if (!requireAdmin()) return;
    setCoaches((old) =>
      old.map((c) => {
        if (c.name !== coachName) return c;
        const newMatches = [...(c.matches || [])];
        newMatches[index] = { ...newMatches[index], isMarked: !newMatches[index].isMarked };
        return { ...c, matches: newMatches };
      })
    );
  };

  const updateNextMatch = (key, value) => {
    setNextMatch((prev) => ({ ...prev, [key]: value }));
  };

  /* ===== 备份/恢复 ===== */
  const exportBackup = () => {
    try {
      const backup = buildTeamPayload();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
      a.href = url;
      a.download = `football_backup_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMessage("备份已导出，请妥善保存。");
    } catch (e) {
      setBackupMessage("导出失败：" + (e.message || "未知错误"));
    }
  };

  const importBackup = () => {
    try {
      if (!importText.trim()) {
        setBackupMessage("请粘贴备份内容后再导入。");
        return;
      }
      const data = JSON.parse(importText);
      if (!data.players && !data.coaches) {
        setBackupMessage("备份数据格式不正确。");
        return;
      }
      applyTeamPayload(data);
      setImportText("");
      setBackupMessage("数据导入成功！");
    } catch (e) {
      setBackupMessage("导入失败：" + (e.message || "JSON 格式错误"));
    }
  };

  const restoreLocalBackup = () => {
    try {
      const localPlayers = safeGetLocalStorage("fm_players", null);
      const localCoaches = safeGetLocalStorage("fm_coaches", null);
      const localClubInfo = safeGetLocalStorage("fm_clubInfo", null);
      const localTeamMatches = safeGetLocalStorage("fm_teamMatches", null);
      const localManualAwards = safeGetLocalStorage("fm_manualAwards", null);
      const localNextMatch = safeGetLocalStorage("fm_nextMatch", null);
      const localContentEdits = safeGetLocalStorage("fm_contentEdits", null);

      if (localPlayers) setPlayers(localPlayers);
      if (localCoaches) setCoaches(localCoaches);
      if (localClubInfo) setClubInfo(localClubInfo);
      if (localTeamMatches) setTeamMatches(localTeamMatches);
      if (localManualAwards) setManualAwards(localManualAwards);
      if (localNextMatch) setNextMatch(localNextMatch);
      if (localContentEdits) setContentEdits(localContentEdits);
      setBackupMessage("已从本地缓存恢复数据。");
    } catch (e) {
      setBackupMessage("恢复失败：" + (e.message || "未知错误"));
    }
  };

  const resetData = () => {
    if (!window.confirm("确认恢复初始数据？所有修改将被覆盖！")) return;
    setPlayers(initialPlayers);
    setCoaches(initialCoachData);
    setClubInfo(initialClubInfo);
    setTeamMatches([]);
    setManualAwards({ topScorer: "", assistKing: "", bestDefender: "", bestCoach: "" });
    setNextMatch({ opponent: "", date: "", time: "", stadium: "", type: "友谊赛", lineup: "", note: "" });
    setContentEdits({});
    setBackupMessage("已恢复初始数据。");
  };

  /* ===== 管理员登录 ===== */
  const handleAdminLogin = () => {
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginPassword("");
      setLoginError("");
    } else {
      setLoginError("密码错误，请重试。");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setShowLogin(false);
    setLoginPassword("");
  };

  /* ===== 页面渲染 ===== */
  const currentView = view;

  return (
    <ContentEditor
      enabled={isAdmin && contentEditMode}
      contentEdits={contentEdits}
      setContentEdits={setContentEdits}
    >
    <div className="fm-shell">
      <Navbar view={currentView} setView={setView} clubInfo={clubInfo} />

      <main className="fm-main">
        {/* 顶部栏 */}
        <header className="fm-topbar">
          <div>
            <h1>
              {currentView === "dashboard" && "球队官网首页"}
              {currentView === "club" && "球队介绍"}
              {currentView === "playerLibrary" && "球队名单"}
              {currentView === "players" && "球员详情"}
              {currentView === "teamMatches" && "比赛详情中心"}
              {currentView === "matches" && "个人比赛记录"}
              {currentView === "lineup" && "阵容推荐"}
              {currentView === "rankings" && "数据排行榜"}
              {currentView === "operations" && "球队运营中心"}
              {currentView === "awards" && "奖项系统"}
              {currentView === "coach" && "教练组"}
            </h1>
            <p>{clubInfo.name} | {clubInfo.slogan}</p>
          </div>
          <div className="top-actions">
            <span className={`mode-pill ${isAdmin ? "admin" : "visitor"}`}>
              {isAdmin ? "管理员" : "访客"}
            </span>
            {isAdmin && (
              <button
                className={`top-mini-btn ${contentEditMode ? "active" : ""}`}
                data-content-editor-ignore
                onClick={() => setContentEditMode((value) => !value)}
              >
                {contentEditMode ? "退出文字编辑" : "编辑页面文字"}
              </button>
            )}
            {seasonOptions.length > 0 && (
              <select
                className="season-select"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                <option value="全部赛季">全部赛季</option>
                {seasonOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
            <button
              className={`top-mini-btn ${cloudLoading ? "cloud-pill warn" : cloudStatus === "已同步" || cloudStatus === "已加载" ? "cloud-pill" : ""}`}
              onClick={async () => {
                try {
                  await upsertCloudData();
                } catch {
                  // 错误已在函数内处理
                }
              }}
              disabled={cloudLoading}
            >
              {cloudLoading ? "同步中..." : cloudStatus}
            </button>
            {isAdmin ? (
              <button className="top-mini-btn" onClick={handleAdminLogout}>退出管理</button>
            ) : (
              <button className="top-mini-btn active" onClick={() => setShowLogin(true)}>管理员登录</button>
            )}
          </div>
        </header>

        {/* 全局错误提示 */}
        {pageError && (
          <div className="global-error-bar" style={{
            margin: "0 14px",
            padding: "12px 16px",
            background: "rgba(255,107,107,0.12)",
            border: "1px solid rgba(255,107,107,0.3)",
            borderRadius: "12px",
            color: "var(--red)",
            fontWeight: 800,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{pageError}</span>
            <button className="small-ghost-btn" onClick={() => setPageError("")}>×</button>
          </div>
        )}

        {/* 加载状态 */}
        {pageLoading && <LoadingSpinner size="large" text="加载中..." />}

        {/* 登录弹窗 */}
        {showLogin && (
          <div className="login-modal-backdrop" onClick={() => setShowLogin(false)}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <div className="login-modal-head">
                <div>
                  <h2>管理员登录</h2>
                  <p>输入密码后登录管理员模式，可编辑所有数据。</p>
                </div>
                <button className="login-close-btn" onClick={() => setShowLogin(false)}>×</button>
              </div>
              <label className="login-label">管理员密码</label>
              <input
                type="password"
                placeholder="请输入密码"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
                autoFocus
              />
              {loginError && <div className="login-error">{loginError}</div>}
              <div className="login-action-row">
                <button className="small-ghost-btn" onClick={() => setShowLogin(false)}>取消</button>
                <button className="primary-btn" onClick={handleAdminLogin}>登录</button>
              </div>
              <div className="login-tip">
                <small>提示：默认密码为 football2026。登录后所有操作会获得管理员权限，数据修改会自动同步到云端。</small>
              </div>
            </div>
          </div>
        )}

        {/* 页面路由 */}
        {currentView === "dashboard" && (
          <HomeShowcasePage
            clubInfo={clubInfo}
            teamStats={teamStats}
            latestTeamMatch={latestTeamMatch}
            featuredPlayers={featuredPlayers}
            ranking={ranking}
            mvp={mvp}
            nextMatch={nextMatch}
            setView={setView}
            setSelectedName={setSelectedName}
            setSelectedTeamMatchId={setSelectedTeamMatchId}
          />
        )}

        {currentView === "club" && (
          <ClubInfoPage clubInfo={clubInfo} setClubInfo={setClubInfo} isAdmin={isAdmin} />
        )}

        {currentView === "playerLibrary" && (
          <PlayerLibraryPage
            players={players}
            playerForm={playerForm}
            setPlayerForm={setPlayerForm}
            addPlayer={addPlayer}
            setSelectedName={setSelectedName}
            setView={setView}
            isAdmin={isAdmin}
            clubInfo={clubInfo}
            onUploadPhoto={handleUploadPlayerFormPhoto}
            onUploadCard={handleUploadPlayerFormCard}
            onDeletePhoto={handleDeletePlayerFormPhoto}
            onDeleteCard={handleDeletePlayerFormCard}
          />
        )}

        {currentView === "players" && selectedPlayer && (
          <div className="player-layout">
            {/* 左侧球员列表 */}
            <aside className="player-list">
              {categories.map((category) => (
                <div className="player-group" key={category}>
                  <h3>{category}</h3>
                  {players
                    .filter((p) => p.category === category)
                    .sort((a, b) => Number(a.number || 0) - Number(b.number || 0))
                    .map((player) => (
                      <button
                        key={player.name}
                        className={`player-row ${player.name === selectedName ? "active" : ""}`}
                        onClick={() => setSelectedName(player.name)}
                      >
                        <span>#{player.number}</span>
                        <strong>{player.name}</strong>
                        <small>{player.position} | 能力 {player.ability}</small>
                      </button>
                    ))}
                </div>
              ))}
            </aside>

            {/* 球员详情 */}
            <PlayerDetail
              player={selectedPlayer}
              clubInfo={clubInfo}
              awardStats={awardStats}
              onToggleMark={(index) => togglePlayerMatchMark(selectedPlayer.name, index)}
              onEdit={(match, index) => {
                setView("matches");
                // TODO: 传递编辑状态
              }}
              onDelete={(index) => deletePlayerMatchRecord(selectedPlayer.name, index)}
              editable={isAdmin}
              onAttributeUpdate={updateSelectedPlayerAttribute}
              onCoreUpdate={updateSelectedPlayerCore}
              isAdmin={isAdmin}
              onUploadPhoto={handleUploadSelectedPlayerPhoto}
              onUploadCard={handleUploadSelectedPlayerCard}
              onDeletePhoto={handleDeleteSelectedPlayerPhoto}
              onDeleteCard={handleDeleteSelectedPlayerCard}
              onUpdateField={handleUpdateSelectedPlayerField}
              onUpdateAttributes={handleUpdateSelectedPlayerAttributes}
            />
          </div>
        )}

        {currentView === "players" && !selectedPlayer && (
          <section className="dashboard-grid">
            <div className="panel wide">
              <EmptyState title="请选择球员" text="从左侧列表中选择一名球员查看详情。" icon="👤" />
            </div>
          </section>
        )}

        {currentView === "teamMatches" && (
          <TeamMatchesPage
            clubInfo={clubInfo}
            players={players}
            teamMatches={filteredTeamMatches}
            teamMatchForm={teamMatchForm}
            setTeamMatchForm={setTeamMatchForm}
            addTeamMatch={addTeamMatch}
            deleteTeamMatch={(id) => {
              if (!requireAdmin()) return;
              setTeamMatches((old) => old.filter((m) => m.id !== id));
            }}
            isAdmin={isAdmin}
            selectedTeamMatchId={selectedTeamMatchId}
            setSelectedTeamMatchId={setSelectedTeamMatchId}
            setSelectedName={setSelectedName}
            setView={setView}
          />
        )}

        {currentView === "matches" && selectedPlayer && (
          <PersonalMatchPage
            selectedPlayer={selectedPlayer}
            matchForm={matchForm}
            setMatchForm={setMatchForm}
            addMatchRecord={addMatchRecord}
            updatePlayerMatchRecord={updatePlayerMatchRecord}
            deletePlayerMatchRecord={deletePlayerMatchRecord}
            togglePlayerMatchMark={togglePlayerMatchMark}
            isAdmin={isAdmin}
          />
        )}

        {currentView === "matches" && !selectedPlayer && (
          <section className="dashboard-grid">
            <div className="panel wide">
              <EmptyState title="请先选择球员" text="在球队名单或球员详情中选择一名球员后再查看个人比赛记录。" icon="📊" />
            </div>
          </section>
        )}

        {currentView === "lineup" && (
          <LineupPage bestLineup={bestLineup} players={players} />
        )}

        {currentView === "rankings" && (
          <RankingsPage players={filteredPlayers} teamMatches={filteredTeamMatches} ranking={ranking} teamStats={teamStats} />
        )}

        {currentView === "operations" && (
          <OperationsPage
            clubInfo={clubInfo}
            nextMatch={nextMatch}
            updateNextMatch={updateNextMatch}
            teamMatches={teamMatches}
            players={players}
            isAdmin={isAdmin}
            exportBackup={exportBackup}
            importText={importText}
            setImportText={setImportText}
            importBackup={importBackup}
            restoreLocalBackup={restoreLocalBackup}
            backupMessage={backupMessage}
            setSelectedTeamMatchId={setSelectedTeamMatchId}
            setView={setView}
          />
        )}

        {currentView === "awards" && (
          <AwardsPage
            players={filteredPlayers}
            coaches={coaches}
            teamMatches={filteredTeamMatches}
            setTeamMatches={setTeamMatches}
            manualAwards={manualAwards}
            setManualAwards={setManualAwards}
            awardStats={awardStats}
            isAdmin={isAdmin}
          />
        )}

        {currentView === "coach" && (
          <CoachPage
            coaches={coaches}
            selectedCoach={selectedCoach}
            selectedCoachName={selectedCoachName}
            setSelectedCoachName={setSelectedCoachName}
            coachMatchForm={coachMatchForm}
            setCoachMatchForm={setCoachMatchForm}
            addCoachMatchRecord={addCoachMatchRecord}
            toggleCoachMatchMark={toggleCoachMatchMark}
            ranking={ranking}
            resetData={resetData}
            isAdmin={isAdmin}
          />
        )}

        {/* 高级功能入口 */}
        <div className="advanced-features-bar">
          <button 
            className="advanced-feature-btn" 
            onClick={() => setShowAdvancedStats(!showAdvancedStats)}
          >
            📊 {showAdvancedStats ? "隐藏" : "显示"}高级统计
          </button>
          <button 
            className="advanced-feature-btn" 
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
          >
            🤖 {showAIAnalysis ? "隐藏" : "显示"}AI分析
          </button>
          <button 
            className="advanced-feature-btn" 
            onClick={() => setShowWechatShare(!showWechatShare)}
          >
            📱 {showWechatShare ? "隐藏" : "显示"}微信分享
          </button>
        </div>

        {/* 高级统计组件 */}
        {showAdvancedStats && (
          <AdvancedStats
            players={filteredPlayers}
            teamMatches={filteredTeamMatches}
            coaches={coaches}
            clubInfo={clubInfo}
          />
        )}

        {/* AI分析组件 */}
        {showAIAnalysis && (
          <AIAnalysis
            players={filteredPlayers}
            onAnalysisComplete={(result) => {
              console.log('AI分析完成:', result);
            }}
          />
        )}

        {/* 微信分享组件 */}
        {showWechatShare && (
          <WechatShare
            title={`${clubInfo.name} - 足球球队管理`}
            desc={`查看${clubInfo.name}的球员数据、比赛记录和统计分析`}
            link={window.location.href}
            imgUrl="https://via.placeholder.com/300x300/4ECDC4/ffffff?text=足球球队"
            onShareSuccess={() => console.log('分享成功')}
            onShareError={(err) => console.error('分享失败:', err)}
          />
        )}
      </main>
    </div>
    </ContentEditor>
  );
}

export default App;
