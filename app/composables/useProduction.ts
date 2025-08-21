import { ref, computed } from 'vue'
import type { Database } from '~/types/database.types'

type ProductionOrder = Database['public']['Tables']['production_orders']['Row']
type ProductionOrderInsert = Database['public']['Tables']['production_orders']['Insert']
type ProductionOrderUpdate = Database['public']['Tables']['production_orders']['Update']

type ProductionProcess = Database['public']['Tables']['production_processes']['Row']
type MaterialRequirement = Database['public']['Tables']['material_requirements']['Row']

export const useProduction = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 生产订单相关状态
  const productionOrders = ref<ProductionOrder[]>([])
  const currentOrder = ref<ProductionOrder | null>(null)
  const orderProcesses = ref<ProductionProcess[]>([])
  const materialRequirements = ref<MaterialRequirement[]>([])
  
  // 统计数据
  const orderStats = computed(() => {
    const total = productionOrders.value.length
    const pending = productionOrders.value.filter(order => order.status === 'pending').length
    const confirmed = productionOrders.value.filter(order => order.status === 'confirmed').length
    const inProgress = productionOrders.value.filter(order => order.status === 'in_progress').length
    const completed = productionOrders.value.filter(order => order.status === 'completed').length
    const cancelled = productionOrders.value.filter(order => order.status === 'cancelled').length
    
    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })
  
  // 获取生产订单列表
  const fetchProductionOrders = async (filters?: {
    status?: string
    workshop_id?: string
    product_code?: string
    order_no?: string
    start_date?: string
    end_date?: string
  }) => {
    try {
      loading.value = true
      error.value = null
      
      let query = supabase
        .from('production_orders')
        .select(`
          *,
          workshops:workshop_id(id, workshop_name, workshop_code),
          products:product_id(id, product_name, product_code)
        `)
        .order('created_at', { ascending: false })
      
      // 应用筛选条件
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.workshop_id) {
        query = query.eq('workshop_id', filters.workshop_id)
      }
      if (filters?.product_code) {
        query = query.ilike('product_code', `%${filters.product_code}%`)
      }
      if (filters?.order_no) {
        query = query.ilike('order_no', `%${filters.order_no}%`)
      }
      if (filters?.start_date) {
        query = query.gte('planned_start_date', filters.start_date)
      }
      if (filters?.end_date) {
        query = query.lte('planned_end_date', filters.end_date)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      productionOrders.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取生产订单失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 获取单个生产订单详情
  const fetchProductionOrder = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('production_orders')
        .select(`
          *,
          workshops:workshop_id(id, workshop_name, workshop_code, workshop_type),
          products:product_id(id, product_name, product_code, category),
          bom_headers:bom_id(id, version, material_count, total_cost)
        `)
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      currentOrder.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取生产订单详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 创建生产订单
  const createProductionOrder = async (orderData: ProductionOrderInsert) => {
    try {
      loading.value = true
      error.value = null
      
      // 生成订单号
      const orderNo = await generateOrderNumber()
      
      const { data, error: createError } = await supabase
        .from('production_orders')
        .insert({
          ...orderData,
          order_no: orderNo,
          created_by: user.value?.id
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      // 刷新订单列表
      await fetchProductionOrders()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建生产订单失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 更新生产订单
  const updateProductionOrder = async (id: string, updates: ProductionOrderUpdate) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('production_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // 更新本地状态
      const index = productionOrders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        productionOrders.value[index] = { ...productionOrders.value[index], ...data }
      }
      
      if (currentOrder.value?.id === id) {
        currentOrder.value = { ...currentOrder.value, ...data }
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新生产订单失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 删除生产订单
  const deleteProductionOrder = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('production_orders')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // 从本地状态中移除
      productionOrders.value = productionOrders.value.filter(order => order.id !== id)
      
      if (currentOrder.value?.id === id) {
        currentOrder.value = null
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除生产订单失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 确认生产订单
  const confirmProductionOrder = async (id: string) => {
    try {
      const updates: ProductionOrderUpdate = {
        status: 'confirmed',
        confirmed_by: user.value?.id,
        confirmed_at: new Date().toISOString()
      }
      
      return await updateProductionOrder(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '确认生产订单失败'
      throw err
    }
  }
  
  // 开始生产
  const startProduction = async (id: string) => {
    try {
      const updates: ProductionOrderUpdate = {
        status: 'in_progress',
        actual_start_date: new Date().toISOString().split('T')[0]
      }
      
      return await updateProductionOrder(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '开始生产失败'
      throw err
    }
  }
  
  // 完成生产
  const completeProduction = async (id: string, completedQuantity: number) => {
    try {
      const updates: ProductionOrderUpdate = {
        status: 'completed',
        completed_quantity: completedQuantity,
        actual_end_date: new Date().toISOString().split('T')[0]
      }
      
      return await updateProductionOrder(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '完成生产失败'
      throw err
    }
  }
  
  // 取消生产订单
  const cancelProductionOrder = async (id: string) => {
    try {
      const updates: ProductionOrderUpdate = {
        status: 'cancelled'
      }
      
      return await updateProductionOrder(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取消生产订单失败'
      throw err
    }
  }
  
  // 获取生产工序
  const fetchProductionProcesses = async (orderId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('production_processes')
        .select(`
          *,
          workshops:workshop_id(id, workshop_name, workshop_code)
        `)
        .eq('production_order_id', orderId)
        .order('sequence_no', { ascending: true })
      
      if (fetchError) throw fetchError
      
      orderProcesses.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取生产工序失败'
      throw err
    }
  }
  
  // 获取物料需求
  const fetchMaterialRequirements = async (orderId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('material_requirements')
        .select(`
          *,
          products:material_id(id, product_name, product_code, unit)
        `)
        .eq('production_order_id', orderId)
        .order('created_at', { ascending: true })
      
      if (fetchError) throw fetchError
      
      materialRequirements.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取物料需求失败'
      throw err
    }
  }
  
  // 生成订单号
  const generateOrderNumber = async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    // 查询当天已有的订单数量
    const { count } = await supabase
      .from('production_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-${month}-${day}T00:00:00.000Z`)
      .lt('created_at', `${year}-${month}-${day}T23:59:59.999Z`)
    
    const sequence = String((count || 0) + 1).padStart(3, '0')
    return `PO-${year}${month}${day}-${sequence}`
  }
  
  // 计算生产进度
  const calculateProgress = (order: ProductionOrder) => {
    if (!order.quantity || order.quantity === 0) return 0
    return Math.round((order.completed_quantity / order.quantity) * 100)
  }
  
  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      in_progress: '生产中',
      completed: '已完工',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }
  
  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }
  
  // 获取优先级文本
  const getPriorityText = (priority: number) => {
    const priorityMap: Record<number, string> = {
      1: '高',
      2: '中',
      3: '低'
    }
    return priorityMap[priority] || '中'
  }
  
  // 获取优先级颜色
  const getPriorityColor = (priority: number) => {
    const colorMap: Record<number, string> = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-green-100 text-green-800'
    }
    return colorMap[priority] || 'bg-gray-100 text-gray-800'
  }
  
  return {
    // 状态
    loading: readonly(loading),
    error: readonly(error),
    productionOrders: readonly(productionOrders),
    currentOrder: readonly(currentOrder),
    orderProcesses: readonly(orderProcesses),
    materialRequirements: readonly(materialRequirements),
    orderStats,
    
    // 方法
    fetchProductionOrders,
    fetchProductionOrder,
    createProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    confirmProductionOrder,
    startProduction,
    completeProduction,
    cancelProductionOrder,
    fetchProductionProcesses,
    fetchMaterialRequirements,
    
    // 工具函数
    calculateProgress,
    getStatusText,
    getStatusColor,
    getPriorityText,
    getPriorityColor
  }
}