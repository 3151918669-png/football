import React, { Suspense, lazy, useState, useEffect, useMemo } from "react";
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
import { LoadingSpinner, ErrorMessage, EmptyState } from "../components/LoadingSpinner";
import { supabaseClient } from "./supabaseClient";
import ContentEditor from "../components/ContentEditor";
import TrainingPage from "../components/TrainingPage";

const WechatShare = lazy(() => import("../components/WechatShare"));

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

const PLAYER_ROSTER_VERSION = "player-sheet-2026-v1";

const initialPlayers = [
  { rosterOrder: 1, name: "陆梓鑫", number: "3", category: "后卫", position: "后卫/LB", hometown: "江阴市延陵路", age: "23", dominantFoot: "左脚", shirtSize: "L" },
  { rosterOrder: 2, name: "谭嘉铭", number: "10", category: "前场", position: "前锋/ST\n前腰/CAM", hometown: "江阴徐霞客", age: "28", dominantFoot: "右脚", shirtSize: "L" },
  { rosterOrder: 3, name: "张力", number: "16", category: "前场", position: "前锋/LW", hometown: "江阴市澄江街道", age: "24", dominantFoot: "左脚", shirtSize: "L" },
  { rosterOrder: 4, name: "张冬晨", number: "8", category: "前场", position: "边锋/RW\n前腰/CAM", hometown: "江阴市云亭街道", age: "24", dominantFoot: "右脚", shirtSize: "XL" },
  { rosterOrder: 5, name: "苏锴昊", number: "1", category: "守门员", position: "门将", hometown: "江阴市澄江街道", age: "18", dominantFoot: "右脚", shirtSize: "3xl" },
  { rosterOrder: 6, name: "陈志昊", number: "76", category: "守门员", position: "门将", hometown: "江阴市澄江街道", age: "18", dominantFoot: "右脚", shirtSize: "Xl" },
  { rosterOrder: 7, name: "潘均毅", number: "7", category: "前场", position: "前锋/边锋/后卫", hometown: "江阴青阳镇", age: "24", dominantFoot: "左右脚", shirtSize: "L" },
  { rosterOrder: 8, name: "周杰", number: "21", category: "前场", position: "边锋", hometown: "江阴市青阳镇", age: "33", dominantFoot: "右脚", shirtSize: "L" },
  { rosterOrder: 9, name: "徐嘉浩", number: "20", category: "后卫", position: "后卫/中场", hometown: "暂住证   江阴市澄江街道", age: "18", dominantFoot: "右脚", shirtSize: "XL" },
  { rosterOrder: 10, name: "卞嘉铭", number: "6", category: "中场", position: "中场", hometown: "江阴市", age: "18", dominantFoot: "右脚", shirtSize: "2xl" },
  { rosterOrder: 11, name: "徐智洋", number: "19", category: "前场", position: "边锋", hometown: "江阴市华士镇", age: "18", dominantFoot: "右脚", shirtSize: "L" },
  { rosterOrder: 12, name: "章兮兮", number: "33", category: "中场", position: "后腰/前卫", hometown: "江阴市周庄镇", age: "22", dominantFoot: "右脚", shirtSize: "L" },
  { rosterOrder: 13, name: "贾玉乐", number: "9", category: "前场", position: "中锋", hometown: "", age: "25", dominantFoot: "左脚", shirtSize: "4xl" },
  { rosterOrder: 14, name: "戴天麒", number: "17", category: "中场", position: "中场", hometown: "江阴市", age: "18", dominantFoot: "右脚", shirtSize: "2xl" },
  { rosterOrder: 15, name: "赵俊楠", number: "77", category: "前场", position: "前锋", hometown: "江阴市", age: "17", dominantFoot: "右脚", shirtSize: "3xl" },
  { rosterOrder: 16, name: "徐煊哲", number: "36", category: "后卫", position: "后卫/中场", hometown: "江阴市澄江街道", age: "22", dominantFoot: "右脚", shirtSize: "L" },
  { rosterOrder: 17, name: "黄非凡", number: "88", category: "前场", position: "前腰/边锋", hometown: "江阴市青阳镇", age: "27", dominantFoot: "右脚", shirtSize: "xl" },
  { rosterOrder: 18, name: "李可炜", number: "92", category: "中场", position: "中场", hometown: "江阴市青阳镇", age: "27", dominantFoot: "左脚", shirtSize: "L" },
  { rosterOrder: 19, name: "沈宁", number: "22", category: "前场", position: "前锋／后腰", hometown: "江阴市澄江街道", age: "26", dominantFoot: "左脚", shirtSize: "XL" },
  { rosterOrder: 20, name: "何逸凡", number: "24", category: "后卫", position: "后卫", hometown: "江阴市澄江街道", age: "29", dominantFoot: "右脚", shirtSize: "XL" },
  { rosterOrder: 30, name: "麻伟华", number: "10", category: "", position: "", hometown: "", age: "", dominantFoot: "", shirtSize: "l" },
  { rosterOrder: 31, name: "吴俊", number: "13", category: "", position: "", hometown: "", age: "", dominantFoot: "", shirtSize: "2xl" },
  { rosterOrder: 32, name: "吴易玮", number: "11", category: "", position: "", hometown: "", age: "", dominantFoot: "", shirtSize: "l" },
].map((player) => ({ ...player, role: "", joinedAt: "", status: "", tags: [], summary: "", photo: "", cardImage: "", matches: [] }));

