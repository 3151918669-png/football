-- 在 Supabase Dashboard > SQL Editor 中执行一次。
-- 创建公开图片 bucket，并允许网站使用 anon key 上传、更新和删除图片。

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'player-photos',
  'player-photos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read player photos" on storage.objects;
create policy "Public read player photos"
on storage.objects for select
using (bucket_id = 'player-photos');

drop policy if exists "Public upload player photos" on storage.objects;
create policy "Public upload player photos"
on storage.objects for insert
with check (bucket_id = 'player-photos');

drop policy if exists "Public update player photos" on storage.objects;
create policy "Public update player photos"
on storage.objects for update
using (bucket_id = 'player-photos')
with check (bucket_id = 'player-photos');

drop policy if exists "Public delete player photos" on storage.objects;
create policy "Public delete player photos"
on storage.objects for delete
using (bucket_id = 'player-photos');
