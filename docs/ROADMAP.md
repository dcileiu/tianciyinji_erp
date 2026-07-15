# 开发路线图

本文档基于**当前仓库实现**，替代旧版「自建 JWT / 完整 REST」规划。优先级可按业务需要调整。

## 已完成（可维护基线）

- [x] Supabase Auth：登录、注册、回调、找回/重置密码
- [x] 全局认证中间件 + 路由级权限中间件
- [x] 用户 / 角色 / 部门：服务端 API + 管理页
- [x] 菜单管理 + 角色挂菜单（客户端写库）
- [x] 权限 Store、PermissionGuard、`v-permission`
- [x] 侧栏按权限菜单渲染
- [x] 权限域 SQL 迁移与 `/db-init`
- [x] `.env.example`；`.env*` / `.nuxt` 已忽略

## P0 — 稳定性与安全

| 项 | 说明 |
|----|------|
| ~~统一 `roles.status`~~ | 已修：`isRoleActive` + 角色 API 规范化 |
| 生产 RLS | 仍建议在 Supabase 启用；应用层菜单写已走 Service Role API |
| ~~菜单 API 化~~ | 已新增 `/api/menus`、`/api/roles/:id/menus` |
| 密钥轮换 | 若历史曾提交过真实 `.env`，在 Supabase 控制台轮换 |

## P1 — 主数据与核心单据

- [x] 主数据表 + API：产品 / 客户 / 供应商 / 仓库
- [x] 库存 upsert API + 页面
- [x] 销售订单 / 采购订单（含明细）API + 页面
- [x] `departments.status` 文本化迁移与 API 归一化
- [x] 关闭公开注册
- [x] **订单确认自动库存**：销售 `confirmed/completed` 扣库存，采购入库；取消/删除回滚；需选择仓库
- [x] **生产**：车间 / 计划 / 工单 / BOM
- [x] **财务**：应收应付 / 收付款 / 发票
- [x] **报表**：总览 + 销售/采购/库存/生产聚合

迁移文件：

1. `20260715_master_data_and_orders.sql`
2. `20260715_production_finance_reports.sql`

## P2 — 生产与报表

- 生产计划 / 工单 / BOM / 车间
- 报表与仪表盘接真实聚合（替换 `/dashboard` 调试信息与假图表）
- 清理或隔离开发页：`/auth-test`、`/status-test`、`/components-demo` 等（生产构建可 exclude）

## P3 — 体验与工程

| 项 | 说明 |
|----|------|
| 用户导入/导出 | `system/users` 中仍为「开发中」toast |
| 岗位 / 字典 / 资源 / 日志 / 系统配置 | 现为 mock 或本地态，按需接库或砍掉入口 |
| 类型同步 | `database.types.ts` 与真实表对齐；去掉对不存在表的 composable 引用 |
| `server/api/README.md` | 与真实端点清单同步 |
| 根 `README.md` | 将「100% 完成」改为与本文一致的完成度说明（待单独改） |

## 当前 API 清单（事实）

| 方法/路径 | 用途 |
|-----------|------|
| `POST /api/auth/login` | 更新在线状态 |
| `POST /api/auth/logout` | 标记离线（合并 metadata） |
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

## 近期已加固

- 超管 `status` 判断、logout metadata 合并、debug 接口门禁
- 菜单 / 角色菜单改为服务端 API
- auth 中间件等待会话就绪；生产屏蔽调试页
- 安全响应头（Nitro / vercel.json）

## 不建议再做的方向

- 自建 JWT 与密码哈希登录链路（已与 Supabase Auth 重复）
- 在文档中继续宣称全模块「已完成」而未接库

## 相关文档

- [文档索引](./README.md)
- [认证指南](./AUTH.md)
- [权限系统](./PERMISSIONS.md)