function migratePlayersTo2026Roster(cloudPlayers = []) {
  const existingByName = new Map(cloudPlayers.map((player) => [player.name, player]));
  return initialPlayers.map((player) => {
    const existing = existingByName.get(player.name);
    return {
      ...player,
      photo: existing?.photo || "",
      cardImage: existing?.cardImage || "",
      matches: Array.isArray(existing?.matches) ? existing.matches : [],
    };
  });
}

const initialCoachData = [
  { name: "陈教练", role: "主教练", roleKey: "head", focus: "战术体系搭建", desc: "执教10年，擅长4-3-3和3-5-2阵型。", initials: "陈教", matches: [] },
  { name: "王助教", role: "助理教练", roleKey: "assistant", focus: "体能和恢复训练", desc: "负责每日训练计划和球员体能管理。", initials: "王助", matches: [] },
  { name: "张指导", role: "技术顾问", roleKey: "advisor", focus: "技术动作指导", desc: "前职业球员，专注个人技术打磨。", initials: "张指", matches: [] },
];

const initialClubInfo = {
  name: "江特FC",
  shortName: "江特",
  city: "江阴",
  homeGround: "",
  homeKit: "",
  awayKit: "",
  slogan: "因热爱相聚，为球队而战！",
  description: "江特FC球队官网，记录球员、比赛与球队成长。",
  homeKitImage: "",
  awayKitImage: "",
  thirdKitImage: "",
};

function migrateClubInfo(storedClubInfo = {}) {
  const normalizedName = String(storedClubInfo.name || "").replace(/\s+/g, "");
  if (normalizedName && normalizedName !== "城市猎人FC") {
    return { ...initialClubInfo, ...storedClubInfo };
  }
  return {
    ...initialClubInfo,
    homeKitImage: storedClubInfo.homeKitImage || "",
    awayKitImage: storedClubInfo.awayKitImage || "",
    thirdKitImage: storedClubInfo.thirdKitImage || "",
  };
}

const categories = ["前场", "中场", "后卫", "守门员", ""];

