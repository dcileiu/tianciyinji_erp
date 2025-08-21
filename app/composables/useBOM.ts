import { ref, computed } from 'vue'
import type { Database } from '~/types/database.types'

type BOMHeader = Database['public']['Tables']['bom_headers']['Row']
type BOMHeaderInsert = Database['public']['Tables']['bom_headers']['Insert']
type BOMHeaderUpdate = Database['public']['Tables']['bom_headers']['Update']

type BOMItem = Database['public']['Tables']['bom_items']['Row']
type BOMItemInsert = Database['public']['Tables']['bom_items']['Insert']
type BOMItemUpdate = Database['public']['Tables']['bom_items']['Update']

export const useBOM = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // BOM相关状态
  const bomHeaders = ref<BOMHeader[]>([])
  const currentBOM = ref<BOMHeader | null>(null)
  const bomItems = ref<BOMItem[]>([])
  
  // 统计数据
  const bomStats = computed(() => {
    const total = bomHeaders.value.length
    const draft = bomHeaders.value.filter(bom => bom.status === 'draft').length
    const approved = bomHeaders.value.filter(bom => bom.status === 'approved').length
    const active = bomHeaders.value.filter(bom => bom.status === 'active').length
    const inactive = bomHeaders.value.filter(bom => bom.status === 'inactive').length
    
    // 计算涉及的物料总数
    const totalMaterials = bomHeaders.value.reduce((sum, bom) => sum + (bom.material_count || 0), 0)
    
    // 计算平均成本
    const totalCost = bomHeaders.value.reduce((sum, bom) => sum + (bom.total_cost || 0), 0)
    const avgCost = total > 0 ? Math.round(totalCost / total * 100) / 100 : 0
    
    return {
      total,
      draft,
      approved,
      active,
      inactive,
      totalMaterials,
      avgCost,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
    }
  })
  
  // 按产品类别分组的BOM
  const bomsByCategory = computed(() => {
    const grouped: Record<string, BOMHeader[]> = {}
    bomHeaders.value.forEach(bom => {
      const category = bom.product_category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(bom)
    })
    return grouped
  })
  
  // 获取BOM列表
  const fetchBOMHeaders = async (filters?: {
    status?: string
    product_category?: string
    product_name?: string
    version?: string
    is_current?: boolean
  }) => {
    try {
      loading.value = true
      error.value = null
      
      let query = supabase
        .from('bom_headers')
        .select(`
          *,
          products:product_id(id, product_name, product_code, category)
        `)
        .order('created_at', { ascending: false })
      
      // 应用筛选条件
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.product_category) {
        query = query.eq('product_category', filters.product_category)
      }
      if (filters?.product_name) {
        query = query.ilike('product_name', `%${filters.product_name}%`)
      }
      if (filters?.version) {
        query = query.ilike('version', `%${filters.version}%`)
      }
      if (filters?.is_current !== undefined) {
        query = query.eq('is_current', filters.is_current)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      bomHeaders.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取BOM列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 获取单个BOM详情
  const fetchBOMHeader = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('bom_headers')
        .select(`
          *,
          products:product_id(id, product_name, product_code, category, unit)
        `)
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      currentBOM.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取BOM详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 获取BOM物料明细
  const fetchBOMItems = async (bomId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('bom_items')
        .select(`
          *,
          products:material_id(id, product_name, product_code, category, unit, cost)
        `)
        .eq('bom_id', bomId)
        .order('created_at', { ascending: true })
      
      if (fetchError) throw fetchError
      
      bomItems.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取BOM物料明细失败'
      throw err
    }
  }
  
  // 创建BOM
  const createBOMHeader = async (bomData: BOMHeaderInsert) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('bom_headers')
        .insert({
          ...bomData,
          created_by: user.value?.id
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      // 刷新BOM列表
      await fetchBOMHeaders()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建BOM失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 更新BOM
  const updateBOMHeader = async (id: string, updates: BOMHeaderUpdate) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('bom_headers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // 更新本地状态
      const index = bomHeaders.value.findIndex(bom => bom.id === id)
      if (index !== -1) {
        bomHeaders.value[index] = { ...bomHeaders.value[index], ...data }
      }
      
      if (currentBOM.value?.id === id) {
        currentBOM.value = { ...currentBOM.value, ...data }
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新BOM失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 删除BOM
  const deleteBOMHeader = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      // 检查是否有关联的生产订单
      const { count } = await supabase
        .from('production_orders')
        .select('*', { count: 'exact', head: true })
        .eq('bom_id', id)
      
      if (count && count > 0) {
        throw new Error('该BOM存在关联的生产订单，无法删除')
      }
      
      // 删除BOM明细
      await supabase
        .from('bom_items')
        .delete()
        .eq('bom_id', id)
      
      // 删除BOM主表
      const { error: deleteError } = await supabase
        .from('bom_headers')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // 从本地状态中移除
      bomHeaders.value = bomHeaders.value.filter(bom => bom.id !== id)
      
      if (currentBOM.value?.id === id) {
        currentBOM.value = null
        bomItems.value = []
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除BOM失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 复制BOM
  const copyBOM = async (id: string, newVersion: string) => {
    try {
      loading.value = true
      error.value = null
      
      // 获取原BOM信息
      const originalBOM = await fetchBOMHeader(id)
      const originalItems = await fetchBOMItems(id)
      
      // 创建新BOM主表
      const newBOMData: BOMHeaderInsert = {
        product_id: originalBOM.product_id,
        product_code: originalBOM.product_code,
        product_name: originalBOM.product_name,
        product_category: originalBOM.product_category,
        version: newVersion,
        is_current: false,
        status: 'draft',
        description: `复制自版本 ${originalBOM.version}`
      }
      
      const newBOM = await createBOMHeader(newBOMData)
      
      // 复制BOM明细
      if (originalItems.length > 0) {
        const newItemsData: BOMItemInsert[] = originalItems.map(item => ({
          bom_id: newBOM.id,
          material_id: item.material_id,
          material_code: item.material_code,
          material_name: item.material_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost,
          scrap_rate: item.scrap_rate,
          lead_time: item.lead_time,
          is_critical: item.is_critical,
          substitute_materials: item.substitute_materials,
          notes: item.notes
        }))
        
        await supabase
          .from('bom_items')
          .insert(newItemsData)
        
        // 更新BOM统计信息
        await updateBOMStatistics(newBOM.id)
      }
      
      return newBOM
    } catch (err) {
      error.value = err instanceof Error ? err.message : '复制BOM失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // 审核BOM
  const approveBOM = async (id: string) => {
    try {
      const updates: BOMHeaderUpdate = {
        status: 'approved',
        approved_by: user.value?.id,
        approved_at: new Date().toISOString()
      }
      
      return await updateBOMHeader(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '审核BOM失败'
      throw err
    }
  }
  
  // 激活BOM
  const activateBOM = async (id: string) => {
    try {
      // 先将同产品的其他BOM设为非当前版本
      const bom = bomHeaders.value.find(b => b.id === id)
      if (bom?.product_id) {
        await supabase
          .from('bom_headers')
          .update({ is_current: false })
          .eq('product_id', bom.product_id)
      }
      
      // 激活当前BOM
      const updates: BOMHeaderUpdate = {
        status: 'active',
        is_current: true
      }
      
      return await updateBOMHeader(id, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '激活BOM失败'
      throw err
    }
  }
  
  // 添加BOM物料
  const addBOMItem = async (bomId: string, itemData: BOMItemInsert) => {
    try {
      const { data, error: createError } = await supabase
        .from('bom_items')
        .insert({
          ...itemData,
          bom_id: bomId,
          total_cost: (itemData.quantity || 0) * (itemData.unit_cost || 0)
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      // 更新BOM统计信息
      await updateBOMStatistics(bomId)
      
      // 刷新物料列表
      await fetchBOMItems(bomId)
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加BOM物料失败'
      throw err
    }
  }
  
  // 更新BOM物料
  const updateBOMItem = async (id: string, updates: BOMItemUpdate) => {
    try {
      // 计算总成本
      if (updates.quantity !== undefined || updates.unit_cost !== undefined) {
        const item = bomItems.value.find(item => item.id === id)
        if (item) {
          const quantity = updates.quantity ?? item.quantity
          const unitCost = updates.unit_cost ?? item.unit_cost
          updates.total_cost = quantity * unitCost
        }
      }
      
      const { data, error: updateError } = await supabase
        .from('bom_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // 更新本地状态
      const index = bomItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        bomItems.value[index] = { ...bomItems.value[index], ...data }
      }
      
      // 更新BOM统计信息
      if (data.bom_id) {
        await updateBOMStatistics(data.bom_id)
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新BOM物料失败'
      throw err
    }
  }
  
  // 删除BOM物料
  const deleteBOMItem = async (id: string) => {
    try {
      const item = bomItems.value.find(item => item.id === id)
      const bomId = item?.bom_id
      
      const { error: deleteError } = await supabase
        .from('bom_items')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // 从本地状态中移除
      bomItems.value = bomItems.value.filter(item => item.id !== id)
      
      // 更新BOM统计信息
      if (bomId) {
        await updateBOMStatistics(bomId)
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除BOM物料失败'
      throw err
    }
  }
  
  // 更新BOM统计信息
  const updateBOMStatistics = async (bomId: string) => {
    try {
      const items = await fetchBOMItems(bomId)
      
      const materialCount = items.length
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalCost = items.reduce((sum, item) => sum + (item.total_cost || 0), 0)
      
      await updateBOMHeader(bomId, {
        material_count: materialCount,
        total_quantity: totalQuantity,
        total_cost: totalCost
      })
    } catch (err) {
      console.error('更新BOM统计信息失败:', err)
    }
  }
  
  // 计算物料需求
  const calculateMaterialRequirements = (bomId: string, productionQuantity: number) => {
    const items = bomItems.value.filter(item => item.bom_id === bomId)
    
    return items.map(item => {
      const requiredQuantity = item.quantity * productionQuantity
      const scrapQuantity = requiredQuantity * (item.scrap_rate || 0) / 100
      const totalRequired = requiredQuantity + scrapQuantity
      
      return {
        ...item,
        production_quantity: productionQuantity,
        required_quantity: requiredQuantity,
        scrap_quantity: scrapQuantity,
        total_required: totalRequired,
        total_cost: totalRequired * (item.unit_cost || 0)
      }
    })
  }
  
  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      approved: '已审核',
      active: '生效中',
      inactive: '已停用'
    }
    return statusMap[status] || status
  }
  
  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }
  
  // 获取产品类别文本
  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      electronics: '电子产品',
      mechanical: '机械产品',
      chemical: '化工产品',
      textile: '纺织产品',
      food: '食品',
      other: '其他'
    }
    return categoryMap[category] || category
  }
  
  return {
    // 状态
    loading: readonly(loading),
    error: readonly(error),
    bomHeaders: readonly(bomHeaders),
    currentBOM: readonly(currentBOM),
    bomItems: readonly(bomItems),
    bomStats,
    bomsByCategory,
    
    // 方法
    fetchBOMHeaders,
    fetchBOMHeader,
    fetchBOMItems,
    createBOMHeader,
    updateBOMHeader,
    deleteBOMHeader,
    copyBOM,
    approveBOM,
    activateBOM,
    addBOMItem,
    updateBOMItem,
    deleteBOMItem,
    updateBOMStatistics,
    calculateMaterialRequirements,
    
    // 工具函数
    getStatusText,
    getStatusColor,
    getCategoryText
  }
}