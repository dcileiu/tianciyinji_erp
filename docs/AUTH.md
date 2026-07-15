# 认证指南

基于 **Supabase Auth**，不自建 JWT。会话由 `@nuxtjs/supabase` 管理。

## 环境变量

与 `.env.example` 一致：

| 变量 | 用途 |
|------|------|
| `NUXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名公钥（前端可用） |
| `SUPABASE_SERVICE_KEY` | Service Role（仅服务端；`serverSupabaseServiceRole` 依赖） |
| `NUXT_PUBLIC_SITE_URL` | 站点根地址，用于注册/重置邮件回调（默认 `http://localhost:3000`） |
| `NODE_ENV` | 环境标记 |

配置入口：`nuxt.config.ts` 的 `runtimeConfig.public` 与 `supabase` 模块。

## 页面与路由

| 路径 | 文件 | 说明 |
|------|------|------|
| `/login` | `app/pages/login/index.vue` | 邮箱密码登录 |
| `/login/register` | `app/pages/login/register.vue` | 注册 |
| `/login/forgot-password` | `app/pages/login/forgot-password.vue` | 发送重置邮件 |
| `/login/reset-password` | `app/pages/login/reset-password.vue` | 设置新密码 |
| `/auth/callback` | `app/pages/auth/callback.vue` | 邮箱验证 / hash 会话回调 |

`nuxt.config.ts` 中 `supabase.redirectOptions`：

- `login`: `/login`
- `callback`: `/auth/callback`
- `exclude`: 注册、找回/重置密码、`/getting-started`、`/components-demo`、`/db-init` 等

## 流程

### 登录

1. `useAuth().login` → `supabase.auth.signInWithPassword`
2. 可选调用 `POST /api/auth/login`（更新 `user_metadata` 在线状态 / 登录次数）
3. `userStore.refreshUserData()` 拉取 profile 与权限
4. 再请求 `GET /api/user?action=permissions`；若权限数组为空，返回「请联系管理员」

### 注册

`supabase.auth.signUp`，`emailRedirectTo = {NUXT_PUBLIC_SITE_URL}/auth/callback`。

### 登出

1. `POST /api/auth/logout`（标记离线）
2. `signOut({ scope: 'local' | 'global' })`
3. 清空 Pinia store，跳转 `/login`

### 用户数据模型

- **无独立业务 users 表**：身份在 `auth.users`
- 扩展字段在 `user_metadata`（如 name、username、phone、department_id、status、is_online、login_count）
- 角色通过 `users_role` 关联 `roles`
- Profile：`GET /api/user?action=profile`（Service Role 读用户 + 角色 + 部门）

## 中间件与插件

| 文件 | 行为 |
|------|------|
| `app/middleware/auth.global.ts` | 公开路由白名单；未登录 → `/login`；已登录访问 `/` → `/dashboard` |
| `app/middleware/permission.global.ts` | 见 [PERMISSIONS.md](./PERMISSIONS.md) |
| `app/plugins/user-init.client.ts` | 客户端登录后并行拉取 profile / permissions |

公开路由（auth 中间件白名单）包括：

`/login`、`/login/register`、`/login/forgot-password`、`/login/reset-password`、`/auth/callback`、`/getting-started`、`/403`、`/404`、`/debug-permissions`

## 核心代码

| 路径 | 说明 |
|------|------|
| `app/composables/useAuth.ts` | 登录 / 注册 / 登出 / 重置密码封装 |
| `app/stores/user.ts` | 认证用户、profile、权限码、角色码 |
| `server/api/auth/login.post.ts` | 更新在线状态 |
| `server/api/auth/logout.post.ts` | 标记离线 |
| `server/api/user/index.ts` | `profile` / `permissions` / `menus` |

## 使用示例

```ts
const { login, logout, user, isLoading } = useAuth();

await login({ email: 'a@b.com', password: '...' });
await logout();
```

页面声明不需要登录：

```ts
definePageMeta({
  requiresAuth: false,
  layout: false,
});
```

## 相关文档

- [权限系统](./PERMISSIONS.md)
- [路线图](./ROADMAP.md)
