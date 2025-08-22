import type { Database } from '~/types/database'

type Resource = Database['public']['Tables']['resources']['Row']
type ResourceInsert = Database['public']['Tables']['resources']['Insert']
type ResourceUpdate = Database['public']['Tables']['resources']['Update']

export const useResources = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // 获取所有资源
  const getResources = async (filters?: {
    resourceType?: string
    isActive?: boolean
    search?: string
  }) => {
    try {
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType)
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('获取资源列表失败:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('获取资源列表异常:', error)
      throw error
    }
  }

  // 根据ID获取资源
  const getResourceById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('获取资源详情失败:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('获取资源详情异常:', error)
      throw error
    }
  }

  // 创建资源
  const createResource = async (resource: ResourceInsert) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select()
        .single()

      if (error) {
        console.error('创建资源失败:', error)
        throw error
      }

      // 记录操作日志
      if (user.value?.id) {
        await supabase.rpc('log_permission_action', {
          user_id: user.value.id,
          action: 'CREATE_RESOURCE',
          resource_code: data.code,
          details: `创建资源: ${data.name}`
        })
      }

      return data
    } catch (error) {
      console.error('创建资源异常:', error)
      throw error
    }
  }

  // 更新资源
  const updateResource = async (id: string, updates: ResourceUpdate) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('更新资源失败:', error)
        throw error
      }

      // 记录操作日志
      if (user.value?.id) {
        await supabase.rpc('log_permission_action', {
          user_id: user.value.id,
          action: 'UPDATE_RESOURCE',
          resource_code: data.code,
          details: `更新资源: ${data.name}`
        })
      }

      return data
    } catch (error) {
      console.error('更新资源异常:', error)
      throw error
    }
  }

  // 删除资源
  const deleteResource = async (id: string) => {
    try {
      // 先获取资源信息用于日志记录
      const resource = await getResourceById(id)

      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('删除资源失败:', error)
        throw error
      }

      // 记录操作日志
      if (user.value?.id && resource) {
        await supabase.rpc('log_permission_action', {
          user_id: user.value.id,
          action: 'DELETE_RESOURCE',
          resource_code: resource.code,
          details: `删除资源: ${resource.name}`
        })
      }

      return true
    } catch (error) {
      console.error('删除资源异常:', error)
      throw error
    }
  }

  // 获取资源类型列表
  const getResourceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('resource_type')
        .not('resource_type', 'is', null)

      if (error) {
        console.error('获取资源类型失败:', error)
        throw error
      }

      // 去重并排序
      const types = [...new Set(data.map(item => item.resource_type))]
        .filter(type => type)
        .sort()

      return types
    } catch (error) {
      console.error('获取资源类型异常:', error)
      throw error
    }
  }

  // 获取角色的资源权限
  const getRoleResources = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_resources')
        .select(`
          id,
          resource_id,
          resources (
            id,
            name,
            code,
            description,
            resource_type,
            is_active
          )
        `)
        .eq('role_id', roleId)

      if (error) {
        console.error('获取角色资源权限失败:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('获取角色资源权限异常:', error)
      throw error
    }
  }

  // 更新角色的资源权限
  const updateRoleResources = async (roleId: string, resourceIds: string[]) => {
    try {
      // 先删除现有的角色资源关联
      const { error: deleteError } = await supabase
        .from('role_resources')
        .delete()
        .eq('role_id', roleId)

      if (deleteError) {
        console.error('删除角色资源关联失败:', deleteError)
        throw deleteError
      }

      // 如果有新的资源权限，则插入
      if (resourceIds.length > 0) {
        const roleResources = resourceIds.map(resourceId => ({
          role_id: roleId,
          resource_id: resourceId
        }))

        const { error: insertError } = await supabase
          .from('role_resources')
          .insert(roleResources)

        if (insertError) {
          console.error('插入角色资源关联失败:', insertError)
          throw insertError
        }
      }

      // 记录操作日志
      if (user.value?.id) {
        await supabase.rpc('log_permission_action', {
          user_id: user.value.id,
          action: 'UPDATE_ROLE_RESOURCES',
          resource_code: 'ROLE_MANAGEMENT',
          details: `更新角色资源权限，角色ID: ${roleId}，资源数量: ${resourceIds.length}`
        })
      }

      return true
    } catch (error) {
      console.error('更新角色资源权限异常:', error)
      throw error
    }
  }

  // 获取资源统计信息
  const getResourceStats = async () => {
    try {
      const [totalResult, activeResult, typesResult] = await Promise.all([
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('resources').select('resource_type').not('resource_type', 'is', null)
      ])

      const typeCount = new Set(typesResult.data?.map(item => item.resource_type)).size

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        inactive: (totalResult.count || 0) - (activeResult.count || 0),
        typeCount
      }
    } catch (error) {
      console.error('获取资源统计信息异常:', error)
      throw error
    }
  }

  return {
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    getResourceTypes,
    getRoleResources,
    updateRoleResources,
    getResourceStats
  }
}