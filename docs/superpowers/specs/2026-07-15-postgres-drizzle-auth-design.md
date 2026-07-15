# 离开 Supabase：直连 Postgres + Drizzle + 自建 Auth

**日期：** 2026-07-15  
**状态：** 待用户审阅后进入实现计划  
**范围：** 一次性切干净（方案 1）

## 1. 背景与目标

项目当前通过 **Supabase**（托管 Postgres + Auth + PostgREST 客户端 + RLS）运行。目标改为：

- 自建 / Docker 托管的 **PostgreSQL**
- **Drizzle ORM** 访问数据
- **自建邮箱密码登录** + 服务端 Session + HttpOnly Cookie
- **不迁移** 现有 Supabase 数据；新库 + seed 重建

成功标准：

1. 本地 `docker compose up -d` 起库后，`pnpm db:migrate` + `pnpm db:seed` 可初始化
2. 可用 seed 超管账号登录后台，权限中间件与菜单正常
3. 现有业务 API（用户/角色/菜单/主数据/订单/生产/财务/报表）不再依赖 `@nuxtjs/supabase`
4. 仓库中移除 Supabase 模块与相关环境变量；文档已更新

## 2. 非目标（第一期不做）

- 从旧 Supabase 导历史数据
- SMTP / 邮件找回密码（改为管理员重置密码）
- Supabase Realtime / Storage
- 保留双轨（Supabase + Postgres 并存）
- 换 MySQL 或其他数据库

## 3. 架构

```
浏览器
  └─ Nuxt 4 前端（Pinia、auth/permission 中间件）
       └─ Cookie: erp_session (HttpOnly, SameSite=Lax; 生产 Secure)
            └─ Nitro server/api
                 ├─ Auth：login / logout / me
                 ├─ assertPermission（权限码不变）
                 └─ Drizzle client → PostgreSQL（Docker Compose）
```

| 现在 | 之后 |
|------|------|
| `@nuxtjs/supabase` | 移除 |
| `auth.users` + `user_metadata` | 业务表 `users`（含 `password_hash`） |
| Supabase Session | 表 `sessions` + Cookie `erp_session` |
| `serverSupabaseServiceRole()` / `useSupabaseClient` | `server/utils/db.ts` Drizzle 单例 |
| Postgres RLS | 仅服务端 Session + `assertPermission`；API 不直暴露库 |

**保持不变：**

- 权限模型：`roles` / `menus` / `departments` / `users_role` / `roles_menu` + `permission` 字符串
- 页面 `definePageMeta({ permission })` 与全局权限中间件行为
- 业务模块边界（主数据、销采、生产、财务、报表）

## 4. 认证与会话

### 4.1 `users`

替代 `auth.users`。至少包含：

- `id` (uuid, PK)
- `email` (unique, not null)
- `password_hash` (not null)
- `name`, `username`, `phone`
- `department_id` (nullable FK → departments)
- `status`（与现有约定对齐，字符串如 `active` / `inactive`）
- `is_online`, `login_count`
- `created_at`, `updated_at`

密码哈希：`bcryptjs`（已有依赖）。

角色仍通过 `users_role` → `roles`；超管角色码保持 `super_admin`。

### 4.2 `sessions`

- `id`：足够长的随机 token（即 Cookie 值）
- `user_id` → `users.id`（级联删除）
- `expires_at`
- `created_at`
- 可选：`ip`, `user_agent`

会话时长：默认 **7 天**；登录可选择滑动续期（每次鉴权若剩余不足 1 天则延长到 7 天）。登出删除对应行并清空 Cookie。

### 4.3 Cookie

- 名称：`erp_session`
- 属性：`httpOnly`、`path=/`、`sameSite=lax`；`secure` 仅生产开启
- 不在 localStorage 存 token

### 4.4 HTTP API

| 方法路径 | 行为 |
|----------|------|
| `POST /api/auth/login` | body: `{ email, password }` → 校验 → 插入 session → Set-Cookie → 更新 `login_count` / `is_online` |
| `POST /api/auth/logout` | 删 session、清 Cookie、标记离线 |
| `GET /api/user`（保留现有 action 形态或收敛为 profile/permissions） | 由 Cookie 解析用户；无 session → 401 |

公开注册保持关闭。管理员 `POST /api/users` 创建用户并写入 `password_hash`；支持管理员重置密码（第一期替代「忘记密码」邮件流）。

### 4.5 前端

- `useAuth`：只调上述 API，删除 `supabase.auth.*`
- `auth.global.ts` / `permission.global.ts`：数据源改为 `/api/user`（或 `/api/auth/me`），白名单路由不变
- 删除或重定向 `/auth/callback`（无 magic link）
- `/login/forgot-password`：第一期改为提示「联系管理员重置」，或隐藏入口并改文档

