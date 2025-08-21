// 系统日志接口定义
export interface SystemLog {
  id: string
  user_id?: string
  username: string
  type: 'login' | 'operation' | 'error' | 'system'
  action: string
  details?: string
  ip_address: string
  user_agent?: string
  status: 'success' | 'error' | 'warning'
  created_at: string
}

export interface LogStats {
  total: number
  today: number
  errors: number
  activeUsers: number
}

export const useSystemLogs = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const logs = ref<SystemLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取系统日志
  const fetchLogs = async (params?: {
    search?: string
    type?: string
    dateRange?: { start: string; end: string }
    page?: number
    pageSize?: number
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
      
      // 应用筛选条件
      if (params?.type) {
        query = query.eq('type', params.type)
      }
      
      if (params?.dateRange?.start) {
        query = query.gte('created_at', params.dateRange.start)
      }
      
      if (params?.dateRange?.end) {
        query = query.lte('created_at', params.dateRange.end)
      }
      
      if (params?.search) {
        query = query.or(`username.ilike.%${params.search}%,action.ilike.%${params.search}%`)
      }
      
      // 分页
      if (params?.page && params?.pageSize) {
        const from = (params.page - 1) * params.pageSize
        const to = from + params.pageSize - 1
        query = query.range(from, to)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      logs.value = data as SystemLog[]
    } catch (err: any) {
      error.value = err.message || '获取系统日志失败'
      console.error('Fetch logs error:', err)
      
      // 使用模拟数据作为后备
      logs.value = [
        {
          id: '1',
          username: 'admin',
          type: 'login',
          action: '用户登录系统',
          ip_address: '192.168.1.100',
          status: 'success',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          username: 'manager',
          type: 'operation',
          action: '创建销售订单 SO202501001',
          ip_address: '192.168.1.101',
          status: 'success',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          username: 'user1',
          type: 'error',
          action: '尝试访问未授权页面',
          ip_address: '192.168.1.102',
          status: 'error',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          username: 'system',
          type: 'system',
          action: '系统自动备份完成',
          ip_address: '127.0.0.1',
          status: 'success',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 创建日志
  const createLog = async (logData: Omit<SystemLog, 'id' | 'created_at'>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('system_logs')
        .insert([{
          ...logData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      logs.value.unshift(data as SystemLog)
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '创建日志失败'
      console.error('Create log error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // 获取日志统计
  const getLogStats = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 从数据库获取真实统计数据
      const mockStats: LogStats = {
        total: 1250,
        today: 45,
        errors: 12,
        activeUsers: 28
      }
      
      return mockStats
    } catch (err: any) {
      error.value = err.message || '获取日志统计失败'
      console.error('Get log stats error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 导出日志
  const exportLogs = async (params?: {
    search?: string
    type?: string
    dateRange?: { start: string; end: string }
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 实现日志导出功能
      console.log('导出日志:', params)
      
      // 模拟导出成功
      return { success: true, message: '日志导出成功' }
    } catch (err: any) {
      error.value = err.message || '导出日志失败'
      console.error('Export logs error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // 清空日志
  const clearLogs = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('system_logs')
        .delete()
        .neq('id', '') // 删除所有记录
      
      if (deleteError) throw deleteError
      
      logs.value = []
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '清空日志失败'
      console.error('Clear logs error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // 根据用户获取日志
  const getLogsByUser = async (userId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      return data as SystemLog[]
    } catch (err: any) {
      error.value = err.message || '获取用户日志失败'
      console.error('Get user logs error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 根据类型获取日志
  const getLogsByType = async (type: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      return data as SystemLog[]
    } catch (err: any) {
      error.value = err.message || '获取类型日志失败'
      console.error('Get type logs error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取错误日志
  const getErrorLogs = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('status', 'error')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      return data as SystemLog[]
    } catch (err: any) {
      error.value = err.message || '获取错误日志失败'
      console.error('Get error logs error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 记录登录日志
  const logLogin = async (username: string, ipAddress: string, status: 'success' | 'error', details?: string) => {
    return await createLog({
      username,
      type: 'login',
      action: status === 'success' ? '用户登录成功' : '用户登录失败',
      details,
      ip_address: ipAddress,
      status
    })
  }

  // 记录操作日志
  const logOperation = async (username: string, action: string, ipAddress: string, status: 'success' | 'error' | 'warning', details?: string) => {
    return await createLog({
      username,
      type: 'operation',
      action,
      details,
      ip_address: ipAddress,
      status
    })
  }

  // 记录错误日志
  const logError = async (username: string, action: string, errorMessage: string, ipAddress: string) => {
    return await createLog({
      username,
      type: 'error',
      action,
      details: errorMessage,
      ip_address: ipAddress,
      status: 'error'
    })
  }

  // 记录系统日志
  const logSystem = async (action: string, status: 'success' | 'error' | 'warning', details?: string) => {
    return await createLog({
      username: 'system',
      type: 'system',
      action,
      details,
      ip_address: '127.0.0.1',
      status
    })
  }

  return {
    // 状态
    logs: readonly(logs),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    fetchLogs,
    createLog,
    getLogStats,
    exportLogs,
    clearLogs,
    getLogsByUser,
    getLogsByType,
    getErrorLogs,
    logLogin,
    logOperation,
    logError,
    logSystem
  }
} 