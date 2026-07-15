# 开发路线图

本文档基于**当前仓库实现**。优先级可按业务需要调整。

## 已完成（可维护基线）

- [x] 自建 Session 认证：邮箱密码登录 / 登出（HttpOnly Cookie）
- [x] Docker Postgres + Drizzle Schema / seed
- [x] 全局认证中间件 + 路由级权限中间件
- [x] 用户 / 角色 / 部门 / 菜单：服务端 API + 管理页
- [x] 权限 Store、PermissionGuard、`v-permission`
- [x] 侧栏按权限菜单渲染
- [x] 主数据、订单、生产、财务、报表 API（Drizzle）
- [x] `.env.example`；`.env*` / `.nuxt` 已忽略

## P0 — 稳定性与安全

| 项 | 说明 |
|----|------|
| ~~统一 `roles.status`~~ | 已修：`isRoleActive` + 角色 API 规范化 |
| ~~菜单 API 化~~ | 已新增 `/api/menus`、`/api/roles/:id/menus` |
| Session / 密钥 | 生产务必更换 `SESSION_SECRET`；Cookie 仅 HTTPS 传输 |
| SMTP 找回密码 | 第一期不做；管理员重置密码 |

## P1 — 主数据与核心单据

- [x] 主数据表 + API：产品 / 客户 / 供应商 / 仓库
- [x] 库存 upsert API + 页面
- [x] 销售订单 / 采购订单（含明细）API + 页面
- [x] `departments.status` 文本化与 API 归一化
- [x] 关闭公开注册
- [x] **订单确认自动库存**：销售 `confirmed/completed` 扣库存，采购入库；取消/删除回滚；需选择仓库
- [x] **生产**：车间 / 计划 / 工单 / BOM
- [x] **财务**：应收应付 / 收付款 / 发票
- [x] **报表**：总览 + 销售/采购/库存/生产聚合

Schema：`server/db/schema/`；历史 SQL：`docs/legacy-supabase/`。

## P2 — 体验与工程

- 报表与仪表盘接真实聚合（替换 `/dashboard` 调试信息与假图表）
- 清理或隔离开发页：`/auth-test`、`/status-test`、`/components-demo` 等
- 用户导入/导出；岗位 / 字典 / 资源 / 日志按需接库
- 根 `README.md` 完成度说明与真实实现对齐
- `database.types.ts` 逐步改为 Drizzle 推断类型

## 当前 API 清单（事实）

| 方法/路径 | 用途 |
|-----------|------|
| `POST /api/auth/login` | 登录，写 Session Cookie |
| `POST /api/auth/logout` | 登出，清 Session |
| `GET /api/user?action=profile\|permissions\|menus` | 当前用户 |
| `CRUD /api/users` | 用户管理 |
| `CRUD /api/roles` | 角色管理（禁止自造 `super_admin`） |
| `GET/PUT /api/roles/:id/menus` | 角色菜单授权 |
| `CRUD /api/menus` | 菜单管理 |
| `CRUD /api/departments` | 部门管理（status: active/inactive） |
| `CRUD /api/products` | 产品主数据 |
| `CRUD /api/customers` | 客户主数据 |
| `CRUD /api/suppliers` | 供应商主数据 |
| `CRUD /api/warehouses` | 仓库主数据 |
| `GET/POST /api/inventory` | 库存查询 / upsert |
| `CRUD /api/sales/orders` | 销售订单（含明细） |
| `CRUD /api/purchase/orders` | 采购订单（含明细） |
| `GET /api/debug/user-data` | 仅开发环境 + 需权限 |

## 不建议再做的方向

- 重新接入 Supabase Auth / RLS 双轨
- 在文档中继续宣称全模块「已完成」而未接库

## 相关文档

- [文档索引](./README.md)
- [认证指南](./AUTH.md)
- [权限系统](./PERMISSIONS.md)
