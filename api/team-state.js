import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Uses the same public anon credentials and permissions as the existing website.
// No service-role key or write operations are used by this endpoint.
export function publicConfig() {
  let file = {};
  try {
    file = Object.fromEntries(readFileSync(join(process.cwd(), '.env'), 'utf8').split(/\r?\n/).filter(line=>/^VITE_SUPABASE_(URL|ANON_KEY)=/.test(line)).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
  } catch { /* Vercel environment variables take precedence. */ }
  return {
    url: process.env.VITE_SUPABASE_URL || file.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY || file.VITE_SUPABASE_ANON_KEY,
  };
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({error:'只支持读取球队数据'});
  const {url,key}=publicConfig();
  if(!url||!key)return res.status(503).json({error:'服务器缺少 Supabase 公开连接配置'});
  try {
    const upstream=await fetch(`${url}/rest/v1/team_state?id=eq.main&select=data,updated_at`,{headers:{apikey:key,Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(12000)});
    if(!upstream.ok)return res.status(502).json({error:`球队云端读取失败（${upstream.status}），请稍后重试`});
    const rows=await upstream.json(),row=rows?.[0];
    if(!row?.updated_at||!Array.isArray(row.data?.players)||!Array.isArray(row.data?.teamMatches))return res.status(502).json({error:'球队云端记录不完整，已停止读取和自动保存'});
    return res.status(200).json(row);
  }catch{return res.status(502).json({error:'服务器暂时无法连接球队云端，请稍后重试'});}
}
