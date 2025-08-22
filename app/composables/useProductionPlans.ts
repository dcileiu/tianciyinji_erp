import { ref, computed } from 'vue'
import type { Database } from '~/types/database.types'

type ProductionPlan = Database['public']['Tables']['production_plans']['Row']
type ProductionPlanInsert = Database['public']['Tables']['production_plans']['Insert']
type ProductionPlanUpdate = Database['public']['Tables']['production_plans']['Update']

type ProductionPlanItem = Database['public']['Tables']['production_plan_items']['Row']
type ProductionPlanItemInsert = Database['public']['Tables']['production_plan_items']['Insert']
type ProductionPlanItemUpdate = Database['public']['Tables']['production_plan_items']['Update']

export const useProductionPlans = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 生产计划相关状态
  const plans = ref<ProductionPlan[]>([])
  const currentPlan = ref<ProductionPlan | null>(null)
  const planItems = ref<ProductionPlanItem[]>([])
  
  // 统计数据
  const planStats = computed(() => {
    const total = plans.value.length
    const draft = plans.value.filter(plan => plan.status === 'draft').length
    const approved = plans.value.filter(plan => plan.status === 'approved').length
    const executing = plans.value.filter(plan => plan.status === 'executing').length
    const completed = plans.value.filter(plan => plan.status === 'completed').length
    const cancelled = plans.value.filter(plan => plan.status === 'cancelled').length
    
    // 计算本周计划
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    
    const thisWeekPlans = plans.value.filter(plan => {
      const planStart = new Date(plan.plan_start_date)
      const planEnd = new Date(plan.plan_end_date)
      return (planStart >= startOfWeek && planStart <= endOfWeek) ||
             (planEnd >= startOfWeek && planEnd <= endOfWeek) ||
             (planStart <= startOfWeek && planEnd >= endOfWeek)
    })
    
    // 计算平均进度
    const totalProgress = plans.value.reduce((sum, plan) => sum + (plan.progress || 0), 0)
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0
    
    // 计算产能利用率
    const totalCapacity = plans.value.reduce((sum, plan) => sum + (plan.planned_capacity || 0), 0)
    const usedCapacity = plans.value
      .filter(plan => plan.status === 'executing')
      .reduce((sum, plan) => sum + (plan.planned_capacity || 0), 0)
    const capacityUtilization = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0
    
    return {
      total,
      draft,
      approved,
      executing,
      completed,
      cancelled,
      thisWeekPlans: thisWeekPlans.length,
      avgProgress,
      capacityUtilization,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })
  
  // 按状态分组的计划
  const plansByStatus = computed(() => {
    const grouped: Record<string, ProductionPlan[]> = {}
    plans.value.forEach(plan => {
      const status = plan.status || 'draft'
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(plan)
    })
    return grouped
  })
  
  // 按车间分组的计划
  const plansByWorkshop = computed(() => {
    const grouped: Record<string, ProductionPlan[]> = {}
    plans.value.forEach(plan => {
      const workshopId = plan.workshop_id || 'unassigned'
      if (!grouped[workshopId]) {
        grouped[workshopId] = []
      }
      grouped[workshopId].push(plan)
    })
    return grouped
  })
  
  // 获取生产计划列表
  const fetchPlans = async (filters?: {
    status?: string
    workshop_id?: string
    plan_name?: string
    period_type?: string
    date_range?: { start: string; end: string }
  }) => {
    try {
      loading.value = true
      error.value = null
      
      let query = supabase
        .from('production_plans')
        .select(`
          *,
          workshops:workshop_id(id, workshop_name, workshop_code)
        `)
        .order('created_at', { ascending: false })
      
      // 应用筛选条件
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.workshop_id) {
        query = query.eq('workshop_id', filters.workshop_id)
      }
      if (filters?.plan_name) {
        query = query.ilike('plan_name', `%${filters.plan_name}%`)
      }
      if (filters?.period_type) {
        query = query.eq('period_type', filters.period_type)
      }
      if (filters?.date_range) {
        query = query
          .gte('plan_start_date', filters.date_range.start)
          .lte('plan_end_date', filters.date_range.end)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      plans.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取生产计划列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 获取单个生产计划详情
  const fetchPlan = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('production_plans')
        .select(`
          *,
          workshops:workshop_id(id, workshop_name, workshop_code, capacity)
        `)
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      currentPlan.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取生产计划详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 获取生产计划明细
  const fetchPlanItems = async (planId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('production_plan_items')
        .select(`
          *,
          products:product_id(id, product_name, product_code, category, unit),
          bom_headers:bom_id(id, version, total_cost)
        `)
        .eq('plan_id', planId)
        .order('created_at', { ascending: true })
      
      if (fetchError) throw fetchError
      
      planItems.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取生产计划明细失败'
      throw err
    }
  }
  
  // 创建生产计划
  const createPlan = async (planData: ProductionPlanInsert) => {
    try {
      loading.value = true
      error.value = null
      
      // 生成计划编号
      const planCode = await generatePlanCode()
      
      const { data, error: createError } = await supabase
        .from('production_plans')
        .insert({
          ...planData,
          plan_code: planCode,
          created_by: user.value?.id
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      // 刷新计划列表
      await fetchPlans()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建生产计划失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 更新生产计划
  const updatePlan = async (id: string, updates: ProductionPlanUpdate) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('production_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // 更新本地状态
      const index = plans.value.findIndex(plan => plan.id === id)
      if (index !== -1) {
        plans.value[index] = { ...plans.value[index], ...data }
      }
      
      if (currentPlan.value?.id === id) {
        currentPlan.value = { ...currentPlan.value, ...data }
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新生产计划失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 删除生产计划
  const deletePlan = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      // 检查是否有关联的生产订单
      const { count } = await supabase
        .from('production_orders')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
      
      if (count && count > 0) {
        throw new Error('该生产计划存在关联的生产订单，无法删除')
      }
      
      // 删除计划明细
      await supabase
        .from('production_plan_items')
        .delete()
        .eq('plan_id', id)
      
      // 删除计划主表
      const { error: deleteError } = await supabase
        .from('production_plans')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // 从本地状态中移除
      plans.value = plans.value.filter(plan => plan.id !== id)
      
      if (currentPlan.value?.id === id) {
        currentPlan.value = null
        planItems.value = []
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除生产计划失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 审核生产计划
  const approvePlan = async (id: string) => {
    try {
      const updates: ProductionPlanUpdate = {
        status: 'approved',
        approved_by: user.value?.id,
        approved_at: new Date().toISOString()
      }
      
      return await updatePlan(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '审核生产计划失败'
      throw err
    }
  }
  
  // 开始执行生产计划
  const startPlan = async (id: string) => {
    try {
      const updates: ProductionPlanUpdate = {
        status: 'executing',
        actual_start_date: new Date().toISOString()
      }
      
      return await updatePlan(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '开始执行生产计划失败'
      throw err
    }
  }
  
  // 完成生产计划
  const completePlan = async (id: string) => {
    try {
      const updates: ProductionPlanUpdate = {
        status: 'completed',
        actual_end_date: new Date().toISOString(),
        progress: 100
      }
      
      return await updatePlan(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '完成生产计划失败'
      throw err
    }
  }
  
  // 取消生产计划
  const cancelPlan = async (id: string, reason?: string) => {
    try {
      const updates: ProductionPlanUpdate = {
        status: 'cancelled',
        notes: reason ? `取消原因: ${reason}` : '计划已取消'
      }
      
      return await updatePlan(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取消生产计划失败'
      throw err
    }
  }
  
  // 添加计划明细
  const addPlanItem = async (planId: string, itemData: ProductionPlanItemInsert) => {
    try {
      const { data, error: createError } = await supabase
        .from('production_plan_items')
        .insert({
          ...itemData,
          plan_id: planId
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      // 更新计划统计信息
      await updatePlanStatistics(planId)
      
      // 刷新明细列表
      await fetchPlanItems(planId)
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加计划明细失败'
      throw err
    }
  }
  
  // 更新计划明细
  const updatePlanItem = async (id: string, updates: ProductionPlanItemUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('production_plan_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // 更新本地状态
      const index = planItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        planItems.value[index] = { ...planItems.value[index], ...data }
      }
      
      // 更新计划统计信息
      if (data.plan_id) {
        await updatePlanStatistics(data.plan_id)
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新计划明细失败'
      throw err
    }
  }
  
  // 删除计划明细
  const deletePlanItem = async (id: string) => {
    try {
      const item = planItems.value.find(item => item.id === id)
      const planId = item?.plan_id
      
      const { error: deleteError } = await supabase
        .from('production_plan_items')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // 从本地状态中移除
      planItems.value = planItems.value.filter(item => item.id !== id)
      
      // 更新计划统计信息
      if (planId) {
        await updatePlanStatistics(planId)
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除计划明细失败'
      throw err
    }
  }
  
  // 更新计划统计信息
  const updatePlanStatistics = async (planId: string) => {
    try {
      const items = await fetchPlanItems(planId)
      
      const totalQuantity = items.reduce((sum, item) => sum + item.planned_quantity, 0)
      const completedQuantity = items.reduce((sum, item) => sum + (item.completed_quantity || 0), 0)
      const progress = totalQuantity > 0 ? Math.round((completedQuantity / totalQuantity) * 100) : 0
      
      await updatePlan(planId, {
        total_quantity: totalQuantity,
        completed_quantity: completedQuantity,
        progress
      })
    } catch (err) {
      console.error('更新计划统计信息失败:', err)
    }
  }
  
  // 生成计划编号
  const generatePlanCode = async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `PLAN${year}${month}`
    
    // 查询当月最大编号
    const { data } = await supabase
      .from('production_plans')
      .select('plan_code')
      .like('plan_code', `${prefix}%`)
      .order('plan_code', { ascending: false })
      .limit(1)
    
    let sequence = 1
    if (data && data.length > 0 && data[0]) {
      const lastCode = data[0].plan_code
      const lastSequence = parseInt(lastCode.slice(-4))
      sequence = lastSequence + 1
    }
    
    return `${prefix}${String(sequence).padStart(4, '0')}`
  }
  
  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      approved: '已审核',
      executing: '执行中',
      completed: '已完成',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }
  
  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      executing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }
  
  // 获取周期类型文本
  const getPeriodText = (periodType: string) => {
    const periodMap: Record<string, string> = {
      daily: '日计划',
      weekly: '周计划',
      monthly: '月计划',
      quarterly: '季度计划',
      yearly: '年度计划'
    }
    return periodMap[periodType] || periodType
  }
  
  // 获取进度颜色
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }
  
  return {
    // 状态
    loading: readonly(loading),
    error: readonly(error),
    plans: readonly(plans),
    currentPlan: readonly(currentPlan),
    planItems: readonly(planItems),
    planStats,
    plansByStatus,
    plansByWorkshop,
    
    // 方法
    fetchPlans,
    fetchPlan,
    fetchPlanItems,
    createPlan,
    updatePlan,
    deletePlan,
    approvePlan,
    startPlan,
    completePlan,
    cancelPlan,
    addPlanItem,
    updatePlanItem,
    deletePlanItem,
    updatePlanStatistics,
    generatePlanCode,
    
    // 工具函数
    getStatusText,
    getStatusColor,
    getPeriodText,
    getProgressColor
  }
}