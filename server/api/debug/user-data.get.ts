import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
      return { error: '用户未认证' }
    }

    console.log('调试用户数据，用户ID:', user.id)

    // 1. 检查用户角色分配
    const { data: userRoles, error: userRolesError } = await supabase
      .from('users_role')
      .select('*')
      .eq('user_id', user.id)

    // 2. 检查所有角色
    const { data: allRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*')

    // 3. 检查角色菜单关系
    const { data: roleMenus, error: roleMenusError } = await supabase
      .from('roles_menu')
      .select('*')

    // 4. 检查所有菜单
    const { data: allMenus, error: menusError } = await supabase
      .from('menus')
      .select('*')
      .eq('status', 'active')

    // 5. 尝试直接查询用户权限（调试用）
    const { data: directQuery, error: directError } = await supabase
      .from('menus')
      .select(`
        id, name, permission,
        roles_menu!inner(
          role_id,
          roles!inner(
            id, name, status,
            users_role!inner(user_id)
          )
        )
      `)
      .eq('roles_menu.roles.users_role.user_id', user.id)
      .eq('status', 'active')

    return {
      userId: user.id,
      userRoles: {
        data: userRoles,
        error: userRolesError
      },
      allRoles: {
        data: allRoles,
        error: rolesError
      },
      roleMenus: {
        data: roleMenus,
        error: roleMenusError
      },
      allMenus: {
        data: allMenus,
        error: menusError
      },
      directQuery: {
        data: directQuery,
        error: directError
      }
    }
  } catch (error: any) {
    console.error('调试API错误:', error)
    return { error: error.message }
  }
})
