import {publicConfig} from './team-state.js';

export default async function handler(req,res) {
  if(req.method!=='GET') return res.status(405).end();
  const path=req.query.path;
  // Fixed bucket/project: never proxy arbitrary remote URLs or private buckets.
  if(typeof path!=='string'||!path||path.length>1024||path.startsWith('/')||path.includes('\\')||path.split('/').some(p=>!p||p==='.'||p==='..')) return res.status(400).end();
  const {url,key}=publicConfig();
  if(!url||!key)return res.status(503).end();
  try {
    const encoded=path.split('/').map(encodeURIComponent).join('/');
    const upstream=await fetch(`${url}/storage/v1/object/public/player-photos/${encoded}`,{headers:{apikey:key},signal:AbortSignal.timeout(12000)});
    if(!upstream.ok)return res.status(upstream.status===404?404:502).end();
    const type=(upstream.headers.get('content-type')||'').split(';')[0];
    if(!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(type))return res.status(415).end();
    const bytes=Buffer.from(await upstream.arrayBuffer());
    if(bytes.length>20*1024*1024)return res.status(413).end();
    res.setHeader('Content-Type',type);
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','public, max-age=3600, s-maxage=86400');
    return res.status(200).send(bytes);
  }catch{return res.status(502).end();}
}
