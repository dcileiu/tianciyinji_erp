export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  const permissionsStore = usePermissionsStore()
  const user = useSupabaseUser()

  // 监听用户状态变化
  watch(user, async (newUser, oldUser) => {
    if (newUser && newUser !== oldUser) {
      // 用户登录，设置用户状态并初始化数据
      userStore.setAuthUser(newUser)

      try {
        // 并行初始化用户数据和权限数据
        await Promise.all([
          userStore.initializeUserData().catch(err => {
            console.warn('初始化用户数据失败:', err.message)
          }),
          permissionsStore.fetchUserPermissions().catch(err => {
            console.warn('获取权限数据失败:', err.message)
          })
        ])
      } catch (error) {
        console.error('用户数据初始化失败:', error)
      }
    } else if (!newUser && oldUser) {
      // 用户退出，清空所有数据
      userStore.logout()
      permissionsStore.clearPermissions()
    }
  }, { immediate: true })

  // 页面刷新时，如果用户已登录，初始化数据
  if (process.client && user.value) {
    userStore.setAuthUser(user.value)

    try {
      // 只有在数据为空时才重新加载
      const promises = []
      if (!userStore.profile) {
        promises.push(
          userStore.initializeUserData().catch(err => {
            console.warn('页面刷新时获取用户数据失败:', err.message)
          })
        )
      }
      if (permissionsStore.permissions.length === 0) {
        promises.push(
          permissionsStore.fetchUserPermissions().catch(err => {
            console.warn('页面刷新时获取权限数据失败:', err.message)
          })
        )
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }
    } catch (error) {
      console.error('页面刷新时初始化用户数据失败:', error)
    }
  }
})
