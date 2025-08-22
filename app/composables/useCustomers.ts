import type { Customer } from '~/types/database'
import type { PaginationParams, PaginationResponse } from '~/types/database'

export const useCustomers = () => {
  const { findMany, findById, create, update, remove, exists, getStats } = useDatabase()
  
  // 响应式状态
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取客户列表
  const getCustomers = async (params: PaginationParams & {
    search?: string
    type?: string
    region?: string
    status?: string
  } = { page: 1, pageSize: 10 }): Promise<PaginationResponse<Customer>> => {
    const filters: Record<string, any> = {}
    
    if (params.search) {
      // 使用自定义搜索逻辑
      const searchResults = await searchCustomers(params.search, params)
      return searchResults
    }
    
    if (params.type) filters.type = params.type
    if (params.region) filters.region = params.region
    if (params.status) filters.status = params.status

    return await findMany<Customer>('customers', {
      ...params,
      filters
    })
  }

  // 搜索客户（支持多字段搜索）
  const searchCustomers = async (
    searchQuery: string,
    params: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginationResponse<Customer>> => {
    try {
      const supabase = useSupabaseClient()
      
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${searchQuery}%,customer_no.ilike.%${searchQuery}%,contact_person.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)

      // 排序
      if (params.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // 分页
      const from = (params.page - 1) * params.pageSize
      const to = from + params.pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        data: data as Customer[],
        total: count || 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil((count || 0) / params.pageSize)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
      throw error
    }
  }

  // 获取单个客户
  const getCustomer = async (id: string): Promise<Customer | null> => {
    return await findById<Customer>('customers', id)
  }

  // 创建客户
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    // 检查客户编号是否已存在
    const customerNoExists = await exists('customers', { customer_no: customerData.customer_no })
    if (customerNoExists) {
      throw new Error('客户编号已存在')
    }

    // 检查邮箱是否已存在
    if (customerData.email) {
      const emailExists = await exists('customers', { email: customerData.email })
      if (emailExists) {
        throw new Error('邮箱地址已存在')
      }
    }

    return await create<Customer>('customers', customerData)
  }

  // 更新客户
  const updateCustomer = async (
    id: string, 
    customerData: Partial<Omit<Customer, 'id' | 'created_at'>>
  ): Promise<Customer> => {
    // 如果更新客户编号，检查是否已存在
    if (customerData.customer_no) {
      const supabase = useSupabaseClient()
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('customer_no', customerData.customer_no)
        .neq('id', id)
        .maybeSingle()
      
      if (existingCustomer) {
        throw new Error('客户编号已存在')
      }
    }

    // 如果更新邮箱，检查是否已存在
    if (customerData.email) {
      const supabase = useSupabaseClient()
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerData.email)
        .neq('id', id)
        .maybeSingle()
      
      if (existingCustomer) {
        throw new Error('邮箱地址已存在')
      }
    }

    return await update<Customer>('customers', id, customerData)
  }

  // 删除客户
  const deleteCustomer = async (id: string): Promise<void> => {
    // 检查是否有关联的销售订单
    const supabase = useSupabaseClient()
    const { data: orders } = await supabase
      .from('sales_orders')
      .select('id')
      .eq('customer_id', id)
      .limit(1)
    
    if (orders && orders.length > 0) {
      throw new Error('该客户存在关联的销售订单，无法删除')
    }

    await remove('customers', id)
  }

  // 批量删除客户
  const deleteCustomers = async (ids: string[]): Promise<void> => {
    // 检查是否有关联的销售订单
    const supabase = useSupabaseClient()
    const { data: orders } = await supabase
      .from('sales_orders')
      .select('customer_id')
      .in('customer_id', ids)
    
    if (orders && orders.length > 0) {
      const linkedCustomerIds = [...new Set(orders.map(order => order.customer_id))]
      throw new Error(`客户ID ${linkedCustomerIds.join(', ')} 存在关联的销售订单，无法删除`)
    }

    const { removeMany } = useDatabase()
    await removeMany('customers', ids)
  }

  // 获取客户统计数据
  const getCustomerStats = async () => {
    try {
      const [totalCustomers, activeCustomers, newCustomers] = await Promise.all([
        getStats('customers'),
        getStats('customers', 'count', [{ column: 'status', value: 'active' }]),
        getNewCustomersThisMonth()
      ])

      // 获取总交易额（需要关联销售订单表）
      const totalRevenue = await getTotalRevenue()

      return {
        totalCustomers,
        activeCustomers,
        newCustomers,
        totalRevenue
      }
    } catch (error) {
      console.error('Error getting customer stats:', error)
      throw error
    }
  }

  // 获取本月新增客户数
  const getNewCustomersThisMonth = async (): Promise<number> => {
    try {
      const supabase = useSupabaseClient()
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      if (error) {
        throw error
      }

      return count || 0
    } catch (error) {
      console.error('Error getting new customers this month:', error)
      return 0
    }
  }

  // 获取总交易额
  const getTotalRevenue = async (): Promise<number> => {
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('sales_orders')
        .select('final_amount')
        .eq('status', 'delivered')

      if (error) {
        throw error
      }

      return data?.reduce((sum, order) => sum + (order.final_amount || 0), 0) || 0
    } catch (error) {
      console.error('Error getting total revenue:', error)
      return 0
    }
  }

  // 生成客户编号
  const generateCustomerNo = async (): Promise<string> => {
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('customers')
        .select('customer_no')
        .order('customer_no', { ascending: false })
        .limit(1)

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        return 'CUS-001'
      }

      const lastCustomerNo = data[0].customer_no
      const match = lastCustomerNo.match(/CUS-(\d+)/)
      if (match) {
        const nextNumber = parseInt(match[1]) + 1
        return `CUS-${nextNumber.toString().padStart(3, '0')}`
      }

      return 'CUS-001'
    } catch (error) {
      console.error('Error generating customer number:', error)
      return 'CUS-001'
    }
  }

  // 检查客户编号是否存在
  const checkCustomerNoExists = async (customerNo: string, excludeId?: string): Promise<boolean> => {
    const conditions = [{ column: 'customer_no', value: customerNo }]
    if (excludeId) {
      conditions.push({ column: 'id', value: excludeId })
    }
    return await exists('customers', conditions)
  }

  // 检查邮箱是否存在
  const checkEmailExists = async (email: string, excludeId?: string): Promise<boolean> => {
    const conditions = [{ column: 'email', value: email }]
    if (excludeId) {
      conditions.push({ column: 'id', value: excludeId })
    }
    return await exists('customers', conditions)
  }

  return {
    // 响应式状态
    customers,
    loading,
    error,
    
    // 方法
    getCustomers,
    searchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    deleteCustomers,
    getCustomerStats,
    generateCustomerNo,
    checkCustomerNoExists,
    checkEmailExists
  }
}