/* ===== App 主组件 ===== */
function App() {
  // --- 数据状态 ---
  const [players, setPlayers] = useState(() => {
    const stored = safeGetLocalStorage("fm_players", initialPlayers);
    return localStorage.getItem("fm_playerRosterVersion") === PLAYER_ROSTER_VERSION
      ? stored
      : migratePlayersTo2026Roster(stored);
  });
  const [coaches, setCoaches] = useState(() => safeGetLocalStorage("fm_coaches", initialCoachData));
  const [clubInfo, setClubInfo] = useState(() => migrateClubInfo(safeGetLocalStorage("fm_clubInfo", initialClubInfo)));
  const [teamMatches, setTeamMatches] = useState(() => safeGetLocalStorage("fm_teamMatches", []));
  const [manualAwards, setManualAwards] = useState(() => safeGetLocalStorage("fm_manualAwards", { topScorer: "", assistKing: "", bestDefender: "", bestCoach: "" }));
  const [nextMatch, setNextMatch] = useState(() => safeGetLocalStorage("fm_nextMatch", { opponent: "", date: "", time: "", stadium: "", type: "友谊赛", lineup: "", note: "" }));
  const [contentEdits, setContentEdits] = useState(() => safeGetLocalStorage("fm_contentEdits", {}));
  const [tacticsPositions, setTacticsPositions] = useState(() => safeGetLocalStorage("fm_tacticsPositions", []));
  const [trainingSessions, setTrainingSessions] = useState(() => safeGetLocalStorage("fm_trainingSessions", []));

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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- 高级功能状态 ---
  const [showWechatShare, setShowWechatShare] = useState(false);
  const [contentEditMode, setContentEditMode] = useState(false);

  // --- 表单状态 ---
  const [playerForm, setPlayerForm] = useState({
    name: "",
    number: "",
    category: "",
    position: "",
    role: "",
    hometown: "",
    age: "",
    dominantFoot: "",
    shirtSize: "",
    joinedAt: "",
    status: "",
    tags: "",
    summary: "",
    photo: "",
    cardImage: "",
  });
  const [matchForm, setMatchForm] = useState({ date: "", opponent: "", result: "", goals: "", assists: "", rating: "", saves: "", conceded: "", cleanSheet: false, note: "", isMarked: false });
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
  useEffect(() => { localStorage.setItem("fm_playerRosterVersion", PLAYER_ROSTER_VERSION); }, []);
  useEffect(() => { safeSetLocalStorage("fm_coaches", coaches); }, [coaches]);
  useEffect(() => { safeSetLocalStorage("fm_clubInfo", clubInfo); }, [clubInfo]);
  useEffect(() => { safeSetLocalStorage("fm_teamMatches", teamMatches); }, [teamMatches]);
  useEffect(() => { safeSetLocalStorage("fm_manualAwards", manualAwards); }, [manualAwards]);
  useEffect(() => { safeSetLocalStorage("fm_nextMatch", nextMatch); }, [nextMatch]);
  useEffect(() => { safeSetLocalStorage("fm_contentEdits", contentEdits); }, [contentEdits]);
  useEffect(() => { safeSetLocalStorage("fm_tacticsPositions", tacticsPositions); }, [tacticsPositions]);
  useEffect(() => { safeSetLocalStorage("fm_trainingSessions", trainingSessions); }, [trainingSessions]);
  useEffect(() => { safeSetLocalStorage("fm_isAdmin", isAdmin); }, [isAdmin]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [view, selectedName]);

  /* ===== 云端：构建/应用数据载荷 ===== */
  const buildTeamPayload = () => {
    return { players, playerRosterVersion: PLAYER_ROSTER_VERSION, coaches, clubInfo, teamMatches, manualAwards, nextMatch, contentEdits, tacticsPositions, trainingSessions, savedAt: new Date().toISOString() };
  };

  const applyTeamPayload = (payload) => {
    try {
      if (payload.players) {
        setPlayers(payload.playerRosterVersion === PLAYER_ROSTER_VERSION ? payload.players : migratePlayersTo2026Roster(payload.players));
      }
      if (payload.coaches) setCoaches(payload.coaches);
      if (payload.clubInfo) setClubInfo(migrateClubInfo(payload.clubInfo));
      if (payload.teamMatches) setTeamMatches(payload.teamMatches);
      if (payload.manualAwards) setManualAwards(payload.manualAwards);
      if (payload.nextMatch) setNextMatch(payload.nextMatch);
      if (payload.contentEdits) setContentEdits(payload.contentEdits);
      if (payload.tacticsPositions) setTacticsPositions(payload.tacticsPositions);
      if (payload.trainingSessions) setTrainingSessions(payload.trainingSessions);
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
      const { data, error } = await supabaseClient.from("team_state").select("data").eq("id", "main").single();
      if (error) throw error;
      if (data?.data) {
        applyTeamPayload(data.data);
        setCloudStatus("已加载");
        setCloudError("");
      }
      setCloudReady(true);
    } catch (e) {
      setCloudStatus("加载失败");
      setCloudError(e.message || "未知错误");
      setCloudReady(false);
    } finally {
      setCloudLoading(false);
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
  }, [players, coaches, clubInfo, teamMatches, manualAwards, nextMatch, contentEdits, tacticsPositions, trainingSessions, isAdmin, cloudReady]);

  /* ===== Supabase Auth 会话 ===== */
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) setIsAdmin(true);
    });
    const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) setIsAdmin(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

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
      .sort((a, b) => Number(b.avgRating) - Number(a.avgRating) || (b.matches?.length || 0) - (a.matches?.length || 0));
  }, [players]);

  const mvp = useMemo(() => {
    const qualified = ranking.filter((p) => (p.matches?.length || 0) >= 2);
    return qualified.length ? qualified[0] : ranking[0] || null;
  }, [ranking]);

  const featuredPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => Number(Boolean(b.photo)) - Number(Boolean(a.photo)) || (b.matches?.length || 0) - (a.matches?.length || 0) || Number(a.rosterOrder || 999) - Number(b.rosterOrder || 999))
      .slice(0, 4);
  }, [players]);

  const awardStats = useMemo(() => {
    const topScorer = [...players].sort((a, b) => totalStat(b.matches || [], "goals") - totalStat(a.matches || [], "goals"));
    const assistKing = [...players].sort((a, b) => totalStat(b.matches || [], "assists") - totalStat(a.matches || [], "assists"));
    const bestDefender = players.filter((player) => player.category === "后卫").sort((a, b) => (b.matches?.length || 0) - (a.matches?.length || 0));
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
    const byAvailability = (a, b) => (b.matches?.length || 0) - (a.matches?.length || 0) || Number(a.rosterOrder || 999) - Number(b.rosterOrder || 999);
    const fw = [...players.filter((p) => p.category === "前场")].sort(byAvailability).slice(0, 3);
    const mf = [...players.filter((p) => p.category === "中场")].sort(byAvailability).slice(0, 3);
    const df = [...players.filter((p) => p.category === "后卫")].sort(byAvailability).slice(0, 4);
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
      throw e;
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
      throw e;
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
      throw e;
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
      throw e;
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
    const currentName = selectedPlayer.name;
    updatePlayerByName(currentName, { [key]: value });
    if (key === "name") setSelectedName(value);
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
        role: playerForm.role.trim(),
        hometown: playerForm.hometown.trim(),
        age: playerForm.age.trim(),
        dominantFoot: playerForm.dominantFoot.trim(),
        shirtSize: playerForm.shirtSize.trim(),
        joinedAt: playerForm.joinedAt,
        status: playerForm.status,
        tags: playerForm.tags ? playerForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        summary: playerForm.summary.trim(),
        photo: playerForm.photo || "",
        cardImage: playerForm.cardImage || "",
        matches: [],
      };

      setPlayers((old) => [...old, newPlayer]);
      setPlayerForm({
        name: "",
        number: "",
        category: "",
        position: "",
        role: "",
        hometown: "",
        age: "",
        dominantFoot: "",
        shirtSize: "",
        joinedAt: "",
        status: "",
        tags: "",
        summary: "",
        photo: "",
        cardImage: "",
      });
      setPageError("");
    } catch (e) {
      setPageError("添加球员失败：" + (e.message || "未知错误"));
    }
  };

  const importPlayers = (incomingPlayers) => {
    if (!requireAdmin()) return "请先登录管理员账号";
    const existingByName = new Map(players.map((player) => [player.name, player]));
    let added = 0;
    let updated = 0;
    const mergedIncoming = incomingPlayers.map((incoming, index) => {
      const existing = existingByName.get(incoming.name);
      if (existing) updated += 1;
      else added += 1;
      return {
        ...(existing || {}),
        ...incoming,
        rosterOrder: incoming.rosterOrder || existing?.rosterOrder || players.length + index + 1,
        photo: existing?.photo || incoming.photo || "",
        cardImage: existing?.cardImage || "",
        matches: existing?.matches || [],
      };
    });
    const incomingNames = new Set(mergedIncoming.map((player) => player.name));
    setPlayers((current) => [...current.filter((player) => !incomingNames.has(player.name)), ...mergedIncoming]);
    setPageError("");
    return `导入完成：新增 ${added} 人，更新 ${updated} 人`;
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
        saves: Number(matchForm.saves || 0),
        conceded: Number(matchForm.conceded || 0),
        cleanSheet: Boolean(matchForm.cleanSheet),
        note: matchForm.note || "暂无备注",
        isMarked: Boolean(matchForm.isMarked),
      };

      setPlayers((old) =>
        old.map((player) => {
          if (player.name !== selectedName) return player;
          return { ...player, matches: [...(player.matches || []), newMatch] };
        })
      );

      setMatchForm({ date: "", opponent: "", result: "", goals: "", assists: "", rating: "", saves: "", conceded: "", cleanSheet: false, note: "", isMarked: false });
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
        return { ...player, matches: newMatches };
      })
    );
  };

  const deletePlayerMatchRecord = (playerName, index) => {
    if (!requireAdmin()) return;
    setPlayers((old) =>
      old.map((player) => {
        if (player.name !== playerName) return player;
        const newMatches = (player.matches || []).filter((_, i) => i !== index);
        return { ...player, matches: newMatches };
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
      const localTacticsPositions = safeGetLocalStorage("fm_tacticsPositions", null);
      const localTrainingSessions = safeGetLocalStorage("fm_trainingSessions", null);

      if (localPlayers) setPlayers(localPlayers);
      if (localCoaches) setCoaches(localCoaches);
      if (localClubInfo) setClubInfo(localClubInfo);
      if (localTeamMatches) setTeamMatches(localTeamMatches);
      if (localManualAwards) setManualAwards(localManualAwards);
      if (localNextMatch) setNextMatch(localNextMatch);
      if (localContentEdits) setContentEdits(localContentEdits);
      if (localTacticsPositions) setTacticsPositions(localTacticsPositions);
      if (localTrainingSessions) setTrainingSessions(localTrainingSessions);
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
    setTacticsPositions([]);
    setTrainingSessions([]);
    setBackupMessage("已恢复初始数据。");
  };

  /* ===== 管理员登录 ===== */
  const handleAdminLogin = async () => {
    if (loginEmail.trim()) {
      setLoginError("");
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) {
        setLoginError("Supabase 登录失败：" + error.message);
        return;
      }
      setIsAdmin(true);
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      return;
    }

    if (loginPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginPassword("");
      setLoginError("");
    } else {
      setLoginError("密码错误，请重试。");
    }
  };

  const handleAdminLogout = async () => {
    await supabaseClient.auth.signOut();
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
              {currentView === "training" && "训练与考勤"}
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
              title={cloudError || (isAdmin ? "点击立即保存到云端" : "点击重新读取云端数据")}
              onClick={async () => {
                try {
                  if (isAdmin) {
                    await upsertCloudData();
                  } else {
                    await loadCloudData();
                  }
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

        {cloudError && (
          <div className="cloud-error-notice" role="status">
            <div>
              <strong>云端暂时无法连接</strong>
              <span>{isAdmin ? "当前修改尚未保存，请等待 Supabase 恢复后重试。" : "当前显示本机缓存，点击右侧按钮重新读取。"}</span>
            </div>
            <button onClick={isAdmin ? upsertCloudData : loadCloudData} disabled={cloudLoading}>
              {cloudLoading ? "连接中..." : isAdmin ? "重新保存" : "重新读取"}
            </button>
          </div>
        )}

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
              <label className="login-label">Supabase 管理员账户</label>
              <input
                type="email"
                placeholder="Supabase 管理员邮箱（推荐）"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="请输入管理员密码"
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
                <small>推荐使用 Supabase 管理员邮箱登录。邮箱留空时暂时兼容旧管理员密码。</small>
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
            recentTeamMatches={filteredTeamMatches.slice(-5)}
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
            onDeletePhoto={handleDeletePlayerFormPhoto}
            importPlayers={importPlayers}
          />
        )}

        {currentView === "players" && selectedPlayer && (
          <div className="player-layout">
            {/* 左侧球员列表 */}
            <aside className="player-list">
              {categories.map((category) => (
                <div className="player-group" key={category}>
                  <h3>{category || "未分组"}</h3>
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
                        <small>{player.position || "位置待补充"}</small>
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
              isAdmin={isAdmin}
              onUploadPhoto={handleUploadSelectedPlayerPhoto}
              onDeletePhoto={handleDeleteSelectedPlayerPhoto}
              onUpdateField={handleUpdateSelectedPlayerField}
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
          <LineupPage
            bestLineup={bestLineup}
            players={players}
            positions={tacticsPositions}
            setPositions={setTacticsPositions}
            isAdmin={isAdmin}
          />
        )}

        {currentView === "training" && (
          <TrainingPage players={players} sessions={trainingSessions} setSessions={setTrainingSessions} isAdmin={isAdmin} />
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
            onClick={() => setShowWechatShare(!showWechatShare)}
          >
            📱 {showWechatShare ? "隐藏" : "显示"}微信分享
          </button>
        </div>

        {/* 微信分享组件 */}
        {showWechatShare && (
          <Suspense fallback={<LoadingSpinner text="正在加载分享功能..." />}>
          <WechatShare
            title={`${clubInfo.name} - 足球球队管理`}
            desc={`查看${clubInfo.name}的球员数据、比赛记录和统计分析`}
            link={window.location.href}
            imgUrl="https://via.placeholder.com/300x300/4ECDC4/ffffff?text=足球球队"
            onShareSuccess={() => console.log('分享成功')}
            onShareError={(err) => console.error('分享失败:', err)}
          />
          </Suspense>
        )}
      </main>
    </div>
    </ContentEditor>
  );
}

export default App;
