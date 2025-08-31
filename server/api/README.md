# 📁 API 文件夹结构说明

## 🏗️ **组织原则**

API 按照业务模块进行文件夹划分，每个文件夹包含相关的 API 端点。

## 📂 **文件夹结构**

```
server/api/
├── auth/           # 认证相关 API
│   ├── login.post.ts
│   ├── logout.post.ts
│   ├── register.post.ts
│   └── refresh.post.ts
├── users/          # 用户管理 API ✅
│   └── index.ts    # GET/POST/PUT/DELETE /api/users
├── departments/    # 部门管理 API ✅
│   └── index.ts    # GET/POST/PUT/DELETE /api/departments
├── roles/          # 角色管理 API
│   ├── index.ts    # 角色 CRUD
│   └── permissions.ts # 角色权限管理
├── menus/          # 菜单管理 API
│   ├── index.ts    # 菜单 CRUD
│   └── tree.get.ts # 菜单树结构
├── system/         # 系统管理 API
│   ├── config.ts
│   ├── logs.ts
│   └── dictionaries.ts
└── reports/        # 报表相关 API
    ├── production.ts
    ├── sales.ts
    └── inventory.ts
```

## 🔧 **命名规范**

### **文件命名**

- `index.ts` - 支持多种 HTTP 方法的统一端点
- `[method].ts` - 单一方法端点（如 `login.post.ts`）
- `[name].ts` - 功能命名端点（如 `permissions.ts`）

### **URL 路径**

- **RESTful 风格**：`/api/users`、`/api/departments`
- **功能性端点**：`/api/menus/tree`、`/api/roles/permissions`

## ✅ **已实现的 API**

### **用户管理** (`/api/users`)

- `GET` - 获取用户列表（支持分页、搜索、筛选）
- `POST` - 创建新用户
- `PUT` - 更新用户信息和角色
- `DELETE` - 删除用户

### **部门管理** (`/api/departments`)

- `GET` - 获取部门列表（包含层级结构）
- `POST` - 创建新部门
- `PUT` - 更新部门信息
- `DELETE` - 删除部门（检查子部门）

## 🚀 **使用示例**

### **获取用户列表**

```javascript
const users = await $fetch("/api/users", {
  method: "GET",
  query: {
    page: 1,
    pageSize: 20,
    search: "张三",
    role_id: "role-uuid",
    status: "active",
  },
});
```

### **创建部门**

```javascript
const result = await $fetch("/api/departments", {
  method: "POST",
  body: {
    name: "开发部",
    code: "DEV",
    description: "负责软件开发",
    parent_id: "parent-uuid",
    sort: 1,
    status: "active",
  },
});
```

## 📋 **待实现的 API**

- [ ] 认证 API (`/api/auth/`)
- [ ] 角色管理 API (`/api/roles/`)
- [ ] 菜单管理 API (`/api/menus/`)
- [ ] 系统管理 API (`/api/system/`)
- [ ] 报表 API (`/api/reports/`)

## 🔐 **安全说明**

- 所有需要权限的 API 都使用 `serverSupabaseServiceRole`
- 包含完整的错误处理和参数验证
- 支持事务操作和关联数据处理
