import { ref, computed } from 'vue'
import { useSupabaseClient } from '#imports'

// 库存接口定义
export interface InventoryItem {
  id: string
  product_id: string
  warehouse: string
  location?: string
  current_stock: number
  available_stock: number
  reserved_stock: number
  safety_stock: number
  max_stock?: number
  unit_cost?: number
  last_updated: string
  created_at: string
  updated_at: string
  // 关联的商品信息
  product?: {
    id: string
    product_no: string
    name: string
    unit: string
    category: string
    status: string
  }
}

// 库存变动记录接口
export interface InventoryMovement {
  id: string
  product_id: string
  warehouse: string
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  unit_cost?: number
  total_cost?: number
  reference_type?: string
  reference_id?: string
  reason?: string
  operator_id?: string
  movement_date: string
  created_at: string
  // 关联的商品信息
  product?: {
    id: string
    product_no: string
    name: string
    unit: string
  }
}

// 库存统计接口
export interface InventoryStats {
  totalValue: number
  alerts: number
  outOfStock: number
  turnoverRate: string
}

export const useInventory = () => {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取库存列表
  const getInventoryList = async (filters?: {
    warehouse?: string
    category?: string
    stockStatus?: string
    searchQuery?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('inventory')
        .select(`
          *,
          product:products(
            id,
            product_no,
            name,
            unit,
            category,
            status
          )
        `)
        .order('created_at', { ascending: false })

      // 应用筛选条件
      if (filters?.warehouse) {
        query = query.eq('warehouse', filters.warehouse)
      }

      if (filters?.searchQuery) {
        query = query.or(`product.name.ilike.%${filters.searchQuery}%,product.product_no.ilike.%${filters.searchQuery}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      // 应用库存状态筛选
      let filteredData = data || []
      if (filters?.stockStatus) {
        filteredData = filteredData.filter(item => {
          const status = getStockStatus(item)
          return status === filters.stockStatus
        })
      }

      // 应用分类筛选
      if (filters?.category) {
        filteredData = filteredData.filter(item => 
          item.product?.category === filters.category
        )
      }

      return filteredData as InventoryItem[]
    } catch (err: any) {
      error.value = err.message || '获取库存列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取库存统计
  const getInventoryStats = async (): Promise<InventoryStats> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select(`
          current_stock,
          safety_stock,
          unit_cost,
          product:products(unit_price)
        `)

      if (fetchError) {
        throw fetchError
      }

      const items = data || []
      
      // 计算总库存价值
      const totalValue = items.reduce((sum, item) => {
        const price = item.product?.unit_price || item.unit_cost || 0
        return sum + (item.current_stock * price)
      }, 0)

      // 计算预警数量
      const alerts = items.filter(item => 
        item.current_stock > 0 && item.current_stock <= item.safety_stock
      ).length

      // 计算缺货数量
      const outOfStock = items.filter(item => item.current_stock === 0).length

      return {
        totalValue,
        alerts,
        outOfStock,
        turnoverRate: '2.3次/月' // 这里可以根据实际业务逻辑计算
      }
    } catch (err: any) {
      error.value = err.message || '获取库存统计失败'
      throw err
    }
  }

  // 获取库存变动记录
  const getInventoryMovements = async (filters?: {
    productId?: string
    warehouse?: string
    movementType?: string
    dateRange?: { start: string; end: string }
  }) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          product:products(
            id,
            product_no,
            name,
            unit
          )
        `)
        .order('movement_date', { ascending: false })
        .limit(100)

      // 应用筛选条件
      if (filters?.productId) {
        query = query.eq('product_id', filters.productId)
      }

      if (filters?.warehouse) {
        query = query.eq('warehouse', filters.warehouse)
      }

      if (filters?.movementType) {
        query = query.eq('movement_type', filters.movementType)
      }

      if (filters?.dateRange) {
        query = query
          .gte('movement_date', filters.dateRange.start)
          .lte('movement_date', filters.dateRange.end)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      return data as InventoryMovement[]
    } catch (err: any) {
      error.value = err.message || '获取库存变动记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建库存变动记录
  const createInventoryMovement = async (movement: Omit<InventoryMovement, 'id' | 'created_at'>) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('inventory_movements')
        .insert([movement])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return data as InventoryMovement
    } catch (err: any) {
      error.value = err.message || '创建库存变动记录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 调整库存
  const adjustInventory = async (productId: string, warehouse: string, adjustment: {
    quantity: number
    reason: string
    unitCost?: number
  }) => {
    try {
      loading.value = true
      error.value = null

      // 创建库存变动记录
      await createInventoryMovement({
        product_id: productId,
        warehouse,
        movement_type: 'adjustment',
        quantity: adjustment.quantity,
        unit_cost: adjustment.unitCost,
        total_cost: adjustment.unitCost ? adjustment.quantity * adjustment.unitCost : undefined,
        reference_type: 'adjustment',
        reason: adjustment.reason,
        movement_date: new Date().toISOString()
      })

      return true
    } catch (err: any) {
      error.value = err.message || '库存调整失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取库存预警商品
  const getLowStockItems = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(
            id,
            product_no,
            name,
            unit
          )
        `)
        .gt('current_stock', 0)
        .filter('current_stock', 'lte', 'safety_stock')
        .order('current_stock', { ascending: true })
        .limit(10)

      if (fetchError) {
        throw fetchError
      }

      return data as InventoryItem[]
    } catch (err: any) {
      error.value = err.message || '获取库存预警商品失败'
      throw err
    }
  }

  // 获取缺货商品
  const getOutOfStockItems = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(
            id,
            product_no,
            name,
            unit
          )
        `)
        .eq('current_stock', 0)
        .order('last_updated', { ascending: false })
        .limit(10)

      if (fetchError) {
        throw fetchError
      }

      return data as InventoryItem[]
    } catch (err: any) {
      error.value = err.message || '获取缺货商品失败'
      throw err
    }
  }

  // 获取库存状态
  const getStockStatus = (item: InventoryItem): string => {
    if (item.current_stock === 0) return 'out'
    if (item.current_stock <= item.safety_stock) return 'low'
    if (item.max_stock && item.current_stock > item.max_stock) return 'excess'
    return 'normal'
  }

  // 获取库存状态颜色
  const getStockStatusColor = (item: InventoryItem): string => {
    const status = getStockStatus(item)
    const colors: Record<string, string> = {
      normal: 'bg-green-100 text-green-800',
      low: 'bg-yellow-100 text-yellow-800',
      out: 'bg-red-100 text-red-800',
      excess: 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // 获取库存状态文本
  const getStockStatusText = (item: InventoryItem): string => {
    const status = getStockStatus(item)
    const texts: Record<string, string> = {
      normal: '正常',
      low: '不足',
      out: '缺货',
      excess: '过量'
    }
    return texts[status] || '未知'
  }

  // 获取仓库名称
  const getWarehouseName = (warehouse: string): string => {
    const names: Record<string, string> = {
      main: '主仓库',
      raw_material: '原料仓',
      finished_goods: '成品仓',
      backup: '备用仓'
    }
    return names[warehouse] || warehouse
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getInventoryList,
    getInventoryStats,
    getInventoryMovements,
    createInventoryMovement,
    adjustInventory,
    getLowStockItems,
    getOutOfStockItems,
    getStockStatus,
    getStockStatusColor,
    getStockStatusText,
    getWarehouseName
  }
}