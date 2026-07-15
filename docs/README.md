# 文档索引

本目录描述**当前代码真实状态**，不以 README 中的完成度宣传为准。

## 现状一览

| 领域 | 状态 |
|------|------|
| 认证（Supabase Auth） | 已落地：登录 / 注册 / 邮件回调 / 找回密码 |
| 权限与组织 | 已落地：用户、角色、部门、菜单 + 路由/组件/API 校验 |
| 业务 ERP 模块 | 多数为 UI 壳、本地 mock 或 ComingSoon，**未接业务库表** |
| 仪表盘 | `/dashboard` 偏调试信息；图表多为假数据 |

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
