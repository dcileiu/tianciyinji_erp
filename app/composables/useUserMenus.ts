export interface MenuItem {
  name: string
  path: string
  icon: string
  permission: string
  enabled: boolean
}

export interface MenuGroup {
  title: string
  menu: MenuItem[]
}

export const useUserMenus = () => {
  const userMenus = ref<MenuGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取用户菜单权限
  const fetchUserMenus = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/user/menus') as any

      if (response.code === 0) {
        userMenus.value = response.data
      } else {
        throw new Error(response.message || '获取菜单权限失败')
      }
    } catch (err: any) {
      error.value = err.message || '获取菜单权限失败'
      console.error('获取用户菜单失败:', err)
      userMenus.value = []
    } finally {
      loading.value = false
    }
  }

  // 清空菜单数据
  const clearMenus = () => {
    userMenus.value = []
    error.value = null
  }

  // 检查用户是否有某个权限
  const hasPermission = (permission: string): boolean => {
    return userMenus.value.some(group =>
      group.menu.some(item =>
        item.permission === permission && item.enabled
      )
    )
  }

  // 获取所有可用的菜单
  const availableMenus = computed(() => {
    return userMenus.value.filter(group =>
      group.menu.some(item => item.enabled)
    ).map(group => ({
      ...group,
      menu: group.menu.filter(item => item.enabled)
    }))
  })

  // 获取用户所有权限
  const userPermissions = computed(() => {
    const permissions: string[] = []
    userMenus.value.forEach(group => {
      group.menu.forEach(item => {
        if (item.enabled) {
          permissions.push(item.permission)
        }
      })
    })
    return permissions
  })

  return {
    userMenus: readonly(userMenus),
    loading: readonly(loading),
    error: readonly(error),
    availableMenus,
    userPermissions,
    fetchUserMenus,
    clearMenus,
    hasPermission
  }
}
