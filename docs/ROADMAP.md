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
| 统一 `roles.status` | API、种子脚本、前端全部改为 `'active'/'inactive'`，修复 `assertPermission` 中 `=== 1` |
| 生产 RLS | 关闭测试用「全关 RLS」；为 `menus` / `roles_*` / `departments` 定策略；敏感写操作尽量走 Service Role API |
| 菜单 API 化 | 新增 `/api/menus`，与 users/roles 一致走 `assertPermission`，减少客户端直写 |
| 密钥轮换 | 若历史曾提交过真实 `.env`，在 Supabase 控制台轮换 Anon / Service Role |

## P1 — 主数据与核心单据

按依赖顺序建议：

1. **主数据表**：产品、客户、供应商、仓库（迁移 + RLS + 管理页接真数据）
2. **销售订单 / 采购订单**（状态机、明细行）
3. **库存**：入库/出库/调拨与库存余额
4. **财务**：应收应付与收付款（可后置）

对应页面多数已有路由与 UI 壳，需：

- 新增 `supabase/migrations` 业务表
- `server/api/...` + `assertPermission`
- 替换 mock / ComingSoon
- 对齐 `definePageMeta.permission` 与菜单种子权限码

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
| `POST /api/auth/logout` | 标记离线 |
| `GET /api/user?action=profile\|permissions\|menus` | 当前用户 |
| `CRUD /api/users` | 用户管理 |
| `CRUD /api/roles` | 角色管理 |
| `CRUD /api/departments` | 部门管理 |
| `GET /api/debug/user-data` | 调试 |

**尚未实现（勿按旧文档开发）：** 自建 `/api/auth/register|refresh`、`/api/menus` REST、`/api/reports/*`、业务模块 CRUD API。

## 不建议再做的方向

- 自建 JWT 与密码哈希登录链路（已与 Supabase Auth 重复）
- 在文档中继续宣称全模块「已完成」而未接库

## 相关文档

- [文档索引](./README.md)
- [认证指南](./AUTH.md)
- [权限系统](./PERMISSIONS.md)
