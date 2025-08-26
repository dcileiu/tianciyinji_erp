export default defineNuxtRouteMiddleware((to, _from) => {
  // 定义不需要认证的路由
  const publicRoutes = [
    '/',
    '/login',
    '/login/register',
    '/login/forgot-password',
    '/auth/callback',
    '/login/reset-password',
    '/getting-started',
  ]

  // 如果是公开路由，直接通过
  if (publicRoutes.includes(to.path)) {
    return
  }

  const { user, isLoading } = useAuth()

  // 如果还在加载认证状态，等待
  if (isLoading.value) {
    return
  }

  // 如果用户未登录，重定向到登录页面
  if (!user.value) {
    return navigateTo('/login')
  }

  // 如果用户已登录但访问根路径，重定向到仪表盘
  if (user.value && to.path === '/') {
    return navigateTo('/dashboard')
  }
})
