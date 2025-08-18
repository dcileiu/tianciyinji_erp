import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      page = 1,
      limit = 10,
      search = '',
      role_id = '',
      status = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = query

    const offset = (Number(page) - 1) * Number(limit)

    // 构建查询
    let queryBuilder = supabase
      .from('users')
      .select(`
        *,
        roles!inner(
          id,
          name,
          display_name
        )
      `, { count: 'exact' })

    // 搜索条件
    if (search) {
      queryBuilder = queryBuilder.or(`
        email.ilike.%${search}%,
        full_name.ilike.%${search}%,
        phone.ilike.%${search}%
      `)
    }

    // 角色筛选
    if (role_id) {
      queryBuilder = queryBuilder.eq('role_id', role_id)
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

    const { data: users, error, count } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '查询用户失败',
        data: error
      })
    }

    // 处理用户数据，添加状态文本和颜色
    const processedUsers = users?.map(user => ({
      ...user,
      status_text: getStatusText(user.status),
      status_color: getStatusColor(user.status),
      role_name: user.roles?.display_name || user.roles?.name
    })) || []

    return {
      success: true,
      data: {
        data: processedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      }
    }
  } catch (error) {
    console.error('获取用户列表错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取用户列表失败'
    })
  }
})

// 获取状态文本
function getStatusText (status: string): string {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    pending: '待激活'
  }
  return statusMap[status] || status
}

// 获取状态颜色
function getStatusColor (status: string): string {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'red',
    pending: 'yellow'
  }
  return colorMap[status] || 'gray'
}
