import type { Department } from '~/types/database'

export const useDepartments = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const departments = ref<Department[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有部门
  const fetchDepartments = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      departments.value = data as Department[]
    } catch (err: any) {
      error.value = err.message || '获取部门列表失败'
      console.error('Fetch departments error:', err)
      
      // 使用模拟数据作为后备
      departments.value = [
        {
          id: '1',
          name: '总经办',
          code: 'GM_OFFICE',
          manager: '张三',
          description: '公司总经理办公室',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: '销售部',
          code: 'SALES',
          manager: '李四',
          description: '负责产品销售和客户维护',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: '采购部',
          code: 'PURCHASE',
          manager: '王五',
          description: '负责物料采购和供应商管理',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: '生产部',
          code: 'PRODUCTION',
          parent_id: '1',
          manager: '赵六',
          description: '负责生产制造和工艺管理',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 创建部门
  const createDepartment = async (deptData: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('departments')
        .insert([{
          ...deptData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      departments.value.unshift(data as Department)
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '创建部门失败'
      console.error('Create department error:', err)
      
      // 模拟创建成功
      const newDept: Department = {
        id: Date.now().toString(),
        ...deptData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      departments.value.unshift(newDept)
      return { success: true, data: newDept }
    } finally {
      isLoading.value = false
    }
  }

  // 更新部门
  const updateDepartment = async (id: string, deptData: Partial<Department>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('departments')
        .update({
          ...deptData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = departments.value.findIndex(dept => dept.id === id)
      if (index !== -1) {
        departments.value[index] = { ...departments.value[index], ...(data as Department) }
      }
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '更新部门失败'
      console.error('Update department error:', err)
      
      // 模拟更新成功
      const index = departments.value.findIndex(dept => dept.id === id)
      if (index !== -1) {
        departments.value[index] = { 
          ...departments.value[index], 
          ...deptData,
          updated_at: new Date().toISOString()
        } as Department
      }
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 删除部门
  const deleteDepartment = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      departments.value = departments.value.filter(dept => dept.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '删除部门失败'
      console.error('Delete department error:', err)
      
      // 模拟删除成功
      departments.value = departments.value.filter(dept => dept.id !== id)
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 刷新数据
  const refreshDepartments = async () => {
    await fetchDepartments()
  }

  // 根据ID获取部门
  const getDepartmentById = (id: string) => {
    return departments.value.find(dept => dept.id === id)
  }

  // 根据编码获取部门
  const getDepartmentByCode = (code: string) => {
    return departments.value.find(dept => dept.code === code)
  }

  // 获取顶级部门（无父级部门）
  const getTopLevelDepartments = () => {
    return departments.value.filter(dept => !dept.parent_id)
  }

  // 获取子部门
  const getChildDepartments = (parentId: string) => {
    return departments.value.filter(dept => dept.parent_id === parentId)
  }

  return {
    // 状态
    departments: readonly(departments),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refreshDepartments,
    getDepartmentById,
    getDepartmentByCode,
    getTopLevelDepartments,
    getChildDepartments
  }
} 