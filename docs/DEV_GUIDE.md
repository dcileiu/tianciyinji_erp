## ERP 后台管理系统开发文档

### 1. 概述
- 项目类型：通用型 ERP（采购/销售/库存/财务/报表/系统管理）
- 技术栈：**Nuxt 3 全栈框架** + **Nuxt UI** + **Nuxt Drizzle** + **Supabase Auth Helpers** + TypeScript + Pinia + UnoCSS + Vitest + Playwright
- 目标：模块化、可扩展、权限精细、审计可追溯、低耦合、高可维护
- 开发理念：基于 Nuxt 官方生态的黄金组合，追求最佳开发体验和效率

### 2. 技术栈与版本建议 (Nuxt 官方生态黄金组合)
| 组件 | 建议版本/说明 |
|------|---------------|
| Node.js | LTS（当前最新） |
| Nuxt | 最新版|
| **Nuxt UI** | ^2.x（官方 UI 组件库，配置驱动） |
| **Nuxt Drizzle** | 最新版（简化 Drizzle ORM 集成） |
| @nuxtjs/supabase | 最新版
| TypeScript | 最新版
| Drizzle ORM | 最新版（Postgres driver） |
| Supabase 数据库 | PostgreSQL 15+ |
| CSS 框架 | **UnoCSS**（Nuxt UI 默认，原子化 CSS） |
| 状态管理 | **Pinia**（Nuxt 内置） |
| 请求库 | **$fetch / useFetch**（Nuxt 内置） |
| 测试 | Vitest , Playwright  |
| 代码质量 | ESLint + Prettier（最新版） |
| 国际化 | @nuxtjs/i18n | 最新版
| 日志 | pino + hook（server runtime） | 最新版

### 3. 系统高层架构
```
[Nuxt Client (Vue 3 + Nuxt UI)] --(useFetch/useAsyncData)--> [Nuxt Server Routes (/server/api)]
                |                                                       |
    [Supabase Auth Helpers]                              [Nuxt Drizzle (自动注入)]
                |                                                       |
                v                                                       v
        [Supabase Auth Service]                           [Supabase PostgreSQL + RLS]
                |                                                       |
                +-------------------------------------------------------+
                            [统一的用户身份和数据权限]
```
- **全栈一体**: 前后端共享类型定义，开发体验顺滑
- **Nuxt UI**: 配置驱动的现代化组件库，内置暗黑模式支持
- **Supabase Auth + RLS**: 用户认证与行级安全策略，数据权限在数据库层强制执行
- **Nuxt Drizzle**: 类型安全的 ORM，自动连接管理
- **动态路由**: 基于数据库菜单配置的动态路由系统

### 4. 目录结构建议
```
erp_nuxt/
 ├─ app/                # Nuxt 应用入口
 ├─ pages/              # 页面路由
 ├─ components/         # 公共组件
 ├─ layouts/
 ├─ server/
 │   ├─ api/            # 后端 API (REST 风格或分组)
 │   │   └─ erp/...
 │   ├─ middleware/     # 服务器端中间件（鉴权/审计）
 │   └─ utils/          # 服务器工具（db, auth, logger）
 ├─ db/
 │   ├─ schema/         # Drizzle 表结构定义
 │   ├─ migrations/     # 迁移历史（drizzle-kit 生成）
 │   └─ seeds/          # 初始化数据脚本
 ├─ composables/        # 组合式函数（前端）
 ├─ stores/             # Pinia store
 ├─ locales/            # i18n
 ├─ tests/
 │   ├─ unit/
 │   ├─ e2e/
 │   └─ api/
 ├─ scripts/            # 运维/CI辅助脚本
 ├─ docs/               # 文档
 ├─ .env.example
 ├─ drizzle.config.ts
 ├─ nuxt.config.ts
 └─ package.json
```

