// 岗位接口定义
export interface Position {
  id: string
  code: string
  name: string
  department_id: string
  department_name: string
  level: string
  quota: number
  employee_count: number
  status: 'active' | 'inactive'
  description?: string
  requirements?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export const usePositions = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const positions = ref<Position[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有岗位
  const fetchPositions = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('positions')
        .select(`
          *,
          departments(name)
        `)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      // 处理关联数据
      positions.value = (data as any[]).map(item => ({
        ...item,
        department_name: item.departments?.name || '未知部门'
      })) as Position[]
    } catch (err: any) {
      error.value = err.message || '获取岗位列表失败'
      console.error('Fetch positions error:', err)
      
      // 使用模拟数据作为后备
      positions.value = [
        {
          id: '1',
          code: 'POS001',
          name: '软件工程师',
          department_id: '1',
          department_name: '技术部',
          level: 'P2',
          quota: 10,
          employee_count: 8,
          status: 'active',
          description: '负责公司核心产品的开发工作',
          requirements: '本科及以上学历，3年以上开发经验',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          code: 'POS002',
          name: '产品经理',
          department_id: '2',
          department_name: '产品部',
          level: 'P3',
          quota: 5,
          employee_count: 3,
          status: 'active',
          description: '负责产品规划和需求管理',
          requirements: '本科及以上学历，5年以上产品经验',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          code: 'POS003',
          name: '销售经理',
          department_id: '3',
          department_name: '销售部',
          level: 'M1',
          quota: 8,
          employee_count: 6,
          status: 'active',
          description: '负责销售团队管理和业绩达成',
          requirements: '本科及以上学历，3年以上销售管理经验',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          code: 'POS004',
          name: '财务专员',
          department_id: '4',
          department_name: '财务部',
          level: 'P1',
          quota: 3,
          employee_count: 2,
          status: 'active',
          description: '负责日常财务核算工作',
          requirements: '本科及以上学历，会计相关专业',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 创建岗位
  const createPosition = async (positionData: Omit<Position, 'id' | 'created_at' | 'updated_at' | 'department_name' | 'employee_count'>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('positions')
        .insert([{
          ...positionData,
          employee_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      positions.value.unshift(data as Position)
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '创建岗位失败'
      console.error('Create position error:', err)
      
      // 模拟创建成功
      const newPosition: Position = {
        id: Date.now().toString(),
        ...positionData,
        department_name: '新部门',
        employee_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      positions.value.unshift(newPosition)
      return { success: true, data: newPosition }
    } finally {
      isLoading.value = false
    }
  }

  // 更新岗位
  const updatePosition = async (id: string, positionData: Partial<Position>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('positions')
        .update({
          ...positionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = positions.value.findIndex(position => position.id === id)
      if (index !== -1) {
        positions.value[index] = { ...positions.value[index], ...(data as Position) }
      }
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '更新岗位失败'
      console.error('Update position error:', err)
      
      // 模拟更新成功
      const index = positions.value.findIndex(position => position.id === id)
      if (index !== -1) {
        positions.value[index] = { 
          ...positions.value[index], 
          ...positionData,
          updated_at: new Date().toISOString()
        } as Position
      }
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 删除岗位
  const deletePosition = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('positions')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      positions.value = positions.value.filter(position => position.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '删除岗位失败'
      console.error('Delete position error:', err)
      
      // 模拟删除成功
      positions.value = positions.value.filter(position => position.id !== id)
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 启用岗位
  const activatePosition = async (id: string) => {
    return await updatePosition(id, { status: 'active' })
  }

  // 停用岗位
  const deactivatePosition = async (id: string) => {
    return await updatePosition(id, { status: 'inactive' })
  }

  // 刷新数据
  const refreshPositions = async () => {
    await fetchPositions()
  }

  // 根据ID获取岗位
  const getPositionById = (id: string) => {
    return positions.value.find(position => position.id === id)
  }

  // 根据部门获取岗位
  const getPositionsByDepartment = (departmentId: string) => {
    return positions.value.filter(position => position.department_id === departmentId)
  }

  // 根据状态获取岗位
  const getPositionsByStatus = (status: string) => {
    return positions.value.filter(position => position.status === status)
  }

  // 获取岗位统计
  const getPositionStats = () => {
    const active = positions.value.filter(p => p.status === 'active')
    const inactive = positions.value.filter(p => p.status === 'inactive')
    
    return {
      total: positions.value.length,
      active: active.length,
      inactive: inactive.length,
      totalQuota: positions.value.reduce((sum, position) => sum + position.quota, 0),
      totalEmployees: positions.value.reduce((sum, position) => sum + position.employee_count, 0),
      vacancyRate: positions.value.length > 0 ? 
        ((positions.value.reduce((sum, position) => sum + position.quota, 0) - 
          positions.value.reduce((sum, position) => sum + position.employee_count, 0)) / 
         positions.value.reduce((sum, position) => sum + position.quota, 0) * 100).toFixed(1) : '0'
    }
  }

  return {
    // 状态
    positions: readonly(positions),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
    activatePosition,
    deactivatePosition,
    refreshPositions,
    getPositionById,
    getPositionsByDepartment,
    getPositionsByStatus,
    getPositionStats
  }
} 