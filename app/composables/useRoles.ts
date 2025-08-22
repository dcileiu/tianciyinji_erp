import type { Database } from '~/types/database'

type Role = Database['public']['Tables']['roles']['Row']
type UserRole = Database['public']['Tables']['user_roles']['Row']

export const useRoles = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // 获取所有角色
  const getRoles = async (): Promise<Role[]> => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取角色列表失败:', error)
      return []
    }
  }

  // 获取用户角色
  const getUserRoles = async (userId?: string) => {
    if (!userId && !user.value?.id) {
      return []
    }

    const targetUserId = userId || user.value!.id

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          roles (*)
        `)
        .eq('user_id', targetUserId)
        .eq('roles.is_active', true)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取用户角色失败:', error)
      return []
    }
  }

  // 检查用户是否有特定角色
  const hasRole = async (roleCode: string, userId?: string): Promise<boolean> => {
    if (!userId && !user.value?.id) {
      return false
    }

    const targetUserId = userId || user.value!.id

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles!inner(code)
        `)
        .eq('user_id', targetUserId)
        .eq('roles.code', roleCode)
        .eq('roles.is_active', true)

      if (error) throw error
      return (data && data.length > 0) || false
    } catch (error) {
      console.error('检查用户角色失败:', error)
      return false
    }
  }

  // 检查是否是管理员
  const isAdmin = async (userId?: string): Promise<boolean> => {
    return await hasRole('admin', userId)
  }

  // 创建角色
  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('创建角色失败:', error)
      throw error
    }
  }

  // 更新角色
  const updateRole = async (id: string, roleData: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('更新角色失败:', error)
      throw error
    }
  }

  // 删除角色
  const deleteRole = async (id: string) => {
    try {
      // 检查是否有用户使用此角色
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role_id', id)

      if (userRoles && userRoles.length > 0) {
        throw new Error('该角色正在被用户使用，无法删除')
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('删除角色失败:', error)
      throw error
    }
  }

  // 分配用户角色
  const assignUserRole = async (userId: string, roleId: string) => {
    try {
      // 检查是否已经分配
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', roleId)

      if (existing && existing.length > 0) {
        throw new Error('用户已经拥有此角色')
      }

      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role_id: roleId
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('分配用户角色失败:', error)
      throw error
    }
  }

  // 移除用户角色
  const removeUserRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('移除用户角色失败:', error)
      throw error
    }
  }

  // 更新用户角色（替换所有角色）
  const updateUserRoles = async (userId: string, roleIds: string[]) => {
    try {
      // 先删除现有角色
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // 添加新角色
      if (roleIds.length > 0) {
        const userRoles = roleIds.map(roleId => ({
          user_id: userId,
          role_id: roleId
        }))

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(userRoles)

        if (insertError) throw insertError
      }

      return true
    } catch (error) {
      console.error('更新用户角色失败:', error)
      throw error
    }
  }

  // 获取角色统计信息
  const getRoleStats = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          code,
          user_roles(count)
        `)
        .eq('is_active', true)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('获取角色统计失败:', error)
      return []
    }
  }

  return {
    getRoles,
    getUserRoles,
    hasRole,
    isAdmin,
    createRole,
    updateRole,
    deleteRole,
    assignUserRole,
    removeUserRole,
    updateUserRoles,
    getRoleStats
  }
}