### 4.6 Seed 超管

- 环境变量：`SEED_ADMIN_EMAIL`、`SEED_ADMIN_PASSWORD`（仅 seed 使用，不提交真实密码）
- seed 创建 `super_admin` 角色、全量菜单绑定、超管用户
- `.env.example` 写明示例值与「首次登录后立即改密」

## 5. 数据层与部署

### 5.1 Docker Compose

- 服务：`postgres:16`
- 端口：`5432`（可配置）
- volume 持久化
- 健康检查：`pg_isready`

### 5.2 环境变量（新）

| 变量 | 用途 |
|------|------|
| `DATABASE_URL` | Postgres 连接串 |
| `SESSION_SECRET` | 预留：若对 Cookie 做签名/加密时使用；最低要求用于生产随机串校验配置完整性 |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | 仅 seed |
| `NUXT_PUBLIC_SITE_URL` | 站点根地址（保留） |
| `NODE_ENV` | 环境 |

移除：`NUXT_PUBLIC_SUPABASE_*`、`NUXT_SUPABASE_SECRET_KEY`、`SUPABASE_SERVICE_KEY`。

### 5.3 Drizzle 布局

```
server/db/
  schema/          # 按域拆分或单文件 schema.ts
  index.ts         # drizzle(client, { schema })
  seed.ts
drizzle.config.ts
docker-compose.yml
```

- 开发命令（建议）：`pnpm db:up`、`pnpm db:migrate`、`pnpm db:seed`、`pnpm db:studio`（可选）
- Schema 来源：将 `supabase/migrations/*.sql` 中仍有效的表结构收敛进 Drizzle schema（以最近主数据/生产财务 migration + 权限域为准），旧的 RLS / `auth` 依赖语句丢弃
- `server/utils/db.ts`（或 `server/db/index.ts`）导出单例；所有 `server/api/**` 经此访问

### 5.4 API 改造原则

- `_utils/permissions.ts`、`crud.ts`、`inventory.ts`：Supabase query builder → Drizzle
- 对外 JSON 形状尽量不变，减少前端改动
- 事务：销采确认扣库存等路径用 Drizzle transaction
- 类型：以 Drizzle 推断类型替代过时的 `database.types.ts`（可删除或改为 re-export）

## 6. 实施顺序

1. **基础设施**：Compose、Drizzle、schema、migrate、seed  
2. **Auth**：login/logout/session 解析、中间件、`useAuth`  
3. **系统域 API**：users / roles / departments / menus  
4. **业务 API**：products…inventory、sales/purchase、production、finance、reports  
5. **清理**：移除 `@nuxtjs/supabase`、相关 composable/插件、旧 migration 中仅服务 Supabase 的脚本说明；更新 `docs/*`、`AGENTS.md`、`.env.example`  
6. **验证**：`pnpm type-check`、`pnpm lint`；登录 + 超管菜单 + 至少一条主数据 CRUD 冒烟

## 7. 风险与缓解

| 风险 | 缓解 |
|------|------|
| Vue/Nitro 中遗漏的 Supabase 调用 | 全局 ripgrep `supabase` / `useSupabase` 作为验收清单 |
| Schema 与旧 SQL 不一致 | 以「能跑通 seed + 业务 API」为准，不追求逐行复刻历史 migration |
| Session 固定/劫持 | HttpOnly Cookie、登出删行、可选绑定 user-agent 告警（第一期不做强制绑定） |
| 密码重置无自助 | 文档与 UI 明确「联系管理员」；管理员提供 reset 接口 |

## 8. 验收清单

- [ ] `docker compose up -d` 后 migrate + seed 成功
- [ ] seed 超管可登录，Cookie 存在且登出失效
- [ ] 无 `system:users` 权限不能建用户；公开注册仍关闭
- [ ] 角色菜单、权限中间件与超管绕过行为与现文档一致
- [ ] 主数据与订单 API 在无 Supabase 环境下可读写
- [ ] `package.json` 无 `@nuxtjs/supabase`；`nuxt.config` 无 supabase 模块
- [ ] `docs/AUTH.md`、`AGENTS.md`、`.env.example` 已改为 Postgres/Drizzle/Session 描述

## 9. 已拍板决策摘要

- 离开 Supabase，直连 Postgres  
- 自建邮箱密码  
- Drizzle ORM  
- 服务端 Session + HttpOnly Cookie  
- Docker Compose 提供本地库  
- 不迁旧数据，seed 重建  
- 第一期不做 SMTP 找回密码  
