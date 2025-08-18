export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // 如果用户未登录，重定向到登录页
  if (!user.value) {
    return navigateTo('/login')
  }
})
