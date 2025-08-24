import { ref, computed } from 'vue'
import type { Database } from '~/types/database.types'

type Workshop = Database['public']['Tables']['workshops']['Row']
type WorkshopInsert = Database['public']['Tables']['workshops']['Insert']
type WorkshopUpdate = Database['public']['Tables']['workshops']['Update']

export const useWorkshops = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // 车间相关状态
  const workshops = ref<Workshop[]>([])
  const currentWorkshop = ref<Workshop | null>(null)

  // 统计数据
  const workshopStats = computed(() => {
    const total = workshops.value.length
    const active = workshops.value.filter(ws => ws.status === 'active').length
    const maintenance = workshops.value.filter(ws => ws.status === 'maintenance').length
    const inactive = workshops.value.filter(ws => ws.status === 'inactive').length

    // 计算平均产能利用率
    const totalUtilization = workshops.value.reduce((sum, ws) => sum + (ws.utilization || 0), 0)
    const avgUtilization = total > 0 ? Math.round(totalUtilization / total) : 0

    // 计算总设备数和活跃设备数
    const totalEquipment = workshops.value.reduce((sum, ws) => sum + (ws.equipment_count || 0), 0)
    const activeEquipment = workshops.value.reduce((sum, ws) => sum + (ws.equipment_count || 0), 0)

    return {
      total,
      active,
      maintenance,
      inactive,
      avgUtilization,
      totalEquipment,
      activeEquipment,
      equipmentUtilization: totalEquipment > 0 ? Math.round((activeEquipment / totalEquipment) * 100) : 0,
    }
  })

  // 按类型分组的车间
  const workshopsByType = computed(() => {
    const grouped: Record<string, Workshop[]> = {}
    workshops.value.forEach(workshop => {
      const type = workshop.type || 'other'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(workshop)
    })
    return grouped
  })

  // 获取车间列表
  const fetchWorkshops = async (filters?: {
    status?: string
    workshop_type?: string
    workshop_name?: string
    manager_name?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase.from('workshops').select('*').order('created_at', { ascending: false })

      // 应用筛选条件
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.workshop_type) {
        query = query.eq('workshop_type', filters.workshop_type)
      }
      if (filters?.workshop_name) {
        query = query.ilike('workshop_name', `%${filters.workshop_name}%`)
      }
      if (filters?.manager_name) {
        query = query.ilike('manager_name', `%${filters.manager_name}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      workshops.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取车间列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个车间详情
  const fetchWorkshop = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase.from('workshops').select('*').eq('id', id).single()

      if (fetchError) throw fetchError

      currentWorkshop.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取车间详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建车间
  const createWorkshop = async (workshopData: WorkshopInsert) => {
    try {
      loading.value = true
      error.value = null

      // 生成车间编码
      const workshopCode = await generateWorkshopCode(workshopData.type || 'other')

      const { data, error: createError } = await (supabase as any)
        .from('workshops')
        .insert({
          ...workshopData,
          code: workshopCode,
        })
        .select()
        .single()

      if (createError) throw createError

      // 刷新车间列表
      await fetchWorkshops()

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建车间失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新车间
  const updateWorkshop = async (id: string, updates: WorkshopUpdate) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await (supabase as any)
        .from('workshops')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // 更新本地状态
      const index = workshops.value.findIndex(ws => ws.id === id)
      if (index !== -1) {
        workshops.value[index] = { ...workshops.value[index], ...data }
      }

      if (currentWorkshop.value?.id === id) {
        currentWorkshop.value = { ...currentWorkshop.value, ...data }
      }

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新车间失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除车间
  const deleteWorkshop = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      // 检查是否有关联的生产订单
      const { count } = await supabase
        .from('production_orders')
        .select('*', { count: 'exact', head: true })
        .eq('workshop_id', id)

      if (count && count > 0) {
        throw new Error('该车间存在关联的生产订单，无法删除')
      }

      const { error: deleteError } = await supabase.from('workshops').delete().eq('id', id)

      if (deleteError) throw deleteError

      // 从本地状态中移除
      workshops.value = workshops.value.filter(ws => ws.id !== id)

      if (currentWorkshop.value?.id === id) {
        currentWorkshop.value = null
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除车间失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新车间状态
  const updateWorkshopStatus = async (id: string, status: 'active' | 'maintenance' | 'inactive') => {
    try {
      const updates: WorkshopUpdate = { status }
      return await updateWorkshop(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新车间状态失败'
      throw err
    }
  }

  // 更新设备数量
  const updateEquipmentCount = async (id: string, equipmentCount: number, activeCount: number) => {
    try {
      const updates: WorkshopUpdate = {
        equipment_count: equipmentCount,
      }
      return await updateWorkshop(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新设备数量失败'
      throw err
    }
  }

  // 更新产能利用率
  const updateCapacityUtilization = async (id: string, utilization: number) => {
    try {
      const updates: WorkshopUpdate = {
        utilization: utilization,
      }
      return await updateWorkshop(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新产能利用率失败'
      throw err
    }
  }

  // 获取车间的生产订单
  const fetchWorkshopOrders = async (workshopId: string, status?: string) => {
    try {
      let query = supabase
        .from('production_orders')
        .select(
          `
          *,
          products:product_id(id, product_name, product_code)
        `
        )
        .eq('workshop_id', workshopId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取车间生产订单失败'
      throw err
    }
  }

  // 生成车间编码
  const generateWorkshopCode = async (type: string) => {
    const typePrefix: Record<string, string> = {
      assembly: 'AS',
      machining: 'MC',
      painting: 'PT',
      packaging: 'PK',
      quality: 'QC',
      other: 'WS',
    }

    const prefix = typePrefix[type] || 'WS'

    // 查询同类型车间数量
    const { count } = await supabase
      .from('workshops')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_type', type)

    const sequence = String((count || 0) + 1).padStart(3, '0')
    return `${prefix}-${sequence}`
  }

  // 获取车间类型文本
  const getWorkshopTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      assembly: '装配车间',
      machining: '机加工车间',
      painting: '喷涂车间',
      packaging: '包装车间',
      quality: '质检车间',
      other: '其他车间',
    }
    return typeMap[type] || type
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      active: '运行中',
      maintenance: '维护中',
      inactive: '停用',
    }
    return statusMap[status] || status
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // 获取产能利用率颜色
  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 80) return 'text-yellow-600'
    if (utilization >= 60) return 'text-green-600'
    return 'text-gray-600'
  }

  // 获取设备状态
  const getEquipmentStatus = (workshop: Workshop) => {
    const total = workshop.equipment_count || 0
    const active = workshop.equipment_count || 0
    const rate = total > 0 ? Math.round((active / total) * 100) : 0

    return {
      total,
      active,
      inactive: total - active,
      rate,
      status: rate >= 90 ? 'excellent' : rate >= 70 ? 'good' : rate >= 50 ? 'normal' : 'poor',
    }
  }

  return {
    // 状态
    loading: readonly(loading),
    error: readonly(error),
    workshops: readonly(workshops),
    currentWorkshop: readonly(currentWorkshop),
    workshopStats,
    workshopsByType,

    // 方法
    fetchWorkshops,
    fetchWorkshop,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    updateWorkshopStatus,
    updateEquipmentCount,
    updateCapacityUtilization,
    fetchWorkshopOrders,

    // 工具函数
    getWorkshopTypeText,
    getStatusText,
    getStatusColor,
    getUtilizationColor,
    getEquipmentStatus,
  }
}
