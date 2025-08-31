export default defineNuxtRouteMiddleware(async (to) => {
  // 只在客户端运行
  if (process.server) return

  const { fetchUserMenus, clearMenus, userMenus, loading } = useUserMenus()
  const user = useSupabaseUser()

  // 如果用户已登录但没有菜单数据，获取菜单权限
  if (user.value && userMenus.value.length === 0 && !loading.value) {
    try {
      await fetchUserMenus()
    } catch (error) {
      console.error('获取菜单权限失败:', error)
    }
  }

  // 如果用户退出登录，清空菜单数据
  if (!user.value && userMenus.value.length > 0) {
    clearMenus()
  }
})
