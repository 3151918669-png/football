import { validatePayload } from "./clubData";

export async function readTeamState(client) {
  // The production origin relays public reads so expired browser auth sessions
  // and browser-to-Supabase connectivity cannot block the public club website.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    const response=await fetch('/api/team-state',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(16000)});
    const row=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(row?.error || `球队数据读取失败（${response.status}）`);
    validatePayload(row?.data);
    if(!row.updated_at)throw new Error('云端版本信息缺失，已阻止写入。');
    return row;
  }
  const { data, error } = await client
    .from("team_state")
    .select("data,updated_at")
    .eq("id", "main")
    .single();
  if (error) throw error;
  validatePayload(data?.data);
  if (!data.updated_at) throw new Error("云端版本信息缺失，已阻止写入。");
  return data;
}

export async function saveTeamState(
  client,
  payload,
  { isAdmin, ready, revision, readOnly },
) {
  if (!isAdmin || !ready || !revision || readOnly)
    throw new Error("云端未就绪或当前为只读模式，已阻止保存。");
  validatePayload(payload);
  const { data, error } = await client
    .from("team_state")
    .update({ data: payload, updated_at: new Date().toISOString() })
    .eq("id", "main")
    .eq("updated_at", revision)
    .select("updated_at");
  if (error) throw error;
  if (!data?.length)
    throw new Error(
      "云端已有新版本或当前账户没有写入权限。请导出本地备份，再重新读取云端。",
    );
  return data[0].updated_at;
}
