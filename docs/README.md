# 文档索引

本目录描述**当前代码真实状态**，不以 README 中的完成度宣传为准。

## 现状一览

| 领域 | 状态 |
|------|------|
| 认证（Session Cookie） | 已落地：邮箱密码登录 / 登出；公开注册关闭；找回密码请管理员重置 |
| 权限与组织 | 已落地：用户、角色、部门、菜单 + 路由/组件/API 校验 |
| 主数据与订单 | 产品/客户/供应商/仓库/库存/销采订单；确认订单自动扣/加库存 |
| 生产 / 财务 / 报表 | 车间计划工单 BOM、应收应付收付发票、聚合报表 |

技术栈：Nuxt 4 + Vue 3 + **Postgres（Drizzle）** + Pinia + shadcn-vue + Tailwind。

## 文档列表

| 文档 | 说明 |
|------|------|
| [AUTH.md](./AUTH.md) | 认证流程、环境变量、页面与中间件 |
| [PERMISSIONS.md](./PERMISSIONS.md) | 权限模型、检查点、API、已知问题 |
| [ROADMAP.md](./ROADMAP.md) | 后续开发优先级与建议 |
| [legacy-supabase/](./legacy-supabase/) | 旧 Supabase SQL 归档（不参与运行） |

## 快速开始（开发）

1. 复制 `.env.example` 为 `.env`，填入 `DATABASE_URL` 等
2. `pnpm install`
3. `pnpm db:up && pnpm db:push && pnpm db:seed`
4. `pnpm dev`

敏感文件 `.env*` 已加入 `.gitignore`；提交仓库请使用 `.env.example`。
