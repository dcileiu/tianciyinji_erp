import type { Database } from '~/types/database'

type Department = Database['public']['Tables']['departments']['Row']
type DepartmentInsert = Database['public']['Tables']['departments']['Insert']
type DepartmentUpdate = Database['public']['Tables']['departments']['Update']

export const useDepartments = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // 获取所有部门
  const getDepartments = async (filters?: {
    isActive?: boolean
    search?: string
    parentId?: string | null
  }) => {
    try {
      let query = supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.parentId !== undefined) {
        if (filters.parentId === null) {
          query = query.is('parent_id', null)
        } else {
          query = query.eq('parent_id', filters.parentId)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('获取部门列表失败:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('获取部门列表异常:', error)
      throw error
    }
  }

  // 根据ID获取部门
  const getDepartmentById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('获取部门详情失败:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('获取部门详情异常:', error)
      throw error
    }
  }

  // 构建部门树结构
  const buildDepartmentTree = (departments: Department[]): (Department & { children?: Department[] })[] => {
    const departmentMap = new Map<string, Department & { children?: Department[] }>()
    const rootDepartments: (Department & { children?: Department[] })[] = []

    // 创建部门映射
    departments.forEach(dept => {
      departmentMap.set(dept.id, { ...dept, children: [] })
    })

    // 构建树结构
    departments.forEach(dept => {
      const departmentNode = departmentMap.get(dept.id)!
      if (dept.parent_id && departmentMap.has(dept.parent_id)) {
        const parent = departmentMap.get(dept.parent_id)!
        parent.children!.push(departmentNode)
      } else {
        rootDepartments.push(departmentNode)
      }
    })

    return rootDepartments
  }

  // 获取部门树
  const getDepartmentTree = async (filters?: {
    isActive?: boolean
    search?: string
  }) => {
    try {
      const departments = await getDepartments(filters)
      return buildDepartmentTree(departments)
    } catch (error) {
      console.error('获取部门树异常:', error)
      throw error
    }
  }

  // 创建部门
  const createDepartment = async (department: DepartmentInsert) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert(department)
        .select()
        .single()

      if (error) {
        console.error('创建部门失败:', error)
        throw error
      }

      // 记录操作日志
      if (user.value?.id) {
        await supabase.rpc('log_permission_action', {
          user_id: user.value.id,
          action: 'CREATE_DEPARTMENT',
          resource_code: 'DEPARTMENT_MANAGEMENT',
          details: `创建部门: ${data.name}`
        })
      }

      return data
    } catch (error) {
      console.error('创建部门异常:', error)
      throw error
    }
  }

  // 更新部门
  const updateDepartment = async (id: string, updates: DepartmentUpdate) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('更新部门失败:', error)
        throw error
      }

      // 记录操作日志
      if (user.value?.id) {
        await supabase.rpc('log_permission_action', {
          user_id: user.value.id,
          action: 'UPDATE_DEPARTMENT',
          resource_code: 'DEPARTMENT_MANAGEMENT',
          details: `更新部门: ${data.name}`
        })
      }

      return data
    } catch (error) {
      console.error('更新部门异常:', error)
      throw error
    }
  }

  // 删除部门
  const deleteDepartment = async (id: string) => {
    try {
      // 检查是否有子部门
      const { data: children } = await supabase
        .from('departments')
        .select('id')
        .eq('parent_id', id)

      if (children && children.length > 0) {
        throw new Error('无法删除有子部门的部门，请先删除或移动子部门')
      }

      // 检查是否有用户关联
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('department_id', id)

      if (users && users.length > 0) {
        throw new Error('无法删除有用户关联的部门，请先移动用户到其他部门')
      }

      // 先获取部门信息用于日志记录
      const department = await getDepartmentById(id)

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('删除部门失败:', error)
        throw error
      }

      // 记录操作日志
      if (user.value?.id && department) {
        await supabase.rpc('log_permission_action', {
          user_id: user.value.id,
          action: 'DELETE_DEPARTMENT',
          resource_code: 'DEPARTMENT_MANAGEMENT',
          details: `删除部门: ${department.name}`
        })
      }

      return true
    } catch (error) {
      console.error('删除部门异常:', error)
      throw error
    }
  }

  // 获取部门的所有子部门（递归）
  const getDepartmentChildren = async (parentId: string): Promise<Department[]> => {
    try {
      const { data: children, error } = await supabase
        .from('departments')
        .select('*')
        .eq('parent_id', parentId)

      if (error) {
        console.error('获取子部门失败:', error)
        throw error
      }

      let allChildren: Department[] = children || []

      // 递归获取子部门的子部门
      for (const child of children || []) {
        const grandChildren = await getDepartmentChildren(child.id)
        allChildren = allChildren.concat(grandChildren)
      }

      return allChildren
    } catch (error) {
      console.error('获取子部门异常:', error)
      throw error
    }
  }

  // 获取部门路径（从根部门到当前部门）
  const getDepartmentPath = async (departmentId: string): Promise<Department[]> => {
    try {
      const path: Department[] = []
      let currentId: string | null = departmentId

      while (currentId) {
        const department = await getDepartmentById(currentId)
        path.unshift(department)
        currentId = department.parent_id
      }

      return path
    } catch (error) {
      console.error('获取部门路径异常:', error)
      throw error
    }
  }

  // 获取部门统计信息
  const getDepartmentStats = async () => {
    try {
      const [totalResult, activeResult, rootResult] = await Promise.all([
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('departments').select('id', { count: 'exact', head: true }).is('parent_id', null)
      ])

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        inactive: (totalResult.count || 0) - (activeResult.count || 0),
        rootCount: rootResult.count || 0
      }
    } catch (error) {
      console.error('获取部门统计信息异常:', error)
      throw error
    }
  }

  return {
    getDepartments,
    getDepartmentById,
    buildDepartmentTree,
    getDepartmentTree,
    createDepartment,
    updateDepartment,