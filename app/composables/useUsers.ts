import type { Database } from '~/types/database.types'

// 用户类型定义（扩展 auth.users）
export interface UserData {
  id: string
  email: string
  phone?: string | null
  email_confirmed_at?: string | null
  last_sign_in_at?: string | null
  created_at: string
  updated_at: string
  // 从 raw_user_meta_data 提取的字段
  name?: string
  username?: string
  avatar?: string
  department_id?: string
  position_id?: string
  remarks?: string
  // 关联的角色信息
  roles?: Array<{
    id: string
    name: string
    code: string
  }>
  // 状态和统计信息
  status: 'active' | 'inactive' | 'pending'
  is_online: boolean
  login_count: number
}

// 用户表单类型
export interface UserForm {
  username: string
  name: string
  email: string
  phone?: string
  password?: string
  confirmPassword?: string
  department_id?: string
  role_ids: string[]
  remarks?: string
  status: 'active' | 'inactive' | 'pending'
}

// 查询参数类型
export interface UserQuery {
  page?: number
  pageSize?: number
  search?: string
  role_id?: string
  department_id?: string
  status?: string
}

// 用户统计类型
export interface UserStats {
  total: number
  active: number
  inactive: number
  pending: number
  online: number
  admins: number
  newThisMonth: number
}

export const useUsers = () => {
  const supabase = useSupabaseClient<Database>()

  // 状态
  const users = ref<UserData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

      // 获取用户列表
  const getUsers = async (query: UserQuery = {}) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API
      const result = await $fetch('/api/users', {
        query: query
      }) as any

      if (result.code === 0) {
        // 转换数据格式
        const transformedUsers = result.data.map(transformUserData)
        users.value = transformedUsers

        return {
          code: 0,
          message: result.message,
          data: transformedUsers,
          total: result.total
        }
      } else {
        return result
      }
    } catch (err: any) {
      error.value = err.message || '获取用户列表失败'
      return {
        code: -1,
        message: err.message || '获取用户列表失败',
        data: [],
        total: 0
      }
    } finally {
      loading.value = false
    }
  }

       // 获取单个用户
  const getUser = async (id: string) => {
    try {
      // 获取用户角色信息
      const { data: userRoles, error: roleError } = await supabase
        .from('users_role')
        .select(`
          user_id,
          roles!inner(
            id,
            name,
            code
          )
        `)
        .eq('user_id', id)

      if (roleError) throw roleError

      // 创建模拟用户数据
      const mockUser = {
        id,
        email: id === '098db796-66e3-4a87-b43c-57ecda4d4ecb' ? 'dianci.liu@gmail.com' : `user${id.slice(0, 8)}@example.com`,
        user_metadata: {
          name: id === '098db796-66e3-4a87-b43c-57ecda4d4ecb' ? '管理员' : `用户${id.slice(0, 8)}`,
          username: id === '098db796-66e3-4a87-b43c-57ecda4d4ecb' ? 'admin' : `user${id.slice(0, 8)}`,
          status: 'active',
          department_id: '1'
        },
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        roles: userRoles?.map(ur => ur.roles) || []
      }

      return {
        code: 0,
        message: '获取成功',
        data: transformUserData(mockUser)
      }
    } catch (err: any) {
      return {
        code: -1,
        message: err.message || '获取用户失败',
        data: null
      }
    }
  }

  // 创建用户
  const createUser = async (userData: UserForm) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API 创建用户
      const result = await $fetch('/api/users', {
        method: 'POST',
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          username: userData.username,
          phone: userData.phone,
          department_id: userData.department_id,
          role_ids: userData.role_ids,
          remarks: userData.remarks,
          status: userData.status
        }
      })

      return result
    } catch (err: any) {
      error.value = err.message || '创建用户失败'
      return {
        code: -1,
        message: err.message || '创建用户失败',
        data: null
      }
    } finally {
      loading.value = false
    }
  }

  // 更新用户
  const updateUser = async (id: string, userData: Partial<UserForm>) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API 更新用户信息和角色
      const result = await $fetch('/api/users', {
        method: 'PUT',
        body: {
          id,
          name: userData.name,
          username: userData.username,
          phone: userData.phone,
          department_id: userData.department_id,
          role_ids: userData.role_ids,
          remarks: userData.remarks,
          status: userData.status
        }
      })

      return result
    } catch (err: any) {
      error.value = err.message || '更新用户失败'
      return {
        code: -1,
        message: err.message || '更新用户失败',
        data: null
      }
    } finally {
      loading.value = false
    }
  }

  // 删除用户
  const deleteUser = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API 删除用户
      const result = await $fetch('/api/users', {
        method: 'DELETE',
        body: { id }
      })

      return result
    } catch (err: any) {
      error.value = err.message || '删除用户失败'
      return {
        code: -1,
        message: err.message || '删除用户失败',
        data: null
      }
    } finally {
      loading.value = false
    }
  }

  // 重置密码（暂时禁用，需要服务端支持）
  const resetPassword = async (id: string, newPassword: string) => {
    return {
      code: -1,
      message: '重置密码功能需要服务端API支持，请联系管理员',
      data: null
    }
  }

  // 切换用户状态（暂时禁用，需要服务端支持）
  const toggleUserStatus = async (id: string, status: 'active' | 'inactive') => {
    return {
      code: -1,
      message: '状态切换功能需要服务端API支持，请联系管理员',
      data: null
    }
  }



  // 获取部门列表
  const getDepartments = async () => {
    try {
      // 调用部门API获取数据
      const result = await $fetch('/api/departments', { method: 'GET' }) as any

      if (result?.code === 0) {
        return result.data || []
      } else {
        console.error('获取部门列表失败:', result?.message)
        return []
      }
    } catch (err: any) {
      console.error('获取部门列表失败:', err)
      return []
    }
  }

  return {
    // 状态
    users,
    loading,
    error,

    // 方法
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    toggleUserStatus,
    getDepartments
  }
}

// 转换用户数据格式的辅助函数
function transformUserData(rawUser: any): UserData {
  const metadata = rawUser.raw_user_meta_data || {}

  return {
    id: rawUser.id,
    email: rawUser.email,
    phone: rawUser.phone,
    email_confirmed_at: rawUser.email_confirmed_at,
    last_sign_in_at: rawUser.last_sign_in_at,
    created_at: rawUser.created_at,
    updated_at: rawUser.updated_at,
    name: rawUser.name || metadata.name || rawUser.email?.split('@')[0] || '',
    username: rawUser.username || metadata.username || rawUser.email?.split('@')[0] || '',
    avatar: rawUser.avatar || metadata.avatar,
    department_id: rawUser.department_id || metadata.department_id,
    position_id: rawUser.position_id || metadata.position_id,
    remarks: rawUser.remarks || metadata.remarks,
    status: rawUser.status || metadata.status || 'active',
    is_online: rawUser.is_online || false,
    login_count: rawUser.login_count || 0,
    // 修复角色数据映射 - 直接使用API返回的roles字段
    roles: rawUser.roles || rawUser.users_role?.map((ur: any) => ur.roles) || []
  }
}
