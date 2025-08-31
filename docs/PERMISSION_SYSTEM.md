# 🔐 企业级前端权限控制系统

## 📋 概述

这是一个基于 **Nuxt 3** + **Supabase** 的企业级前端权限控制系统，提供了完整的菜单权限、路由权限、组件权限控制方案。

## 🏗️ 系统架构

### 数据库表结构

```sql
-- 菜单表
menus (id, name, icon, path, parent_id, sort, status, permission, type)

-- 角色表
roles (id, name, code, description, status)

-- 用户角色关联表
users_role (user_id, role_id)

-- 角色菜单权限关联表
roles_menu (role_id, menu_id)
```

### 前端权限控制层次

1. **路由级权限** - 页面访问控制
2. **菜单级权限** - 导航菜单显示控制
3. **组件级权限** - 页面内组件显示控制
4. **操作级权限** - 按钮/功能操作控制

## 🚀 使用方法

### 1. 页面权限配置

在页面中使用 `definePageMeta` 配置权限：

```vue
<!-- pages/system/users/index.vue -->
<script setup>
// 页面权限配置
definePageMeta({
  layout: "default",
  requiresAuth: true, // 需要登录
  permission: "system:users", // 需要的权限
});
</script>
```

### 2. 组件权限控制

#### 使用权限守卫组件

```vue
<template>
  <!-- 单个权限 -->
  <PermissionGuard permission="system:users">
    <Button>用户管理</Button>
  </PermissionGuard>

  <!-- 多个权限 - 任意一个满足 -->
  <PermissionGuard :permission="['user:create', 'user:edit']">
    <Button>编辑用户</Button>
  </PermissionGuard>

  <!-- 多个权限 - 全部满足 -->
  <PermissionGuard :permission="['user:create', 'user:edit']" mode="all">
    <Button>高级操作</Button>
  </PermissionGuard>

  <!-- 角色权限 -->
  <PermissionGuard role="admin">
    <Button>管理员功能</Button>
  </PermissionGuard>

  <!-- 显示无权限提示 -->
  <PermissionGuard
    permission="system:admin"
    show-fallback
    fallback-message="您需要管理员权限才能访问此功能"
  >
    <Button>管理员设置</Button>
    <template #fallback>
      <div class="text-red-500">自定义无权限提示</div>
    </template>
  </PermissionGuard>
</template>
```

#### 使用权限指令

```vue
<template>
  <!-- 基础权限控制 -->
  <Button v-permission="'user:create'">创建用户</Button>

  <!-- 多权限控制 - 任意一个满足 -->
  <Button v-permission="['user:edit', 'user:delete']">编辑/删除</Button>

  <!-- 多权限控制 - 全部满足 -->
  <Button v-permission.all="['user:edit', 'user:admin']">高级编辑</Button>

  <!-- 禁用而非隐藏 -->
  <Button v-permission.disable="'user:delete'">删除用户</Button>

  <!-- 角色控制 -->
  <Button v-role="'admin'">管理员功能</Button>
  <Button v-role="['admin', 'manager']">管理功能</Button>
</template>
```

### 3. 编程式权限检查

```vue
<script setup>
const {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoutePermission,
} = usePermissions();

// 检查单个权限
const canCreateUser = hasPermission("user:create");

// 检查多个权限 - 任意一个满足
const canEditOrDelete = hasAnyPermission(["user:edit", "user:delete"]);

// 检查多个权限 - 全部满足
const canAdvancedEdit = hasAllPermissions(["user:edit", "user:admin"]);

// 检查路由权限
const canAccessUserPage = hasRoutePermission("/system/users");

// 条件渲染
const showAdvancedFeatures = computed(() => {
  return hasPermission("admin:advanced");
});
</script>

<template>
  <div>
    <Button v-if="canCreateUser" @click="createUser">创建用户</Button>
    <div v-if="showAdvancedFeatures">高级功能面板</div>
  </div>
</template>
```

