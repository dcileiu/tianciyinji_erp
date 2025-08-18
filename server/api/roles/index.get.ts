import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = query

    const offset = (Number(page) - 1) * Number(limit)

    // 构建查询
    let queryBuilder = supabase
      .from('roles')
      .select('*', { count: 'exact' })

    // 搜索条件
    if (search) {
      queryBuilder = queryBuilder.or(`
        name.ilike.%${search}%,
        display_name.ilike.%${search}%,
        description.ilike.%${search}%
      `)
    }

    // 状态筛选
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    // 排序
    queryBuilder = queryBuilder.order(sort_by as string, {
      ascending: sort_order === 'asc'
    })

    // 分页
    queryBuilder = queryBuilder.range(offset, offset + Number(limit) - 1)

    const { data: roles, error, count } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '查询角色失败',
        data: error
      })
    }

    // 获取每个角色的用户数量
    const rolesWithUserCount = await Promise.all(
      (roles || []).map(async (role) => {
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role_id', role.id)

        return {
          ...role,
          user_count: userCount || 0,
          status_text: getStatusText(role.status),
          status_color: getStatusColor(role.status)
        }
      })
    )

    return {
      success: true,
      data: {
        data: rolesWithUserCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      }
    }
  } catch (error) {
    console.error('获取角色列表错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取角色列表失败'
    })
  }
})

// 获取状态文本
function getStatusText (status: string): string {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用'
  }
  return statusMap[status] || status
}

// 获取状态颜色
function getStatusColor (status: string): string {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'red'
  }
  return colorMap[status] || 'gray'
}
