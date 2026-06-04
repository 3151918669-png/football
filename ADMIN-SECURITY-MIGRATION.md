# 管理员安全迁移

网站已支持 Supabase Auth 邮箱登录，并暂时兼容旧管理员密码。

## 启用安全管理员模式

1. 在 Supabase Dashboard 打开 `Authentication > Users`。
2. 创建一个仅管理员使用的邮箱账户。
3. 在网站管理员登录弹窗中使用该邮箱和密码登录，确认可以进入管理模式并上传图片。
4. 在 Supabase SQL Editor 执行：
   - `SUPABASE-AUTH-SECURITY.sql`
   - `SUPABASE-TEAM-STATE-SECURITY.sql`
5. 在 Vercel 项目环境变量中删除 `VITE_ADMIN_PASSWORD`。

完成后：

- 访客只能读取球队数据和照片。
- 只有 Supabase 登录管理员可以修改球队数据、上传和删除照片。
- 战术板位置会跟随球队数据跨设备同步。

## Vercel 必需环境变量

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase anon key 可以用于浏览器客户端，但必须配合 RLS 策略限制写入权限。
