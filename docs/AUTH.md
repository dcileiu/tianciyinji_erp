# 认证指南

基于 **自建邮箱密码 + 服务端 Session（HttpOnly Cookie）**，数据库为 Docker / 直连 Postgres（Drizzle）。

## 环境变量

| 变量 | 用途 |
|------|------|
| `DATABASE_URL` | Postgres 连接串 |
| `SESSION_SECRET` | 会话相关密钥（生产必改） |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | 仅 `pnpm db:seed` |
| `NUXT_PUBLIC_SITE_URL` | 站点根地址 |
| `NODE_ENV` | 环境标记 |

本地库：

```bash
pnpm db:up
pnpm db:push
pnpm db:seed
```

## 页面与路由

| 路径 | 说明 |
|------|------|
| `/login` | 邮箱密码登录 |
| `/login/forgot-password` | 提示联系管理员重置（无 SMTP） |
| `/login/register` | 已关闭，重定向 `/login` |

## 流程

1. `POST /api/auth/login` → 校验 bcrypt → 写入 `sessions` → Cookie `erp_session`
2. `useAuth().login` 拉 profile / permissions
3. `POST /api/auth/logout` 删 session、清 Cookie
4. 中间件与 `/api/user` 用 Cookie 鉴权；`assertPermission` 校验菜单权限码

超管角色码：`super_admin`。
