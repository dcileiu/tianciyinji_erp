import type { Database } from '~/types/database'

type Menu = Database['public']['Tables']['menus']['Row']
type UserMenu = Menu & {
  children?: UserMenu[]
}

export const useMenus = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // 获取用户菜单
  const getUserMenus = async (userId?: string): Promise<UserMenu[]> => {
    if (!userId && !user.value?.id) {
      return []
    }

    const targetUserId = userId || user.value!.id

    try {
      const { data, error } = await supabase.rpc('get_user_menus', {
        user_id: targetUserId
      })

      if (error) throw error
      
      // 构建菜单树结构
      return buildMenuTree(data || [])
    } catch (error) {
      console.error('获取用户菜单失败:', error)
      return []
    }
  }

  // 获取所有菜单（管理员用）
  const getAllMenus = async (): Promise<Menu[]> => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取所有菜单失败:', error)
      return []
    }
  }

  // 构建菜单树结构
  const buildMenuTree = (menus: Menu[]): UserMenu[] => {
    const menuMap = new Map<string, UserMenu>()
    const rootMenus: UserMenu[] = []

    // 创建菜单映射
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] })
    })

    // 构建树结构
    menus.forEach(menu => {
      const menuItem = menuMap.get(menu.id)!
      
      if (menu.parent_id && menuMap.has(menu.parent_id)) {
        const parent = menuMap.get(menu.parent_id)!
        parent.children!.push(menuItem)
      } else {
        rootMenus.push(menuItem)
      }
    })

    return rootMenus
  }

  // 创建菜单
  const createMenu = async (menuData: Omit<Menu, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .insert([menuData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建菜单失败:', error)
      throw error
    }
  }

  // 更新菜单
  const updateMenu = async (id: string, menuData: Partial<Omit<Menu, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .update(menuData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新菜单失败:', error)
      throw error
    }
  }

  // 删除菜单
  const deleteMenu = async (id: string) => {
    try {
      // 检查是否有子菜单
      const { data: children } = await supabase
        .from('menus')
        .select('id')
        .eq('parent_id', id)

      if (children && children.length > 0) {
        throw new Error('请先删除子菜单')
      }

      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('删除菜单失败:', error)
      throw error
    }
  }

  // 获取角色菜单权限
  const getRoleMenus = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_menus')
        .select(`
          *,
          menus (*)
        `)
        .eq('role_id', roleId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取角色菜单失败:', error)
      return []
    }
  }

  // 更新角色菜单权限
  const updateRoleMenus = async (roleId: string, menuIds: string[]) => {
    try {
      // 先删除现有菜单权限
      const { error: deleteError } = await supabase
        .from('role_menus')
        .delete()
        .eq('role_id', roleId)

      if (deleteError) throw deleteError

      // 添加新菜单权限
      if (menuIds.length > 0) {
        const roleMenus = menuIds.map(menuId => ({
          role_id: roleId,
          menu_id: menuId
        }))

        const { error: insertError } = await supabase
          .from('role_menus')
          .insert(roleMenus)

        if (insertError) throw insertError
      }

      return true
    } catch (error) {
      console.error('更新角色菜单失败:', error)
      throw error
    }
  }

  // 获取面包屑导航
  const getBreadcrumbs = async (menuId: string): Promise<Menu[]> => {
    try {
      const { data: menu, error } = await supabase
        .from('menus')
        .select('*')
        .eq('id', menuId)
        .single()

      if (error) throw error
      if (!menu) return []

      const breadcrumbs: Menu[] = [menu]
      
      // 递归获取父菜单
      let currentMenu = menu
      while (currentMenu.parent_id) {
        const { data: parentMenu, error: parentError } = await supabase
          .from('menus')
          .select('*')
          .eq('id', currentMenu.parent_id)
          .single()

        if (parentError || !parentMenu) break
        
        breadcrumbs.unshift(parentMenu)
        currentMenu = parentMenu
      }

      return breadcrumbs
    } catch (error) {
      console.error('获取面包屑失败:', error)
      return []
    }
  }

  return {
    getUserMenus,
    getAllMenus,
    buildMenuTree,
    createMenu,
    updateMenu,
    deleteMenu,
    getRoleMenus,
    updateRoleMenus,
    getBreadcrumbs
  }
}