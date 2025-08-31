export default defineNuxtPlugin(async () => {
  const user = useSupabaseUser()
  const { fetchUserMenus, clearMenus } = useUserMenus()

  // 监听用户登录状态变化
  watch(user, async (newUser, oldUser) => {
    if (newUser && !oldUser) {
      // 用户刚登录，获取菜单权限
      try {
        await fetchUserMenus()
        console.log('用户菜单权限加载成功')
      } catch (error) {
        console.error('加载用户菜单权限失败:', error)
      }
    } else if (!newUser && oldUser) {
      // 用户退出登录，清空菜单
      clearMenus()
      console.log('用户菜单权限已清空')
    }
  }, { immediate: true })

  // 页面刷新时，如果用户已登录则加载菜单
  if (user.value) {
    try {
      await fetchUserMenus()
      console.log('页面刷新后菜单权限加载成功')
    } catch (error) {
      console.error('页面刷新后加载菜单权限失败:', error)
    }
  }
})
