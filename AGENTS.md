# AGENTS.md

给 AI coding agent 的项目说明。人类文档见 `docs/`；本文件描述**如何改代码**。

## 项目概览

Nuxt 4 + Vue 3 + **Postgres（Drizzle）** + Pinia + shadcn-vue 的 ERP 后台。

- **已落地**：自建 Session 认证；用户 / 角色 / 部门 / 菜单与权限；主数据与业务 API（Drizzle）
- 包管理器：**pnpm**；本地库：`pnpm db:up && pnpm db:push && pnpm db:seed`

详细说明：

- `docs/README.md` — 索引与现状
- `docs/AUTH.md` — 认证
- `docs/PERMISSIONS.md` — 权限
- `docs/ROADMAP.md` — 优先级

## 常用命令

包管理器：**pnpm**（不要用 npm/yarn）。

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm build
pnpm type-check
pnpm lint                # ultracite check
pnpm format              # ultracite fix
pnpm check-all           # type-check + lint
```

## 环境变量

复制 `.env.example` → `.env` / `.env.development`。

| 变量 | 用途 |
|------|------|
| `DATABASE_URL` | Postgres 连接串 |
| `SESSION_SECRET` | Session 密钥 |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seed 超管 |
| `NUXT_PUBLIC_SITE_URL` | 站点根地址 |
| `NUXT_PUBLIC_SITE_URL` | 邮件回调基址 |

**禁止**提交 `.env`、`.env.*`（`.env.example` 除外）。`.nuxt`、`.output` 已忽略。

## 目录约定

```
app/                 # Nuxt 应用（pages / components / composables / middleware / stores）
server/api/          # Nitro API（users / roles / departments / auth / user）
server/db/           # Drizzle schema / seed
docs/                # 现状文档（含 docs/legacy-supabase 历史 SQL）
scripts/             # 运维脚本等
```

- UI 组件：`app/components/ui/`（shadcn-vue），业务组件放 `app/components/`
- 菜单 CRUD 走 `server/api/menus`；角色挂菜单走 `/api/roles/:id/menus`
- 主数据 / 订单走 `/api/products|customers|suppliers|warehouses|inventory|sales/orders|purchase/orders`
- 勿开放自助注册；用户由管理员创建
- 全局中间件：`app/middleware/auth.global.ts`、`permission.global.ts`
- 服务端权限：`server/api/_utils/permissions.ts` → `assertPermission`
- 勿在前端直写 `menus` / `roles_menu`（已改为服务端 API）

## 编码约定

- TypeScript + Vue 3 Composition API；优先 `<script setup lang="ts">`
- 遵循现有 Biome / Ultracite（`.cursor/rules/ultracite.mdc`）
- 权限页：`definePageMeta({ permission: 'module:action' })`
- 需要登录保护的 API：用 `assertPermission`；超管角色码为 `super_admin`
- `roles.status` 期望字符串 `'active' | 'inactive'`（代码里仍有数字 `1` 混用，改相关逻辑时一并统一）
- 不要引入 Supabase；认证用 Session Cookie + `users.password_hash`
- 数据访问走 `server/db`（Drizzle），勿在前端直连库

## 改功能时注意

1. **权限相关**：同步菜单种子 / `permission` 字符串、页面 `definePageMeta`、服务端 `assertPermission`
2. **新业务模块**：先加 migration + API + 再接页面；不要假装已有业务表
3. **文档**：行为或 API 变更时更新 `docs/` 对应文件
4. **验证**：相关改动至少跑 `pnpm type-check`；触及格式/质量时跑 `pnpm lint`

## 已知坑（勿重复踩）

- `assertPermission` 超管判断曾用 `status === 1`，权限查询用 `'active'` — 修权限时优先对齐
- 存在 `disable_rls_for_testing.sql`；生产勿默认关闭 RLS
- 多个 migration 种子权限字符串可能不一致；以 `complete_system_init.sql` 为主
- Composable 里可能引用尚不存在的业务表类型，接库前不要扩大这类假依赖