### 5. 功能模块 & 菜单规划 (根据原型更新)
| 一级 | 二级 | 三级 | 说明 |
|------|----------|------|------|
| 首页 | - | - | 首页仪表盘、关键指标 |
| 销售管理 | 客户档案 | 详情/新增/编辑/导入/导出/删除 | 客户主数据 |
| | 销售订单 | 详情/新增/导入/导出/删除 | 主销售单据 |
| | 备货订单 | 详情/新增/删除 | 备货流程 |
| | 发货通知单 | 详情/新增/删除 | 发货流程 |
| | 开票通知单 | 详情/新增/删除 | 开票流程 |
| | 退货通知单 | 详情/新增/删除 | 退货流程 |
| | 销售订单计划表 | - | 订单计划 |
| | 销售明细计划表 | - | 明细计划 |
| | 销售报表 | 订单执行明细表/发货通知明细表/发出商品明细表/销售退货明细表/开票通知明细表 | 各类销售统计 |
| 生产计划 | 生产计划单 | 新增/选择/详情 | 生产计划管理 |
| | 物料清单 | 新增/详情 | BOM 管理 |
| | 采购计划单 | - | 采购需求 |
| | 生产计划需求表 | - | 生产需求 |
| | 采购计划需求表 | - | 采购需求 |
| 采购管理 | 原料供应商 | 新增/详情 | 供应商管理 |
| | 采购订单 | 详情/新增/删除 | 采购主单据 |
| | 采购到货单 | 新增/详情 | 到货管理 |
| | 采购退货单 | 详情/新增 | 退货管理 |
| | 采购发票 | 新增 | 发票管理 |
| 生产管理 | 生产订单 | 新增/详情 | 生产主单据 |
| | 生产领料单 | 新增/详情 | 领料管理 |
| | 生产完工单 | 新增/详情 | 完工管理 |
| | 生产入库单 | 新增/详情 | 入库管理 |
| | 生产退料单 | 新增/详情 | 退料管理 |
| 车间设置 | 加工中心 | 新增 | 设备管理 |
| | 生产线 | 新增 | 生产线管理 |
| | 班组设置 | 新增 | 班组管理 |
| | 工人管理 | 新增 | 工人档案 |
| | 工种设置 | 新增 | 工种档案 |
| | 标准工序段 | 新增 | 工序标准 |
| | 工艺路线 | 新增/详情 | 工艺管理 |
| 仓库管理 | 仓库列表 | 新增/编辑 | 仓库主数据 |
| | 入库单据 | 新增/详情 | 入库管理 |
| | 出库单据 | 新增/详情 | 出库管理 |
| | 现存量 | 明细 | 库存现存量 |
| 入库管理 | 采购入库 | 新增/详情 | 采购入库 |
| | 生产入库 | 新增/详情 | 生产入库 |
| | 其他入库 | 新增/详情 | 其他入库 |
| 出库管理 | 销售出库 | 新增/详情 | 销售出库 |
| | 生产出库 | 新增/详情 | 生产出库 |
| | 其他出库 | 新增/详情 | 其他出库 |
| 退料退货 | 采购退货 | 新增/详情 | 采购退货 |
| | 销售退货 | 新增/详情 | 销售退货 |
| | 生产退料 | 新增/详情 | 生产退料 |
| 盘点调拨 | 盘点单 | 新增/详情 | 盘点管理 |
| | 调拨单 | 新增/详情 | 调拨管理 |
| 财务管理 | 收款单 | 新增/详情 | 收款管理 |
| | 付款单 | 新增/详情 | 付款管理 |
| | 开票申请 | 新增/详情 | 开票管理 |
| | 销售发票 | 新增/详情 | 销售发票 |
| | 采购发票 | 新增/详情 | 采购发票 |
| 系统设置 | 角色管理 | 新增 | 角色权限 |
| | 部门管理 | 新增/编辑 | 部门组织架构 |
| | 岗位管理 | 新增/编辑 | 岗位配置 |
| | 字典管理 | 新增/编辑 | 数据字典 |
| | 人员明细 | 新增 | 人员档案 |
| | 用户管理 | 新增 | 用户管理 |
| | 日志管理 | - | 系统日志 |
| | 系统配置 | - | 参数配置 |
| 基础数据 | 客户管理 | - | 客户主数据 |
| | 供应商管理 | - | 供应商主数据 |
| | 商品管理 | - | 商品主数据 |
| | 仓库管理 | - | 仓库主数据 |

菜单数据结构示例（存表 `sys_menus`）：
```json
{
  "id": 1001,
  "parentId": 0,
  "title": "系统管理",
  "path": "/system",
  "icon": "mdi:cog",
  "order": 10,
  "component": null,
  "type": "DIR",
  "permission": null,
  "children": [
    {
      "id": 1002,
      "parentId": 1001,
      "title": "用户管理",
      "path": "/system/user",
      "component": "system/user/index",
      "type": "MENU",
      "permission": "system:user:view"
    }
  ]
}
```

### 6. 权限与认证 (基于 Supabase Auth Helpers)

#### 6.1. 认证集成
使用 `@supabase/auth-helpers-nuxt` 实现与 Supabase Auth 的无缝集成：

**安装与配置**:
```bash
pnpm add @supabase/auth-helpers-nuxt @nuxt/supabase
```

**nuxt.config.ts 配置**:
```typescript
export default defineNuxtConfig({
  modules: ['@supabase/auth-helpers-nuxt'],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
})
```

#### 6.2. 前端使用
```vue
<script setup>
// 获取用户状态
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// 登录
const signIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password'
  })
}

// 登出
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
}
</script>

<template>
  <div v-if="user">
    欢迎，{{ user.email }}
    <button @click="signOut">登出</button>
  </div>
  <div v-else>
    <button @click="signIn">登录</button>
  </div>
</template>
```

#### 6.3. 后端 API 认证
```typescript
// server/api/protected.get.ts
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  // 使用用户信息进行数据查询
  return { message: `Hello ${user.email}` }
})
```

#### 6.4. Supabase Auth 用户 ID 规范

**Supabase Auth 内置 ID 特征**：
- **格式**：UUID v4 (128-bit 全局唯一标识符)
- **示例**：`550e8400-e29b-41d4-a716-446655440000`
- **长度**：36 字符（包含4个连字符）
- **字符集**：十六进制 (0-9, a-f) + 连字符
- **生成方式**：Supabase Auth 服务自动生成，无需手动指定

**在 ERP 系统中的映射**：
```typescript
// Supabase auth.users 表（系统内置）
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // UUID v4
  email: "admin@example.com",
  created_at: "2024-01-01T00:00:00Z"
}

// ERP 业务用户表 sys_users
{
  id: 1,                                       // bigserial (业务主键)
  authUid: "550e8400-e29b-41d4-a716-446655440000", // 关联 Supabase Auth
  username: "admin",
  email: "admin@example.com",
  role: "admin"
}
```

**关联查询示例**：
```typescript
// 通过 Supabase Auth UID 获取业务用户信息
const getUserInfo = async (authUid: string) => {
  return await db.select()
    .from(sysUsers)
    .where(eq(sysUsers.authUid, authUid))
    .limit(1)
}

// 在 API 中的使用
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)  // 获取 Supabase Auth 用户
  const businessUser = await getUserInfo(user.id) // 查询业务信息
  return { user: businessUser[0] }
})
```

#### 6.5. RBAC 设计
- **用户表** `sys_users`：扩展 Supabase auth.users 的 metadata
- **角色表** `sys_roles`：定义系统角色
- **角色-权限映射** `sys_role_permissions`：关联角色和权限
- **权限粒度**：遵循 `模块:资源:操作` 格式（如 `system:user:create`）

#### 6.6. RLS (行级安全) 策略
**核心优势**：数据权限在数据库层强制执行，简化后端代码

**示例策略**:
```sql
-- 用户只能查看自己创建的订单
CREATE POLICY "Users can view own orders" ON purchase_orders
FOR SELECT USING (auth.uid()::text = created_by::text);

-- 管理员可以查看所有数据
CREATE POLICY "Admins can view all orders" ON purchase_orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sys_users 
    WHERE auth_uid = auth.uid()::text 
    AND role = 'admin'
  )
);
```

