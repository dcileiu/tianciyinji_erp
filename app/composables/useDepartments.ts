import type { Database } from '~/types/database.types'

// 部门类型定义
export interface Department {
  id: string
  name: string
  code: string
  description?: string | null
  parent_id?: string | null
  manager_id?: string | null
  sort: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  // 扩展字段
  children?: Department[]
  parent?: Department | null
  manager?: {
    id: string
    name: string
    email: string
  } | null
  employee_count?: number
}

// 部门表单类型
export interface DepartmentForm {
  name: string
  code: string
  description?: string
  parent_id?: string
  manager_id?: string
  sort: number
  status: 'active' | 'inactive'
}

// 查询参数类型
export interface DepartmentQuery {
  search?: string
  parent_id?: string
  status?: string
  sort?: 'name' | 'code' | 'sort' | 'created_at'
  order?: 'asc' | 'desc'
}

export const useDepartments = () => {
  const supabase = useSupabaseClient<Database>()

  // 状态
  const departments = ref<Department[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取部门列表
  const getDepartments = async (query: DepartmentQuery = {}) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API
      const result = await $fetch('/api/departments', {
        query: query
      }) as any

      if (result.code === 0) {
        departments.value = result.data
        return {
          code: 0,
          message: result.message,
          data: result.data
        }
      } else {
        return result
      }
    } catch (err: any) {
      error.value = err.message || '获取部门列表失败'
      return {
        code: -1,
        message: err.message || '获取部门列表失败',
        data: []
      }
    } finally {
      loading.value = false
    }
  }

  // 获取单个部门
  const getDepartment = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        code: 0,
        message: '获取成功',
        data
      }
    } catch (err: any) {
      return {
        code: -1,
        message: err.message || '获取部门失败',
        data: null
      }
    }
  }

  // 创建部门
  const createDepartment = async (departmentData: DepartmentForm) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API 创建部门
      const result = await $fetch('/api/departments', {
        method: 'POST',
        body: departmentData
      })

      return result
    } catch (err: any) {
      error.value = err.message || '创建部门失败'
      return {
        code: -1,
        message: err.message || '创建部门失败',
        data: null
      }
    } finally {
      loading.value = false
    }
  }

  // 更新部门
  const updateDepartment = async (id: string, departmentData: Partial<DepartmentForm>) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API 更新部门
      const result = await $fetch('/api/departments', {
        method: 'PUT',
        body: {
          id,
          ...departmentData
        }
      })

      return result
    } catch (err: any) {
      error.value = err.message || '更新部门失败'
      return {
        code: -1,
        message: err.message || '更新部门失败',
        data: null
      }
    } finally {
      loading.value = false
    }
  }

  // 删除部门
  const deleteDepartment = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      // 调用服务端 API 删除部门
      const result = await $fetch('/api/departments', {
        method: 'DELETE',
        body: { id }
      })

      return result
    } catch (err: any) {
      error.value = err.message || '删除部门失败'
      return {
        code: -1,
        message: err.message || '删除部门失败',
        data: null
      }
    } finally {
      loading.value = false
    }
  }

  // 获取部门树结构
  const getDepartmentTree = () => {
    const buildTree = (depts: Department[], parentId: string | null = null): Department[] => {
      return depts
        .filter(dept => dept.parent_id === parentId)
        .sort((a, b) => a.sort - b.sort)
        .map(dept => ({
          ...dept,
          children: buildTree(depts, dept.id)
        }))
    }

    return computed(() => buildTree(departments.value))
  }

    // 获取部门路径
  const getDepartmentPath = (departmentId: string): Department[] => {
    const path: Department[] = []
    let current = departments.value.find(d => d.id === departmentId)

    while (current) {
      path.unshift(current)
      current = current.parent_id ? departments.value.find(d => d.id === current!.parent_id) : undefined
    }

    return path
  }

  // 检查是否可以删除部门（是否有子部门）
  const canDeleteDepartment = (departmentId: string): boolean => {
    return !departments.value.some(d => d.parent_id === departmentId)
  }

  return {
    // 状态
    departments,
    loading,
    error,

    // 方法
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentTree,
    getDepartmentPath,
    canDeleteDepartment
  }
}
