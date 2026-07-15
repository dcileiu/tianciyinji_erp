# API 结构说明

业务 API 按模块分目录；认证与权限走 Session Cookie。

## 目录（与仓库一致）

```
server/api/
├── auth/
│   ├── login.post.ts
│   └── logout.post.ts
├── user/                 # 当前登录用户 profile / permissions / menus
├── users/                # 用户 CRUD
├── roles/                # 角色 CRUD + [id]/menus
├── departments/
├── menus/
├── products|customers|suppliers|warehouses|inventory/
├── sales/orders|purchase/orders/
├── workshops|boms|production/{plans,orders}/
├── finance/{receivables,payables,receipts,payments,invoices}/
├── reports/
└── _utils/               # permissions / crud / inventory
```

## 鉴权

- Cookie：`erp_session`
- 业务写接口：`assertPermission(event, 'module:action')`
- 超管角色码：`super_admin`

## 初始化

不在此目录初始化库。请用：

```bash
pnpm db:up && pnpm db:push && pnpm db:seed
```

详见 `docs/AUTH.md`、`docs/PERMISSIONS.md`。