### 7. Drizzle ORM 设计 (基于 Nuxt Drizzle)

#### 7.1. 安装与配置
```bash
pnpm add nuxt-drizzle drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

**nuxt.config.ts 配置**:
```typescript
export default defineNuxtConfig({
  modules: ['nuxt-drizzle'],
  drizzle: {
    driver: 'pg',
    url: process.env.DATABASE_URL,
    schema: './db/schema'
  }
})
```

#### 7.2. ID 规范与字段标准

**ID 策略选择**:
- 使用 UUID v7，全局唯一且时间有序

**通用字段规范**:
```typescript
// 标准审计字段
{
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  createdBy: bigint('created_by', { mode: 'bigint' }).references(() => sysUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: bigint('updated_by', { mode: 'bigint' }).references(() => sysUsers.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // 软删除
}
```

#### 7.3. 核心系统表设计
**系统用户表** (`db/schema/system.ts`):
```typescript
import { pgTable, bigserial, varchar, timestamp, boolean, bigint, integer } from 'drizzle-orm/pg-core';

export const sysUsers = pgTable('sys_users', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  authUid: varchar('auth_uid', { length: 64 }).notNull().unique(), // Supabase Auth UID
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 120 }).notNull().unique(),
  realName: varchar('real_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  avatar: varchar('avatar', { length: 255 }),
  status: boolean('status').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const sysRoles = pgTable('sys_roles', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 30 }).notNull().unique(),
  description: varchar('description', { length: 200 }),
  status: boolean('status').notNull().default(true),
  createdBy: bigint('created_by', { mode: 'bigint' }).references(() => sysUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const sysUserRoles = pgTable('sys_user_roles', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  userId: bigint('user_id', { mode: 'bigint' }).references(() => sysUsers.id).notNull(),
  roleId: bigint('role_id', { mode: 'bigint' }).references(() => sysRoles.id).notNull(),
  createdBy: bigint('created_by', { mode: 'bigint' }).references(() => sysUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sysPermissions = pgTable('sys_permissions', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 100 }).notNull().unique(), // system:user:create
  type: varchar('type', { length: 20 }).notNull().default('menu'), // menu, button, api
  description: varchar('description', { length: 200 }),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sysRolePermissions = pgTable('sys_role_permissions', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  roleId: bigint('role_id', { mode: 'bigint' }).references(() => sysRoles.id).notNull(),
  permissionId: bigint('permission_id', { mode: 'bigint' }).references(() => sysPermissions.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sysMenus = pgTable('sys_menus', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  parentId: bigint('parent_id', { mode: 'bigint' }).references(() => sysMenus.id),
  title: varchar('title', { length: 50 }).notNull(),
  name: varchar('name', { length: 50 }), // 路由名称
  path: varchar('path', { length: 200 }),
  component: varchar('component', { length: 200 }),
  icon: varchar('icon', { length: 100 }),
  type: varchar('type', { length: 20 }).notNull().default('menu'), // dir, menu, button
  permission: varchar('permission', { length: 100 }), // 关联权限码
  orderSort: integer('order_sort').default(0),
  status: boolean('status').notNull().default(true),
  isExternal: boolean('is_external').default(false),
  visible: boolean('visible').default(true),
  createdBy: bigint('created_by', { mode: 'bigint' }).references(() => sysUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
```

#### 7.3. 在 Server API 中使用
```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  // useDrizzle 由 nuxt-drizzle 自动注入
  const db = useDrizzle()
  
  const users = await db.select().from(sysUsers).where(eq(sysUsers.status, true))
  
  return {
    success: true,
    data: users
  }
})
```

#### 7.4. 迁移管理
```bash
# 生成迁移文件
npx drizzle-kit generate:pg

# 执行迁移
npx drizzle-kit push:pg
```

迁移：
1. 定义 schema
2. 执行 `npx drizzle-kit generate:pg`
3. 审核 SQL
4. `npx drizzle-kit push:pg`

数据库连接（`server/utils/db.ts`）：
```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

### 7.1. 核心业务数据模型 (Data Models)
ERP 系统的核心是数据。以下为关键模块（采购）的初步 Drizzle ORM schema 设计示例，作为后续模块开发的参考。

**采购订单 (`db/schema/purchase.ts`)**:
```typescript
import { pgTable, serial, varchar, timestamp, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { sysUsers } from './system'; // 假设在 system.ts 中
import { suppliers } from './basic_data'; // 假设在 basic_data.ts 中

// 定义采购订单状态枚举
export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED']);

// 采购订单主表
export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  orderDate: timestamp('order_date').defaultNow(),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: purchaseOrderStatusEnum('status').default('DRAFT'),
  // 审计字段
  createdBy: integer('created_by').references(() => sysUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: integer('updated_by').references(() => sysUsers.id),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 采购订单行项目表... (类似结构)
```

### 7.3. Drizzle ORM 关系查询 (Relations)
为了实现类型安全的连表查询，Drizzle 推荐使用 `relations` 辅助函数。

**定义关系 (`db/schema/purchase.ts`)**:
```typescript
import { relations } from 'drizzle-orm';
// ... 其他 import 和表定义

// 定义 purchaseOrders 表与 sysUsers 和 suppliers 表的关系
export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  creator: one(sysUsers, {
    fields: [purchaseOrders.createdBy],
    references: [sysUsers.id],
  }),
}));
```

**查询时使用**:
```typescript
// 在 server/api 中查询
const result = await db.query.purchaseOrders.findMany({
  with: {
    supplier: true, // 自动 join suppliers 表
    creator: {
      columns: { // 只选择需要的列
        username: true,
        email: true,
      }
    }
  }
});
// result[0].supplier.name 将会是类型安全的
```

### 7.4. 数据库初始化数据 (Seeding)
系统启动前需要初始化基础数据：管理员用户、角色、权限、菜单等。

**完整的初始化脚本** (`scripts/seed.ts`):
```typescript
import { createClient } from '@nuxt/supabase'
import { useDrizzle } from '#drizzle'
import { 
  sysUsers, sysRoles, sysUserRoles, 
  sysPermissions, sysRolePermissions, sysMenus 
} from '../db/schema/system'

// 初始化 Supabase 客户端 (使用 service role key)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function main() {
  console.log('🌱 开始初始化数据库...')
  const db = useDrizzle()

  try {
    // 1. 创建超级管理员账户 (Supabase Auth)
    console.log('📝 创建管理员账户...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('创建认证用户失败:', authError)
      throw authError
    }

    // 2. 创建角色
    console.log('👥 创建系统角色...')
    const [adminRole] = await db.insert(sysRoles).values([
      {
        name: '超级管理员',
        code: 'admin',
        description: '系统超级管理员，拥有所有权限'
      },
      {
        name: '普通用户',
        code: 'user', 
        description: '普通用户，基础权限'
      }
    ]).returning()

    // 3. 创建系统用户记录
    console.log('👤 创建用户记录...')
    const [adminUser] = await db.insert(sysUsers).values({
      authUid: authUser.user.id,
      username: 'admin',
      email: 'admin@example.com',
      realName: '系统管理员',
      status: true,
    }).returning()

    // 4. 分配角色
    await db.insert(sysUserRoles).values({
      userId: adminUser.id,
      roleId: adminRole.id,
      createdBy: adminUser.id
    })

    // 5. 创建权限
    console.log('🔐 创建系统权限...')
    const permissions = await db.insert(sysPermissions).values([
      // 系统管理权限
      { name: '用户查看', code: 'system:user:view', type: 'menu' },
      { name: '用户新增', code: 'system:user:create', type: 'button' },
      { name: '用户编辑', code: 'system:user:update', type: 'button' },
      { name: '用户删除', code: 'system:user:delete', type: 'button' },
      { name: '角色管理', code: 'system:role:view', type: 'menu' },
      { name: '菜单管理', code: 'system:menu:view', type: 'menu' },
      { name: '权限管理', code: 'system:permission:view', type: 'menu' },
      
      // 销售管理权限
      { name: '客户管理', code: 'sale:customer:view', type: 'menu' },
      { name: '销售订单', code: 'sale:order:view', type: 'menu' },
      { name: '销售订单新增', code: 'sale:order:create', type: 'button' },
      
      // 采购管理权限
      { name: '供应商管理', code: 'purchase:supplier:view', type: 'menu' },
      { name: '采购订单', code: 'purchase:order:view', type: 'menu' },
      { name: '采购订单新增', code: 'purchase:order:create', type: 'button' },
      
      // 库存管理权限
      { name: '库存查询', code: 'inventory:stock:view', type: 'menu' },
      { name: '入库管理', code: 'inventory:inbound:view', type: 'menu' },
      { name: '出库管理', code: 'inventory:outbound:view', type: 'menu' },
      
      // 财务管理权限
      { name: '收款管理', code: 'finance:receipt:view', type: 'menu' },
      { name: '付款管理', code: 'finance:payment:view', type: 'menu' },
      { name: '发票管理', code: 'finance:invoice:view', type: 'menu' },
    ]).returning()

    // 6. 给管理员分配所有权限
    console.log('⚡ 分配管理员权限...')
    const rolePermissions = permissions.map(permission => ({
      roleId: adminRole.id,
      permissionId: permission.id
    }))
    await db.insert(sysRolePermissions).values(rolePermissions)

    // 7. 创建菜单
    console.log('📋 创建系统菜单...')
    const menus = await db.insert(sysMenus).values([
      // 一级菜单
      { id: 1n, title: '首页', name: 'Dashboard', path: '/dashboard', icon: 'i-heroicons-home', type: 'menu', orderSort: 1, createdBy: adminUser.id },
      { id: 10n, title: '系统管理', name: 'System', path: '/system', icon: 'i-heroicons-cog-6-tooth', type: 'dir', orderSort: 10, createdBy: adminUser.id },
      { id: 20n, title: '销售管理', name: 'Sale', path: '/sale', icon: 'i-heroicons-shopping-cart', type: 'dir', orderSort: 20, createdBy: adminUser.id },
      { id: 30n, title: '采购管理', name: 'Purchase', path: '/purchase', icon: 'i-heroicons-truck', type: 'dir', orderSort: 30, createdBy: adminUser.id },
      { id: 40n, title: '库存管理', name: 'Inventory', path: '/inventory', icon: 'i-heroicons-cube', type: 'dir', orderSort: 40, createdBy: adminUser.id },
      { id: 50n, title: '财务管理', name: 'Finance', path: '/finance', icon: 'i-heroicons-banknotes', type: 'dir', orderSort: 50, createdBy: adminUser.id },
      
      // 系统管理子菜单
      { id: 101n, parentId: 10n, title: '用户管理', name: 'SystemUser', path: '/system/user', component: 'system/user/index', permission: 'system:user:view', type: 'menu', orderSort: 1, createdBy: adminUser.id },
      { id: 102n, parentId: 10n, title: '角色管理', name: 'SystemRole', path: '/system/role', component: 'system/role/index', permission: 'system:role:view', type: 'menu', orderSort: 2, createdBy: adminUser.id },
      { id: 103n, parentId: 10n, title: '菜单管理', name: 'SystemMenu', path: '/system/menu', component: 'system/menu/index', permission: 'system:menu:view', type: 'menu', orderSort: 3, createdBy: adminUser.id },
      
      // 销售管理子菜单
      { id: 201n, parentId: 20n, title: '客户管理', name: 'SaleCustomer', path: '/sale/customer', component: 'sale/customer/index', permission: 'sale:customer:view', type: 'menu', orderSort: 1, createdBy: adminUser.id },
      { id: 202n, parentId: 20n, title: '销售订单', name: 'SaleOrder', path: '/sale/order', component: 'sale/order/index', permission: 'sale:order:view', type: 'menu', orderSort: 2, createdBy: adminUser.id },
    ]).returning()

    console.log('✅ 数据库初始化完成!')
    console.log('📧 管理员账户: admin@example.com')
    console.log('🔑 管理员密码: 123456')

  } catch (error) {
    console.error('❌ 初始化失败:', error)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ 脚本执行失败:', err)
  process.exit(1)
})
```

**package.json 命令**:
```json
{
  "scripts": {
    "db:seed": "tsx scripts/seed.ts",
    "db:reset": "drizzle-kit drop && drizzle-kit push:pg && pnpm db:seed"
  }
}
```

**重要提醒**:
1. 生产环境请立即修改默认密码
2. 确保 `SUPABASE_SERVICE_ROLE_KEY` 仅在服务器端使用
3. 定期备份数据库

### 8. 环境变量
`.env.example`：
```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # 仅服务器使用，不下发客户端

# Postgres (可直接用 supabase connection string)
DATABASE_URL=postgresql://...

# App
NUXT_PUBLIC_APP_NAME=ERP-X
NUXT_PUBLIC_APP_VERSION=0.1.0
LOG_LEVEL=info
```
命名规范：
- `NUXT_PUBLIC_` 前缀：客户端可见
- Service Role Key：只在 server runtime 访问

### 8.1. 多环境管理
Nuxt 3 原生支持基于 `.env` 文件的多环境配置。
- `.env`: 存放所有环境共享或仅用于本地开发的变量。会被 `.env.development` 或 `.env.production` 覆盖。
- `.env.development`: 开发环境 (`npm run dev`) 使用的变量。
- `.env.production`: 生产环境 (`npm run build` 后) 使用的变量。

**实践**:
- 将生产环境的 `SUPABASE_URL`、`DATABASE_URL` 等敏感或不同的配置放入 `.env.production` 文件中。
- `.env.production` 文件不应提交到 Git 仓库，应通过 CI/CD 的 secrets 注入。

### 9. API 设计规范
- 路径：`/api/模块/资源`
- 动词：GET 列表/详情, POST 创建, PATCH 更新, DELETE 删除
- 分页参数：`page`, `pageSize`
- 统一响应：
```json
{ "success": true, "data": {}, "error": null, "traceId": "..." }
```
- 错误码：业务定义（如 `PURCHASE_ORDER_DUP`），HTTP 状态保持语义（400/401/403/404/409/500）

### 9.1. 请求校验 (Request Validation)
为了保证 API 的健壮性和安全性，所有接收外部输入的 Server Route 都必须对请求参数进行校验。

**工具**:
- 推荐使用 `zod` 库，它可以方便地定义 schema 并进行类型安全的校验。

**实践 (`server/api/system/user/index.post.ts`)**:
```typescript
import { z } from 'zod';

// 定义创建用户的校验 schema
const createUserSchema = z.object({
  username: z.string().min(3, '用户名至少3位'),
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(6, '密码至少6位'),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // 进行校验
  const validation = createUserSchema.safeParse(body);
  if (!validation.success) {
    // 如果校验失败，返回 400 错误
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Failed',
      data: validation.error.errors,
    });
  }

  // validation.data 是类型安全的数据
  // ... 执行创建用户逻辑
  return { success: true, data: { userId: 123 } };
});
```

### 10. 中间件
- `auth`: 校验 session / 注入 user / 缺失 => 401
- `permission`: 基于 route meta 的权限码校验
- `audit`: 记录操作（userId, path, params hash, 耗时）
- `error`: 捕获异常 -> 标准化输出

### 11. 前端实现要点 (基于 Nuxt UI)

#### 11.1. Nuxt UI 安装与配置
```bash
pnpm add @nuxt/ui
```

**nuxt.config.ts 配置**:
```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  ui: {
    // 自定义主题色
    primary: 'blue',
    gray: 'slate'
  }
})
```

#### 11.2. 核心组件使用

**配置驱动的表格 (UTable)**:
```vue
<script setup>
const columns = [
  { key: 'username', label: '用户名' },
  { key: 'email', label: '邮箱' },
  { key: 'role', label: '角色' },
  { key: 'actions', label: '操作' }
]

const { data: users, pending } = await useFetch('/api/users')
</script>

<template>
  <UTable 
    :rows="users" 
    :columns="columns"
    :loading="pending"
  >
    <template #actions-data="{ row }">
      <UButton size="xs" @click="editUser(row)">编辑</UButton>
      <UButton size="xs" color="red" @click="deleteUser(row)">删除</UButton>
    </template>
  </UTable>
</template>
```

**配置驱动的表单 (UForm)**:
```vue
<script setup>
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(3, '用户名至少3位'),
  email: z.string().email('邮箱格式不正确'),
  role: z.enum(['admin', 'user'])
})

const state = reactive({
  username: '',
  email: '',
  role: 'user'
})

async function onSubmit() {
  const { data } = await $fetch('/api/users', {
    method: 'POST',
    body: state
  })
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormGroup label="用户名" name="username">
      <UInput v-model="state.username" />
    </UFormGroup>
    
    <UFormGroup label="邮箱" name="email">
      <UInput v-model="state.email" type="email" />
    </UFormGroup>
    
    <UFormGroup label="角色" name="role">
      <USelect v-model="state.role" :options="[
        { label: '管理员', value: 'admin' },
        { label: '普通用户', value: 'user' }
      ]" />
    </UFormGroup>
    
    <UButton type="submit">提交</UButton>
  </UForm>
</template>
```

**模态框与侧边栏 (UModal & USlideover)**:
```vue
<script setup>
const isModalOpen = ref(false)
const isSlideoverOpen = ref(false)
</script>

<template>
  <!-- 模态框 -->
  <UModal v-model="isModalOpen">
    <UCard>
      <template #header>
        新增用户
      </template>
      
      <!-- 表单内容 -->
      
      <template #footer>
        <UButton @click="isModalOpen = false">取消</UButton>
        <UButton color="primary">确定</UButton>
      </template>
    </UCard>
  </UModal>
  
  <!-- 侧边栏 -->
  <USlideover v-model="isSlideoverOpen">
    <UCard>
      <!-- 详情内容 -->
    </UCard>
  </USlideover>
</template>
```

#### 11.3. 页面布局

**标准后台布局**:
```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航 -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between items-center">
          <h1 class="text-xl font-semibold">ERP 系统</h1>
          
          <!-- 用户菜单 -->
          <UDropdown :items="userMenuItems">
            <UAvatar :src="user?.avatar" :alt="user?.name" />
          </UDropdown>
        </div>
      </div>
    </header>
    
    <div class="flex">
      <!-- 侧边栏 -->
      <nav class="w-64 bg-white dark:bg-gray-800 shadow-sm">
        <UVerticalNavigation :links="navigationLinks" />
      </nav>
      
      <!-- 主内容区 -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

#### 11.4. 主题与响应式
Nuxt UI 基于 UnoCSS，支持：
- **暗黑模式**: 自动切换，通过 `useColorMode()` 控制
- **响应式**: 内置响应式断点
- **自定义主题**: 通过 `app.config.ts` 配置颜色和字体

### 11.1. UI 组件库集成与封装
**优势**:
- Nuxt UI 提供了配置驱动的组件，无需手动封装即可实现高效的 CRUD 开发
- 基于 UnoCSS 的原子化 CSS，样式定制非常灵活
- 内置暗黑模式和响应式支持

**组件组织**:
- `components/common/`: 通用业务组件（如页面头部、数据统计卡片）
- `components/business/`: 特定业务组件（如订单选择器、客户选择器）
- 页面级组件: 放在对应页面目录下

### 11.2. 状态管理最佳实践
使用 Nuxt 内置的 Pinia + `useFetch`/`useAsyncData` 组合：

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  
  // 使用 Nuxt 的 useFetch
  const { data, pending, refresh } = useFetch('/api/users', {
    transform: (data: any) => data.records || []
  })
  
  // 响应式计算
  const activeUsers = computed(() => 
    data.value?.filter(user => user.status === true) || []
  )
  
  return {
    users: data,
    loading: pending,
    activeUsers,
    refresh
  }
})
```

### 11.3. 统一错误处理与用户反馈
**API 层面**:
- 使用 Nuxt 的 `$fetch` 拦截器 (`interceptors`)。在 `onResponseError` 和 `onResponse` 钩子中进行全局处理。
- **`onResponse`**: 检查响应体 `body.success` 是否为 `false`，如果是，则视为业务错误，进行提示。
- **`onResponseError`**: 处理网络错误或 HTTP 状态码为 4xx/5xx 的错误。
- **特殊处理**: 对 `401 Unauthorized` 错误，应清除本地会话并重定向到登录页。

**UI 层面**:
- 对于捕获到的错误，调用全局通知组件（如 `ElMessage.error` 或 `ElNotification`）向用户展示友好的错误提示，而不是将原始错误信息暴露给用户。
- 在 `plugins/` 目录下创建 `fetch.ts` 插件来配置全局 `$fetch`。

### 11.4. 国际化 (i18n) 实践
**文件结构**:
- 翻译文件存放在 `locales/` 目录下，如 `zh-cn.json`, `en.json`。
- `zh-cn.json` 示例:
  ```json
  {
    "menu": {
      "dashboard": "仪表盘",
      "system": "系统管理"
    },
    "button": {
      "search": "搜索",
      "reset": "重置"
    }
  }
  ```

**使用**:
- 在 Vue 组件的 `<template>` 中，使用 `$t` 函数进行翻译。
  ```vue
  <template>
    <div>
      <span>{{ $t('menu.dashboard') }}</span>
      <el-button>{{ $t('button.search') }}</el-button>
    </div>
  </template>
  ```
- 在 `<script setup>` 中，可以通过 `vue-i18n` 提供的 `useI18n` hook 来获取 `t` 函数。

### 12. 日志与审计
- Server：pino logger（区分 level）输出 JSON
- Trace：生成 `traceId`（UUID v7）挂载到请求上下文
- 审计表 `sys_audit_logs`：字段（id, user_id, action, resource, before, after, ip, ua, created_at）

### 13. 缓存与性能
阶段 1（必做）：
- 内存 LRU：菜单/权限缓存 5 分钟
- 数据库分页 + 索引（常用：外键列、时间列、状态列、组合索引）
阶段 2（可选）：
- Redis 引入（会话、频控、排行）
- 预汇总表/物化视图（大报表）
- 列存/OLAP（ClickHouse）对接

### 14. 安全
- 全站 HTTPS
- CSRF：主要交互 API + SameSite=Lax；一般使用 token header
- XSS：使用框架转义 + 白名单富文本
- SQL 注入：Drizzle 参数化
- 速率限制：后期接入 Redis + token bucket
- RLS：敏感表必须启用（如单据行、财务数据）
- 敏感字段脱敏（日志/导出）

### 15. 测试策略
| 层级 | 工具 | 说明 |
|------|------|------|
| 单元 | Vitest | 纯函数/服务逻辑 |
| 集成 | Vitest + 测试 DB（schema migrate） | API route 调用 |
| E2E | Playwright | 关键业务流程（下单→发货） |
| 性能 | autocannon / k6 | 热路径压测 |
| 安全 | 规则扫描 (npm audit, eslint-plugin-security) | 自动化 |

目录：`tests/unit`, `tests/api`, `tests/e2e`

### 16. CI/CD
- Git 分支：`main`（发布），`dev`（集成），Feature 分支
- Pipeline（GitHub Actions 示例）：
  1. Install & Cache
  2. Lint & Type Check
  3. Unit + API Tests（使用临时 Supabase or Testcontainers）
  4. 构建（`nuxi build`）
  5. 数据库迁移（drizzle-kit push）
  6. 部署（容器 或 Supabase Edge Functions + Node 托管）
- 版本：语义化（feat/minor, fix/patch）

### 17. 部署
方案 A：自管服务器
- Dockerfile（多阶段：依赖安装 -> 构建 -> 仅产物）
- 运行：`node .output/server/index.mjs`

方案 B：Serverless
- Nuxt Nitro Adapter（如 vercel / netlify）
- 注意：Service Role Key 不进入浏览器；放在平台环境变量

### 18. 数据库设计最佳实践

#### 18.1. ID 策略与规范
**为什么选择 bigserial (bigint 自增)**:
1. **性能优秀**: 自增整数查询和索引效率最高
2. **节省空间**: 比 UUID 节省 50% 存储空间
3. **易于调试**: 连续的数字 ID 便于开发和运维
4. **兼容性好**: 所有 ORM 和数据库工具都完美支持

**何时考虑 UUID**:
- 多数据库合并场景
- 需要在客户端生成 ID
- 有安全要求不能暴露 ID 规律

**ID 字段统一规范**:
```typescript
// 所有主键统一格式
id: bigserial('id', { mode: 'bigint' }).primaryKey()

// 外键引用统一格式  
userId: bigint('user_id', { mode: 'bigint' }).references(() => sysUsers.id)
```

#### 18.2. 表设计规范
**命名约定**:
- 表名: `snake_case`，加业务前缀（如 `sys_users`, `sale_orders`）
- 字段名: `snake_case`
- 索引名: `idx_表名_字段名`
- 外键名: `fk_表名_字段名`

**标准字段**:
```typescript
// 每个业务表必备字段
{
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  createdBy: bigint('created_by', { mode: 'bigint' }).references(() => sysUsers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: bigint('updated_by', { mode: 'bigint' }).references(() => sysUsers.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // 软删除标记
}
```

#### 18.3. 索引策略
**必建索引**:
- 所有外键字段
- 经常用于 WHERE 条件的字段
- 经常用于 ORDER BY 的字段

**组合索引示例**:
```sql
-- 订单状态 + 创建时间的组合索引
CREATE INDEX idx_orders_status_created ON sale_orders(status, created_at);

-- 软删除 + 状态的组合索引
CREATE INDEX idx_users_deleted_status ON sys_users(deleted_at, status) WHERE deleted_at IS NULL;
```

### 19. 代码规范
- TS：strict / noImplicitAny
- 别名：`@/` 指向根目录
- 每模块 service 层负责业务聚合，不在 route 中写复杂逻辑
- 命名：表名 snake_case；TS 接口 PascalCase；变量 camelCase
- 提交规范：Commitlint + Conventional Commits（feat:, fix:, chore: 等）
- 自动：`pre-commit` -> lint-staged（eslint --fix, prettier）

### 19. 典型流程示例（采购订单）
1. 用户登录 -> 获取权限 `purchase:order:create`
2. 前端打开创建页 -> 选供应商/物料（下拉懒加载）
3. 校验库存/价格策略
4. 后端保存主表 + 行明细（事务）
5. 触发事件（消息中心：待审批）
6. 审批通过 -> 状态变更 `APPROVED`
7. 收货 -> 生成库存移动 + 更新可用量
8. 关联应付生成凭证（财务模块）

### 20. 渐进式路线图
| 阶段 | 目标 | 内容 |
|------|------|------|
| P0 | 可用骨架 | Auth + 菜单 + RBAC + 基础数据 |
| P1 | 三大流转 | 采购/销售/库存主线 |
| P2 | 生产 + 财务 | BOM/工单 + 应收应付 |
| P3 | 报表中心 | 关键汇总、导出、权限过滤 |
| P4 | 优化 | 性能、缓存、审计可视化 |
| P5 | 拓展 | CRM/HR 深化，移动端，BI 接入 |

### 21. 风险与控制
| 风险 | 缓解 |
|------|------|
| 权限漏洞 | 单元 + 集成测试覆盖关键 API |
| 报表性能 | 物化视图 + 定时刷新 |
| 频繁 schema 变更 | 严格迁移流程 + 评审 |
| 数据一致性 | 事务 + 错误回滚日志 |
| 超范围需求膨胀 | 路线图冻结周期 + 评审窗口 |

### 22. 快速初始化指南 (黄金组合版)

#### 22.1. 项目初始化
```bash
# 1. 创建 Nuxt 项目
npx nuxi@latest init erp_nuxt
cd erp_nuxt

# 2. 安装核心依赖 (Nuxt UI + Nuxt Drizzle + Supabase Auth)
pnpm add @nuxt/ui nuxt-drizzle @supabase/auth-helpers-nuxt
pnpm add @nuxt/supabase drizzle-orm pg zod

# 3. 安装开发依赖
pnpm add -D drizzle-kit @types/pg
```

#### 22.2. 配置文件
**nuxt.config.ts**:
```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    'nuxt-drizzle', 
    '@supabase/auth-helpers-nuxt'
  ],
  
  // Drizzle 配置
  drizzle: {
    driver: 'pg',
    url: process.env.DATABASE_URL,
    schema: './db/schema'
  },
  
  // 运行时配置
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  },
  
  // 类型检查
  typescript: {
    strict: true
  }
})
```

**环境变量 (.env)**:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Database (通常与 Supabase 相同)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

#### 22.3. 基础目录结构
```bash
# 创建核心目录
mkdir -p db/schema
mkdir -p server/api/system
mkdir -p components/{common,business}
mkdir -p stores
mkdir -p types

# 创建基础 schema 文件
touch db/schema/system.ts
touch db/schema/index.ts
```

#### 22.4. 首个 API 端点
**server/api/ping.get.ts**:
```typescript
export default defineEventHandler(async (event) => {
  return {
    success: true,
    data: { 
      message: 'ERP API 运行正常',
      timestamp: new Date().toISOString()
    }
  }
})
```

#### 22.5. 数据库 Schema 示例
**db/schema/system.ts**:
```typescript
import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'

export const sysUsers = pgTable('sys_users', {
  id: serial('id').primaryKey(),
  authUid: varchar('auth_uid', { length: 64 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 120 }).notNull(),
  role: varchar('role', { length: 20 }).default('user'),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

**db/schema/index.ts**:
```typescript
export * from './system'
```

#### 22.6. 数据库初始化
```bash
# 1. 生成数据库迁移
npx drizzle-kit generate:pg

# 2. 推送到数据库
npx drizzle-kit push:pg

# 3. 初始化基础数据 (创建 admin 用户)
pnpm db:seed
```

#### 22.7. 验证安装
```bash
# 启动开发服务器
pnpm dev

# 验证端点 (新终端)
curl http://localhost:3000/api/ping
```

预期输出：
```json
{
  "success": true,
  "data": {
    "message": "ERP API 运行正常",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 23. 开发环境搭建指南

#### 23.1. 代码质量工具配置
**安装开发工具**:
```bash
pnpm add -D eslint @nuxt/eslint-config prettier husky lint-staged
```

**package.json 脚本**:
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"]
  }
}
```

#### 23.2. VS Code 配置推荐
**创建 .vscode/settings.json**:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

**推荐扩展**:
- Volar (Vue Language Features)
- TypeScript Vue Plugin
- Prettier
- ESLint
- UnoCSS

#### 23.3. Supabase 项目设置
1. 在 [supabase.com](https://supabase.com) 创建项目
2. 获取项目 URL 和 anon key
3. 在 SQL Editor 中启用必要的扩展：
   ```sql
   -- 启用 RLS
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
   
   -- 启用必要扩展
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

#### 23.4. 类型安全最佳实践
**创建 types/api.ts**:
```typescript
// 统一 API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页响应类型
export interface PaginatedResponse<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}
```

**创建 types/auth.ts**:
```typescript
export interface User {
  id: string
  email: string
  username: string
  role: 'admin' | 'user'
  status: boolean
}
```

### 24. 部署指南

#### 24.1. 构建与部署
```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

**推荐部署平台**:
- **Vercel**: 零配置部署 Nuxt 应用
- **Netlify**: 静态站点托管
- **Railway**: 全栈应用部署
- **Supabase Edge Functions**: 边缘计算

#### 24.2. 环境变量设置
在部署平台设置以下环境变量：
```bash
SUPABASE_URL=your-production-url
SUPABASE_ANON_KEY=your-production-key
DATABASE_URL=your-production-db-url
NODE_ENV=production
```

### 25. 质量保证

#### 25.1. 代码质量 Gate
- **PR 检查**: ESLint + TypeScript 检查必须通过
- **代码覆盖率**: 核心业务逻辑 ≥ 70%
- **安全扫描**: 使用 `npm audit` 检查依赖安全

#### 25.2. 测试策略
```bash
# 安装测试工具
pnpm add -D vitest @vue/test-utils happy-dom playwright

# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e
```

### 27. 生产环境安全加固

#### 27.1. 默认账户安全
**⚠️ 重要提醒**: 生产部署后立即执行以下安全措施：

1. **修改默认密码**:
   ```bash
   # 登录系统后立即在用户管理中修改密码
   # 建议使用强密码：至少12位，包含大小写字母、数字、特殊字符
   ```

2. **启用双因素认证** (可选):
   ```typescript
   // 在 Supabase Dashboard 中启用 MFA
   // 或集成第三方 2FA 服务
   ```

3. **限制管理员权限**:
   ```typescript
   // 创建细分角色，避免使用超级管理员进行日常操作
   // 遵循最小权限原则
   ```

#### 27.2. 数据库安全
- **启用 SSL 连接**: 生产环境必须使用 SSL
- **定期备份**: 配置自动备份策略
- **审计日志**: 启用数据库操作审计
- **IP 白名单**: 限制数据库访问来源

#### 27.3. API 安全
- **速率限制**: 防止 API 滥用
- **输入验证**: 使用 Zod 严格校验所有输入
- **HTTPS**: 强制使用 HTTPS
- **CORS 配置**: 严格配置跨域策略

### 28. 故障排查指南

#### 28.1. 常见问题
**数据库连接失败**:
```bash
# 检查环境变量
echo $DATABASE_URL

# 测试连接
npx drizzle-kit introspect:pg
```

**认证问题**:
```bash
# 检查 Supabase 配置
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 查看 Supabase 日志
```

**权限错误**:
- 检查用户角色分配
- 验证菜单权限配置
- 确认 RLS 策略正确

#### 28.2. 日志分析
生产环境建议集成：
- **Sentry**: 错误监控
- **LogRocket**: 用户行为回放
- **Grafana**: 性能监控

### 25. 变更提交模板
```
feat(purchase): 新增采购订单审批流
- 添加审批状态字段
- 增加审批动作 API
BREAKING CHANGE: 采购订单状态枚举扩展
```

### 26. 定时任务 (Scheduled Tasks)
**场景**:
- 每日生成统计报表。
- 每小时同步外部数据。
- 每7晚清理过期日志。

**技术方案**:
1.  **`pg_cron` (推荐用于数据库内任务)**:
    - Supabase 内置了 `pg_cron` 扩展，可以直接在数据库中定义 cron 表达式来定时执行 SQL 函数。
    - **优点**: 简单、可靠、与数据紧密结合。
    - **适用**: 数据清理、数据汇总、状态更新等。

2.  **Supabase Edge Functions + Cron Triggers**:
    - 对于需要执行复杂 JavaScript/TypeScript 逻辑、调用外部 API 或需要更强计算能力的任务。
    - **实现**: 编写一个 Edge Function，然后在 Supabase Dashboard 中为其配置一个 Cron 触发器。
    - **优点**: 功能强大、语言灵活。

**选择建议**: 优先使用 `pg_cron`，只有当任务逻辑超出 SQL 范围时，才考虑使用 Edge Functions。
