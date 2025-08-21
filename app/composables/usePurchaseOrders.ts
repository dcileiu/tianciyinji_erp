import type { Supplier, PurchaseOrder, PurchaseOrderItem, Product, PaginationParams, PaginationResponse } from '~/types/database'

// 采购订单筛选器接口
interface OrderFilters {
  status?: string
  supplier_id?: string
  date_range?: [string, string]
  search?: string
  priority?: string
  payment_status?: string
}

// 采购订单统计接口
interface PurchaseOrderStats {
  total: number
  draft: number
  submitted: number
  approved: number
  in_transit: number
  received: number
  completed: number
  cancelled: number
  totalAmount: number
  monthlyAmount: number
}

export const usePurchaseOrders = () => {
  const supabase = useSupabaseClient()

  // 响应式状态
  const purchaseOrders = ref<PurchaseOrder[]>([])
  const suppliers = ref<Supplier[]>([])
  const orderStats = ref<PurchaseOrderStats>({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    in_transit: 0,
    received: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
    monthlyAmount: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取采购订单列表
  const fetchPurchaseOrders = async (params: PaginationParams & { filters?: OrderFilters } = { page: 1, pageSize: 20 }): Promise<PaginationResponse<PurchaseOrder>> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError, count } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name, contact_person),
          items:purchase_order_items(*, product:products(name, product_no, unit))
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

  // 创建采购订单
  const createPurchaseOrder = async (orderData: Partial<PurchaseOrder>): Promise<{ success: boolean; data?: PurchaseOrder; error?: string }> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('purchase_orders')
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

  // 更新采购订单
  const updatePurchaseOrder = async (id: string, orderData: Partial<PurchaseOrder>): Promise<{ success: boolean; data?: PurchaseOrder; error?: string }> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('purchase_orders')
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

  // 删除采购订单
  const deletePurchaseOrder = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('purchase_orders')
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

  // 获取供应商列表
  const fetchSuppliers = async (): Promise<Supplier[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('suppliers')
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
  const fetchOrderStats = async (): Promise<PurchaseOrderStats> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('purchase_orders')
        .select('status, total_amount, created_at')

      if (fetchError) throw fetchError

      const orders = data || []
      const stats = {
        total: orders.length,
        draft: orders.filter((o: any) => o.status === 'draft').length,
        submitted: orders.filter((o: any) => o.status === 'submitted').length,
        approved: orders.filter((o: any) => o.status === 'approved').length,
        in_transit: orders.filter((o: any) => o.status === 'in_transit').length,
        received: orders.filter((o: any) => o.status === 'received').length,
        completed: orders.filter((o: any) => o.status === 'completed').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
        totalAmount: orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0),
        monthlyAmount: 0
      }

      // 计算当月金额
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const monthlyAmountData = orders.filter((o: any) => new Date(o.created_at) >= thisMonth)
      stats.monthlyAmount = monthlyAmountData.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)

      return stats
    } catch (err: any) {
      error.value = err.message
      return {
        total: 0,
        draft: 0,
        submitted: 0,
        approved: 0,
        in_transit: 0,
        received: 0,
        completed: 0,
        cancelled: 0,
        totalAmount: 0,
        monthlyAmount: 0
      }
    }
  }

  return {
    // 状态
    purchaseOrders: readonly(purchaseOrders),
    suppliers: readonly(suppliers),
    orderStats: readonly(orderStats),
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    fetchSuppliers,
    fetchOrderStats
  }
}