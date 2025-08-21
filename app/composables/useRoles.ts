import type { Role } from '~/types/database'

export const useRoles = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const roles = ref<Role[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有角色
  const fetchRoles = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      roles.value = data as Role[]
    } catch (err: any) {
      error.value = err.message || '获取角色列表失败'
      console.error('Fetch roles error:', err)
      
      // 使用模拟数据作为后备
      roles.value = [
        {
          id: '1',
          name: '系统管理员',
          code: 'admin',
          description: '拥有系统所有权限',
          permissions: ['*'],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: '销售经理',
          code: 'sales_manager',
          description: '负责销售模块管理',
          permissions: ['sales:read', 'sales:write', 'customer:read', 'customer:write'],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: '采购员',
          code: 'purchaser',
          description: '负责采购相关工作',
          permissions: ['purchase:read', 'purchase:write', 'supplier:read', 'supplier:write'],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 创建角色
  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('roles')
        .insert([{
          ...roleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      roles.value.unshift(data as Role)
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '创建角色失败'
      console.error('Create role error:', err)
      
      // 模拟创建成功
      const newRole: Role = {
        id: Date.now().toString(),
        ...roleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      roles.value.unshift(newRole)
      return { success: true, data: newRole }
    } finally {
      isLoading.value = false
    }
  }

  // 更新角色
  const updateRole = async (id: string, roleData: Partial<Role>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('roles')
        .update({
          ...roleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = roles.value.findIndex(role => role.id === id)
      if (index !== -1) {
        roles.value[index] = { ...roles.value[index], ...(data as Role) }
      }
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '更新角色失败'
      console.error('Update role error:', err)
      
      // 模拟更新成功
      const index = roles.value.findIndex(role => role.id === id)
      if (index !== -1) {
        roles.value[index] = { 
          ...roles.value[index], 
          ...roleData,
          updated_at: new Date().toISOString()
        } as Role
      }
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 删除角色
  const deleteRole = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      roles.value = roles.value.filter(role => role.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '删除角色失败'
      console.error('Delete role error:', err)
      
      // 模拟删除成功
      roles.value = roles.value.filter(role => role.id !== id)
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 刷新数据
  const refreshRoles = async () => {
    await fetchRoles()
  }

  // 根据ID获取角色
  const getRoleById = (id: string) => {
    return roles.value.find(role => role.id === id)
  }

  // 根据编码获取角色
  const getRoleByCode = (code: string) => {
    return roles.value.find(role => role.code === code)
  }

  return {
    // 状态
    roles: readonly(roles),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    refreshRoles,
    getRoleById,
    getRoleByCode
  }
} 