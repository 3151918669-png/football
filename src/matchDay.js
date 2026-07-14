const EVENT_ORDER = {
  goal: 1,
  opponent_goal: 2,
  substitution: 3,
  yellow_card: 4,
  red_card: 5,
  injury: 6,
  key_moment: 7,
};

export const MATCH_EVENT_OPTIONS = [
  { value: "goal", label: "我方进球", playerLabel: "进球队员", relatedLabel: "助攻球员（可选）" },
  { value: "opponent_goal", label: "对方进球", playerLabel: "", relatedLabel: "" },
  { value: "substitution", label: "换人", playerLabel: "换下球员", relatedLabel: "换上球员" },
  { value: "yellow_card", label: "黄牌", playerLabel: "吃牌球员", relatedLabel: "" },
  { value: "red_card", label: "红牌", playerLabel: "吃牌球员", relatedLabel: "" },
  { value: "injury", label: "伤退", playerLabel: "球员", relatedLabel: "" },
  { value: "key_moment", label: "关键事件", playerLabel: "相关球员（可选）", relatedLabel: "" },
];

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeNameList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function removeOccurrences(values, namesToRemove) {
  const remaining = [...normalizeNameList(values)];
  namesToRemove.filter(Boolean).forEach((name) => {
    const index = remaining.indexOf(name);
    if (index >= 0) remaining.splice(index, 1);
  });
  return remaining;
}

function buildEventBase(match) {
  if (match.eventBase) {
    return {
      ourScore: numberOrZero(match.eventBase.ourScore),
      opponentScore: numberOrZero(match.eventBase.opponentScore),
      scorers: normalizeNameList(match.eventBase.scorers),
      assists: normalizeNameList(match.eventBase.assists),
    };
  }

  const existingEvents = Array.isArray(match.events) ? match.events : [];
  const existingGoalPlayers = existingEvents
    .filter((event) => event.type === "goal")
    .map((event) => event.player)
    .filter(Boolean);
  const existingAssistPlayers = existingEvents
    .filter((event) => event.type === "goal")
    .map((event) => event.relatedPlayer)
    .filter(Boolean);
  const existingOpponentGoals = existingEvents.filter((event) => event.type === "opponent_goal").length;

  return {
    ourScore: Math.max(0, numberOrZero(match.ourScore) - existingGoalPlayers.length),
    opponentScore: Math.max(0, numberOrZero(match.opponentScore) - existingOpponentGoals),
    scorers: removeOccurrences(match.scorers, existingGoalPlayers),
    assists: removeOccurrences(match.assists, existingAssistPlayers),
  };
}

export function sortMatchEvents(events = []) {
  return [...events].sort((left, right) => {
    const minuteDifference = numberOrZero(left.minute) - numberOrZero(right.minute);
    if (minuteDifference !== 0) return minuteDifference;
    const typeDifference = (EVENT_ORDER[left.type] || 99) - (EVENT_ORDER[right.type] || 99);
    if (typeDifference !== 0) return typeDifference;
    return String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
  });
}

export function deriveMatchFromEvents(match, nextEvents) {
  const events = sortMatchEvents(nextEvents);
  const eventBase = buildEventBase(match);
  const goalEvents = events.filter((event) => event.type === "goal");
  const opponentGoalEvents = events.filter((event) => event.type === "opponent_goal");
  const eventScorers = goalEvents.map((event) => event.player).filter(Boolean);
  const eventAssists = goalEvents.map((event) => event.relatedPlayer).filter(Boolean);

  return {
    ...match,
    events,
    eventBase,
    ourScore: eventBase.ourScore + goalEvents.length,
    opponentScore: eventBase.opponentScore + opponentGoalEvents.length,
    scorers: [...eventBase.scorers, ...eventScorers],
    assists: [...eventBase.assists, ...eventAssists],
  };
}

export function getMatchStatus(match) {
  return match?.status || "finished";
}

