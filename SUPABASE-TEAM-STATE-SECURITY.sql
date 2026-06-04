-- 创建 Supabase Auth 管理员账号并确认邮箱登录正常后执行。
-- 访客只允许读取球队数据，登录管理员才允许写入。

alter table public.team_state enable row level security;

drop policy if exists "Public read team state" on public.team_state;
drop policy if exists "Public write team state" on public.team_state;
drop policy if exists "Allow anon read team state" on public.team_state;
drop policy if exists "Allow anon write team state" on public.team_state;
drop policy if exists "Authenticated write team state" on public.team_state;

create policy "Public read team state"
on public.team_state for select
to anon, authenticated
using (true);

create policy "Authenticated write team state"
on public.team_state for all
to authenticated
using (true)
with check (true);
