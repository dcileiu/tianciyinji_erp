# ERP 系统认证指南

## 认证系统概述

本 ERP 系统集成了 Supabase 认证服务，提供完整的用户认证功能：

- ✅ 邮箱密码登录/注册
- ✅ 邮箱验证
- ✅ 密码重置
- ✅ 用户会话管理
- ✅ 受保护路由
- ✅ 响应式 UI

## 环境配置

### 1. 创建 `.env` 文件

```bash
cp .env.example .env
```

### 2. 配置 Supabase

在 `.env` 文件中添加：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase 项目设置

在 Supabase 项目中配置：

#### 认证设置

- 启用邮箱认证
- 设置邮箱确认要求（推荐开启）
- 配置重定向 URL：
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset-password`

#### 邮件模板（可选）

- 自定义邮箱验证邮件模板
- 自定义密码重置邮件模板

## 认证流程

### 用户注册流程

1. 用户访问 `/register` 页面
2. 填写邮箱、密码、姓名
3. 系统发送验证邮件
4. 用户点击邮件中的验证链接
5. 重定向到 `/auth/callback` 处理验证
6. 验证成功后跳转到 `/dashboard`

### 用户登录流程

1. 用户访问 `/login` 页面
2. 输入邮箱和密码
3. 登录成功后跳转到 `/dashboard`
4. 如果邮箱未验证，显示相应提示

### 密码重置流程

1. 用户点击"忘记密码"
2. 输入邮箱地址
3. 系统发送重置邮件
4. 用户点击邮件中的重置链接
5. 重定向到 `/auth/reset-password`
6. 设置新密码

## 页面路由

### 公开页面（无需登录）

- `/` - 首页
- `/login` - 登录页面
- `/register` - 注册页面
- `/forgot-password` - 忘记密码
- `/auth/callback` - 邮箱验证回调
- `/auth/reset-password` - 密码重置

### 受保护页面（需要登录）

- `/dashboard` - 仪表板
- `/master-data/*` - 主数据管理
- `/warehouse/*` - 仓库管理
- `/sales/*` - 销售管理
- `/purchase/*` - 采购管理
- `/production/*` - 生产管理

## 认证 Composable 使用

### useAuth()

```typescript
const {
  // 状态
  user, // 当前用户信息
  isLoading, // 是否正在加载
  isAuthenticated, // 是否已认证

  // 方法
  login, // 登录
  register, // 注册
  logout, // 登出
  resetPassword, // 重置密码
  updatePassword, // 更新密码
  updateProfile, // 更新用户信息
} = useAuth()
```

### 使用示例

```vue
<template>
  <div>
    <div v-if="isLoading">加载中...</div>
    <div v-else-if="isAuthenticated">
      欢迎，{{ user?.email }}！
      <button @click="handleLogout">退出</button>
    </div>
    <div v-else>请先登录</div>
  </div>
</template>

<script setup>
const { user, isLoading, isAuthenticated, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>
```

## 中间件

### auth 中间件

自动保护需要登录的页面：

```typescript
// pages/dashboard.vue
definePageMeta({
  middleware: 'auth',
})
```

## 错误处理

### 常见错误及解决方案

1. **登录失败**
   - 检查邮箱密码是否正确
   - 确认邮箱是否已验证

2. **邮箱验证失败**
   - 检查验证链接是否过期
   - 确认重定向 URL 配置正确

3. **密码重置失败**
   - 检查邮箱是否存在
   - 确认重置链接是否过期

## 安全最佳实践

1. **密码要求**
   - 最少 6 个字符
   - 建议包含字母、数字、特殊字符

2. **会话管理**
   - 自动处理 token 刷新
   - 监听认证状态变化

3. **路由保护**
   - 受保护页面自动重定向到登录页
   - 已登录用户访问登录页自动重定向到仪表板

## 开发调试

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问应用
http://localhost:3000
```

### 查看认证状态

在浏览器开发者工具中：

```javascript
// 查看当前用户
console.log(useSupabaseUser().value)

// 查看会话信息
console.log(useSupabaseSession().value)
```

## 部署注意事项

1. **环境变量**
   - 确保生产环境配置正确的 Supabase URL 和 Key

2. **重定向 URL**
   - 在 Supabase 项目中添加生产环境的重定向 URL

3. **邮件服务**
   - 配置自定义 SMTP（生产环境推荐）
   - 自定义邮件模板和发送域名

## 故障排除

### 常见问题

1. **认证状态不更新**
   - 检查 `plugins/auth.client.ts` 是否正确加载
   - 确认 `useAuth` composable 正常工作

2. **重定向循环**
   - 检查中间件配置
   - 确认路由保护逻辑

3. **邮件发送失败**
   - 检查 Supabase 邮件配置
   - 确认 SMTP 设置（如果使用自定义 SMTP）

### 调试技巧

1. **启用调试日志**

   ```typescript
   // 在 composables/useAuth.ts 中
   console.log('Auth state changed:', event, session?.user?.email)
   ```

2. **检查网络请求**
   - 在浏览器开发者工具中查看网络请求
   - 确认 Supabase API 调用正常

3. **验证环境变量**
   ```typescript
   // 在组件中
   console.log('Supabase URL:', useRuntimeConfig().public.supabaseUrl)
   ```

## 扩展功能

### 未来可添加的功能

1. **社交登录**
   - Google、GitHub、微信等
   - 配置相应的 OAuth 提供商

2. **多因素认证**
   - SMS 验证码
   - 认证器应用

3. **用户角色权限**
   - 基于角色的访问控制
   - 细粒度权限管理

4. **用户资料管理**
   - 头像上传
   - 个人信息编辑
   - 偏好设置