export function getMatchStatusLabel(match) {
  const status = getMatchStatus(match);
  if (status === "scheduled") return "赛前准备";
  if (status === "live") return "比赛进行中";
  return "比赛已结束";
}

export function getMatchEventLabel(type) {
  return MATCH_EVENT_OPTIONS.find((option) => option.value === type)?.label || "比赛事件";
}

function countNames(values = []) {
  return normalizeNameList(values).reduce((counts, name) => {
    counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});
}

function getResult(match) {
  const ourScore = numberOrZero(match.ourScore);
  const opponentScore = numberOrZero(match.opponentScore);
  if (ourScore > opponentScore) return "win";
  if (ourScore === opponentScore) return "draw";
  return "loss";
}

export function syncMatchToPlayerRecords(players, match) {
  const squad = match.squad || {};
  const starters = normalizeNameList(squad.starters);
  const starterNames = new Set(starters);
  const eventParticipants = (match.events || []).flatMap((event) => [event.player, event.relatedPlayer]).filter(Boolean);
  const substitutedPlayers = (match.events || [])
    .filter((event) => event.type === "substitution")
    .flatMap((event) => [event.player, event.relatedPlayer])
    .filter(Boolean);
  const participantNames = new Set([
    ...starters,
    ...eventParticipants,
    ...normalizeNameList(match.scorers),
    ...normalizeNameList(match.assists),
  ]);
  const knownPlayerNames = new Set(players.map((player) => player.name));
  const goalsByPlayer = countNames(match.scorers);
  const assistsByPlayer = countNames(match.assists);
  const designatedGoalkeeper = squad.goalkeeper || starters.find((name) => {
    const player = players.find((item) => item.name === name);
    return player?.category === "守门员" || String(player?.position || "").includes("门将");
  });

  return players.map((player) => {
    const matches = Array.isArray(player.matches) ? [...player.matches] : [];
    const linkedIndex = matches.findIndex((record) => String(record.teamMatchId || "") === String(match.id));
    const exactIndex = linkedIndex >= 0
      ? linkedIndex
      : matches.findIndex((record) => record.date === match.date && record.opponent === match.opponent);
    const isParticipant = participantNames.has(player.name) && knownPlayerNames.has(player.name);

    if (!isParticipant) {
      const filteredMatches = matches.filter((record) => !(
        String(record.teamMatchId || "") === String(match.id) && record.autoGenerated
      ));
      return filteredMatches.length === matches.length ? player : { ...player, matches: filteredMatches };
    }

    const existingRecord = exactIndex >= 0 ? matches[exactIndex] : null;
    const isGoalkeeper = player.name === designatedGoalkeeper;
    const nextRecord = {
      ...(existingRecord || {}),
      teamMatchId: match.id,
      autoGenerated: existingRecord ? Boolean(existingRecord.autoGenerated) : true,
      date: match.date,
      opponent: match.opponent,
      result: getResult(match),
      goals: goalsByPlayer[player.name] || 0,
      assists: assistsByPlayer[player.name] || 0,
      rating: existingRecord?.rating ?? "",
      note: existingRecord?.note || "由比赛日中心自动同步",
      isMarked: Boolean(existingRecord?.isMarked),
      appearance: starterNames.has(player.name) ? "首发" : substitutedPlayers.includes(player.name) ? "替补" : "出场",
    };

    if (isGoalkeeper) {
      nextRecord.conceded = numberOrZero(match.opponentScore);
      nextRecord.cleanSheet = numberOrZero(match.opponentScore) === 0;
      nextRecord.saves = numberOrZero(existingRecord?.saves);
    }

    if (exactIndex >= 0) matches[exactIndex] = nextRecord;
    else matches.push(nextRecord);
    return { ...player, matches };
  });
}

export function removeAutoMatchRecords(players, matchId) {
  return players.map((player) => ({
    ...player,
    matches: (player.matches || []).filter((record) => !(
      String(record.teamMatchId || "") === String(matchId) && record.autoGenerated
    )),
  }));
}
