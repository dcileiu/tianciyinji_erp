# 文档索引

本目录描述**当前代码真实状态**，不以 README 中的完成度宣传为准。

> **分支**：当前文档对应 **`master`（Supabase）**。若不想用 Supabase，请切到 **`dev-Postgres`**（直连 Postgres + Drizzle + Session），并阅读该分支下的 `docs/` 与 `README.md`。

## 现状一览

| 领域 | 状态 |
|------|------|
| 认证（Supabase Auth） | 已落地：登录 / 邮件回调 / 找回密码；**公开注册已关闭** |
| 权限与组织 | 已落地：用户、角色、部门、菜单 + 路由/组件/API 校验 |
| 主数据与订单 | 产品/客户/供应商/仓库/库存/销采订单；确认订单自动扣/加库存 |
| 生产 / 财务 / 报表 | 车间计划工单 BOM、应收应付收付发票、聚合报表（需执行迁移） |

技术栈：Nuxt 4 + Vue 3 + Supabase + Pinia + shadcn-vue + Tailwind。

## 文档列表

| 文档 | 说明 |
|------|------|
| [AUTH.md](./AUTH.md) | 认证流程、环境变量、页面与中间件 |
| [PERMISSIONS.md](./PERMISSIONS.md) | 权限模型、检查点、API、已知问题 |
| [ROADMAP.md](./ROADMAP.md) | 后续开发优先级与建议 |

## 快速开始（开发）

1. 复制 `.env.example` 为 `.env` / `.env.development`，填入 Supabase 配置
2. `pnpm install` → `pnpm dev`
3. 在 Supabase 执行 `supabase/migrations/complete_system_init.sql`（或使用 `/db-init`）
4. 按需执行 `scripts/assign-admin-permissions.sql` 为超级管理员挂菜单

敏感文件 `.env*` 已加入 `.gitignore`；提交仓库请使用 `.env.example`。