### 4. 菜单权限控制

菜单会自动根据用户权限进行过滤：

```vue
<!-- components/AppSidebarMenu.vue -->
<template>
  <div>
    <!-- 菜单会自动过滤用户有权限的项目 -->
    <NavMain :items="authorizedMenus" />
  </div>
</template>

<script setup>
const { authorizedMenus, loading, error } = usePermissions();
</script>
```

## 🔧 权限配置

### 1. 数据库权限配置

```sql
-- 插入菜单
INSERT INTO menus (name, icon, path, permission, type, sort) VALUES
('用户管理', 'Users', '/system/users', 'system:users', 'menu', 1),
('角色管理', 'Shield', '/system/roles', 'system:roles', 'menu', 2);

-- 创建角色
INSERT INTO roles (name, code, description, status) VALUES
('管理员', 'admin', '系统管理员', 1),
('普通用户', 'user', '普通用户', 1);

-- 分配菜单权限给角色
INSERT INTO roles_menu (role_id, menu_id)
SELECT r.id, m.id FROM roles r, menus m
WHERE r.code = 'admin' AND m.permission IN ('system:users', 'system:roles');

-- 分配角色给用户
INSERT INTO users_role (user_id, role_id)
SELECT 'user-uuid', r.id FROM roles r WHERE r.code = 'admin';
```

### 2. 权限命名规范

```
模块:操作

系统管理：
- system:users     (用户管理)
- system:roles     (角色管理)
- system:menus     (菜单管理)

基础数据：
- master-data:products   (产品管理)
- master-data:customers  (客户管理)

业务模块：
- finance:invoices       (发票管理)
- production:orders      (生产订单)
```

## 📱 响应式权限控制

系统支持实时权限更新：

```vue
<script setup>
const { refreshPermissions, clearPermissions } = usePermissions();

// 权限变更后刷新
const handleRoleChange = async () => {
  await refreshPermissions();
  console.log("权限已更新");
};

// 用户退出时清空权限
const handleLogout = () => {
  clearPermissions();
};
</script>
```

## ⚡ 性能优化

1. **懒加载权限** - 仅在需要时加载用户权限
2. **缓存机制** - 权限数据在客户端缓存，避免重复请求
3. **树摇优化** - 组件级权限控制，未使用的组件不会被渲染
4. **并行请求** - 权限和菜单数据并行获取

## 🛡️ 安全考虑

1. **前后端双重验证** - 前端权限控制 + 后端 API 权限验证
2. **最小权限原则** - 用户仅获得必要的最小权限
3. **权限日志** - 所有权限检查操作都有日志记录
4. **敏感操作保护** - 关键操作需要额外的权限验证

## 🔍 调试和监控

### 开发模式调试

```javascript
// 在浏览器控制台查看权限信息
const { permissions, menus, roles } = usePermissions();
console.log("当前权限:", permissions.value);
console.log("可访问菜单:", menus.value);
console.log("用户角色:", roles.value);
```

### 权限检查日志

系统会自动记录权限检查的详细日志，便于调试和审计。

## 📚 最佳实践

1. **权限粒度适中** - 不要过于细粒度，避免权限爆炸
2. **角色优先** - 优先使用角色管理，而非直接分配权限
3. **权限继承** - 合理利用菜单树结构实现权限继承
4. **异常处理** - 权限验证失败时提供友好的用户提示
5. **测试覆盖** - 为权限相关功能编写充分的测试用例

## 🚨 常见问题

### Q: 权限更新后不生效？

A: 调用 `refreshPermissions()` 刷新权限缓存

### Q: 如何实现按钮级权限控制？

A: 使用 `v-permission` 指令或 `PermissionGuard` 组件

### Q: 如何处理复杂的权限逻辑？

A: 使用编程式权限检查，结合业务逻辑进行判断

### Q: 性能如何优化？

A: 合理使用权限缓存，避免频繁的权限检查请求
