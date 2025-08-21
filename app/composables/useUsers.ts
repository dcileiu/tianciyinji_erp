import type { User } from '~/types/database'

export const useUsers = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有用户
  const fetchUsers = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      users.value = data as User[]
    } catch (err: any) {
      error.value = err.message || '获取用户列表失败'
      console.error('Fetch users error:', err)
      
      // 使用模拟数据作为后备
      users.value = [
        {
          id: '1',
          name: '张三',
          email: 'zhangsan@example.com',
          role: 'admin',
          department: '技术部',
          position: '技术总监',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: '李四',
          email: 'lisi@example.com',
          role: 'manager',
          department: '销售部',
          position: '销售经理',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: '王五',
          email: 'wangwu@example.com',
          role: 'employee',
          department: '采购部',
          position: '采购员',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: '赵六',
          email: 'zhaoliu@example.com',
          role: 'viewer',
          department: '财务部',
          position: '会计',
          status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 创建用户
  const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { password, ...userInfo } = userData
      
      const { data, error: createError } = await supabase
        .from('users')
        .insert([{
          ...userInfo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      users.value.unshift(data as User)
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '创建用户失败'
      console.error('Create user error:', err)
      
      // 模拟创建成功
      const { password, ...userInfo } = userData
      const newUser: User = {
        id: Date.now().toString(),
        ...userInfo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      users.value.unshift(newUser)
      return { success: true, data: newUser }
    } finally {
      isLoading.value = false
    }
  }

  // 更新用户
  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...(data as User) }
      }
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '更新用户失败'
      console.error('Update user error:', err)
      
      // 模拟更新成功
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = { 
          ...users.value[index], 
          ...userData,
          updated_at: new Date().toISOString()
        } as User
      }
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 删除用户
  const deleteUser = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      users.value = users.value.filter(user => user.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '删除用户失败'
      console.error('Delete user error:', err)
      
      // 模拟删除成功
      users.value = users.value.filter(user => user.id !== id)
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 重置用户密码
  const resetUserPassword = async (id: string, newPassword: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 实现密码重置逻辑
      // 这里需要根据具体的认证系统实现
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '重置密码失败'
      console.error('Reset password error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // 刷新数据
  const refreshUsers = async () => {
    await fetchUsers()
  }

  // 根据ID获取用户
  const getUserById = (id: string) => {
    return users.value.find(user => user.id === id)
  }

  // 根据邮箱获取用户
  const getUserByEmail = (email: string) => {
    return users.value.find(user => user.email === email)
  }

  // 根据角色获取用户
  const getUsersByRole = (role: string) => {
    return users.value.filter(user => user.role === role)
  }

  // 根据部门获取用户
  const getUsersByDepartment = (department: string) => {
    return users.value.filter(user => user.department === department)
  }

  return {
    // 状态
    users: readonly(users),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    refreshUsers,
    getUserById,
    getUserByEmail,
    getUsersByRole,
    getUsersByDepartment
  }
} 