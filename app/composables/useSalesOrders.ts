import type { SalesOrder, Customer, Product, PaginationParams, PaginationResponse } from '~/types/database'

// 销售订单筛选器
interface OrderFilters {
  status?: string
  customer_id?: string
  date_range?: [string, string]
  search?: string
}

// 销售订单统计
interface SalesOrderStats {
  total: number
  draft: number
  confirmed: number
  shipped: number
  delivered: number
  cancelled: number
  totalValue: number
  monthlyValue: number
}

export const useSalesOrders = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const salesOrders = ref<SalesOrder[]>([])
  const customers = ref<Customer[]>([])
  const orderStats = ref<SalesOrderStats>({
    total: 0,
    draft: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalValue: 0,
    monthlyValue: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取销售订单列表
  const fetchSalesOrders = async (params: PaginationParams & { filters?: OrderFilters } = { page: 1, pageSize: 20 }): Promise<PaginationResponse<SalesOrder>> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError, count } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customer:customers(name, contact_person),
          items:sales_order_items(*, product:products(name, product_no, unit))
        `, { count: 'exact' })
        .range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1)

      if (fetchError) throw fetchError

      const orders = (data || []) as any[]
      const total = count || 0

      return {
        data: orders,
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize)
      }
    } catch (err: any) {
      error.value = err.message
      return {
        data: [],
        total: 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: 0
      }
    } finally {
      loading.value = false
    }
  }

  // 创建销售订单
  const createSalesOrder = async (orderData: Partial<SalesOrder>): Promise<{ success: boolean; data?: SalesOrder; error?: string }> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('sales_orders')
        .insert([orderData])
        .select()
        .single()

      if (createError) throw createError

      return { success: true, data: data as any }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 更新销售订单
  const updateSalesOrder = async (id: string, orderData: Partial<SalesOrder>): Promise<{ success: boolean; data?: SalesOrder; error?: string }> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('sales_orders')
        .update(orderData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return { success: true, data: data as any }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 删除销售订单
  const deleteSalesOrder = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 获取客户列表
  const fetchCustomers = async (): Promise<Customer[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (fetchError) throw fetchError

      return (data || []) as any[]
    } catch (err: any) {
      error.value = err.message
      return []
    }
  }

  // 获取统计数据
  const fetchOrderStats = async (): Promise<SalesOrderStats> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('sales_orders')
        .select('status, total_amount, created_at')

      if (fetchError) throw fetchError

      const orders = data || []
      const stats = {
        total: orders.length,
        draft: orders.filter((o: any) => o.status === 'draft').length,
        confirmed: orders.filter((o: any) => o.status === 'confirmed').length,
        shipped: orders.filter((o: any) => o.status === 'shipped').length,
        delivered: orders.filter((o: any) => o.status === 'delivered').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
        totalValue: orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0),
        monthlyValue: 0
      }

      // 计算当月金额
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const monthlyValueData = orders.filter((o: any) => new Date(o.created_at) >= thisMonth)
      stats.monthlyValue = monthlyValueData.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)

      return stats
    } catch (err: any) {
      error.value = err.message
      return {
        total: 0,
        draft: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalValue: 0,
        monthlyValue: 0
      }
    }
  }

  return {
    // 状态
    salesOrders: readonly(salesOrders),
    customers: readonly(customers),
    orderStats: readonly(orderStats),
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    fetchSalesOrders,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    fetchCustomers,
    fetchOrderStats
  }
}