import type { Database } from '~/types/database'

type Permission = Database['public']['Tables']['resources']['Row']
type UserRole = Database['public']['Tables']['user_roles']['Row']
type RoleResource = Database['public']['Tables']['role_resources']['Row']

export const usePermissions = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // 获取用户权限
  const getUserPermissions = async (userId?: string) => {
    if (!userId && !user.value?.id) {
      throw new Error('用户未登录')
    }

    const targetUserId = userId || user.value!.id

    try {
      const { data, error } = await supabase.rpc('check_user_permission', {
        user_id: targetUserId,
        resource_code: '' // 获取所有权限
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取用户权限失败:', error)
      return []
    }
  }

  // 检查用户是否有特定权限
  const hasPermission = async (resourceCode: string, userId?: string): Promise<boolean> => {
    if (!userId && !user.value?.id) {
      return false
    }

    const targetUserId = userId || user.value!.id

    try {
      const { data, error } = await supabase.rpc('check_user_permission', {
        user_id: targetUserId,
        resource_code: resourceCode
      })

      if (error) throw error
      return data || false
    } catch (error) {
      console.error('检查权限失败:', error)
      return false
    }
  }

  // 检查多个权限
  const hasAnyPermission = async (resourceCodes: string[], userId?: string): Promise<boolean> => {
    for (const code of resourceCodes) {
      if (await hasPermission(code, userId)) {
        return true
      }
    }
    return false
  }

  // 检查是否拥有所有权限
  const hasAllPermissions = async (resourceCodes: string[], userId?: string): Promise<boolean> => {
    for (const code of resourceCodes) {
      if (!(await hasPermission(code, userId))) {
        return false
      }
    }
    return true
  }

  // 获取所有资源/权限列表
  const getResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取资源列表失败:', error)
      return []
    }
  }

  // 获取角色权限
  const getRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_resources')
        .select(`
          *,
          resources (*)
        `)
        .eq('role_id', roleId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取角色权限失败:', error)
      return []
    }
  }

  // 更新角色权限
  const updateRolePermissions = async (roleId: string, resourceIds: string[]) => {
    try {
      // 先删除现有权限
      const { error: deleteError } = await supabase
        .from('role_resources')
        .delete()
        .eq('role_id', roleId)

      if (deleteError) throw deleteError

      // 添加新权限
      if (resourceIds.length > 0) {
        const roleResources = resourceIds.map(resourceId => ({
          role_id: roleId,
          resource_id: resourceId
        }))

        const { error: insertError } = await supabase
          .from('role_resources')
          .insert(roleResources)

        if (insertError) throw insertError
      }

      return true
    } catch (error) {
      console.error('更新角色权限失败:', error)
      throw error
    }
  }

  // 记录权限操作日志
  const logPermissionAction = async (action: string, resourceCode: string, details?: string) => {
    if (!user.value?.id) return

    try {
      await supabase.rpc('log_permission_action', {
        user_id: user.value.id,
        action,
        resource_code: resourceCode,
        details: details || null
      })
    } catch (error) {
      console.error('记录权限日志失败:', error)
    }
  }

  return {
    getUserPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getResources,
    getRolePermissions,
    updateRolePermissions,
    logPermissionAction
  }
}