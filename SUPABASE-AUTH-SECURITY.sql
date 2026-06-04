-- 创建 Supabase Auth 管理员账号后执行。
-- 执行后访客仍可读取照片，但只有登录用户可以上传、替换和删除。

drop policy if exists "Allow anon upload player photos" on storage.objects;
drop policy if exists "Allow anon update player photos" on storage.objects;
drop policy if exists "Allow anon delete player photos" on storage.objects;
drop policy if exists "Public upload player photos" on storage.objects;
drop policy if exists "Public update player photos" on storage.objects;
drop policy if exists "Public delete player photos" on storage.objects;

create policy "Authenticated upload player photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'player-photos');

create policy "Authenticated update player photos"
on storage.objects for update
to authenticated
using (bucket_id = 'player-photos')
with check (bucket_id = 'player-photos');

create policy "Authenticated delete player photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'player-photos');
