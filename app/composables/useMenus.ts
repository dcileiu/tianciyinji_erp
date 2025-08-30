import type { Database } from '~/types/database.types'

// 菜单类型定义
export interface Menu {
  id: string
  name: string
  icon?: string | null
  path?: string | null
  parent_id: string // '0' 表示根菜单
  sort: number
  status: 'active' | 'inactive'
  permission?: string | null
  type: 'directory' | 'menu' | 'permission'
  created_at?: string
  updated_at?: string
  children?: Menu[]
}

// 菜单表单类型
export interface MenuForm {
  name: string
  icon?: string | null
  path?: string | null
  parent_id: string // '0' 表示根菜单
  sort: number
  status: 'active' | 'inactive'
  permission?: string | null
  type: 'directory' | 'menu' | 'permission'
}

// 菜单查询参数
export interface MenuQuery {
  search?: string
  status?: string
  type?: string
  parent_id?: string | null
}

export const useMenus = () => {
  const supabase = useSupabaseClient<Database>()

  // 状态
  const menus = ref<Menu[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取菜单树结构
  const fetchMenus = async (query?: MenuQuery) => {
    try {
      loading.value = true
      error.value = null

      let dbQuery = supabase
        .from('menus')
        .select('*')
        .order('sort', { ascending: true })
        .order('created_at', { ascending: true })

      // 添加筛选条件
      if (query?.search) {
        dbQuery = dbQuery.or(`name.ilike.%${query.search}%,path.ilike.%${query.search}%`)
      }

      if (query?.status && query.status !== 'all') {
        dbQuery = dbQuery.eq('status', query.status)
      }

      if (query?.type && query.type !== 'all') {
        dbQuery = dbQuery.eq('type', query.type)
      }

      const { data, error: fetchError } = await dbQuery

      if (fetchError) throw fetchError

      // 构建树结构
      const menuTree = buildMenuTree(data || [])
      menus.value = menuTree

      return { data: menuTree, error: null }
    } catch (err: any) {
      error.value = err.message || '获取菜单失败'
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 获取单个菜单
  const fetchMenu = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('menus')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  // 创建菜单
  const createMenu = async (menuData: MenuForm) => {
    try {
      loading.value = true
      error.value = null

      // 处理数据，保持 parent_id 为字符串类型
      const processedData = {
        ...menuData,
        parent_id: menuData.parent_id || '0',
        icon: menuData.icon || null,
        path: menuData.path || null,
        permission: menuData.permission || null,
      }

      // @ts-ignore
      const { data, error: createError } = await (supabase as any)
        .from('menus')
        .insert([processedData])
        .select()
        .single()

      if (createError) throw createError

      // 重新获取菜单列表
      await fetchMenus()

      return { data, error: null }
    } catch (err: any) {
      error.value = err.message || '创建菜单失败'
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 更新菜单
  const updateMenu = async (id: string, menuData: Partial<MenuForm>) => {
    try {
      loading.value = true
      error.value = null

      // 处理数据，保持 parent_id 为字符串类型
      const processedData = {
        ...menuData,
        parent_id: menuData.parent_id || '0',
        icon: menuData.icon || null,
        path: menuData.path || null,
        permission: menuData.permission || null,
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore
      const { data, error: updateError } = await (supabase as any)
        .from('menus')
        .update(processedData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // 重新获取菜单列表
      await fetchMenus()

      return { data, error: null }
    } catch (err: any) {
      error.value = err.message || '更新菜单失败'
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 删除菜单
  const deleteMenu = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      // 检查是否有子菜单
      const { data: children } = await supabase
        .from('menus')
        .select('id')
        .eq('parent_id', id)

      if (children && children.length > 0) {
        throw new Error('无法删除有子菜单的菜单，请先删除子菜单')
      }

      const { error: deleteError } = await supabase
        .from('menus')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // 重新获取菜单列表
      await fetchMenus()

      return { error: null }
    } catch (err: any) {
      error.value = err.message || '删除菜单失败'
      return { error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 批量删除菜单
  const deleteMenus = async (ids: string[]) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('menus')
        .delete()
        .in('id', ids)

      if (deleteError) throw deleteError

      // 重新获取菜单列表
      await fetchMenus()

      return { error: null }
    } catch (err: any) {
      error.value = err.message || '批量删除菜单失败'
      return { error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 更新菜单状态
  const updateMenuStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      // @ts-ignore
      const { error: updateError } = await (supabase as any)
        .from('menus')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      // 重新获取菜单列表
      await fetchMenus()

      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // 获取父级菜单选项（用于下拉选择）
  const getParentMenuOptions = () => {
    const options: Array<{ label: string; value: string }> = []

    const addMenuOptions = (menuList: Menu[], prefix = '') => {
      menuList.forEach(menu => {
        if (menu.type === 'directory' || menu.type === 'menu') {
          options.push({
            label: `${prefix}${menu.name}`,
            value: menu.id
          })

          if (menu.children && menu.children.length > 0) {
            addMenuOptions(menu.children, `${prefix}${menu.name} / `)
          }
        }
      })
    }

    addMenuOptions(menus.value)
    return options
  }

  return {
    // 状态
    menus: readonly(menus),
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    fetchMenus,
    fetchMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    deleteMenus,
    updateMenuStatus,
    getParentMenuOptions,
  }
}

// 构建菜单树结构的辅助函数
function buildMenuTree(flatMenus: any[]): Menu[] {
  const menuMap = new Map<string, Menu>()
  const rootMenus: Menu[] = []

  // 首先创建所有菜单对象
  flatMenus.forEach(menu => {
    menuMap.set(menu.id, {
      ...menu,
      children: []
    })
  })

  // 然后构建父子关系
  flatMenus.forEach(menu => {
    const menuNode = menuMap.get(menu.id)!

    if (!menu.parent_id || menu.parent_id === '0') {
      // 根菜单
      rootMenus.push(menuNode)
    } else {
      // 子菜单
      const parentNode = menuMap.get(menu.parent_id)
      if (parentNode) {
        parentNode.children = parentNode.children || []
        parentNode.children.push(menuNode)
      }
    }
  })

  return rootMenus
}
