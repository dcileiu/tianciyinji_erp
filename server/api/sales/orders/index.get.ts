import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string
    const status = query.status as string
    const customer_id = query.customer_id as string

    let queryBuilder = supabase
      .from('sales_orders')
      .select(`
        *,
        customers(id, name, contact_person)
      `, { count: 'exact' })

    // 搜索功能
    if (search) {
      queryBuilder = queryBuilder.or(`order_number.ilike.%${search}%,notes.ilike.%${search}%`)
    }

    // 按状态筛选
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    // 按客户筛选
    if (customer_id) {
      queryBuilder = queryBuilder.eq('customer_id', customer_id)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await queryBuilder
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '获取销售订单列表失败: ' + error.message
      })
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})
