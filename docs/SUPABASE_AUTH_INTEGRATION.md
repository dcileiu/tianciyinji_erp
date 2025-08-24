# ERP 项目 Supabase 认证集成指南

## 项目概述

ERP 项目已成功集成 Supabase 认证系统，提供完整的用户认证功能，包括登录、注册、忘记密码和密码重置等功能。

## 技术栈对比

### CRM 项目 (Next.js)

- **依赖**: `@supabase/ssr` + `@supabase/supabase-js`
- **配置**: 手动配置客户端、服务端、中间件
- **状态管理**: Zustand
- **特点**: 更灵活，需要手动处理 SSR

### ERP 项目 (Nuxt.js) ✅

- **依赖**: `@nuxtjs/supabase` (Nuxt 专用模块)
- **配置**: 自动处理 SSR 和客户端集成
- **状态管理**: Vue 响应式系统 + Composables
- **特点**: 更简单，自动化程度更高

## 已完成的功能

### ✅ 1. 环境配置

- **文件**: `.env`, `.env.example`
- **变量**:
  - `NUXT_PUBLIC_SUPABASE_URL`
  - `NUXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NUXT_PUBLIC_SITE_URL`

### ✅ 2. 核心配置

- **文件**: `nuxt.config.ts`
- **配置**: Supabase 模块、重定向选项、运行时配置

### ✅ 3. 认证 Composable

- **文件**: `app/composables/useAuth.ts`
- **功能**:
  - 登录 (`login`)
  - 注册 (`register`)
  - 登出 (`logout`)
  - 重置密码 (`resetPassword`)
  - 更新密码 (`updatePassword`)
  - 会话管理 (`getSession`, `refreshSession`)
  - 状态监听 (`watchAuthState`)

### ✅ 4. 路由保护

- **文件**: `app/middleware/auth.global.ts`
- **功能**: 全局认证中间件，自动保护需要登录的页面

### ✅ 5. 认证页面

- **登录页面**: `app/pages/login.vue`
- **注册页面**: `app/pages/register.vue`
- **忘记密码**: `app/pages/forgot-password.vue`
- **密码重置**: `app/pages/auth/reset-password.vue`
- **认证回调**: `app/pages/auth/callback.vue`

### ✅ 6. 客户端插件

- **文件**: `app/plugins/auth.client.ts`
- **功能**: 应用启动时初始化认证状态

## 使用指南

### 1. 环境配置

复制 `.env.example` 为 `.env` 并填入您的 Supabase 配置：

```bash
cp .env.example .env
```

```env
# Supabase
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL (用于邮件重定向)
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. 在组件中使用认证

```vue
<script setup lang="ts">
const { user, isAuthenticated, isLoading, login, logout } = useAuth()

// 登录示例
const handleLogin = async () => {
  const result = await login({
    email: 'user@example.com',
    password: 'password123',
  })

  if (result.success) {
    // 登录成功
  } else {
    // 处理错误
    console.error(result.error?.message)
  }
}
</script>

<template>
  <div v-if="isLoading">加载中...</div>
  <div v-else-if="isAuthenticated">
    欢迎，{{ user?.email }}
    <button @click="logout">登出</button>
  </div>
  <div v-else>
    <button @click="handleLogin">登录</button>
  </div>
</template>
```

### 3. 路由保护

中间件会自动保护需要认证的页面，以下路径为公开访问：

- `/` (首页)
- `/login` (登录)
- `/register` (注册)
- `/forgot-password` (忘记密码)
- `/auth/callback` (认证回调)
- `/auth/reset-password` (密码重置)
- `/getting-started` (入门)

### 4. 自定义错误处理

认证系统内置了中文错误消息映射：

```typescript
const errorMessages = {
  'Invalid login credentials': '邮箱或密码错误，请检查后重试',
  'Email not confirmed': '邮箱尚未验证，请检查您的邮箱',
  'Too many requests': '请求过于频繁，请稍后再试',
  // ... 更多错误映射
}
```

## 认证流程

### 注册流程

1. 用户填写注册表单
2. 系统发送验证邮件到用户邮箱
3. 用户点击邮件中的验证链接
4. 重定向到 `/auth/callback` 进行验证
5. 验证成功后跳转到仪表盘

### 密码重置流程

1. 用户在忘记密码页面输入邮箱
2. 系统发送重置邮件
3. 用户点击邮件中的重置链接
4. 重定向到 `/auth/reset-password` 页面
5. 用户设置新密码
6. 完成后跳转到登录页面

## 架构优势

### 1. 自动化集成

- Nuxt 模块自动处理 SSR 和客户端认证
- 无需手动配置复杂的客户端/服务端实例

### 2. 响应式状态管理

- 使用 Vue 3 的响应式系统
- 状态变化自动更新 UI

### 3. 类型安全

- 完整的 TypeScript 支持
- 类型化的数据库接口

### 4. 现代化 UI

- 使用 PrimeVue 组件库
- 响应式设计，支持移动端
- 优雅的加载和错误状态

## 常见问题

### Q: 如何处理认证状态持久化？

A: Supabase 模块会自动处理会话持久化，用户刷新页面后登录状态会保持。

### Q: 如何自定义重定向逻辑？

A: 可以在 `nuxt.config.ts` 中的 `supabase.redirectOptions` 配置重定向选项。

### Q: 如何添加社交登录？

A: 可以在 `useAuth` composable 中添加社交登录方法，例如：

```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${$config.public.siteUrl}/auth/callback`,
    },
  })
  // 处理结果
}
```

## 部署注意事项

1. **环境变量**: 确保生产环境配置了正确的 Supabase 凭据
2. **站点 URL**: `NUXT_PUBLIC_SITE_URL` 必须设置为生产环境的正确域名
3. **Supabase 配置**: 在 Supabase 控制台中配置正确的重定向 URL

## 总结

ERP 项目的 Supabase 认证集成已完成，提供了比 CRM 项目更简洁、更现代化的认证解决方案。Nuxt 3 的
`@nuxtjs/supabase` 模块大大简化了配置和使用过程，同时保持了完整的功能性和类型安全。
