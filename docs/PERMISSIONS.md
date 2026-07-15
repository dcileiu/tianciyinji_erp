# 权限系统

权限来自「用户 → 角色 → 菜单」关联；菜单上的 `permission` 字符串去重后即用户权限码。`super_admin` 在前端与多数服务端检查中旁路放行。

## 数据模型

| 表 | 作用 |
|----|------|
| `menus` | 目录 / 菜单 / 权限点；字段含 `permission`、`type`、`status`、`path` 等 |
| `roles` | 角色（如 `super_admin`）；`status` 期望为 `'active' \| 'inactive'` |
| `users_role` | 用户 ↔ 角色 |
| `roles_menu` | 角色 ↔ 菜单 |
| `departments` | 组织架构（非权限本体） |

主初始化脚本：`supabase/migrations/complete_system_init.sql`  
类型定义：`app/types/database.types.ts`

没有独立的 `permissions` 表。

## 权限码约定

推荐 `模块:动作`，例如：

- `system:users` / `system:roles` / `system:departments` / `system:menus`
- `dashboard:view` / `dashboard:stats`

页面通过 `definePageMeta({ permission: '...' })` 声明；侧栏菜单来自 `GET /api/user?action=menus`。

## 检查点

### 1. 路由（前端）

`app/middleware/permission.global.ts`（仅客户端）：

- `requiresAuth === false` 跳过
- 无 `meta.permission` 跳过
- 字符串 / 字符串数组：`hasPermission` / `hasAnyPermission`
- 失败时若权限未加载会再拉一次；仍失败则 `createError(403)`

```ts
definePageMeta({
  permission: 'system:users',
  // 或 permission: ['a:view', 'b:view']  // 任一即可
});
```

### 2. 前端状态与组件

| 能力 | 位置 |
|------|------|
| Store | `app/stores/permissions.ts`、`app/stores/user.ts` |
| Composable | `app/composables/usePermissions.ts` |
| 组件 | `PermissionGuard.vue`、`PermissionWrapper.vue`、`PermissionTree*.vue` |
| 指令 | `v-permission` / `v-role`（`app/plugins/permission-directive.client.ts`） |

`userStore` 对角色码 `super_admin` 做前端全放行。

### 3. 服务端 API

`server/api/_utils/permissions.ts` → `assertPermission(event, 'system:users')`

已接入：

| API | 权限码 |
|-----|--------|
| `/api/users` | `system:users` |
| `/api/roles` | `system:roles` |
| `/api/departments` | `system:departments` |

当前用户只读接口（需登录，不经 assertPermission 业务码）：

| 接口 | 说明 |
|------|------|
| `GET /api/user?action=profile` | 资料 |
| `GET /api/user?action=permissions` | 权限码列表 |
| `GET /api/user?action=menus` | 菜单树 |
| `GET /api/debug/user-data` | 调试 dump |

### 4. 菜单与角色授权写入方式

| 模块 | 实现 |
|------|------|
| 用户 / 角色 / 部门 CRUD | `server/api/users|roles|departments`（Service Role） |
| 菜单 CRUD | **客户端直连 Supabase**（`useMenus`），无 `/api/menus` |
| 角色挂菜单 | `useRoles` 写 `roles_menu`（客户端 Supabase） |

## 已接权限的系统页（相对完整）

| 路径 | 权限 meta |
|------|-----------|
| `/dashboard` | `dashboard:view` |
| `/system/users` | `system:users` |
| `/system/roles` | `system:roles` |
| `/system/departments` | `system:departments` |
| `/system/menus` | `system:menus` |

其余大量业务页虽写了 `permission`，但数据多为 mock / ComingSoon，见 [ROADMAP.md](./ROADMAP.md)。

## 已知问题

1. **`roles.status` 类型混用**  
   - 迁移脚本将 status 改为字符串 `'active'/'inactive'`  
   - `assertPermission` 判断超管时仍用 `roles.status === 1`（数字）  
   - 权限查询用 `status = 'active'`  
   可能导致超管旁路或权限查询异常，需统一为字符串并改 API / SQL 脚本。

2. **RLS**  
   `disable_rls_for_testing.sql` 用于开发关闭 RLS；生产策略未在应用层完整落地。菜单等客户端直写依赖 Anon + RLS（或当前关闭状态）。

3. **多种子脚本**  
   `create_menus_table_complete.sql` 与 `complete_system_init.sql` 权限字符串可能不完全一致，初始化时以一套为准。

4. **辅助脚本**  
   `scripts/assign-admin-permissions.sql` 中 status 仍可能按数字 `1` 书写，执行前对照当前列类型。

## 运维提示

新用户登录后若提示「请联系管理员」：在角色管理中分配角色，或确认 `roles_menu` 已挂载带 `permission` 的菜单项。

调试页：`/debug-permissions`（公开路由白名单内）。

## 相关文档

- [认证指南](./AUTH.md)
- [路线图](./ROADMAP.md)
